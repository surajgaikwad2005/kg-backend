'use client';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { queryKeys } from '@/src/lib/query/keys';
import {
    getExpressionList,
    getExpressionDetail,
    createExpression,
    modifyExpression,
    deleteExpression,
    pauseResumeExpression,
    testExpression,
    validateCron,
    searchTags,
} from '@/src/services/model-studio/expression/expressionService';

export function useExpressionsQuery(plantCode) {
    return useQuery({
        queryKey: queryKeys.modelStudio.expression.list(plantCode),
        queryFn: () => getExpressionList(plantCode),
        enabled: !!plantCode,
    });
}

export function useExpressionDetailQuery(plantCode, expressionId) {
    return useQuery({
        queryKey: queryKeys.modelStudio.expression.detail(plantCode, expressionId),
        queryFn: () => getExpressionDetail(plantCode, expressionId),
        enabled: !!plantCode && !!expressionId,
    });
}

export function useCronValidationQuery(plantCode, cronSchedule, enabled = true) {
    return useQuery({
        queryKey: queryKeys.modelStudio.expression.cronValidation(plantCode, cronSchedule),
        queryFn: () => validateCron(plantCode, cronSchedule),
        enabled: !!plantCode && !!cronSchedule && enabled,
        staleTime: 60_000,
    });
}

export function useTagSearchQuery(plantCode, query) {
    return useQuery({
        queryKey: queryKeys.modelStudio.expression.tagSearch(plantCode, query),
        queryFn: () => searchTags(plantCode, query),
        enabled: !!plantCode && !!query && query.length >= 1,
        placeholderData: keepPreviousData,
    });
}

export function useCreateExpressionMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ plantCode, payload }) => createExpression(plantCode, payload),
        onSuccess: (_data, { plantCode }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.modelStudio.expression.all(plantCode) });
        },
    });
}

export function useModifyExpressionMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ plantCode, expressionId, payload }) => modifyExpression(plantCode, expressionId, payload),
        onSuccess: (_data, { plantCode }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.modelStudio.expression.all(plantCode) });
        },
    });
}

export function useDeleteExpressionMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ plantCode, expressionId }) => deleteExpression(plantCode, expressionId),
        onSuccess: (_data, { plantCode }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.modelStudio.expression.all(plantCode) });
        },
    });
}

export function usePauseResumeExpressionMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ plantCode, expressionId, action }) => pauseResumeExpression(plantCode, expressionId, action),
        onSuccess: (_data, { plantCode }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.modelStudio.expression.all(plantCode) });
        },
    });
}

export function useTestExpressionMutation() {
    return useMutation({
        mutationFn: ({ plantCode, expression }) => testExpression(plantCode, expression),
    });
}
