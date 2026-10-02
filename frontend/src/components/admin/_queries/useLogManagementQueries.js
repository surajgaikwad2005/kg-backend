'use client';

/**
 * useLogManagementQueries — Phase 10.
 *
 * Five straightforward `refetchInterval` pollers replacing the hand-rolled
 * `setInterval` pairs in LogsManagement.jsx (30s), PipelineLogsViewer.jsx
 * (5s), and the six-copy `Promise.allSettled` fan-out in
 * useConnectorActivity.js. None of these are "poll until terminal" job
 * status — they're periodic list/tail refreshes, so plain `useQuery` +
 * `refetchInterval` is the right primitive, not `useJobPolling`.
 *
 * `refetchIntervalInBackground: false` on every hook here — a log tail or
 * activity feed refreshing in a hidden tab is pure waste. This is the
 * opposite of a job poller (useConnectorJob, useJobPolling), which must keep
 * running when the tab is hidden because the job itself keeps running.
 */
import { useQuery, useQueries, keepPreviousData } from '@tanstack/react-query';
import { queryKeys } from '@/src/lib/query';
import { getActivity, getLogEvents, getLogsSummary, getLogs } from '@/src/services/log-management/logsService';
import { parseLinesToLogEntries } from '@/src/components/admin/admin.utils';

const REFRESH_INTERVAL_MS = 30_000;

/** Pre-aggregated summary counts (events by level, job/commit outcomes). */
export function useLogsSummary(plantCode) {
    return useQuery({
        queryKey: queryKeys.logManagement.summary(plantCode),
        queryFn: () => getLogsSummary({ plantCodeId: plantCode }),
        enabled: !!plantCode,
        refetchInterval: REFRESH_INTERVAL_MS,
        refetchIntervalInBackground: false,
    });
}

/** View-level derivation (module scope — stable identity, CLAUDE.md rule 22/54). */
const selectActivityRows = (d) => d?.activity ?? [];

/** Who-did-what activity feed (commits + pipeline runs), newest first. */
export function useLogActivity(plantCode, limit = 100) {
    return useQuery({
        queryKey: queryKeys.logManagement.activity(plantCode, limit),
        queryFn: () => getActivity({ plantCodeId: plantCode, limit }),
        enabled: !!plantCode,
        select: selectActivityRows,
        refetchInterval: REFRESH_INTERVAL_MS,
        refetchIntervalInBackground: false,
    });
}

const selectLogEvents = (d) => ({
    events: d?.events ?? [],
    facets: d?.facets ?? { level: {}, source: {} },
});

/**
 * Server-parsed, server-filtered log events. Filters (`level`/`source`/`query`)
 * live IN the key, so Query itself refetches on every filter change instead of
 * the effect-dependency chain this replaces — `loadEvents` was recreated on
 * every keystroke in `query` and included in the effect's dep array, so typing
 * already re-fetched on every character; that behavior carries over unchanged
 * here, it's just declarative now. `keepPreviousData` stops the table blanking
 * between keystrokes/facet clicks, per the Phase 10 plan.
 */
export function useLogEvents(plantCode, { level, source, query, limit = 800 } = {}, { enabled = true } = {}) {
    const params = { level, source: source || undefined, q: query || undefined, limit };
    return useQuery({
        queryKey: queryKeys.logManagement.events(plantCode, params),
        queryFn: () => getLogEvents({ plantCodeId: plantCode, ...params }),
        enabled: enabled && !!plantCode,
        select: selectLogEvents,
        placeholderData: keepPreviousData,
    });
}

/** Tail the last `lines` lines of one log file. `autoRefresh` drives the 5s poll. */
export function useLogTail(plantCode, logKey, lines = 500, { autoRefresh = false } = {}) {
    return useQuery({
        queryKey: queryKeys.logManagement.tail(plantCode, logKey, lines),
        queryFn: () => getLogs(logKey, lines, plantCode),
        enabled: !!plantCode && !!logKey,
        refetchInterval: autoRefresh ? 5_000 : false,
        refetchIntervalInBackground: false,
    });
}

// ── Connector activity fan-out ──────────────────────────────────────────────
// Same 6 keys `useConnectorActivity.js:14` hardcoded (a subset of the 8-key
// `PIPELINE_LOG_KEYS` — no `pnid_pipeline`/`docs_pipeline`). Preserved exactly;
// widening it to the full constant would be a scope change, not a migration.
const CONNECTOR_ACTIVITY_KEYS = ['api', 'connectors', 'pnid', 'docs', 'sap', 'timeseries'];

/**
 * Folds the per-key tail results into one sorted entry list + stats, module
 * scope so `combine`'s identity is stable (same requirement as `select`).
 *
 * Replaces the old `if (allEntries.length > 0) setRealLogEntries(...)` guard,
 * which only ever wrote non-empty results and otherwise silently kept
 * whatever was there before (including `null` forever, if the very first
 * poll came back empty). That guard is unnecessary here: each per-key query
 * already keeps its own last-successful `data` across a failed/empty
 * refetch, so `entries` is simply null while any key's first fetch is still
 * in flight, and the real (possibly empty) aggregate once every key has
 * settled at least once.
 */
const combineConnectorActivity = (results) => {
    const entries = [];
    results.forEach(({ data }, i) => {
        if (!data) return;
        entries.push(...parseLinesToLogEntries(data.lines ?? [], CONNECTOR_ACTIVITY_KEYS[i]));
    });
    entries.sort((a, b) => b.timestamp.localeCompare(a.timestamp));

    return {
        entries: results.some((r) => r.isLoading) ? null : entries,
        logStats: {
            success: entries.filter((e) => e.status === 'Success').length,
            failed: entries.filter((e) => e.status === 'Failed').length,
            warnings: entries.filter((e) => e.status === 'Warning').length,
            records: entries.reduce((acc, e) => acc + e.records, 0),
        },
        refetch: () => Promise.all(results.map((r) => r.refetch())),
    };
};

/** Six parallel log tails, parsed into connector activity rows + summary stats. */
export function useConnectorActivityLogs(plantCode) {
    return useQueries({
        queries: CONNECTOR_ACTIVITY_KEYS.map((key) => ({
            queryKey: queryKeys.logManagement.tail(plantCode, key, 500),
            queryFn: () => getLogs(key, 500, plantCode),
            enabled: !!plantCode,
            refetchInterval: REFRESH_INTERVAL_MS,
            refetchIntervalInBackground: false,
        })),
        combine: combineConnectorActivity,
    });
}
