'use client';
import { useState, useMemo } from 'react';
import { useToast } from '@/src/components/ui/Toast';
import {
    useGlobalVariablesQuery,
    useSaveGlobalVariableMutation,
    useUpdateGlobalVariableMutation,
    useDeleteGlobalVariableMutation,
} from '../_queries/useGlobalVariableQueries';
import { useApp } from '@/src/context/AppContext';

export function useGlobalVariablePage() {
    const toast = useToast();
    const { plantCode } = useApp();
    const { data: rawData, isLoading: loading, error, refetch: fetchVariables } = useGlobalVariablesQuery(plantCode);
    const saveMutation = useSaveGlobalVariableMutation();
    const updateMutation = useUpdateGlobalVariableMutation();
    const deleteMutation = useDeleteGlobalVariableMutation();

    const variablesList = useMemo(() => Array.isArray(rawData) ? rawData : [], [rawData]);
    const [searchQuery, setSearchQuery] = useState('');

    // Modal state for Add / Edit
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingVariable, setEditingVariable] = useState(null);

    // Delete modal state
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingVariable, setDeletingVariable] = useState(null);

    const actionLoading = saveMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

    const openNewModal = () => {
        setEditingVariable(null);
        setIsModalOpen(true);
    };

    const openEditModal = (item) => {
        setEditingVariable(item);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingVariable(null);
    };

    const openDeleteModal = (item) => {
        setDeletingVariable(item);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setDeletingVariable(null);
    };

    const handleSaveOrUpdate = async ({ varName, value, description }) => {
        if (!varName?.trim()) return;
        try {
            if (editingVariable) {
                const varId = editingVariable.globalvar_id || editingVariable.global_var_id || editingVariable.id;
                await updateMutation.mutateAsync({
                    globalvar_id: varId,
                    var: varName,
                    value,
                    description,
                    plant_code_id: plantCode,
                });
                toast?.success?.('Global variable updated successfully');
            } else {
                const username = typeof window !== 'undefined' ? (localStorage.getItem('username') || '').split('@')[0] : 'User';
                await saveMutation.mutateAsync({
                    var: varName,
                    value,
                    description,
                    created_by: username || 'User',
                    plant_code_id: plantCode,
                });
                toast?.success?.('Global variable added successfully');
            }
            closeModal();
        } catch (err) {
            console.error('Save error:', err);
            toast?.error?.(err.message || 'Failed to save global variable');
        }
    };

    const handleConfirmDelete = async () => {
        if (!deletingVariable) return;
        const varId = deletingVariable.globalvar_id || deletingVariable.global_var_id || deletingVariable.id;
        const varName = deletingVariable.var || deletingVariable.key;
        try {
            await deleteMutation.mutateAsync({ globalvar_id: varId, var: varName, plant_code_id: plantCode });
            toast?.success?.('Global variable deleted');
            closeDeleteModal();
        } catch (err) {
            console.error('Delete error:', err);
            toast?.error?.(err.message || 'Failed to delete global variable');
        }
    };

    const filteredVariables = useMemo(() => {
        if (!searchQuery.trim()) return variablesList;
        const q = searchQuery.toLowerCase();
        return variablesList.filter((v) => {
            const idMatch = String(v.globalvar_id || v.global_var_id || v.id || '').toLowerCase().includes(q);
            const keyMatch = String(v.var || v.key || '').toLowerCase().includes(q);
            const valMatch = String(v.value || '').toLowerCase().includes(q);
            const descMatch = String(v.description || '').toLowerCase().includes(q);
            const creatorMatch = String(v.created_by || '').toLowerCase().includes(q);
            return idMatch || keyMatch || valMatch || descMatch || creatorMatch;
        });
    }, [variablesList, searchQuery]);

    return {
        variablesList,
        filteredVariables,
        loading,
        error: error ? error.message || 'Failed to load global variables' : null,
        searchQuery,
        setSearchQuery,
        isModalOpen,
        editingVariable,
        openNewModal,
        openEditModal,
        closeModal,
        isDeleteModalOpen,
        deletingVariable,
        openDeleteModal,
        closeDeleteModal,
        actionLoading,
        handleSaveOrUpdate,
        handleConfirmDelete,
        fetchVariables,
    };
}

