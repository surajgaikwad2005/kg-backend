'use client';

/**
 * useDashboardQueries — TanStack Query hooks for the Dashboard feature
 * (Phase 11). Wraps `dashboardService` and the subset of `expressionService`
 * actually consumed by this feature (`getExpressionList`, `getExpressionDetail`,
 * `pauseResumeExpression`, `searchExpressionTags` have zero call sites in this
 * route today — same "no consumer; leave unmigrated" treatment as pnidService's
 * `health` in Phase 1a).
 *
 * `createVisualChart` gets TWO wrappers because it is called two different ways
 * in the existing code:
 *  - Auto-fired on every config-field change (chart type, metrics, time window,
 *    …) to drive a live preview → `useVisualChartPreview`, a query. The whole
 *    payload is passed as the key, so there is no hand-maintained dependency
 *    array to keep in sync with the payload builder — the key IS the payload.
 *  - Fired once, explicitly, right before persisting (Save/Create), to get a
 *    guaranteed-fresh render to embed in the saved visual → `useRenderVisualChart`,
 *    a mutation. Reusing the query cache here would risk saving up-to-30s-stale
 *    (staleTime) chart data, which matters at Save time in a way it doesn't for
 *    a live preview.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/src/lib/query';
import * as dashboardService from '@/src/services/dashboard/dashboardService';
import * as expressionService from '@/src/services/dashboard/expressionService';

// ── Reads ────────────────────────────────────────────────────────────────────

/** Dashboard list for the current plant (landing page cards + the [id] route's row lookup). */
export function useDashboardsList(plantCode) {
    return useQuery({
        queryKey: queryKeys.dashboard.list(plantCode),
        queryFn: ({ signal }) => dashboardService.listDashboards(plantCode, { signal }),
        enabled: !!plantCode,
    });
}

/** One dashboard's full detail (visuals included). */
export function useDashboardDetail(plantCode, dashboardId) {
    return useQuery({
        queryKey: queryKeys.dashboard.detail(plantCode, dashboardId),
        queryFn: ({ signal }) => dashboardService.viewDashboard(dashboardId, plantCode, { signal }),
        enabled: !!plantCode && !!dashboardId,
    });
}

/** Equipment list available to a dashboard's visuals. Changes rarely. */
export function useEquipmentList(plantCode, dashboardId) {
    return useQuery({
        queryKey: queryKeys.dashboard.equipment(plantCode, dashboardId),
        queryFn: ({ signal }) => dashboardService.listEquipment(dashboardId, plantCode, { signal }),
        enabled: !!plantCode,
        staleTime: 5 * 60_000,
    });
}

/** Tag list for one equipment — populates the metric pickers once equipment is chosen. */
export function useEquipmentTags(plantCode, equipmentId, dashboardId) {
    return useQuery({
        queryKey: queryKeys.dashboard.equipmentTags(plantCode, equipmentId, dashboardId),
        queryFn: ({ signal }) => dashboardService.getTagsByEquipment(equipmentId, dashboardId, plantCode, { signal }),
        enabled: !!plantCode && !!equipmentId,
    });
}

/**
 * Live chart-data preview for the visual currently being configured.
 * `payload` is whatever shape the caller's config builder produces — the
 * lightweight `{ metric, metric2, aggregation, interval }` probe used by the
 * create/monitor pages, or the full `buildBackendPayload()` used by the
 * add/edit-visual drawer. Either way it becomes the cache key verbatim, so
 * identical configs (e.g. stepping back to a previously-seen chart type) are
 * served from cache instead of re-fetched.
 */
export function useVisualChartPreview(plantCode, payload, { enabled = true } = {}) {
    return useQuery({
        queryKey: queryKeys.dashboard.preview(plantCode, payload),
        queryFn: ({ signal }) => dashboardService.createVisualChart(payload, plantCode, { signal }),
        enabled: !!plantCode && !!payload && enabled,
    });
}

/**
 * Cron-schedule validation for the custom-logic formula builder. Callers must
 * debounce `cron` themselves before passing it in (see FormulaBuilder.jsx) —
 * this hook fires on whatever value it's given.
 */
export function useCronValidation(plantCode, cron, { enabled = true } = {}) {
    return useQuery({
        queryKey: queryKeys.dashboard.cronValidation(plantCode, cron),
        queryFn: ({ signal }) => expressionService.validateCron(cron, plantCode, { signal }),
        enabled: !!plantCode && !!cron && enabled,
        retry: false,
    });
}

