'use client';
import { useState, useCallback } from 'react';
import { useApp } from '@/src/context/AppContext';
import { useToast } from '@/src/components/ui/Toast';
import { useConfirm } from '@/src/components/ui/ConfirmModal';
import {
    useOptimizerExperimentsQuery,
    useCreateOptimizerExperimentMutation,
    useModifyOptimizerExperimentMutation,
    useDeleteOptimizerExperimentMutation,
    useObjectiveFunctionListQuery,
    useConstraintsListQuery,
    useConstantsListQuery,
} from '../_queries/useOptimizerQueries';

const EMPTY_FORM = { optimizerFunctionId: '', constraintId: '', constantsId: '', solver: '', description: '', createdBy: '' };

export function useExperimentTab() {
    const { plantCode } = useApp();
    const { success: toastSuccess, error: toastError } = useToast();
    const { openConfirm } = useConfirm();

    const { data: rawList, isLoading, refetch: fetchList } = useOptimizerExperimentsQuery(plantCode);
    const list = Array.isArray(rawList) ? rawList : [];

    const createMutation = useCreateOptimizerExperimentMutation();
    const modifyMutation = useModifyOptimizerExperimentMutation();
    const deleteMutation = useDeleteOptimizerExperimentMutation();

    const { data: rawObjFuncs } = useObjectiveFunctionListQuery(plantCode);
    const { data: rawConstraints } = useConstraintsListQuery(plantCode);
    const { data: rawConstants } = useConstantsListQuery(plantCode);

    const objectiveFunctions = Array.isArray(rawObjFuncs) ? rawObjFuncs : [];
    const constraints = Array.isArray(rawConstraints) ? rawConstraints : [];
    const constants = Array.isArray(rawConstants) ? rawConstants : [];

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [isSaving, setIsSaving] = useState(false);

    const deletingId = deleteMutation.isPending ? deleteMutation.variables?.expId : null;

    const openCreate = useCallback(() => {
        setForm(EMPTY_FORM); setIsEditMode(false); setEditingId(null); setIsModalOpen(true);
    }, []);

    const openEdit = useCallback((row) => {
        setForm({
            optimizerFunctionId: row.optimizer_function_id ?? '', constraintId: row.constraint_id ?? '', constantsId: row.constants_id ?? '',
            solver: row.solver || '', description: row.description || '', createdBy: '',
        });
        setIsEditMode(true); setEditingId(row.experiment_id); setIsModalOpen(true);
    }, []);

    const closeModal = useCallback(() => setIsModalOpen(false), []);

    const handleSave = useCallback(async () => {
        setIsSaving(true);
        try {
            const payload = {
                optimizerFunctionId: form.optimizerFunctionId ? Number(form.optimizerFunctionId) : undefined,
                constraintId: form.constraintId ? Number(form.constraintId) : undefined,
                constantsId: form.constantsId ? Number(form.constantsId) : undefined,
                solver: form.solver, description: form.description,
            };
            const currentUser = typeof window !== 'undefined' ? (localStorage.getItem('username') || 'admin') : 'admin';
            if (isEditMode) {
                await modifyMutation.mutateAsync({ plantCode, expId: editingId, payload: { ...payload, updatedBy: currentUser } });
                toastSuccess('Experiment updated');
            } else {
                await createMutation.mutateAsync({ plantCode, payload: { ...payload, createdBy: currentUser } });
                toastSuccess('Experiment created');
            }
            setIsModalOpen(false);
        } catch (e) { toastError(isEditMode ? 'Update failed' : 'Create failed', e.message); }
        finally { setIsSaving(false); }
    }, [plantCode, form, isEditMode, editingId, createMutation, modifyMutation, toastSuccess, toastError]);

    const handleDelete = useCallback(async (row) => {
        const ok = await openConfirm('This experiment will be permanently deleted.', { title: 'Delete experiment?', confirmLabel: 'Delete' });
        if (!ok) return;
        try {
            await deleteMutation.mutateAsync({ plantCode, expId: row.experiment_id });
            toastSuccess('Experiment deleted');
        } catch (e) { toastError('Delete failed', e.message); }
    }, [plantCode, deleteMutation, openConfirm, toastSuccess, toastError]);

    return {
        list, isLoading, objectiveFunctions, constraints, constants,
        isModalOpen, isEditMode, form, setForm, isSaving: isSaving || createMutation.isPending, deletingId,
        openCreate, openEdit, closeModal, handleSave, handleDelete,
    };
}

