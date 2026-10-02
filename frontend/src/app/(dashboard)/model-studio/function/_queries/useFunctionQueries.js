'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/src/lib/query/keys';
import {
    listFunctions,
    getFunction,
    runFunction,
    saveFunction,
    updateFunction,
    deleteFunction,
} from '@/src/services/model-studio/function/functionService';

export function useFunctionsQuery(plantCode) {
    return useQuery({
        queryKey: queryKeys.modelStudio.function.list(plantCode),
        queryFn: () => listFunctions(plantCode),
        enabled: !!plantCode,
    });
}

export function useFunctionDetailQuery(plantCode, functionId) {
    return useQuery({
        queryKey: queryKeys.modelStudio.function.detail(plantCode, functionId),
        queryFn: () => getFunction(plantCode, functionId),
        enabled: !!plantCode && !!functionId,
    });
}

export function useSaveFunctionMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ plantCode, payload }) => saveFunction(plantCode, payload),
        onSuccess: (_data, { plantCode }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.modelStudio.function.all(plantCode) });
        },
    });
}

export function useUpdateFunctionMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ plantCode, functionId, payload }) => updateFunction(plantCode, functionId, payload),
        onSuccess: (_data, { plantCode }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.modelStudio.function.all(plantCode) });
        },
    });
}

export function useDeleteFunctionMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ plantCode, functionId }) => deleteFunction(plantCode, functionId),
        onSuccess: (_data, { plantCode }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.modelStudio.function.all(plantCode) });
        },
    });
}

export function useRunFunctionMutation() {
    return useMutation({
        mutationFn: ({ plantCode, payload }) => runFunction(plantCode, payload),
    });
}
