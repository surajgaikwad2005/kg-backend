'use client';

/**
 * usePipelineQueries — the CDM pipeline router's cache layer (rules 46–57).
 *
 * These replace the Promise-wrapped `setInterval` that used to live in
 * usePipelineOrchestration.js, which never cleared on unmount, swallowed poll
 * errors in an empty `catch {}`, treated only completed/failed as terminal (so a
 * cancelled job polled forever), and faked progress with `Math.random() * 8 + 4`.
 * Progress is now read from the server.
 *
 * Only the endpoints with a real consumer get a hook here. `/pipeline/jobs` is
 * consumed through Data Activity's own hook, and the two `/pipeline/outputs`
 * endpoints exist as service functions awaiting a UI — adding hooks for them now
 * would just be dead code.
 */
import { useQueries, useMutation, useQueryClient } from '@tanstack/react-query';
import { makeJobPollRefetchInterval, queryKeys } from '@/src/lib/query';
import * as pipeline from '@/src/services/domain-configuration/common';

const JOB_POLL_INTERVAL = 3000;

/**
 * Poll SEVERAL pipeline jobs at once — the CDM flow runs pnid/docs/ts/sap in
 * parallel, and `useJobPolling` can only watch one. Each entry keeps the same
 * stop-on-terminal and bounded-failure behaviour via the shared
 * `makeJobPollRefetchInterval`.
 *
 * `refetchIntervalInBackground: true` is what lets a run keep progressing while
 * the modal is minimized or the tab is hidden — the job runs server-side
 * regardless, so its status must keep being read (rule 49).
 *
 * The returned array is a NEW array every render (it is mapped, and `useQueries`
 * itself returns fresh results each time). Consumers must key effects off a
 * derived signature, never off this array's identity.
 *
 * @param {string} plantCode
 * @param {Array<{ stage: string, jobId: string }>} runs Active runs to watch.
 * @returns {Array<{ stage, jobId, job, isError, error }>} one row per input run.
 */
export function usePipelineJobPolls(plantCode, runs) {
    const results = useQueries({
        queries: (runs || []).map(({ jobId }) => ({
            queryKey: queryKeys.domainConfig.pipeline.job(plantCode, jobId),
            queryFn: ({ signal }) => pipeline.getPipelineJob(jobId, plantCode, { signal }),
            select: pipeline.normalizePipelineJob,
            enabled: !!plantCode && !!jobId,
            staleTime: 0,
            gcTime: 0,
            retry: false,
            refetchInterval: makeJobPollRefetchInterval({
                interval: JOB_POLL_INTERVAL,
                isTerminal: (d) => pipeline.isTerminalPipelineStatus(d?.status),
            }),
            refetchIntervalInBackground: true,
        })),
    });

    return (runs || []).map((run, i) => ({
        ...run,
        job: results[i]?.data ?? null,
        isError: !!results[i]?.isError,
        error: results[i]?.error ?? null,
    }));
}

export function useRunPipelineMutation(plantCode) {
    const queryClient = useQueryClient();
    return useMutation({
        meta: { errorTitle: 'Pipeline failed to start' },
        mutationFn: (body) => pipeline.runPipeline(body),
        // A run regenerates everything downstream for this plant, and adds a row
        // to the jobs list Data Activity reads.
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: queryKeys.domainConfig.all(plantCode) });
        },
    });
}

export function useCancelPipelineJob(plantCode) {
    const queryClient = useQueryClient();
    return useMutation({
        meta: { errorTitle: 'Could not cancel pipeline' },
        mutationFn: (jobId) => pipeline.cancelPipelineJob(jobId, plantCode),
        // Refetch the job so the poller sees `cancelled` and stops itself now,
        // instead of waiting out another tick.
        onSuccess: (_data, jobId) => {
            void queryClient.invalidateQueries({
                queryKey: queryKeys.domainConfig.pipeline.job(plantCode, jobId),
            });
        },
    });
}

/** Re-run a finished job. Returns a NEW pipeline_job_id, so the caller must re-register the run. */
export function useRetryPipelineJob(plantCode) {
    const queryClient = useQueryClient();
    return useMutation({
        meta: { errorTitle: 'Could not retry pipeline' },
        mutationFn: ({ jobId, scope = 'failed_only' }) =>
            pipeline.retryPipelineJob(jobId, plantCode, { scope }),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: queryKeys.domainConfig.all(plantCode) });
        },
    });
}
