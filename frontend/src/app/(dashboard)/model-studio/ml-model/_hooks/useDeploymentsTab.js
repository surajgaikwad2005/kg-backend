'use client';
import { useState, useCallback, useEffect } from 'react';
import {
    modifyDeployment, pauseUnpauseDeployment, runInferenceContainer,
} from '@/src/services/model-studio/ml-model/deploymentService';
import { useApp } from '@/src/context/AppContext';
import { useToast } from '@/src/components/ui/Toast';
import { useConfirm } from '@/src/components/ui/ConfirmModal';
import { useCronValidationQuery } from '../../expression/_queries/useExpressionQueries';
import {
    useMLDeploymentListQuery,
    useMLExperimentListQuery,
    useCreateMLDeploymentMutation,
    useDeleteMLDeploymentMutation,
} from '../_queries/useMLModelQueries';

const DEFAULT_FORM = {
    experimentId: '',
    environment: 'prod',
    cronSchedule: '* * * * *',
    createdBy: '',
    status: 'active',
};

export function useDeploymentsTab({ initialExperiments = [] } = {}) {
    const { error: toastError, success: toastSuccess } = useToast();
    const { openConfirm } = useConfirm();
    const { plantCode, user } = useApp();

    const deploymentsQuery = useMLDeploymentListQuery(plantCode);
    const experimentsQuery = useMLExperimentListQuery(plantCode);

    const createMutation = useCreateMLDeploymentMutation();
    const deleteMutation = useDeleteMLDeploymentMutation();

    const rawDeployments = deploymentsQuery.data;
    const deploymentsList = Array.isArray(rawDeployments) ? rawDeployments : [];
    const isLoading = deploymentsQuery.isLoading;

    const rawExperiments = experimentsQuery.data;
    const experimentsList = Array.isArray(rawExperiments) ? rawExperiments : initialExperiments;

    const [activeDepFilter, setActiveDepFilter] = useState('All');

    // Modal state
    const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingDeploymentId, setEditingDeploymentId] = useState(null);
    const [formData, setFormData] = useState(DEFAULT_FORM);
    const [isSaving, setIsSaving] = useState(false);
    const [actionLoadingId, setActionLoadingId] = useState(null);

    // Cron validation query
    const cronValidationQuery = useCronValidationQuery(plantCode, isDeployModalOpen ? formData.cronSchedule : '');
    const cronValidation = {
        isValid: !cronValidationQuery.isError,
        isLoading: cronValidationQuery.isLoading,
        description: cronValidationQuery.data?.description || cronValidationQuery.data?.message,
        nextRun: cronValidationQuery.data?.next_run,
        error: cronValidationQuery.error?.message || 'Invalid cron schedule',
    };

    const fetchDeployments = useCallback(() => deploymentsQuery.refetch(), [deploymentsQuery]);

    const handleOpenCreateModal = () => {
        setIsEditMode(false);
        setEditingDeploymentId(null);
        setFormData({
            ...DEFAULT_FORM,
            createdBy: user?.username || user?.name || user?.email || 'akshay',
            experimentId: experimentsList.length > 0 ? String(experimentsList[0].experiment_id || experimentsList[0].id || '') : '',
        });
        setIsDeployModalOpen(true);
    };

    const handleOpenEditModal = (dep) => {
        setIsEditMode(true);
        setEditingDeploymentId(dep.deployment_id);
        setFormData({
            experimentId: String(dep.experiment_id || ''),
            environment: dep.environment || 'prod',
            cronSchedule: dep.cron_schedule || '* * * * *',
            status: dep.status || 'active',
            createdBy: dep.created_by || user?.username || user?.name || 'akshay',
        });
        setIsDeployModalOpen(true);
    };

    const handleSubmitModal = async (e) => {
        if (e) e.preventDefault();
        if (!formData.experimentId) {
            toastError('Please select an experiment');
            return;
        }
        if (!formData.cronSchedule?.trim()) {
            toastError('Please enter a valid cron schedule');
            return;
        }
        if (!cronValidation.isValid) {
            toastError(cronValidation.error || 'Invalid cron schedule');
            return;
        }

        setIsSaving(true);
        try {
            if (isEditMode) {
                await modifyDeployment(plantCode, {
                    deploymentId: editingDeploymentId,
                    experimentId: formData.experimentId,
                    environment: formData.environment,
                    cronSchedule: formData.cronSchedule,
                    status: formData.status,
                });
                toastSuccess('Deployment updated successfully');
                fetchDeployments();
            } else {
                await createMutation.mutateAsync({
                    plantCode,
                    payload: {
                        experimentId: formData.experimentId,
                        environment: formData.environment,
                        cronSchedule: formData.cronSchedule,
                        createdBy: user?.username || user?.name || user?.email || 'akshay',
                    },
                });
                toastSuccess('Deployment created successfully');
            }
            setIsDeployModalOpen(false);
        } catch (err) {
            toastError(err.message || 'Failed to save deployment');
        } finally {
            setIsSaving(false);
        }
    };

    const handlePauseUnpause = (dep) => {
        const isCurrentActive = dep.status === 'active';
        const action = isCurrentActive ? 'pause' : 'unpause';
        const actionCapitalized = isCurrentActive ? 'Pause' : 'Resume';
        
        openConfirm({
            title: `${actionCapitalized} Deployment`,
            message: `Are you sure you want to ${isCurrentActive ? 'pause' : 'resume'} Deployment #${dep.deployment_id}?`,
            confirmLabel: actionCapitalized,
            variant: isCurrentActive ? 'warning' : 'success',
            onConfirm: async () => {
                setActionLoadingId(dep.deployment_id);
                try {
                    await pauseUnpauseDeployment(plantCode, dep.deployment_id, action);
                    toastSuccess(`Deployment ${isCurrentActive ? 'paused' : 'resumed'} successfully`);
                    fetchDeployments();
                } catch (err) {
                    toastError(err.message || `Failed to ${action} deployment`);
                } finally {
                    setActionLoadingId(null);
                }
            },
        });
    };

    const handleRunInference = async (dep) => {
        setActionLoadingId(dep.deployment_id);
        try {
            await runInferenceContainer(plantCode, dep.deployment_id);
            toastSuccess('Inference task started in background');
        } catch (err) {
            toastError(err.message || 'Failed to run inference task');
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleDelete = (dep) => {
        openConfirm({
            title: 'Delete Deployment',
            message: `Are you sure you want to delete Deployment #${dep.deployment_id}? This action cannot be undone.`,
            confirmLabel: 'Delete',
            variant: 'danger',
            onConfirm: async () => {
                setActionLoadingId(dep.deployment_id);
                try {
                    await deleteMutation.mutateAsync({ plantCode, depId: dep.deployment_id });
                    toastSuccess('Deployment deleted successfully');
                } catch (err) {
                    toastError(err.message || 'Failed to delete deployment');
                } finally {
                    setActionLoadingId(null);
                }
            },
        });
    };

    const depFilterOptions = [
        { label: 'All', key: 'All', count: deploymentsList.length },
        { label: 'Production', key: 'prod', count: deploymentsList.filter(d => ['prod', 'production'].includes((d.environment || '').toLowerCase())).length },
        { label: 'Development', key: 'dev', count: deploymentsList.filter(d => ['dev', 'development'].includes((d.environment || '').toLowerCase())).length },
    ];

    const filteredDeployments = deploymentsList.filter(dep => {
        if (activeDepFilter === 'All') return true;
        const env = (dep.environment || '').toLowerCase();
        if (activeDepFilter === 'prod' || activeDepFilter === 'Production') return env === 'prod' || env === 'production';
        if (activeDepFilter === 'dev' || activeDepFilter === 'Development') return env === 'dev' || env === 'development';
        return env === activeDepFilter.toLowerCase();
    });

    return {
        deploymentsList,
        filteredDeployments,
        isLoading,
        experimentsList,
        activeDepFilter,
        setActiveDepFilter,
        depFilterOptions,
        isDeployModalOpen,
        setIsDeployModalOpen,
        isEditMode,
        formData,
        setFormData,
        cronValidation,
        isSaving: isSaving || createMutation.isPending,
        handleOpenCreateModal,
        handleOpenEditModal,
        handleSubmitModal,
        handlePauseUnpause,
        handleRunInference,
        handleDelete,
        actionLoadingId,
        fetchDeployments,
    };
}

