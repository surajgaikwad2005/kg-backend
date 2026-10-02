'use client';

/**
 * useDataActivityQueries — Phase 7.
 *
 * One function, one interval — the smallest possible migration, and the
 * reference for every periodic LIST refresh that follows.
 */
import { useQuery } from '@tanstack/react-query';
import { getPipelineJobs } from '@/src/services/data-activity/activityService';
import { apiJobToFrontend } from '@/src/components/admin/admin.utils';

/** The endpoint returns either a bare array or { data: [...] }. */
const toJobArray = (res) => {
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.data)) return res.data;
    return [];
};

/**
 * View-level derivation, so it belongs in `select` (CLAUDE.md rule 54) — and at
 * module scope so its identity is stable and the memoization actually holds.
 */
const selectFrontendJobs = (res) => toJobArray(res).map(apiJobToFrontend);

/**
 * Pipeline jobs for a plant, refreshed every 30s.
 *
 * The pre-migration comment on the poll read "silently fail on poll; manual
 * refresh will surface UI errors". That is exactly what Query does by default:
 * a failed background refetch leaves the last good `data` on screen and only
 * flips `isError`, so the table keeps rendering rather than blanking.
 *
 * `refetchIntervalInBackground` is left at its default (false) deliberately —
 * this is a periodic list refresh, not a job-status poll, so there is nothing to
 * learn while the tab is hidden. (Job pollers set it true; see useJobPolling.)
 */
export function usePipelineJobs(plantCode, { stage } = {}) {
    return useQuery({
        queryKey: ['data-activity', plantCode, 'pipeline-jobs', stage ?? null],
        queryFn: () => getPipelineJobs({ stage, plantCode }),
        enabled: !!plantCode,
        select: selectFrontendJobs,
        refetchInterval: 30_000,
    });
}
