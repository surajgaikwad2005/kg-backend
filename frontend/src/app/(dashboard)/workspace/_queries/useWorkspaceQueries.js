'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApp } from '@/src/context/AppContext';
import { queryKeys } from '@/src/lib/query/keys';
import {
    listWorkspaces,
    createWorkspace,
    deleteWorkspace,
    loadWorkspaceFolder,
    getWorkspaceFeatures,
    listAvailableTags,
    getTimeseriesAnalysis,
    getCorrelationAnalysis,
    getEventDetection,
    getRcaAnalysis,
    getKpiMonitoring,
    getMultiChartVisualization,
    getTrendAnalysis,
    updateWorkspaceAnalysis,
    deleteWorkspaceAnalysis,
    createCustomTag,
} from '@/src/services/workspace/workspaceService';

/** Query hook to list all saved workspaces for a user in the active plant. */
export function useWorkspaceList(username, options = {}) {
    const { plantCode } = useApp();
    return useQuery({
        queryKey: queryKeys.workspace.list(plantCode, username),
        queryFn: () => listWorkspaces(plantCode, username),
        enabled: Boolean(plantCode && username) && (options.enabled ?? true),
        ...options,
    });
}

/** Mutation to create a new workspace. */
export function useCreateWorkspace(options = {}) {
    const { plantCode } = useApp();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ username, workspaceName }) => createWorkspace(plantCode, username, workspaceName),
        onSuccess: (data, variables, context) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.workspace.list(plantCode, variables.username) });
            options.onSuccess?.(data, variables, context);
        },
        ...options,
    });
}

/** Mutation to delete a workspace. */
export function useDeleteWorkspace(options = {}) {
    const { plantCode } = useApp();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ username, workspaceName }) => deleteWorkspace(plantCode, username, workspaceName),
        onSuccess: (data, variables, context) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.workspace.list(plantCode, variables.username) });
            options.onSuccess?.(data, variables, context);
        },
        ...options,
    });
}

/** Query hook to load saved workspace folder contents (analyses + node configs). */
export function useLoadWorkspaceFolder(username, workspaceName, options = {}) {
    const { plantCode } = useApp();
    return useQuery({
        queryKey: queryKeys.workspace.folder(plantCode, username, workspaceName),
        queryFn: () => loadWorkspaceFolder(plantCode, username, workspaceName),
        enabled: Boolean(plantCode && username && workspaceName) && (options.enabled ?? true),
        ...options,
    });
}

/** Query hook to fetch supported workspace features. */
export function useWorkspaceFeatures(username, workspaceName, options = {}) {
    const { plantCode } = useApp();
    return useQuery({
        queryKey: queryKeys.workspace.features(plantCode, username, workspaceName),
        queryFn: () => getWorkspaceFeatures(plantCode, username, workspaceName),
        enabled: Boolean(plantCode && username && workspaceName) && (options.enabled ?? true),
        ...options,
    });
}

/** Query hook for available physical + custom tags for tag-picker nodes. */
export function useListAvailableTags(username, workspaceName, options = {}) {
    const { plantCode } = useApp();
    return useQuery({
        queryKey: queryKeys.workspace.availableTags(plantCode, username, workspaceName),
        queryFn: () => listAvailableTags(plantCode, username, workspaceName),
        enabled: Boolean(plantCode && username && workspaceName) && (options.enabled ?? true),
        ...options,
    });
}

// ── Per-type analysis mutation hooks ─────────────────────────────────────────

export function useTimeseriesAnalysis(options = {}) {
    const { plantCode } = useApp();
    return useMutation({
        mutationFn: (body) => getTimeseriesAnalysis(plantCode, body),
        ...options,
    });
}

export function useCorrelationAnalysis(options = {}) {
    const { plantCode } = useApp();
    return useMutation({
        mutationFn: (body) => getCorrelationAnalysis(plantCode, body),
        ...options,
    });
}

export function useEventDetection(options = {}) {
    const { plantCode } = useApp();
    return useMutation({
        mutationFn: (body) => getEventDetection(plantCode, body),
        ...options,
    });
}

export function useRcaAnalysis(options = {}) {
    const { plantCode } = useApp();
    return useMutation({
        mutationFn: (body) => getRcaAnalysis(plantCode, body),
        ...options,
    });
}

export function useKpiMonitoring(options = {}) {
    const { plantCode } = useApp();
    return useMutation({
        mutationFn: (body) => getKpiMonitoring(plantCode, body),
        ...options,
    });
}

export function useMultiChartVisualization(options = {}) {
    const { plantCode } = useApp();
    return useMutation({
        mutationFn: (body) => getMultiChartVisualization(plantCode, body),
        ...options,
    });
}

export function useTrendAnalysis(options = {}) {
    const { plantCode } = useApp();
    return useMutation({
        mutationFn: (body) => getTrendAnalysis(plantCode, body),
        ...options,
    });
}

// ── Analysis CRUD & Custom Tag mutations ─────────────────────────────────────

export function useUpdateWorkspaceAnalysis(options = {}) {
    const { plantCode } = useApp();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (body) => updateWorkspaceAnalysis(plantCode, body),
        onSuccess: (data, variables, context) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.workspace.all(plantCode) });
            options.onSuccess?.(data, variables, context);
        },
        ...options,
    });
}

export function useDeleteWorkspaceAnalysis(options = {}) {
    const { plantCode } = useApp();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (body) => deleteWorkspaceAnalysis(plantCode, body),
        onSuccess: (data, variables, context) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.workspace.all(plantCode) });
            options.onSuccess?.(data, variables, context);
        },
        ...options,
    });
}

export function useCreateWorkspaceCustomTag(options = {}) {
    const { plantCode } = useApp();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (body) => createCustomTag(plantCode, body),
        onSuccess: (data, variables, context) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.workspace.all(plantCode) });
            options.onSuccess?.(data, variables, context);
        },
        ...options,
    });
}
