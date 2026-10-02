'use client';
import { useState, useCallback } from 'react';
import { useApp } from '@/src/context/AppContext';
import { useToast } from '@/src/components/ui/Toast';
import { useConfirm } from '@/src/components/ui/ConfirmModal';
import {
    useWorkflowList,
    useDeleteWorkflow,
    useLoadWorkflowForEdit,
} from '../_queries/useDecisionTemplate';

export function useWorkflows() {
    const { plantCode } = useApp();
    const toast = useToast();
    const { openConfirm } = useConfirm();

    // `enabled: !!plantCode` means no plant selected resolves to "not loading,
    // empty list" without ever touching the network — the same outcome the old
    // early-return produced by hand, minus the manual flag juggling.
    const {
        data: workflows = [],
        isLoading: loading,
        error: queryError,
        refetch,
    } = useWorkflowList(plantCode);

    const deleteWorkflowMutation = useDeleteWorkflow(plantCode);
    const loadWorkflow = useLoadWorkflowForEdit(plantCode);

    const [selectedWorkflow, setSelectedWorkflow] = useState(null);
    // Per-row async indicators — which template_id is currently being fetched
    // (Modify) or deleted, so the table can disable that row's action and show
    // a spinner instead of leaving the click looking like it did nothing. These
    // stay local: the mutation's own isPending is global to the mutation, not
    // scoped to a row.
    const [editLoadingId, setEditLoadingId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    const { mutateAsync: deleteWorkflowAsync } = deleteWorkflowMutation;

    const deleteWorkflow = useCallback((wf) => {
        const templateId = typeof wf === 'object' ? wf.template_id : wf;
        const templateName = typeof wf === 'object' ? wf.template_name : null;

        openConfirm({
            title: 'Delete Template?',
            message: `Are you sure you want to delete "${templateName || 'this template'}"? This cannot be undone.`,
            confirmLabel: 'Delete',
            onConfirm: async () => {
                setDeletingId(templateId);
                try {
                    // The mutation invalidates the list itself, so the manual
                    // setWorkflows(prev => prev.filter(...)) that used to follow
                    // is gone — the row disappears when the refetch lands.
                    await deleteWorkflowAsync(templateId);
                    toast.success('Template deleted', `"${templateName || 'Template'}" has been removed.`);
                } catch {
                    // Surfaced by the global mutation-error toast.
                } finally {
                    setDeletingId(null);
                }
            },
        });
    }, [deleteWorkflowAsync, toast, openConfirm]);

    /**
     * Fetches the canonical saved workflow (viewWorkflow) before the builder is
     * allowed to open for editing. getWorkflowList's row is a list-view summary
     * and isn't confirmed to carry the full `workflow` graph — opening the
     * builder directly off that row let Save silently PUT an empty
     * `{ data: [], ui_nodes: [], ui_edges: [] }` over the real saved workflow.
     * Returns the canonical record to edit, or null if the caller should NOT
     * proceed (an error is already toasted in that case).
     */
    const loadWorkflowForEdit = useCallback(async (wf) => {
        setEditLoadingId(wf.template_id);
        try {
            const data = await loadWorkflow(wf.template_id);
            if (!data?.workflow) {
                toast.error('Could not load the saved workflow for this template — editing was cancelled to avoid overwriting it.');
                return null;
            }
            return data;
        } catch (err) {
            toast.error(err?.message || 'Failed to load the template for editing.');
            return null;
        } finally {
            setEditLoadingId(null);
        }
    }, [loadWorkflow, toast]);

    return {
        workflows,
        loading,
        error: queryError ? (queryError.message || 'Failed to load workflows') : null,
        selectedWorkflow,
        setSelectedWorkflow,
        fetchWorkflows: refetch,
        deleteWorkflow,
        loadWorkflowForEdit,
        editLoadingId,
        deletingId,
        noPlantSelected: !plantCode,
    };
}
