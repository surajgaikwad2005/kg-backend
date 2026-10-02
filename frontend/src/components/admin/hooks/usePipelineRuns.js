'use client';

/**
 * usePipelineRuns — the per-stage CDM pipeline run registry.
 *
 * Owns `pipelineStatuses` (one entry per stage), resumes in-flight runs from
 * localStorage after a reload, polls every active job through TanStack Query,
 * and exposes cancel/retry.
 *
 * WHY THE POLLING LIVES HERE, not in the modal: a run has to keep progressing
 * while its modal is minimized or the user walks to another Domain Configuration
 * screen. This hook is instantiated by AdminPanelProvider, which the
 * data-source-integration `layout.jsx` owns — so it survives navigation between
 * the page and its review routes (CLAUDE.md #45), and a full reload picks the
 * run back up from the persisted job id.
 *
 * It replaces a `Promise`-wrapped `setInterval` that never cleared on unmount,
 * swallowed poll errors, only treated completed/failed as terminal (so a
 * cancelled job polled forever), and animated `Math.random() * 8 + 4` as
 * progress. Progress is now whatever the server reports — or an honest
 * indeterminate bar when it reports nothing.
 */
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { isTerminalPipelineStatus } from '@/src/services/domain-configuration/common';
import {
    usePipelineJobPolls,
    useCancelPipelineJob,
    useRetryPipelineJob,
} from '@/src/components/admin/_queries/usePipelineQueries';
import { useInvalidateConnectorState } from '@/src/components/admin/_queries/useDsiQueries';
import { PIPELINE_STAGE_KEYS } from '@/src/components/admin/pipeline/pipelineRun.utils';
import { saveCtxParams, loadCtxParams } from './pipelineCtxParams';

const IDLE_STATUSES = Object.freeze(
    Object.fromEntries(PIPELINE_STAGE_KEYS.map((k) => [k, { status: 'idle' }]))
);

/**
 * Pull the run-shaped fields out of a poll payload (or a POST /run response).
 *
 * Keys whose value is absent are OMITTED, never set to undefined: these patches
 * are spread over the existing run entry, so an `undefined` would erase a value
 * an earlier response had already supplied. POST /run returns files_total and
 * progress_percent up front, and a later poll that happens not to repeat them
 * must not wipe the file caption off the row.
 */
function readRunFields(job) {
    if (!job) return {};
    const out = {};
    const set = (key, value) => { if (value !== undefined && value !== null) out[key] = value; };

    if (Number.isFinite(job.progress_percent)) out.progressPercent = job.progress_percent;
    if (typeof job.is_determinate === 'boolean') out.isDeterminate = job.is_determinate;
    set('filesTotal', Number.isFinite(job.files_total) ? job.files_total : job.counters?.files_total);
    set('filesDone', Number.isFinite(job.files_done) ? job.files_done : job.counters?.files_done);
    set('stages', job.stages);
    // The live field is `current_phase` (confirmed 2026-08-18 via a real
    // GET /pipeline/jobs/{id} poll — job.phases is an OBJECT keyed by phase
    // name, e.g. {validate:{...}, extract:{...}}, not the `stages[]` array
    // this file's stages-rollup fallback expects). `current_stage` was never a
    // real field; PipelineRunRow's `detail` line read it every render and
    // always got undefined, silently dropping the "Stage: …" caption.
    set('currentStage', job.current_phase);
    set('currentLabel', job.current_label);
    set('currentItem', job.current_item);
    return out;
}

