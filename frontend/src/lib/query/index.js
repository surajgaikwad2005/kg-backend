/**
 * Barrel for the TanStack Query foundation.
 * Import from '@/src/lib/query' — never reach into the individual modules.
 */
export { QueryProvider } from './QueryProvider';
export { makeQueryClient, shouldRetry } from './queryClient';
export { queryKeys } from './keys';
export { useJobPolling, makeJobPollRefetchInterval } from './useJobPolling';
export { useUploadMutation } from './useUploadMutation';