// ── Mutations ────────────────────────────────────────────────────────────────

export function useCreateDashboard(plantCode) {
    const queryClient = useQueryClient();
    return useMutation({
        meta: { errorTitle: 'Create Failed' },
        mutationFn: (dashboardData) => dashboardService.createDashboard(dashboardData, plantCode),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.list(plantCode) });
        },
    });
}

export function useDeleteDashboard(plantCode) {
    const queryClient = useQueryClient();
    return useMutation({
        meta: { errorTitle: 'Delete Failed' },
        mutationFn: (dashboardId) => dashboardService.deleteDashboard(dashboardId, plantCode),
        onSuccess: (_data, dashboardId) => {
            void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.list(plantCode) });
            queryClient.removeQueries({ queryKey: queryKeys.dashboard.detail(plantCode, dashboardId) });
        },
    });
}

/** See file header — the imperative, guaranteed-fresh render used right before a save. */
export function useRenderVisualChart(plantCode) {
    return useMutation({
        // Compute-only render (rule 50 exception): nothing to invalidate, the
        // result is consumed directly by the caller to build the next save call.
        mutationFn: (payload) => dashboardService.createVisualChart(payload, plantCode),
    });
}

export function useCreateVisual(plantCode) {
    const queryClient = useQueryClient();
    return useMutation({
        meta: { errorTitle: 'Save Failed' },
        mutationFn: ({ visualName, savedChart }) => dashboardService.createVisual(visualName, savedChart, plantCode),
        onSuccess: (_data, { dashboardId }) => {
            void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.list(plantCode) });
            if (dashboardId) {
                void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.detail(plantCode, dashboardId) });
            }
        },
    });
}

export function useEditVisual(plantCode) {
    const queryClient = useQueryClient();
    return useMutation({
        meta: { errorTitle: 'Save Failed' },
        mutationFn: ({ visualId, visualName, visualConfigPayload, dashboardId }) =>
            dashboardService.editVisual(visualId, visualName, visualConfigPayload, dashboardId, plantCode),
        onSuccess: (_data, { dashboardId }) => {
            if (dashboardId) {
                void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.detail(plantCode, dashboardId) });
            }
        },
    });
}

export function useDeleteVisual(plantCode) {
    const queryClient = useQueryClient();
    return useMutation({
        meta: { errorTitle: 'Delete Failed', silent: true }, // caller does its own best-effort local cleanup on failure
        mutationFn: ({ visualId, dashboardId }) => dashboardService.deleteVisual(visualId, dashboardId, plantCode),
        onSuccess: (_data, { dashboardId }) => {
            void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.list(plantCode) });
            if (dashboardId) {
                void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.detail(plantCode, dashboardId) });
            }
        },
    });
}

/**
 * Formula "Test" — explicit button click, not auto-fired on every keystroke,
 * so (unlike cron validation) this stays a mutation. `meta.silent` because the
 * caller (useFormulaBuilder) already renders a rich inline error box parsed
 * from the response — a duplicate global toast would be redundant.
 */
export function useTestExpression(plantCode) {
    return useMutation({
        meta: { silent: true },
        mutationFn: (expression) => expressionService.testExpression(expression, plantCode),
    });
}

// Expression CRUD below has no corresponding list query in this feature: the
// "custom logic" catalog a user builds while configuring one visual lives in
// local form state (`customLogicList` in useDashboardModalForm), not a cached
// list read, so there is nothing to invalidate (rule 50 exception). The caller
// merges each mutation's result into that local state directly.

export function useCreateExpression(plantCode) {
    return useMutation({
        meta: { errorTitle: 'Save Failed' },
        mutationFn: (payload) => expressionService.createExpression(payload, plantCode),
    });
}

export function useModifyExpression(plantCode) {
    return useMutation({
        meta: { errorTitle: 'Save Failed' },
        mutationFn: (payload) => expressionService.modifyExpression(payload, plantCode),
    });
}

export function useDeleteExpression(plantCode) {
    // Silent: the pre-migration behaviour is "best-effort backend delete, local
    // removal proceeds regardless" — the caller swallows failures on purpose.
    return useMutation({
        meta: { silent: true },
        mutationFn: (expressionId) => expressionService.deleteExpression(expressionId, plantCode),
    });
}
