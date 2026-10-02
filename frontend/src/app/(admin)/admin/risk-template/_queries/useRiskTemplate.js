'use client';

/**
 * useRiskTemplate — TanStack Query hooks for the Risk Template feature.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/src/lib/query';
import {
    listTemplates,
    deleteTemplate,
    fetchMarkdown,
    generateMarkdown,
    addEquipmentColumn,
    setColumns,
    removeColumns,
    addData,
    deleteData,
    updateDynamic,
    sendChat,
} from '@/src/services/risk-template/riskTemplateService';

/** listTemplates resolves to { data: { templateNames: [...] } } or { data: { dashboardNames: [...] } }. */
const selectTemplateNames = (res) =>
    res?.data?.templateNames ?? res?.data?.dashboardNames ?? [];

/** fetchMarkdown resolves to { data: { markdown } }. */
const selectMarkdown = (res) => res?.data?.markdown ?? null;

// ── Reads ────────────────────────────────────────────────────────────────────

/** Names of every risk template for this plant. */
export function useRiskTemplates(plantCode) {
    return useQuery({
        queryKey: queryKeys.riskTemplate.templates(plantCode),
        queryFn: () => listTemplates(plantCode),
        enabled: !!plantCode,
        select: selectTemplateNames,
    });
}

/** One risk template's markdown representation. */
export function useRiskTemplateMarkdown(plantCode, templateName) {
    return useQuery({
        queryKey: queryKeys.riskTemplate.markdown(plantCode, templateName),
        queryFn: () => fetchMarkdown(templateName, plantCode),
        enabled: !!plantCode && !!templateName,
        select: selectMarkdown,
    });
}

// ── Mutations ────────────────────────────────────────────────────────────────

export function useDeleteRiskTemplate(plantCode) {
    const queryClient = useQueryClient();
    return useMutation({
        meta: { errorTitle: 'Delete failed' },
        mutationFn: (templateName) => deleteTemplate(templateName, plantCode),
        onSuccess: (_res, templateName) => {
            void queryClient.invalidateQueries({ queryKey: queryKeys.riskTemplate.templates(plantCode) });
            queryClient.removeQueries({
                queryKey: queryKeys.riskTemplate.markdown(plantCode, templateName),
            });
        },
    });
}

/** INSERT flow — multipart upload returning generated markdown */
export function useGenerateRiskMarkdown(plantCode) {
    const queryClient = useQueryClient();
    return useMutation({
        meta: { errorTitle: 'Generation failed' },
        mutationFn: (formData) => generateMarkdown(formData, plantCode),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: queryKeys.riskTemplate.templates(plantCode) });
        },
    });
}

/** Parse workbook for Equipment Config wizard */
export function useAddEquipmentColumn(plantCode) {
    return useMutation({
        meta: { errorTitle: 'Could not read the file' },
        mutationFn: (formData) => addEquipmentColumn(formData, plantCode),
    });
}

/**
 * Seed a template's markdown into the cache immediately without a refetch.
 */
export function useSeedRiskTemplateMarkdown(plantCode) {
    const queryClient = useQueryClient();
    return (templateName, markdown) => {
        if (!plantCode || !templateName) return;
        queryClient.setQueryData(
            queryKeys.riskTemplate.markdown(plantCode, templateName),
            { data: { markdown } },
        );
    };
}

// ── Table Cell / Column Edit Mutations ───────────────────────────────────────

const TABLE_EDIT_MUTATION_KEY = ['risk-template', 'table-edit'];

function useTableEditMutation(plantCode, templateName, mutationFn, errorTitle) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: TABLE_EDIT_MUTATION_KEY,
        meta: { errorTitle },
        mutationFn,
        onSettled: () => {
            if (queryClient.isMutating({ mutationKey: TABLE_EDIT_MUTATION_KEY }) > 1) return;
            void queryClient.invalidateQueries({
                queryKey: queryKeys.riskTemplate.markdown(plantCode, templateName),
            });
        },
    });
}

export function useSetColumns(plantCode, templateName) {
    return useTableEditMutation(
        plantCode, templateName,
        (columns) => setColumns({ template_name: templateName, columns }, plantCode),
        'Could not add columns',
    );
}

export function useRemoveColumns(plantCode, templateName) {
    return useTableEditMutation(
        plantCode, templateName,
        (columns) => removeColumns({ template_name: templateName, columns }, plantCode),
        'Could not remove columns',
    );
}

export function useAddData(plantCode, templateName) {
    return useTableEditMutation(
        plantCode, templateName,
        (rows) => addData({ template_name: templateName, rows }, plantCode),
        'Could not add rows',
    );
}

export function useDeleteData(plantCode, templateName) {
    return useTableEditMutation(
        plantCode, templateName,
        (filters) => deleteData({ template_name: templateName, filters }, plantCode),
        'Delete failed',
    );
}

export function useUpdateDynamic(plantCode, templateName) {
    return useTableEditMutation(
        plantCode, templateName,
        ({ filters, update_column, update_value }) =>
            updateDynamic({ template_name: templateName, filters, update_column, update_value }, plantCode),
        'Update failed',
    );
}

/** One chat turn */
export function useSendChat(plantCode, templateName) {
    return useMutation({
        meta: { errorTitle: 'Chat failed' },
        mutationFn: (userQuery) =>
            sendChat({ user_query: userQuery, template_name: templateName }, plantCode),
    });
}
