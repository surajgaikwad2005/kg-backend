'use client';

/**
 * useSymbolicAi — TanStack Query hooks for the Symbolic AI feature (Phase 3).
 *
 * This domain had three separate hand-rolled mechanisms that the cache replaces
 * outright:
 *
 *  1. `_lib/pendingMarkdownCache.js` — a module-level stash used to hand freshly
 *     generated markdown from the library route to the [slug] route so the
 *     detail page could skip a refetch. That is `setQueryData` on the detail
 *     key, so the file is deleted.
 *  2. `loadedKeyRef` in useSymbolicAIPage — a manual guard against StrictMode's
 *     dev-only double effect firing two identical generateMarkdown requests.
 *     Query deduplicates identical in-flight keys natively.
 *  3. `if (!plantCode) return` early-returns — replaced by `enabled`, which also
 *     stops apiClient's PLANT_CODE_REQUIRED preflight toast from ever firing.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/src/lib/query';
import {
    listTables,
    deleteTable,
    fetchMarkdown,
    generateMarkdown,
    addEquipmentColumn,
    setColumns,
    removeColumns,
    addData,
    deleteData,
    updateDynamic,
    sendChat,
} from '@/src/services/symbolic-ai/symbolicAiService';

/** listTables resolves to { data: { dashboardNames: [...] } }. */
const selectDashboardNames = (res) => res?.data?.dashboardNames ?? [];

/** fetchMarkdown resolves to { data: { markdown } }. */
const selectMarkdown = (res) => res?.data?.markdown ?? null;

// ── Reads ────────────────────────────────────────────────────────────────────

/** Names of every rule table for this plant. */
export function useRuleTables(plantCode) {
    return useQuery({
        queryKey: queryKeys.symbolicAi.tables(plantCode),
        queryFn: () => listTables(plantCode),
        enabled: !!plantCode,
        select: selectDashboardNames,
    });
}

/**
 * One rule base's markdown.
 *
 * The expensive read in this domain — the backend re-derives the whole markmap
 * tree from the database. After an upload the library route seeds this key
 * directly (see useSeedRuleMarkdown), so navigating to a rule you just created
 * renders instantly with no request at all.
 */
export function useRuleMarkdown(plantCode, dashboardName) {
    return useQuery({
        queryKey: queryKeys.symbolicAi.markdown(plantCode, dashboardName),
        queryFn: () => fetchMarkdown(dashboardName, plantCode),
        enabled: !!plantCode && !!dashboardName,
        select: selectMarkdown,
    });
}

// ── Mutations ────────────────────────────────────────────────────────────────

export function useDeleteTable(plantCode) {
    const queryClient = useQueryClient();
    return useMutation({
        meta: { errorTitle: 'Delete failed' },
        mutationFn: (dashboardName) => deleteTable(dashboardName, plantCode),
        onSuccess: (_res, dashboardName) => {
            void queryClient.invalidateQueries({ queryKey: queryKeys.symbolicAi.tables(plantCode) });
            // The table is gone — drop its markdown rather than refetch it.
            queryClient.removeQueries({
                queryKey: queryKeys.symbolicAi.markdown(plantCode, dashboardName),
            });
        },
    });
}

/** INSERT flow — multipart, file required. Returns the generated markdown. */
export function useGenerateMarkdown(plantCode) {
    const queryClient = useQueryClient();
    return useMutation({
        meta: { errorTitle: 'Generation failed' },
        mutationFn: (formData) => generateMarkdown(formData, plantCode),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: queryKeys.symbolicAi.tables(plantCode) });
        },
    });
}

/** Step 1 of the upload wizard — parses the workbook. Transient, nothing cached. */
export function useAddEquipmentColumn(plantCode) {
    return useMutation({
        meta: { errorTitle: 'Could not read the file' },
        mutationFn: (formData) => addEquipmentColumn(formData, plantCode),
    });
}

/**
 * Seed a rule's markdown into the cache without a request.
 *
 * Replaces `stashPendingMarkdown` / `takePendingMarkdown`. The generated
 * markdown is already in hand after the INSERT flow, so writing it to the
 * detail key means the [slug] route finds fresh data on arrival.
 *
 * The value written must match what the queryFn resolves to, because `select`
 * runs on read — hence the `{ data: { markdown } }` envelope rather than a bare
 * string.
 */
export function useSeedRuleMarkdown(plantCode) {
    const queryClient = useQueryClient();
    return (dashboardName, markdown) => {
        if (!plantCode || !dashboardName) return;
        queryClient.setQueryData(
            queryKeys.symbolicAi.markdown(plantCode, dashboardName),
            { data: { markdown } },
        );
    };
}

/**
 * Row/column edits against a live table.
 *
 * All five share one `mutationKey` so the invalidation below can tell whether
 * other edits are still in flight. CreateTableView fires one of these per cell
 * edit, and invalidating on every settle would produce a refetch storm on rapid
 * typing; invalidating only when this is the LAST in-flight edit collapses that
 * to a single refetch once the user stops.
 */
const TABLE_EDIT_MUTATION_KEY = ['symbolic-ai', 'table-edit'];

function useTableEditMutation(plantCode, dashboardName, mutationFn, errorTitle) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: TABLE_EDIT_MUTATION_KEY,
        meta: { errorTitle },
        mutationFn,
        onSettled: () => {
            // isMutating counts THIS mutation too, so 1 means "no others left".
            if (queryClient.isMutating({ mutationKey: TABLE_EDIT_MUTATION_KEY }) > 1) return;
            void queryClient.invalidateQueries({
                queryKey: queryKeys.symbolicAi.markdown(plantCode, dashboardName),
            });
        },
    });
}

export function useSetColumns(plantCode, dashboardName) {
    return useTableEditMutation(
        plantCode, dashboardName,
        (columns) => setColumns({ dashboard_name: dashboardName, columns }, plantCode),
        'Could not add columns',
    );
}

export function useRemoveColumns(plantCode, dashboardName) {
    return useTableEditMutation(
        plantCode, dashboardName,
        (columns) => removeColumns({ dashboard_name: dashboardName, columns }, plantCode),
        'Could not remove columns',
    );
}

export function useAddData(plantCode, dashboardName) {
    return useTableEditMutation(
        plantCode, dashboardName,
        (rows) => addData({ dashboard_name: dashboardName, rows }, plantCode),
        'Could not add rows',
    );
}

export function useDeleteData(plantCode, dashboardName) {
    return useTableEditMutation(
        plantCode, dashboardName,
        (filters) => deleteData({ dashboard_name: dashboardName, filters }, plantCode),
        'Delete failed',
    );
}

export function useUpdateDynamic(plantCode, dashboardName) {
    return useTableEditMutation(
        plantCode, dashboardName,
        ({ filters, update_column, update_value }) =>
            updateDynamic({ dashboard_name: dashboardName, filters, update_column, update_value }, plantCode),
        'Update failed',
    );
}

/**
 * One chat turn.
 *
 * A mutation, not a query: the transcript is append-only local state owned by
 * the chat component (CLAUDE.md rule 53). Only the request/response round trip
 * belongs here.
 */
export function useSendChat(plantCode, dashboardName) {
    return useMutation({
        meta: { errorTitle: 'Chat failed' },
        mutationFn: (userQuery) =>
            sendChat({ user_query: userQuery, dashboard_name: dashboardName }, plantCode),
    });
}
