'use client';

/**
 * useDecisionTemplate — TanStack Query hooks for the Decision Template feature
 * (Phase 6). Wraps `decisionService` unchanged; the service already unwraps the
 * backend's { success, message, data } envelope, so these hooks receive the
 * flat payload.
 *
 * Placement note (CLAUDE.md rule 45): these hooks are consumed by the PAGES
 * (`decision-template/page.jsx` and `[templateId]/page.jsx`), never by the
 * shared `layout.jsx`. A query hoisted into the layout would re-run on every
 * navigation between the list and a template, defeating the persistence that
 * layout exists to provide.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/src/lib/query';
import { decisionService } from '@/src/services/decision-template/decisionService';

/** getWorkflowList returns rows, but defensively normalise — callers render a table. */
const asArray = (data) => (Array.isArray(data) ? data : []);

// ── Reads ────────────────────────────────────────────────────────────────────

/** The workflow/template list for the current plant. */
export function useWorkflowList(plantCode) {
    return useQuery({
        queryKey: queryKeys.decisionTemplate.workflows(plantCode),
        queryFn: () => decisionService.getWorkflows(plantCode),
        enabled: !!plantCode,
        select: asArray,
    });
}

/** Dropdown options for the template-class picker. Reference data — rarely changes. */
export function useTemplateOptions(plantCode) {
    return useQuery({
        queryKey: queryKeys.decisionTemplate.templateOptions(plantCode),
        queryFn: () => decisionService.getTemplateOptions(plantCode),
        enabled: !!plantCode,
        staleTime: 5 * 60_000,
    });
}

/** Snapshot feature catalog (widget definitions). Reference data. */
export function useSnapshotFeatures(plantCode) {
    return useQuery({
        queryKey: queryKeys.decisionTemplate.snapshotFeatures(plantCode),
        queryFn: () => decisionService.getSnapshotFeatures(plantCode),
        enabled: !!plantCode,
        staleTime: 5 * 60_000,
    });
}

/** The category keys available for one template's snapshot. */
export function useSnapshotOptions(plantCode, templateId) {
    return useQuery({
        queryKey: queryKeys.decisionTemplate.snapshotOptions(plantCode, templateId),
        queryFn: () => decisionService.getSnapshotOptions(plantCode, templateId),
        enabled: !!plantCode && templateId != null,
    });
}

/**
 * One template's saved snapshot (grid layout).
 *
 * The pre-migration code wrapped this call in `.catch(() => null)` inside a
 * Promise.all so a missing snapshot could not fail the whole load. As its own
 * query it fails independently by construction — the other three reads are
 * unaffected — so the swallow is no longer needed and a real failure stays
 * visible instead of masquerading as "no snapshot saved yet".
 */
export function useSnapshot(plantCode, templateId) {
    return useQuery({
        queryKey: queryKeys.decisionTemplate.snapshot(plantCode, templateId),
        queryFn: () => decisionService.viewSnapshot(plantCode, templateId),
        enabled: !!plantCode && templateId != null,
    });
}

/**
 * The canonical saved workflow for one template.
 *
 * Used both to render template metadata in the designer and — via
 * `useLoadWorkflowForEdit` below — as the guard before opening the builder.
 */
export function useWorkflow(plantCode, templateId) {
    return useQuery({
        queryKey: queryKeys.decisionTemplate.workflow(plantCode, templateId),
        queryFn: () => decisionService.viewWorkflow(plantCode, templateId),
        enabled: !!plantCode && templateId != null,
    });
}

// ── Mutations ────────────────────────────────────────────────────────────────

export function useCreateWorkflow(plantCode) {
    const queryClient = useQueryClient();
    return useMutation({
        meta: { errorTitle: 'Save Failed' },
        mutationFn: (payload) => decisionService.createWorkflow(plantCode, payload),
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: queryKeys.decisionTemplate.workflows(plantCode),
            });
        },
    });
}

export function useUpdateWorkflow(plantCode) {
    const queryClient = useQueryClient();
    return useMutation({
        meta: { errorTitle: 'Save Failed' },
        mutationFn: (payload) => decisionService.updateWorkflow(plantCode, payload),
        onSuccess: (_data, payload) => {
            void queryClient.invalidateQueries({
                queryKey: queryKeys.decisionTemplate.workflows(plantCode),
            });
            // The saved graph itself changed — the cached viewWorkflow for this
            // template is now stale and would otherwise reopen the builder with
            // the pre-edit version.
            if (payload?.template_id != null) {
                void queryClient.invalidateQueries({
                    queryKey: queryKeys.decisionTemplate.workflow(plantCode, payload.template_id),
                });
            }
        },
    });
}

export function useDeleteWorkflow(plantCode) {
    const queryClient = useQueryClient();
    return useMutation({
        meta: { errorTitle: 'Delete Failed' },
        mutationFn: (templateId) => decisionService.deleteWorkflow(plantCode, templateId),
        onSuccess: (_data, templateId) => {
            void queryClient.invalidateQueries({
                queryKey: queryKeys.decisionTemplate.workflows(plantCode),
            });
            // Nothing left to read for this template — drop rather than refetch.
            queryClient.removeQueries({
                queryKey: queryKeys.decisionTemplate.workflow(plantCode, templateId),
            });
            queryClient.removeQueries({
                queryKey: queryKeys.decisionTemplate.snapshot(plantCode, templateId),
            });
        },
    });
}

export function useUpdateSnapshot(plantCode, templateId) {
    const queryClient = useQueryClient();
    return useMutation({
        meta: { errorTitle: 'Save Failed' },
        mutationFn: (snapshot) => decisionService.updateSnapshot(plantCode, templateId, snapshot),
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: queryKeys.decisionTemplate.snapshot(plantCode, templateId),
            });
        },
    });
}

export function useDeleteSnapshot(plantCode) {
    const queryClient = useQueryClient();
    return useMutation({
        meta: { errorTitle: 'Delete Failed' },
        mutationFn: (templateId) => decisionService.deleteSnapshot(plantCode, templateId),
        onSuccess: (_data, templateId) => {
            void queryClient.invalidateQueries({
                queryKey: queryKeys.decisionTemplate.snapshot(plantCode, templateId),
            });
        },
    });
}

/**
 * Imperatively fetch (and cache) the canonical workflow before opening the
 * builder for editing.
 *
 * This is a read, but it cannot be a plain useQuery: it must run in response to
 * a click on a specific row and the caller needs to await the result to decide
 * whether to open the builder at all. `fetchQuery` gives exactly that — a
 * promise — while still populating the same cache entry `useWorkflow` reads, so
 * a subsequent render of the designer for that template hits the cache.
 *
 * The guard it enables is load-bearing: getWorkflowList's rows are list-view
 * summaries that are not confirmed to carry the full `workflow` graph, and
 * opening the builder off a row without it let Save silently PUT an empty
 * graph over the real saved workflow.
 */
export function useLoadWorkflowForEdit(plantCode) {
    const queryClient = useQueryClient();
    return (templateId) =>
        queryClient.fetchQuery({
            queryKey: queryKeys.decisionTemplate.workflow(plantCode, templateId),
            queryFn: () => decisionService.viewWorkflow(plantCode, templateId),
        });
}
