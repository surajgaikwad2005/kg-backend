'use client';
import { useState, useCallback } from 'react';
import { useApp } from '@/src/context/AppContext';
import { useToast } from '@/src/components/ui/Toast';
import { useConfirm } from '@/src/components/ui/ConfirmModal';
import { objectToRows, rowsToObject } from '@/src/components/ui/KeyValueEditor';
import {
    useObjectiveFunctionListQuery,
    useCreateObjectiveFunctionMutation,
    useModifyObjectiveFunctionMutation,
    useDeleteObjectiveFunctionMutation,
} from '../_queries/useOptimizerQueries';

const EMPTY_FORM = { type: 'min', expression: '', decisionVariableRows: [], boundsRows: [], description: '', createdBy: '' };

export function useObjectiveFunctionTab() {
    const { plantCode } = useApp();
    const { success: toastSuccess, error: toastError } = useToast();
    const { openConfirm } = useConfirm();

    const { data: rawList, isLoading, refetch: fetchList } = useObjectiveFunctionListQuery(plantCode);
    const list = Array.isArray(rawList) ? rawList : [];

    const createMutation = useCreateObjectiveFunctionMutation();
    const modifyMutation = useModifyObjectiveFunctionMutation();
    const deleteMutation = useDeleteObjectiveFunctionMutation();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [isSaving, setIsSaving] = useState(false);

    const deletingId = deleteMutation.isPending ? deleteMutation.variables?.id : null;

    const openCreate = useCallback(() => {
        setForm(EMPTY_FORM); setIsEditMode(false); setEditingId(null); setIsModalOpen(true);
    }, []);

    const openEdit = useCallback((row) => {
        setForm({
            type: row.type || 'min',
            expression: row.function?.expression || '',
            decisionVariableRows: objectToRows(row.decision_variable),
            boundsRows: objectToRows(row.bounds),
            description: row.description || '', createdBy: '',
        });
        setIsEditMode(true); setEditingId(row.optimizer_function_id); setIsModalOpen(true);
    }, []);

    const closeModal = useCallback(() => setIsModalOpen(false), []);

    const handleSave = useCallback(async () => {
        setIsSaving(true);
        try {
            const decisionVariable = rowsToObject(form.decisionVariableRows);
            const bounds = rowsToObject(form.boundsRows);
            const payload = { type: form.type, fn: { expression: form.expression }, decisionVariable, bounds, description: form.description };
            const currentUser = typeof window !== 'undefined' ? (localStorage.getItem('username') || 'admin') : 'admin';
            if (isEditMode) {
                await modifyMutation.mutateAsync({ plantCode, id: editingId, payload: { ...payload, updatedBy: currentUser } });
                toastSuccess('Objective function updated');
            } else {
                await createMutation.mutateAsync({ plantCode, payload: { ...payload, createdBy: currentUser } });
                toastSuccess('Objective function created');
            }
            setIsModalOpen(false);
        } catch (e) { toastError(isEditMode ? 'Update failed' : 'Create failed', e.message); }
        finally { setIsSaving(false); }
    }, [plantCode, form, isEditMode, editingId, createMutation, modifyMutation, toastSuccess, toastError]);

    const handleDelete = useCallback(async (row) => {
        const ok = await openConfirm('This objective function will be permanently deleted.', { title: 'Delete objective function?', confirmLabel: 'Delete' });
        if (!ok) return;
        try {
            await deleteMutation.mutateAsync({ plantCode, id: row.optimizer_function_id });
            toastSuccess('Objective function deleted');
        } catch (e) { toastError('Delete failed', e.message); }
    }, [plantCode, deleteMutation, openConfirm, toastSuccess, toastError]);

    return { list, isLoading, isModalOpen, isEditMode, form, setForm, isSaving: isSaving || createMutation.isPending || modifyMutation.isPending, deletingId, openCreate, openEdit, closeModal, handleSave, handleDelete };
}

