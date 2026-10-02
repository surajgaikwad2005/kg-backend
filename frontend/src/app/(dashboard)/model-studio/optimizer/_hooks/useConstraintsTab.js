'use client';
import { useState, useCallback } from 'react';
import { useApp } from '@/src/context/AppContext';
import { useToast } from '@/src/components/ui/Toast';
import { useConfirm } from '@/src/components/ui/ConfirmModal';
import { objectToRows, rowsToObject } from '@/src/components/ui/KeyValueEditor';
import {
    useConstraintsListQuery,
    useCreateConstraintsMutation,
    useModifyConstraintsMutation,
    useDeleteConstraintsMutation,
} from '../_queries/useOptimizerQueries';

const EMPTY_FORM = { equalityRows: [], inequalityRows: [], description: '', createdBy: '' };

export function useConstraintsTab() {
    const { plantCode } = useApp();
    const { success: toastSuccess, error: toastError } = useToast();
    const { openConfirm } = useConfirm();

    const { data: rawList, isLoading, refetch: fetchList } = useConstraintsListQuery(plantCode);
    const list = Array.isArray(rawList) ? rawList : [];

    const createMutation = useCreateConstraintsMutation();
    const modifyMutation = useModifyConstraintsMutation();
    const deleteMutation = useDeleteConstraintsMutation();

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
            equalityRows: objectToRows(row.equality_constraint),
            inequalityRows: objectToRows(row.inequality_constraint),
            description: row.description || '', createdBy: '',
        });
        setIsEditMode(true); setEditingId(row.constraint_id); setIsModalOpen(true);
    }, []);

    const closeModal = useCallback(() => setIsModalOpen(false), []);

    const handleSave = useCallback(async () => {
        setIsSaving(true);
        try {
            const equalityConstraint = rowsToObject(form.equalityRows);
            const inequalityConstraint = rowsToObject(form.inequalityRows);
            const payload = { equalityConstraint, inequalityConstraint, description: form.description };
            const currentUser = typeof window !== 'undefined' ? (localStorage.getItem('username') || 'admin') : 'admin';
            if (isEditMode) {
                await modifyMutation.mutateAsync({ plantCode, id: editingId, payload: { ...payload, updatedBy: currentUser } });
                toastSuccess('Constraints updated');
            } else {
                await createMutation.mutateAsync({ plantCode, payload: { ...payload, createdBy: currentUser } });
                toastSuccess('Constraints created');
            }
            setIsModalOpen(false);
        } catch (e) { toastError(isEditMode ? 'Update failed' : 'Create failed', e.message); }
        finally { setIsSaving(false); }
    }, [plantCode, form, isEditMode, editingId, createMutation, modifyMutation, toastSuccess, toastError]);

    const handleDelete = useCallback(async (row) => {
        const ok = await openConfirm('This constraint set will be permanently deleted.', { title: 'Delete constraints?', confirmLabel: 'Delete' });
        if (!ok) return;
        try {
            await deleteMutation.mutateAsync({ plantCode, id: row.constraint_id });
            toastSuccess('Constraints deleted');
        } catch (e) { toastError('Delete failed', e.message); }
    }, [plantCode, deleteMutation, openConfirm, toastSuccess, toastError]);

    return { list, isLoading, isModalOpen, isEditMode, form, setForm, isSaving: isSaving || createMutation.isPending || modifyMutation.isPending, deletingId, openCreate, openEdit, closeModal, handleSave, handleDelete };
}

