'use client';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { queryKeys } from '@/src/lib/query/keys';
import { getExperimentList, createExperiment, modifyExperiment, deleteExperiment } from '@/src/services/model-studio/optimizer/experimentService';
import { getObjectiveFunctionList, createObjectiveFunction, modifyObjectiveFunction, deleteObjectiveFunction } from '@/src/services/model-studio/optimizer/objectiveFunctionService';
import { getConstraintsList, createConstraints, modifyConstraints, deleteConstraints } from '@/src/services/model-studio/optimizer/constraintsService';
import { getConstantsList, createConstants, modifyConstants, deleteConstants } from '@/src/services/model-studio/optimizer/constantsService';
import { getDeploymentList, createDeployment, modifyDeployment, deleteDeployment } from '@/src/services/model-studio/optimizer/deploymentService';
import { searchOptimizerTags } from '@/src/services/model-studio/optimizer/searchService';

// ── Experiments ─────────────────────────────────────────────────────────────

export function useOptimizerExperimentsQuery(plantCode) {
    return useQuery({
        queryKey: queryKeys.modelStudio.optimizer.all(plantCode),
        queryFn: () => getExperimentList(plantCode),
        enabled: !!plantCode,
    });
}

export function useCreateOptimizerExperimentMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ plantCode, payload }) => createExperiment(plantCode, payload),
        onSuccess: (_data, { plantCode }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.modelStudio.optimizer.all(plantCode) });
        },
    });
}

export function useModifyOptimizerExperimentMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ plantCode, expId, payload }) => modifyExperiment(plantCode, expId, payload),
        onSuccess: (_data, { plantCode }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.modelStudio.optimizer.all(plantCode) });
        },
    });
}

export function useDeleteOptimizerExperimentMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ plantCode, expId }) => deleteExperiment(plantCode, expId),
        onSuccess: (_data, { plantCode }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.modelStudio.optimizer.all(plantCode) });
        },
    });
}

// ── Objective Functions ─────────────────────────────────────────────────────

export function useObjectiveFunctionListQuery(plantCode) {
    return useQuery({
        queryKey: queryKeys.modelStudio.optimizer.objectiveFunction(plantCode, 'list'),
        queryFn: () => getObjectiveFunctionList(plantCode),
        enabled: !!plantCode,
    });
}

export function useCreateObjectiveFunctionMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ plantCode, payload }) => createObjectiveFunction(plantCode, payload),
        onSuccess: (_data, { plantCode }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.modelStudio.optimizer.all(plantCode) });
        },
    });
}

export function useModifyObjectiveFunctionMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ plantCode, id, payload }) => modifyObjectiveFunction(plantCode, id, payload),
        onSuccess: (_data, { plantCode }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.modelStudio.optimizer.all(plantCode) });
        },
    });
}

export function useDeleteObjectiveFunctionMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ plantCode, id }) => deleteObjectiveFunction(plantCode, id),
        onSuccess: (_data, { plantCode }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.modelStudio.optimizer.all(plantCode) });
        },
    });
}

// ── Constraints ─────────────────────────────────────────────────────────────

export function useConstraintsListQuery(plantCode) {
    return useQuery({
        queryKey: queryKeys.modelStudio.optimizer.constraints(plantCode, 'list'),
        queryFn: () => getConstraintsList(plantCode),
        enabled: !!plantCode,
    });
}

export function useCreateConstraintsMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ plantCode, payload }) => createConstraints(plantCode, payload),
        onSuccess: (_data, { plantCode }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.modelStudio.optimizer.all(plantCode) });
        },
    });
}

export function useModifyConstraintsMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ plantCode, id, payload }) => modifyConstraints(plantCode, id, payload),
        onSuccess: (_data, { plantCode }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.modelStudio.optimizer.all(plantCode) });
        },
    });
}

export function useDeleteConstraintsMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ plantCode, id }) => deleteConstraints(plantCode, id),
        onSuccess: (_data, { plantCode }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.modelStudio.optimizer.all(plantCode) });
        },
    });
}

// ── Constants ───────────────────────────────────────────────────────────────

export function useConstantsListQuery(plantCode) {
    return useQuery({
        queryKey: queryKeys.modelStudio.optimizer.constants(plantCode, 'list'),
        queryFn: () => getConstantsList(plantCode),
        enabled: !!plantCode,
    });
}

export function useCreateConstantsMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ plantCode, payload }) => createConstants(plantCode, payload),
        onSuccess: (_data, { plantCode }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.modelStudio.optimizer.all(plantCode) });
        },
    });
}

export function useModifyConstantsMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ plantCode, id, payload }) => modifyConstants(plantCode, id, payload),
        onSuccess: (_data, { plantCode }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.modelStudio.optimizer.all(plantCode) });
        },
    });
}

export function useDeleteConstantsMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ plantCode, id }) => deleteConstants(plantCode, id),
        onSuccess: (_data, { plantCode }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.modelStudio.optimizer.all(plantCode) });
        },
    });
}

// ── Deployments ─────────────────────────────────────────────────────────────

export function useDeploymentListQuery(plantCode) {
    return useQuery({
        queryKey: queryKeys.modelStudio.optimizer.deployment(plantCode, 'list'),
        queryFn: () => getDeploymentList(plantCode),
        enabled: !!plantCode,
    });
}

export function useCreateDeploymentMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ plantCode, payload }) => createDeployment(plantCode, payload),
        onSuccess: (_data, { plantCode }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.modelStudio.optimizer.all(plantCode) });
        },
    });
}

export function useModifyDeploymentMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ plantCode, id, payload }) => modifyDeployment(plantCode, id, payload),
        onSuccess: (_data, { plantCode }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.modelStudio.optimizer.all(plantCode) });
        },
    });
}

export function useDeleteDeploymentMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ plantCode, id }) => deleteDeployment(plantCode, id),
        onSuccess: (_data, { plantCode }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.modelStudio.optimizer.all(plantCode) });
        },
    });
}

// ── Tag Search ──────────────────────────────────────────────────────────────

export function useOptimizerTagSearchQuery(plantCode, query) {
    return useQuery({
        queryKey: queryKeys.modelStudio.optimizer.tagSearch(plantCode, query),
        queryFn: () => searchOptimizerTags(plantCode, query),
        enabled: !!plantCode && !!query && query.length >= 2,
        placeholderData: keepPreviousData,
    });
}
