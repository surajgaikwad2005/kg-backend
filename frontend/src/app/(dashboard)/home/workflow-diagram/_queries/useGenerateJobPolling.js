'use client';

/**
 * useGenerateJobPolling — TanStack Query poller for batch-generation jobs
 * (Phase 12).
 *
 * Replaces the `setInterval` + `pollRef` + manual `clearInterval` pattern in
 * useSidebarState.js. Automatically stops polling when the job reaches a
 * terminal state or after MAX_CONSECUTIVE_FAILURES (from useJobPolling).
 * Unmount cleanup is automatic — the leak class disappears with the pattern.
 */
import { useJobPolling } from '@/src/lib/query';
import { queryKeys } from '@/src/lib/query';
import { useApp } from '@/src/context/AppContext';
import { getGenerateJobStatus } from '@/src/services/cpcp/diagram/diagramService';

const POLL_INTERVAL_MS = 2000;

/** Returns true when the job no longer needs polling. */
const isTerminal = (data) => {
    const status = data?.status?.toLowerCase?.() ?? '';
    return status === 'completed' || status === 'failed' || status === 'error';
};

/**
 * Poll a batch-generation job's status until it completes or fails.
 *
 * @param {string|null} jobId    — polling is disabled until this is truthy.
 * @param {boolean}     enabled  — extra gate ANDed with jobId.
 */
export function useGenerateJobPolling(jobId, { enabled = true } = {}) {
    const { plantCode } = useApp();
    return useJobPolling({
        queryKey: queryKeys.cpcpConfig.generateJob(plantCode, jobId),
        queryFn: () => getGenerateJobStatus(plantCode, jobId),
        jobId,
        isTerminal,
        interval: POLL_INTERVAL_MS,
        enabled: !!plantCode && enabled,
    });
}
