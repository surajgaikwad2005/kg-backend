'use client';
import { useState, useCallback } from 'react';
import { useApp } from '@/src/context/AppContext';
import { useToast } from '@/src/components/ui/Toast';
import { useConfirm } from '@/src/components/ui/ConfirmModal';
import {
    useDeploymentListQuery,
    useOptimizerExperimentsQuery,
    useCreateDeploymentMutation,
    useModifyDeploymentMutation,
    useDeleteDeploymentMutation,
} from '../_queries/useOptimizerQueries';

const EMPTY_FORM = { experimentId: '', environment: 'development', cronSchedule: '', createdBy: '' };

export function useDeploymentTab() {
    const { plantCode } = useApp();
    const { success: toastSuccess, error: toastError } = useToast();
    const { openConfirm } = useConfirm();

    const { data: rawList, isLoading, refetch: fetchList } = useDeploymentListQuery(plantCode);
    const list = Array.isArray(rawList) ? rawList : [];

    const { data: rawExperiments } = useOptimizerExperimentsQuery(plantCode);
    const experiments = Array.isArray(rawExperiments) ? rawExperiments : [];

    const createMutation = useCreateDeploymentMutation();
    const modifyMutation = useModifyDeploymentMutation();
    const deleteMutation = useDeleteDeploymentMutation();

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
            experimentId: row.experiment_id ?? '', environment: row.environment || 'development',
            cronSchedule: row.cron_schedule || '', createdBy: '',
        });
        setIsEditMode(true); setEditingId(row.deployment_id); setIsModalOpen(true);
    }, []);

    const closeModal = useCallback(() => setIsModalOpen(false), []);

    const handleSave = useCallback(async () => {
        setIsSaving(true);
        try {
            const payload = {
                experimentId: form.experimentId ? Number(form.experimentId) : undefined,
                environment: form.environment, cronSchedule: form.cronSchedule || undefined,
            };
            const currentUser = typeof window !== 'undefined' ? (localStorage.getItem('username') || 'admin') : 'admin';
            if (isEditMode) {
                await modifyMutation.mutateAsync({ plantCode, id: editingId, payload: { ...payload, updatedBy: currentUser } });
                toastSuccess('Deployment updated');
            } else {
                await createMutation.mutateAsync({ plantCode, payload: { ...payload, createdBy: currentUser } });
                toastSuccess('Deployment created');
            }
            setIsModalOpen(false);
        } catch (e) { toastError(isEditMode ? 'Update failed' : 'Create failed', e.message); }
        finally { setIsSaving(false); }
    }, [plantCode, form, isEditMode, editingId, createMutation, modifyMutation, toastSuccess, toastError]);

    const handleDelete = useCallback(async (row) => {
        const ok = await openConfirm('This deployment will be permanently deleted.', { title: 'Delete deployment?', confirmLabel: 'Delete' });
        if (!ok) return;
        try {
            await deleteMutation.mutateAsync({ plantCode, id: row.deployment_id });
            toastSuccess('Deployment deleted');
        } catch (e) { toastError('Delete failed', e.message); }
    }, [plantCode, deleteMutation, openConfirm, toastSuccess, toastError]);

    return {
        list, isLoading, experiments,
        isModalOpen, isEditMode, form, setForm, isSaving: isSaving || createMutation.isPending || modifyMutation.isPending, deletingId,
        openCreate, openEdit, closeModal, handleSave, handleDelete,
    };
}

