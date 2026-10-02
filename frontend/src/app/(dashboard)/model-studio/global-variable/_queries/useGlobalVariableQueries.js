'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/src/lib/query/keys';
import {
    listGlobalVariables,
    saveGlobalVariable,
    updateGlobalVariable,
    deleteGlobalVariable,
} from '@/src/services/model-studio/global-variable/globalVariableService';

export function useGlobalVariablesQuery(plantCode) {
    return useQuery({
        queryKey: queryKeys.modelStudio.globalVariable.list(plantCode),
        queryFn: () => listGlobalVariables({ plant_code_id: plantCode }),
        enabled: !!plantCode,
    });
}

export function useSaveGlobalVariableMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: saveGlobalVariable,
        onSuccess: (_data, { plant_code_id }) => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.modelStudio.globalVariable.list(plant_code_id),
            });
        },
    });
}

export function useUpdateGlobalVariableMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateGlobalVariable,
        onSuccess: (_data, { plant_code_id }) => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.modelStudio.globalVariable.list(plant_code_id),
            });
        },
    });
}

export function useDeleteGlobalVariableMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteGlobalVariable,
        onSuccess: (_data, { plant_code_id }) => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.modelStudio.globalVariable.list(plant_code_id),
            });
        },
    });
}
