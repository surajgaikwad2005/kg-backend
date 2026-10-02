'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApp } from '@/src/context/AppContext';
import { queryKeys } from '@/src/lib/query/keys';
import { cpcpService } from '@/src/services/cpcp/cpcpService';

/** Query hook for CPCP domain ontology matrix (attribute columns + equipment rows). */
export function useCpcpOntologyQuery(options = {}) {
    const { plantCode } = useApp();
    return useQuery({
        queryKey: queryKeys.cpcp.ontology(plantCode),
        queryFn: () => cpcpService.getOntology(plantCode),
        enabled: Boolean(plantCode) && (options.enabled ?? true),
        staleTime: 5 * 60_000, // attribute schemas change rarely
        ...options,
    });
}

/** Query hook for CPCP assessment matrix by client name. */
export function useCpcpMatrixQuery(clientName, options = {}) {
    return useQuery({
        queryKey: queryKeys.cpcp.matrix(clientName),
        queryFn: () => cpcpService.getMatrix(clientName),
        enabled: Boolean(clientName) && (options.enabled ?? true),
        ...options,
    });
}

// ── Mutations ────────────────────────────────────────────────────────────────

export function useSaveEquipmentMutation(options = {}) {
    const { plantCode } = useApp();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload) => cpcpService.saveEquipment(payload, plantCode),
        onSuccess: (data, variables, context) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.cpcp.ontology(plantCode) });
            options.onSuccess?.(data, variables, context);
        },
        ...options,
    });
}

export function useDeleteEquipmentMutation(options = {}) {
    const { plantCode } = useApp();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (tag) => cpcpService.deleteEquipment(tag, plantCode),
        onSuccess: (data, variables, context) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.cpcp.ontology(plantCode) });
            options.onSuccess?.(data, variables, context);
        },
        ...options,
    });
}

export function useAddAttributeMutation(options = {}) {
    const { plantCode } = useApp();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload) => cpcpService.addAttribute(payload, plantCode),
        onSuccess: (data, variables, context) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.cpcp.ontology(plantCode) });
            options.onSuccess?.(data, variables, context);
        },
        ...options,
    });
}

export function useDeleteAttributeMutation(options = {}) {
    const { plantCode } = useApp();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (key) => cpcpService.deleteAttribute(key, plantCode),
        onSuccess: (data, variables, context) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.cpcp.ontology(plantCode) });
            options.onSuccess?.(data, variables, context);
        },
        ...options,
    });
}

export function useRunPnidAgentMutation(options = {}) {
    return useMutation({
        mutationFn: ({ clientName, modelName, pages, tagsMap }) =>
            cpcpService.runPnidAgent(clientName, modelName, pages, tagsMap),
        ...options,
    });
}

export function useUpdateTagMutation(options = {}) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ clientName, pageNumber, tag, fields }) =>
            cpcpService.updateTag(clientName, pageNumber, tag, fields),
        onSuccess: (data, variables, context) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.cpcp.matrix(variables.clientName) });
            options.onSuccess?.(data, variables, context);
        },
        ...options,
    });
}

export function useVerifyTagMutation(options = {}) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ clientName, pageNumber, tag, status }) =>
            cpcpService.verifyTag(clientName, pageNumber, tag, status),
        onSuccess: (data, variables, context) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.cpcp.matrix(variables.clientName) });
            options.onSuccess?.(data, variables, context);
        },
        ...options,
    });
}

export function useAddTagMutation(options = {}) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ clientName, pageNumber, tag, description, fields }) =>
            cpcpService.addTag(clientName, pageNumber, tag, description, fields),
        onSuccess: (data, variables, context) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.cpcp.matrix(variables.clientName) });
            options.onSuccess?.(data, variables, context);
        },
        ...options,
    });
}

export function useDeleteTagMutation(options = {}) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ clientName, pageNumber, tag }) =>
            cpcpService.deleteTag(clientName, pageNumber, tag),
        onSuccess: (data, variables, context) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.cpcp.matrix(variables.clientName) });
            options.onSuccess?.(data, variables, context);
        },
        ...options,
    });
}
