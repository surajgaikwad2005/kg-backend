'use client';

import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { useApp } from '@/src/context/AppContext';
import { queryKeys } from '@/src/lib/query/keys';
import {
    listTags,
    getSavedVisuals,
    getVisualsData,
    listDashboards,
    deleteDashboard,
    deleteTag,
    createCustomTag,
    fetchCustomTag,
    deleteCustomTag,
} from '@/src/services/visuals/visualsService';

/** Query hook to list/search tags for visuals with keepPreviousData for smooth search typing. */
export function useListTags(params = {}, options = {}) {
    const { plantCode } = useApp();
    return useQuery({
        queryKey: queryKeys.visuals.listTags(plantCode, params),
        queryFn: () => listTags(params, plantCode),
        enabled: Boolean(plantCode) && (options.enabled ?? true),
        placeholderData: keepPreviousData,
        ...options,
    });
}

/** Query hook to fetch saved visual metadata. */
export function useSavedVisuals(body = {}, options = {}) {
    const { plantCode } = useApp();
    return useQuery({
        queryKey: queryKeys.visuals.savedVisuals(plantCode, body),
        queryFn: () => getSavedVisuals({ ...body, plant_code_id: plantCode }),
        enabled: Boolean(plantCode) && (options.enabled ?? true),
        ...options,
    });
}

/** Query hook to fetch visual timeseries chart data (gcTime: 60s for large series payloads). */
export function useVisualsData(body = {}, options = {}) {
    const { plantCode } = useApp();
    return useQuery({
        queryKey: queryKeys.visuals.visualsData(plantCode, body),
        queryFn: () => getVisualsData({ ...body, plant_code_id: plantCode }),
        enabled: Boolean(plantCode && body.dashboard_name && body.tags?.length > 0) && (options.enabled ?? true),
        gcTime: 60_000,
        ...options,
    });
}

/** Query hook to list all visual dashboards for a user. */
export function useListDashboards(username, options = {}) {
    const { plantCode } = useApp();
    return useQuery({
        queryKey: queryKeys.visuals.dashboards(plantCode, username),
        queryFn: () => listDashboards({ username, plant_code_id: plantCode }),
        enabled: Boolean(plantCode && username) && (options.enabled ?? true),
        ...options,
    });
}

/** Query hook to fetch custom tag formulas & compute values. */
export function useFetchCustomTag(body = {}, options = {}) {
    const { plantCode } = useApp();
    return useQuery({
        queryKey: queryKeys.visuals.customTag(plantCode, body),
        queryFn: () => fetchCustomTag({ ...body, plant_code_id: plantCode }),
        enabled: Boolean(plantCode && body.dashboard_name) && (options.enabled ?? true),
        ...options,
    });
}

// ── Mutations ────────────────────────────────────────────────────────────────

export function useDeleteDashboard(options = {}) {
    const { plantCode } = useApp();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (body) => deleteDashboard({ ...body, plant_code_id: plantCode }),
        onSuccess: (data, variables, context) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.visuals.dashboards(plantCode, variables.username) });
            options.onSuccess?.(data, variables, context);
        },
        ...options,
    });
}

export function useDeleteTag(options = {}) {
    const { plantCode } = useApp();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (body) => deleteTag({ ...body, plant_code_id: plantCode }),
        onSuccess: (data, variables, context) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.visuals.all(plantCode) });
            options.onSuccess?.(data, variables, context);
        },
        ...options,
    });
}

export function useCreateCustomTag(options = {}) {
    const { plantCode } = useApp();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (body) => createCustomTag({ ...body, plant_code_id: plantCode }),
        onSuccess: (data, variables, context) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.visuals.all(plantCode) });
            options.onSuccess?.(data, variables, context);
        },
        ...options,
    });
}

export function useDeleteCustomTag(options = {}) {
    const { plantCode } = useApp();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (body) => deleteCustomTag({ ...body, plant_code_id: plantCode }),
        onSuccess: (data, variables, context) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.visuals.all(plantCode) });
            options.onSuccess?.(data, variables, context);
        },
        ...options,
    });
}
