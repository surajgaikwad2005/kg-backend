'use client';

/**
 * useCpcpConfigMutations — TanStack Query mutation hooks for the CPCP
 * Configuration (Home / Workflow Diagram) domain (Phase 12).
 *
 * Each mutation invalidates the appropriate query key on success, so
 * consumers re-render with fresh data automatically — no manual refetch.
 *
 * pinPnidDiagram uses OPTIMISTIC updates: the cached diagram list is
 * updated instantly, then rolled back on error.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/src/lib/query';
import { useApp } from '@/src/context/AppContext';
import {
    savePnidDiagram,
    deletePnidDiagram,
    pinPnidDiagram,
    generateEquipment,
    generateFile,
    generatePnidDetailedEquipmentSummaryRaw,
} from '@/src/services/cpcp/diagram/diagramService';

// ── Diagram persistence ──────────────────────────────────────────────────

/** Save (create or update) a diagram. Invalidates the diagram list on success. */
export function useSaveDiagram() {
    const { plantCode } = useApp();
    const queryClient = useQueryClient();
    return useMutation({
        meta: { errorTitle: 'Diagram save failed' },
        mutationFn: (body) => savePnidDiagram(plantCode, body),
        onSuccess: (_res, body) => {
            void queryClient.invalidateQueries({
                queryKey: queryKeys.cpcpConfig.diagrams(plantCode),
            });
            // If saving an existing diagram, invalidate its individual cache too.
            if (body?.id) {
                void queryClient.invalidateQueries({
                    queryKey: queryKeys.cpcpConfig.diagram(plantCode, body.id),
                });
            }
        },
    });
}

/** Delete a diagram. Invalidates the diagram list on success. */
export function useDeleteDiagram() {
    const { plantCode } = useApp();
    const queryClient = useQueryClient();
    return useMutation({
        meta: { errorTitle: 'Diagram delete failed' },
        mutationFn: (diagramId) => deletePnidDiagram(plantCode, diagramId),
        onSuccess: (_res, diagramId) => {
            void queryClient.invalidateQueries({
                queryKey: queryKeys.cpcpConfig.diagrams(plantCode),
            });
            // Drop the individual diagram cache — it no longer exists.
            queryClient.removeQueries({
                queryKey: queryKeys.cpcpConfig.diagram(plantCode, diagramId),
            });
        },
    });
}

/**
 * Pin/unpin a diagram as the home dashboard diagram.
 *
 * OPTIMISTIC: instantly updates the cached diagram list so pin/unpin feels
 * immediate. Rolls back on error; invalidates on settle (success or error)
 * to re-sync with the backend.
 */
export function usePinDiagram() {
    const { plantCode } = useApp();
    const queryClient = useQueryClient();
    const diagramsKey = queryKeys.cpcpConfig.diagrams(plantCode);

    return useMutation({
        meta: { errorTitle: 'Pin toggle failed' },
        mutationFn: ({ diagramId, pin = true }) =>
            pinPnidDiagram(plantCode, diagramId, pin),
        onMutate: async ({ diagramId, pin = true }) => {
            // Cancel any outgoing refetches so they don't overwrite our optimistic update.
            await queryClient.cancelQueries({ queryKey: diagramsKey });
            const previousData = queryClient.getQueryData(diagramsKey);

            queryClient.setQueryData(diagramsKey, (old) => {
                if (!old) return old;
                // The list may be wrapped in { diagrams: [...] } or be a raw array.
                const list = Array.isArray(old) ? old : old?.diagrams;
                if (!Array.isArray(list)) return old;

                const updated = list.map((d) => ({
                    ...d,
                    is_dashboard: d.id === diagramId ? pin : false,
                    pinned: d.id === diagramId ? pin : false,
                }));

                return Array.isArray(old) ? updated : { ...old, diagrams: updated };
            });

            return { previousData };
        },
        onError: (_err, _vars, context) => {
            if (context?.previousData) {
                queryClient.setQueryData(diagramsKey, context.previousData);
            }
        },
        onSettled: () => {
            void queryClient.invalidateQueries({ queryKey: diagramsKey });
        },
    });
}

// ── Generation ───────────────────────────────────────────────────────────

/** AI-generate one or more components. Invalidates the component catalog on success. */
export function useGenerateEquipment() {
    const { plantCode } = useApp();
    const queryClient = useQueryClient();
    return useMutation({
        meta: { errorTitle: 'Equipment generation failed' },
        mutationFn: (body) => generateEquipment(plantCode, body),
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: queryKeys.cpcpConfig.components(plantCode),
            });
        },
    });
}

/**
 * Batch-generate components from an uploaded file (multipart).
 * Returns `job_id` for the poller; consumers pass that to useGenerateJobPolling.
 */
export function useGenerateFile() {
    const { plantCode } = useApp();
    return useMutation({
        meta: { errorTitle: 'File generation failed' },
        mutationFn: (formData) => generateFile(plantCode, formData),
    });
}

// ── Detailed Equipment Summary ───────────────────────────────────────────

/**
 * Trigger generation of the detailed equipment summary (streaming response).
 * The raw Response is returned for streaming consumers to parse.
 * Invalidates summary status on success.
 */
export function useGenerateSummary() {
    const { plantCode } = useApp();
    const queryClient = useQueryClient();
    return useMutation({
        meta: { errorTitle: 'Summary generation failed' },
        mutationFn: (opts) =>
            generatePnidDetailedEquipmentSummaryRaw(plantCode, opts),
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: queryKeys.cpcpConfig.summaryStatus(plantCode),
            });
            void queryClient.invalidateQueries({
                queryKey: queryKeys.cpcpConfig.summaryPreview(plantCode, undefined),
            });
        },
    });
}
