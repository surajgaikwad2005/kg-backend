'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/src/lib/query/keys';
import {
    getIntegratedLabels,
    getIntegratedColumns,
    getIntegratedView,
    recomputeIntegratedView,
} from '@/src/services/domain-configuration/integrated';
import { useToast } from '@/src/components/ui/Toast';

/**
 * Fetch domain labels with row counts for the integrated review.
 */
export function useIntegratedLabels(plantCode) {
    return useQuery({
        queryKey: queryKeys.domainConfig.integrated.labels(plantCode),
        queryFn: () => getIntegratedLabels(plantCode),
        enabled: Boolean(plantCode),
        staleTime: 60_000,
    });
}

/**
 * Fetch column definitions and schema layers for a specific domain label.
 */
export function useIntegratedColumns(label = 'integrity') {
    return useQuery({
        queryKey: queryKeys.domainConfig.integrated.columns(label),
        queryFn: () => getIntegratedColumns(label),
        enabled: Boolean(label),
        staleTime: 5 * 60_000,
    });
}

/**
 * Fetch paginated cross-domain matrix rows for a selected label.
 */
export function useIntegratedView({
    plantCode,
    label = 'integrity',
    includeProcessed = true,
    page = 1,
    pageSize = 50,
}) {
    return useQuery({
        queryKey: queryKeys.domainConfig.integrated.view(plantCode, {
            label,
            include_processed: includeProcessed,
            page,
            page_size: pageSize,
        }),
        queryFn: () =>
            getIntegratedView(plantCode, {
                label,
                include_processed: includeProcessed,
                page,
                page_size: pageSize,
            }),
        enabled: Boolean(plantCode && label),
    });
}

/**
 * Mutation to save edits and recompute/store the cross-domain integrated view.
 */
export function useRecomputeIntegrated() {
    const queryClient = useQueryClient();
    const { success, error } = useToast();

    return useMutation({
        mutationFn: ({ plantCode, payload }) => recomputeIntegratedView(plantCode, payload),
        onSuccess: (_data, variables) => {
            if (variables?.plantCode) {
                queryClient.invalidateQueries({
                    queryKey: queryKeys.domainConfig.integrated.all(variables.plantCode),
                });
            }
            success('Integrated view saved and recomputed successfully.');
        },
        onError: (err) => {
            error(err?.message || 'Failed to save and recompute integrated view.');
        },
    });
}
