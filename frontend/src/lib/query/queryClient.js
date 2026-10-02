/**
 * queryClient.js
 * The single QueryClient factory + the shared retry predicate.
 *
 * TanStack Query sits ABOVE the service layer — it never replaces it. Every
 * queryFn/mutationFn calls a function from src/services/**, which calls
 * apiClient, which fetches a local /api/* proxy route. Rule 19 ("no axios, use
 * raw fetch") is untouched: apiClient's raw fetch is still the only transport.
 * Query is a cache + request-state manager, not an HTTP client.
 */
import { QueryClient, MutationCache } from '@tanstack/react-query';
import { toast } from '@/src/components/ui/toast/toastApi';

/**
 * Statuses that must NEVER be retried. apiClient throws ApiError({ status }).
 *
 *   0   → apiClient's PLANT_CODE_REQUIRED preflight (src/services/apiClient.js).
 *         It never touched the network and it already fired its own toast;
 *         retrying re-fires that toast N times for a condition that cannot
 *         resolve itself.
 *   401 → AuthInterceptor already refreshed the token and replayed the request
 *         ONCE, below apiClient. By the time an error surfaces here the refresh
 *         has already failed. A retry at this level stacks on top of that
 *         mechanism and multiplies requests during an outage.
 *   403 → deterministic authorization failure; retrying is pure noise.
 *   404 → the resource is absent, not flaky.
 *   422 → validation failure; the same payload will fail identically.
 */
const NO_RETRY_STATUS = new Set([0, 401, 403, 404, 422]);

/** Aborted requests (query cancellation, user-cancelled uploads) are not failures. */
const isAbortError = (error) => error?.name === 'AbortError';

export const shouldRetry = (failureCount, error) => {
    if (isAbortError(error)) return false;
    if (NO_RETRY_STATUS.has(error?.status)) return false;
    return failureCount < 2;
};

/**
 * Mutations toast on failure; queries render an inline error state instead.
 *
 * A mutation is a user-initiated action — silence after a click is the worst
 * possible outcome, so this catches every mutation that does not opt out.
 * Queries deliberately do NOT get a global handler: with refetchInterval
 * pollers running, a global query-error toast would fire every few seconds for
 * the whole duration of a backend outage.
 *
 * Opt out per mutation with meta: { silent: true }.
 * Customise the heading with meta: { errorTitle: 'Upload failed' }.
 */
function onMutationError(error, _variables, _context, mutation) {
    if (mutation.meta?.silent) return;
    if (isAbortError(error)) return;
    // apiClient already toasted 'Plant code required' before any network
    // call — a second toast here would just duplicate it.
    if (error?.status === 0 && error?.data?.error === 'PLANT_CODE_REQUIRED') return;

    toast.error(
        mutation.meta?.errorTitle ?? 'Action failed',
        error?.message ?? 'Something went wrong. Please try again.',
    );
}

export function makeQueryClient() {
    return new QueryClient({
        // Constructed per client, NOT at module scope: a shared cache instance
        // would carry mutation state across SSR requests between users — the
        // same hazard the useState() wrapper in QueryProvider guards against for
        // the client itself. The handler above is stateless, so it can be shared.
        mutationCache: new MutationCache({ onError: onMutationError }),
        defaultOptions: {
            queries: {
                // Today every mount refetches. 30s is short enough that nobody
                // sees stale data inside a workflow, but long enough that moving
                // between sibling tabs stops re-hitting the backend. Reference
                // data (plant registry, document types) overrides this upward;
                // job-status polls override it down to 0.
                staleTime: 30_000,
                gcTime: 5 * 60_000,
                retry: shouldRetry,
                retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
                // This is an internal ops tool — users tab away to Excel/SAP
                // constantly. Refetch-on-focus would fire dozens of requests per
                // session against backends that are frequently unstable in dev
                // (CLAUDE.md rule 43). Screens that genuinely want live data opt
                // in explicitly via refetchInterval.
                refetchOnWindowFocus: false,
                refetchOnReconnect: true,
                // No error boundaries are wired for data failures anywhere in the
                // app (there are no error.jsx segments), so errors are handled as
                // isError render states per component.
                throwOnError: false,
            },
            mutations: {
                retry: false,
            },
        },
    });
}
