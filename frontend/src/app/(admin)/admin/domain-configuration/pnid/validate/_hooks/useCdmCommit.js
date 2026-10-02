'use client';

/**
 * useCdmCommit — wires the validate screen's "Complete" action to the real
 * P0 CDM pipeline instead of the local-only state update it had before.
 *
 * Reuses existing, already-shipped service functions and the app's sanctioned
 * job-polling hook (rule 49) — no new API surface on either end:
 *   runPipeline(stage: 'pnid')   → same endpoint the DSI P&ID flow already
 *                                  uses (usePipelineOrchestration.js)
 *   getPipelineJob               → poll until terminal
 *   commitContext('pnid', ...)   → same commit endpoint the DSI flow already
 *                                  uses; called with no row data so the
 *                                  backend's own staging fallback reads the
 *                                  canonical rows the pipeline just wrote
 */
import { useCallback, useState } from 'react';
import * as cdm from '@/src/services/domain-configuration/common';
import { useJobPolling } from '@/src/lib/query';

export function useCdmCommit({ plantCode, fileNames = [] }) {
    const [jobId, setJobId] = useState(null);
    const [phase, setPhase] = useState('idle'); // idle | running | committing | done | error
    const [error, setError] = useState(null);
    const [commitResult, setCommitResult] = useState(null);

    const jobQuery = useJobPolling({
        queryKey: ['pnidCdmPipelineJob', plantCode, jobId],
        queryFn: ({ signal }) => cdm.getPipelineJob(jobId, plantCode, { signal }),
        jobId,
        isTerminal: (data) => cdm.isTerminalPipelineStatus(data?.status),
    });

    const job = jobQuery.data ? cdm.normalizePipelineJob(jobQuery.data) : null;

    const runAndCommit = useCallback(async () => {
        setError(null);
        setCommitResult(null);
        setPhase('running');
        try {
            const started = await cdm.runPipeline({
                stage: 'pnid',
                plant_code_id: plantCode,
                file_names: fileNames,
            });
            setJobId(started.pipeline_job_id);
        } catch (e) {
            setError(e?.message || 'Failed to start the P&ID CDM pipeline');
            setPhase('error');
        }
    }, [plantCode, fileNames]);

    const commit = useCallback(async () => {
        setError(null);
        setPhase('committing');
        try {
            const result = await cdm.commitContext('pnid', { plant_code_id: plantCode });
            setCommitResult(result);
            setPhase('done');
        } catch (e) {
            setError(e?.message || 'Failed to commit P&ID context to the database');
            setPhase('error');
        }
    }, [plantCode]);

    return { phase, error, job, jobId, commitResult, runAndCommit, commit };
}