export function usePipelineRuns({ selectedPlantId }) {
    const plantCode = selectedPlantId?.id;
    const [pipelineStatuses, setPipelineStatuses] = useState(IDLE_STATUSES);
    const invalidateConnectorState = useInvalidateConnectorState(plantCode);

    // stage -> resolve(); lets triggerPipeline keep its await-until-terminal
    // contract even though the polling that decides "terminal" now lives here.
    const resolversRef = useRef({});
    const _jobIdsLoaded = useRef(false);

    // ── Reset on plant change ──────────────────────────────────────────────
    useEffect(() => {
        if (!plantCode) {
            setPipelineStatuses(IDLE_STATUSES);
            return;
        }

        setPipelineStatuses((prev) => {
            const next = { ...IDLE_STATUSES };
            const ctxParams = loadCtxParams(plantCode);
            Object.entries(ctxParams).forEach(([stage, params]) => {
                if (next[stage] && params) {
                    next[stage] = { ...next[stage], ...params };
                }
            });
            return next;
        });
    }, [plantCode]);

    // ── Poll every non-terminal run ──────────────────────────────────────────
    const activeRuns = useMemo(
        () => PIPELINE_STAGE_KEYS
            .filter((stage) => {
                const ps = pipelineStatuses[stage];
                return !!ps?.jobId && (ps.status === 'running' || ps.status === 'queued');
            })
            .map((stage) => ({ stage, jobId: pipelineStatuses[stage].jobId })),
        [pipelineStatuses]
    );

    const polls = usePipelineJobPolls(plantCode, activeRuns);

    // `polls` is a fresh array every render, so the effect is keyed off a value
    // signature instead of its identity — otherwise this would loop forever.
    const pollsRef = useRef(polls);
    pollsRef.current = polls;
    const pollSignature = polls
        .map((p) => `${p.stage}:${p.job?.status ?? ''}:${p.job?.progress_percent ?? ''}:${p.isError ? 'e' : ''}`)
        .join('|');

    useEffect(() => {
        const current = pollsRef.current;
        if (current.length === 0) return;

        const finished = [];

        setPipelineStatuses((prev) => {
            // React may invoke this updater twice (StrictMode). Clearing here keeps
            // it idempotent — otherwise the second pass re-pushes the same stages.
            finished.length = 0;
            let changed = false;
            const next = { ...prev };

            for (const { stage, job, isError, error } of current) {
                const ps = prev[stage];
                if (!ps) continue;

                if (isError) {
                    // usePipelineJobPolls stops after 5 consecutive failures, so this
                    // is a genuinely unreachable job rather than one flaky tick.
                    next[stage] = { ...ps, status: 'failed', error: error?.message || 'Lost contact with the pipeline job' };
                    changed = true;
                    finished.push([stage, 'failed']);
                    continue;
                }
                if (!job) continue;

                const patch = { ...readRunFields(job), status: job.status };
                if (job.error) patch.error = job.error;
                if (job.upload_batch_id) patch.batchId = job.upload_batch_id;

                const merged = { ...ps, ...patch };
                if (!shallowEqual(ps, merged)) {
                    next[stage] = merged;
                    changed = true;
                }

                if (isTerminalPipelineStatus(job.status) && !isTerminalPipelineStatus(ps.status)) {
                    finished.push([stage, job.status]);
                    if (plantCode) {
                        saveCtxParams(plantCode, stage, {
                            jobId: job.pipeline_job_id || ps.jobId,
                            batchId: job.upload_batch_id || ps.batchId,
                            // Persisted so a later reload knows not to re-attach.
                            status: job.status,
                        });
                    }
                }
            }

            return changed ? next : prev;
        });

        // Resolve outside the state updater — it must not run twice under StrictMode.
        for (const [stage, status] of finished) {
            resolversRef.current[stage]?.(status);
            delete resolversRef.current[stage];
        }

        // A finished run is the single biggest change to /connectors/state and
        // /flow/state there is — every file it touched moved stage — yet
        // nothing here refreshed either read. The four existing
        // invalidateConnectorState() calls all sit on COMMIT paths, so a plain
        // "Process Data" run left the source cards and the sidebar rendering
        // pre-run state until the user manually reloaded.
        //
        // This is the right chokepoint rather than each trigger site: it fires
        // for every stage, and equally for a retry or for a run resumed from
        // localStorage after a reload, none of which go through the commit
        // helpers.
        if (finished.length > 0) invalidateConnectorState();
    }, [pollSignature, plantCode, invalidateConnectorState]);

    // ── Registration ─────────────────────────────────────────────────────────

    /**
     * Record a freshly started run and return a promise that settles with its
     * terminal status. `runResponse` is the POST /run payload — its
     * stages_planned/is_determinate/files_total let the stepper render before the
     * first poll comes back.
     */
    const registerRun = useCallback((stage, { jobId, batchId, ctxParams, runResponse }) => {
        // Persist `running` so a reload mid-run re-attaches instead of losing it.
        if (plantCode) saveCtxParams(plantCode, stage, { jobId, batchId, status: 'running' });

        setPipelineStatuses((prev) => ({
            ...prev,
            [stage]: {
                ...prev[stage],
                ...ctxParams,
                jobId,
                batchId,
                status: 'running',
                error: undefined,
                startedAt: Date.now(),
                stagesPlanned: runResponse?.stages_planned || undefined,
                ...readRunFields(runResponse),
            },
        }));

        return new Promise((resolve) => { resolversRef.current[stage] = resolve; });
    }, [plantCode]);

    /** Mark a stage failed without ever having had a job id (the trigger itself failed). */
    const failRun = useCallback((stage, error) => {
        setPipelineStatuses((prev) => ({ ...prev, [stage]: { ...prev[stage], status: 'failed', error } }));
        resolversRef.current[stage]?.('failed');
        delete resolversRef.current[stage];
    }, []);

    // ── Cancel / retry ───────────────────────────────────────────────────────
    const cancelMutation = useCancelPipelineJob(plantCode);
    const retryMutation = useRetryPipelineJob(plantCode);

    const cancelRun = useCallback(async (stage) => {
        const jobId = pipelineStatuses[stage]?.jobId;
        if (!jobId) return;
        await cancelMutation.mutateAsync(jobId);
        // Don't force status here: the invalidated poll reports `cancelled`
        // itself, and a job that finished mid-cancel must keep its real result
        // (the endpoint is a no-op 200 in that case).
    }, [cancelMutation, pipelineStatuses]);

    const retryRun = useCallback(async (stage, scope = 'failed_only') => {
        const jobId = pipelineStatuses[stage]?.jobId;
        if (!jobId) return undefined;
        const data = await retryMutation.mutateAsync({ jobId, scope });
        const newJobId = data?.pipeline_job_id || data?.job_id;
        if (!newJobId) return undefined;

        const ctxParams = { jobId: newJobId, batchId: data?.upload_batch_id || pipelineStatuses[stage]?.batchId };
        if (plantCode) saveCtxParams(plantCode, stage, ctxParams);
        return registerRun(stage, { jobId: newJobId, batchId: ctxParams.batchId, ctxParams, runResponse: data });
    }, [retryMutation, pipelineStatuses, plantCode, registerRun]);

    // Whether a stage is retryable is derived where it is rendered
    // (usePipelineRunView#canRetryStage) rather than threaded through the context.
    return {
        pipelineStatuses, setPipelineStatuses,
        registerRun, failRun,
        cancelRun, retryRun,
        isCancelling: cancelMutation.isPending,
        isRetrying: retryMutation.isPending,
    };
}

/** One level deep — run entries are flat objects of primitives plus a stages array. */
function shallowEqual(a, b) {
    const ak = Object.keys(a);
    const bk = Object.keys(b);
    if (ak.length !== bk.length) return false;
    return ak.every((k) => a[k] === b[k]);
}
