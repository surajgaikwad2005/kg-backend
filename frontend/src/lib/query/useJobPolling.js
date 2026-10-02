'use client';

import { useQuery } from '@tanstack/react-query';

/**
 * Stop polling after this many consecutive failures. The hand-rolled pollers
 * this hook replaces swallow poll errors in empty `catch {}` blocks, so a dead
 * backend gets hammered forever with nothing shown to the user. Bounded failure
 * is a deliberate behaviour change: the query lands in an error state instead.
 */
const MAX_CONSECUTIVE_FAILURES = 5;

/**
 * The polling decision itself, as a bare `refetchInterval` callback.
 *
 * Exported because `useJobPolling` can only watch ONE job, and some flows watch
 * several at once (e.g. the CDM pipeline runs pnid/docs/ts/sap in parallel) and
 * must build their query array through `useQueries` instead. Those callers get
 * the same stop-on-terminal + bounded-failure behaviour from here rather than
 * hand-rolling a second copy of it that can drift.
 */
export function makeJobPollRefetchInterval({ interval, isTerminal }) {
    return (query) => {
        if (query.state.fetchFailureCount >= MAX_CONSECUTIVE_FAILURES) return false;
        const data = query.state.data;
        if (!data) return interval;
        return isTerminal(data) ? false : interval;
    };
}

/**
 * useJobPolling — poll a backend job until it reaches a terminal state.
 *
 * Replaces the `setInterval` + ref + manual-`clearInterval` pattern duplicated
 * ~15x across the app (six verbatim copies of the connector-job poll alone,
 * five of which never clear on unmount). Unsubscribing on unmount is automatic
 * here, so the leak class disappears with the pattern.
 *
 * @param {object}   opts
 * @param {Array}    opts.queryKey    Cache key — must include plantCode + jobId.
 * @param {Function} opts.queryFn     Status fetcher; receives { signal }.
 * @param {string}   opts.jobId       Polling is disabled until this exists.
 * @param {Function} opts.isTerminal  (data) => boolean. Returning true stops the poll.
 * @param {number}   [opts.interval]  Milliseconds between polls. Default 2500.
 * @param {boolean}  [opts.enabled]   Extra gate ANDed with `jobId` (e.g. a stage flag).
 */
export function useJobPolling({
    queryKey,
    queryFn,
    jobId,
    isTerminal,
    interval = 2500,
    enabled = true,
    ...rest
}) {
    return useQuery({
        // Caller overrides go FIRST so they can tune presentation options
        // (placeholderData, notifyOnChangeProps, ...) without being able to
        // silently replace the safety logic below. Spread last, a caller passing
        // `refetchInterval` — a natural guess, given `interval` exists — would
        // wipe out both the isTerminal stop and the failure circuit-breaker, and
        // poll a finished job forever: the exact leak this hook exists to end.
        ...rest,
        queryKey,
        queryFn,
        enabled: Boolean(enabled && jobId),
        // A job status is never reusable — it is a point-in-time reading, and
        // the whole point of this hook is to keep asking for a fresh one.
        staleTime: 0,
        gcTime: 0,
        // The interval IS the retry. Layering `retry` on top would fire extra
        // requests between ticks and distort the polling cadence.
        retry: false,
        refetchInterval: makeJobPollRefetchInterval({ interval, isTerminal }),
        // Jobs keep running server-side when the tab is hidden, so their status
        // must keep being read. (Periodic LIST refreshes are the opposite case
        // and should set this to false.)
        refetchIntervalInBackground: true,
    });
}
