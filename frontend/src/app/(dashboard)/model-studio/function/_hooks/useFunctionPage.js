'use client';
import { useState } from 'react';
import { useToast } from '@/src/components/ui/Toast';
import { useApp } from '@/src/context/AppContext';
import {
    useFunctionsQuery,
    useSaveFunctionMutation,
    useUpdateFunctionMutation,
    useDeleteFunctionMutation,
    useRunFunctionMutation,
} from '../_queries/useFunctionQueries';

export function useFunctionPage() {
    const { plantCode } = useApp();
    const effectivePlantCode = plantCode || 'Plant_1';
    const { success, error: toastError } = useToast();

    const { data: rawFunctions, isLoading: loading, error: queryError, refetch: fetchFunctions } = useFunctionsQuery(effectivePlantCode);
    const functionsList = Array.isArray(rawFunctions) ? rawFunctions : [];
    const error = queryError ? (queryError.message || 'Failed to load custom functions') : null;

    const saveMutation = useSaveFunctionMutation();
    const updateMutation = useUpdateFunctionMutation();
    const deleteMutation = useDeleteFunctionMutation();
    const runMutation = useRunFunctionMutation();

    const [searchQuery, setSearchQuery] = useState('');

    // View mode: 'list' | 'builder'
    const [viewMode, setViewMode] = useState('list');

    // Modal state for Step 1
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingFunction, setEditingFunction] = useState(null);
    const [builderName, setBuilderName] = useState('');
    const [builderDescription, setBuilderDescription] = useState('');

    // Delete modal
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingFunction, setDeletingFunction] = useState(null);

    // Test execution state
    const [testResult, setTestResult] = useState(null);
    const [copiedId, setCopiedId] = useState(null);

    const actionLoading = saveMutation.isPending || updateMutation.isPending || deleteMutation.isPending;
    const testingCode = runMutation.isPending;

    const openNewModal = () => {
        setEditingFunction(null);
        setBuilderName('');
        setBuilderDescription('');
        setTestResult(null);
        setIsModalOpen(true);
    };

    const openEditModal = (fn) => {
        setEditingFunction(fn);
        setBuilderName(fn.name || '');
        setBuilderDescription(fn.description || '');
        setTestResult(null);
        setViewMode('builder');
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const openCodeBuilder = (name, description) => {
        setBuilderName(name);
        setBuilderDescription(description);
        setIsModalOpen(false);
        setViewMode('builder');
    };

    const closeBuilder = () => {
        setViewMode('list');
        setEditingFunction(null);
        setTestResult(null);
    };

    const openDeleteModal = (fn) => {
        setDeletingFunction(fn);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setDeletingFunction(null);
    };

    const handleRunTest = async ({ name, code, testInputs }) => {
        setTestResult(null);
        try {
            const res = await runMutation.mutateAsync({
                plantCode: effectivePlantCode,
                payload: { name, code, testInputs },
            });
            setTestResult(res);
            if (res?.success) {
                success('Function ran and validated successfully');
            } else {
                toastError(res?.message || 'Function execution failed');
            }
        } catch (err) {
            const errMsg = err.message || 'Failed to run test execution';
            toastError(errMsg);
            setTestResult({
                success: false,
                message: errMsg,
                data: err.data || {},
            });
        }
    };

    const handleSaveOrUpdate = async (formData) => {
        try {
            const currentUserName = typeof window !== 'undefined' ? (localStorage.getItem('username') || 'User') : 'User';

            if (editingFunction) {
                await updateMutation.mutateAsync({
                    plantCode: effectivePlantCode,
                    functionId: editingFunction.function_id,
                    payload: {
                        name: formData.name || builderName,
                        description: formData.description || builderDescription,
                        code: formData.code,
                    },
                });
                success(`Custom function "${formData.name || builderName}" updated successfully`);
            } else {
                await saveMutation.mutateAsync({
                    plantCode: effectivePlantCode,
                    payload: {
                        name: formData.name || builderName,
                        code: formData.code,
                        description: formData.description || builderDescription,
                        createdBy: formData.createdBy || currentUserName,
                    },
                });
                success(`Custom function "${formData.name || builderName}" saved successfully`);
            }
            closeBuilder();
        } catch (err) {
            toastError(err.message || 'Failed to save function');
        }
    };

    const handleDelete = async () => {
        if (!deletingFunction) return;
        try {
            await deleteMutation.mutateAsync({
                plantCode: effectivePlantCode,
                functionId: deletingFunction.function_id,
            });
            success(`Function "${deletingFunction.name}" deleted successfully`);
            closeDeleteModal();
        } catch (err) {
            toastError(err.message || 'Failed to delete function');
        }
    };

    const handleCopyCode = (id, code) => {
        navigator.clipboard.writeText(code);
        setCopiedId(id);
        success('Code copied to clipboard');
        setTimeout(() => setCopiedId(null), 2000);
    };

    const filteredFunctions = functionsList.filter((fn) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
            String(fn.function_id || '').toLowerCase().includes(q) ||
            String(fn.name || '').toLowerCase().includes(q) ||
            String(fn.description || '').toLowerCase().includes(q) ||
            String(fn.created_by || '').toLowerCase().includes(q)
        );
    });

    return {
        functionsList: filteredFunctions,
        rawList: functionsList,
        loading,
        error,
        searchQuery,
        setSearchQuery,
        fetchFunctions,
        // View Mode
        viewMode,
        builderName,
        builderDescription,
        openCodeBuilder,
        closeBuilder,
        // Modal & Actions
        isModalOpen,
        editingFunction,
        openNewModal,
        openEditModal,
        closeModal,
        isDeleteModalOpen,
        deletingFunction,
        openDeleteModal,
        closeDeleteModal,
        actionLoading,
        handleSaveOrUpdate,
        handleDelete,
        // Testing
        handleRunTest,
        testResult,
        testingCode,
        clearTestResult: () => setTestResult(null),
        // Copying
        copiedId,
        handleCopyCode,
    };
}

