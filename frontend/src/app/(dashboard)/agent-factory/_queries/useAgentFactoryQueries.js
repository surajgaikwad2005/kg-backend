'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApp } from '@/src/context/AppContext';
import { queryKeys } from '@/src/lib/query/keys';
import {
    listModels,
    listTools,
    getNodeCatalog,
    listDatasourceTypes,
    listAvailableFeatures,
    memoryTypes,
    outputTypes,
    listTemplates,
    getTemplate,
    saveTemplate,
    updateTemplate,
    deleteTemplate,
    deployTemplate,
    chatWithAgent,
} from '@/src/services/agent-factory/agentFactoryService';

/** Query hook to fetch available LLM models. */
export function useListModels(options = {}) {
    const { plantCode } = useApp();
    return useQuery({
        queryKey: queryKeys.agentFactory.models(plantCode),
        queryFn: () => listModels(plantCode),
        enabled: Boolean(plantCode) && (options.enabled ?? true),
        ...options,
    });
}

/** Query hook to fetch dynamic analytical tools. */
export function useListTools(options = {}) {
    const { plantCode } = useApp();
    return useQuery({
        queryKey: queryKeys.agentFactory.tools(plantCode),
        queryFn: () => listTools(plantCode),
        enabled: Boolean(plantCode) && (options.enabled ?? true),
        ...options,
    });
}

/** Query hook to fetch node catalog. */
export function useGetNodeCatalog(options = {}) {
    const { plantCode } = useApp();
    return useQuery({
        queryKey: queryKeys.agentFactory.nodeCatalog(plantCode),
        queryFn: () => getNodeCatalog(plantCode),
        enabled: Boolean(plantCode) && (options.enabled ?? true),
        ...options,
    });
}

/** Query hook to fetch supported datasource types. */
export function useListDatasourceTypes(options = {}) {
    const { plantCode } = useApp();
    return useQuery({
        queryKey: queryKeys.agentFactory.datasourceTypes(plantCode),
        queryFn: () => listDatasourceTypes(plantCode),
        enabled: Boolean(plantCode) && (options.enabled ?? true),
        ...options,
    });
}

/** Query hook to fetch available features. */
export function useListAvailableFeatures(options = {}) {
    const { plantCode } = useApp();
    return useQuery({
        queryKey: queryKeys.agentFactory.availableFeatures(plantCode),
        queryFn: () => listAvailableFeatures(plantCode),
        enabled: Boolean(plantCode) && (options.enabled ?? true),
        ...options,
    });
}

/** Query hook to fetch memory types. */
export function useMemoryTypes(options = {}) {
    const { plantCode } = useApp();
    return useQuery({
        queryKey: queryKeys.agentFactory.memoryTypes(plantCode),
        queryFn: () => memoryTypes(plantCode),
        enabled: Boolean(plantCode) && (options.enabled ?? true),
        ...options,
    });
}

/** Query hook to fetch output types. */
export function useOutputTypes(options = {}) {
    const { plantCode } = useApp();
    return useQuery({
        queryKey: queryKeys.agentFactory.outputTypes(plantCode),
        queryFn: () => outputTypes(plantCode),
        enabled: Boolean(plantCode) && (options.enabled ?? true),
        ...options,
    });
}

/** Query hook to list all agent templates. */
export function useListTemplates(params = {}, options = {}) {
    const { plantCode } = useApp();
    return useQuery({
        queryKey: queryKeys.agentFactory.templates(plantCode, params),
        queryFn: () => listTemplates(params, plantCode),
        enabled: Boolean(plantCode) && (options.enabled ?? true),
        ...options,
    });
}

/** Query hook to fetch graph detail for a single agent template. */
export function useGetTemplate(id, options = {}) {
    const { plantCode } = useApp();
    return useQuery({
        queryKey: queryKeys.agentFactory.template(plantCode, id),
        queryFn: () => getTemplate(id, {}, plantCode),
        enabled: Boolean(plantCode && id) && (options.enabled ?? true),
        ...options,
    });
}

// ── Mutations ────────────────────────────────────────────────────────────────

export function useSaveTemplate(options = {}) {
    const { plantCode } = useApp();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload) => saveTemplate(payload, plantCode),
        onSuccess: (data, variables, context) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.agentFactory.templates(plantCode) });
            options.onSuccess?.(data, variables, context);
        },
        ...options,
    });
}

export function useUpdateTemplate(options = {}) {
    const { plantCode } = useApp();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, payload }) => updateTemplate(id, payload, plantCode),
        onSuccess: (data, variables, context) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.agentFactory.templates(plantCode) });
            queryClient.invalidateQueries({ queryKey: queryKeys.agentFactory.template(plantCode, variables.id) });
            options.onSuccess?.(data, variables, context);
        },
        ...options,
    });
}

/** Mutation to delete an agent template with optimistic rollback support. */
export function useDeleteTemplate(options = {}) {
    const { plantCode } = useApp();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, params }) => deleteTemplate(id, params, plantCode),
        onMutate: async ({ id }) => {
            await queryClient.cancelQueries({ queryKey: queryKeys.agentFactory.templates(plantCode) });
            const previousTemplates = queryClient.getQueryData(queryKeys.agentFactory.templates(plantCode));
            if (previousTemplates && Array.isArray(previousTemplates)) {
                queryClient.setQueryData(
                    queryKeys.agentFactory.templates(plantCode),
                    previousTemplates.filter(t => (t.template_id || t.id) !== id)
                );
            }
            return { previousTemplates };
        },
        onError: (err, variables, context) => {
            if (context?.previousTemplates) {
                queryClient.setQueryData(queryKeys.agentFactory.templates(plantCode), context.previousTemplates);
            }
            options.onError?.(err, variables, context);
        },
        onSettled: (data, error, variables, context) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.agentFactory.templates(plantCode) });
            options.onSettled?.(data, error, variables, context);
        },
        ...options,
    });
}

export function useDeployTemplate(options = {}) {
    const { plantCode } = useApp();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, payload }) => deployTemplate(id, payload, plantCode),
        onSuccess: (data, variables, context) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.agentFactory.templates(plantCode) });
            options.onSuccess?.(data, variables, context);
        },
        ...options,
    });
}

export function useChatWithAgent(options = {}) {
    return useMutation({
        mutationFn: ({ agentId, query }) => chatWithAgent(agentId, query),
        ...options,
    });
}
