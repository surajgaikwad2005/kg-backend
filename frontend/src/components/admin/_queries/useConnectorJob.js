'use client';

/**
 * useConnectorJob — one connector-job poller to replace six (Phase 1d).
 *
 * The same ~20-line `setInterval` block was copy-pasted at:
 *   usePnidFormState.js:152, useConfigModalActions.js:79/121/261,
 *   useDocSourceModal.js:162, ConfigModal.jsx:129
 * plus a resume-on-mount variant in useSourceLifecycle.js:164.
 *
 * Every copy clears its interval when the job reaches a terminal state or
 * throws — but none of them clear it on UNMOUNT. Closing the config modal
 * mid-upload therefore leaves a 2s poll running against the backend for the rest
 * of the session. That whole class of leak disappears here, because the polling
 * is owned by a query that unsubscribes when its component unmounts.
 *
 * Two shapes are exposed because the call sites genuinely differ:
 *   - `useConnectorJob`      declarative, for components that hold a jobId in state.
 *   - `usePollConnectorJob`  imperative and awaitable, for the async submit
 *                            handlers that create a jobId mid-flow and need to
 *                            keep their existing `await`-style control flow.
 */
import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useJobPolling, queryKeys } from '@/src/lib/query';
import * as common from '@/src/services/domain-configuration/common/connectorsService';

const POLL_INTERVAL_MS = 2000;
/** Matches every copy of the old poller's stop condition. */
export const isConnectorJobTerminal = (d) => d?.status === 'completed' || d?.status === 'failed';

/**
 * Declarative poller. Polling starts when `jobId` becomes truthy and stops on a
 * terminal status, on unmount, or after the shared failure circuit-breaker
 * trips (see useJobPolling).
 */
export function useConnectorJob({ connector, jobId, plantCode, enabled = true }) {
    return useJobPolling({
        queryKey: queryKeys.domainConfig.connector.job(plantCode, connector, jobId),
        queryFn: () => common.getConnectorJob(connector, jobId, plantCode),
        jobId,
        isTerminal: isConnectorJobTerminal,
        interval: POLL_INTERVAL_MS,
        enabled: enabled && !!plantCode,
    });
}

/**
 * Imperative poller for the submit handlers.
 *
 * Returns a promise that resolves with the terminal job payload. It is built on
 * `fetchQuery`, so each poll still reads and writes the same cache entry the
 * declarative hook uses — but unlike the hand-rolled loops it replaces, it
 * cannot outlive the component: the AbortSignal wired to `signal` stops the loop
 * when the caller aborts, and a bounded failure count stops it when the backend
 * is down instead of retrying forever behind an empty catch.
 *
 * @returns {(opts: {connector: string, jobId: string, signal?: AbortSignal}) => Promise<object>}
 */
export function usePollConnectorJob(plantCode) {
    const queryClient = useQueryClient();

    return useCallback(async ({ connector, jobId, signal, maxFailures = 5 }) => {
        let consecutiveFailures = 0;

        for (;;) {
            if (signal?.aborted) throw new DOMException('Polling aborted', 'AbortError');

            try {
                const data = await queryClient.fetchQuery({
                    queryKey: queryKeys.domainConfig.connector.job(plantCode, connector, jobId),
                    queryFn: () => common.getConnectorJob(connector, jobId, plantCode),
                    // A job status is a point-in-time reading; never reuse one.
                    staleTime: 0,
                    gcTime: 0,
                });
                consecutiveFailures = 0;
                if (isConnectorJobTerminal(data)) return data;
            } catch (err) {
                // Bounded, unlike the `catch { clearInterval }` copies which
                // either gave up on the first blip or (in the polling loops)
                // swallowed errors indefinitely.
                consecutiveFailures += 1;
                if (consecutiveFailures >= maxFailures) throw err;
            }

            await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
        }
    }, [queryClient, plantCode]);
}
