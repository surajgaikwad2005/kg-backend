'use client';
import React, { useState, useEffect } from 'react';
import { Plus, Globe, RefreshCw, Pause, Play, Edit3, Trash2 } from 'lucide-react';
import { useDeploymentsTab } from '../_hooks/useDeploymentsTab';
import { DeploymentModal } from '../_components/DeploymentModal';
import { DataTable } from '@/src/components/ui/DataTable';
import { ActionsMenuButton } from '@/src/components/ui/ActionsMenuButton';
import { ENV_COLORS } from '../_lib/cronUtils';

/**
 * DeploymentsTab — live deployment table view (< 150 lines).
 * Connected to modelFactory/mlModel/deployment backend APIs.
 * Uses 3-dots action menu pattern matching Model Studio standard design.
 */
export function DeploymentsTab({ experimentsList = [] }) {
    const {
        deploymentsList,
        filteredDeployments,
        isLoading,
        experimentsList: loadedExperiments,
        activeDepFilter,
        setActiveDepFilter,
        depFilterOptions,
        isDeployModalOpen,
        setIsDeployModalOpen,
        isEditMode,
        formData,
        setFormData,
        cronValidation,
        isSaving,
        handleOpenCreateModal,
        handleOpenEditModal,
        handleSubmitModal,
        handlePauseUnpause,
        handleRunInference,
        handleDelete,
        fetchDeployments,
    } = useDeploymentsTab({ initialExperiments: experimentsList });

    const expOptions = (loadedExperiments || []).map(e => ({
        value: String(e.experiment_id || e.id),
        label: `${e.experiment_name || 'Unnamed'} (#${e.experiment_id || e.id})`
    }));

    const columns = [
        { key: 'deployment_id', label: 'DEPLOYMENT ID', render: r => <span className="font-bold text-text-primary">{r.deployment_id}</span> },
        { key: 'experiment_id', label: 'EXPERIMENT ID', render: r => <span className="font-semibold text-text-secondary">{r.experiment_id}</span> },
        { key: 'environment', label: 'ENVIRONMENT', render: r => {
            const envKey = (r.environment || 'prod').toLowerCase();
            const envBadgeClass = ENV_COLORS[envKey] || ENV_COLORS.prod;
            return <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${envBadgeClass}`}>{r.environment || 'prod'}</span>;
        } },
        { key: 'status', label: 'STATUS', render: r => {
            const isActive = r.status === 'active';
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-canvas border border-border">
                    <div className={`h-2 w-2 rounded-full ${isActive ? 'bg-success animate-pulse' : 'bg-text-subtle'}`} />
                    <span className={isActive ? 'text-success' : 'text-text-subtle'}>{r.status || 'inactive'}</span>
                </span>
            );
        } },
        { key: 'cron_schedule', label: 'CRON SCHEDULE', render: r => <code className="font-mono text-xs bg-canvas px-2.5 py-1 rounded border border-border text-text-primary">{r.cron_schedule || 'N/A'}</code> },
        { key: 'created_by', label: 'CREATED BY', render: r => <span className="text-text-muted text-sm font-medium">{r.created_by || 'System'}</span> },
        { key: 'actions', label: 'ACTIONS', cellClassName: 'text-right', render: r => {
            const isActive = r.status === 'active';
            return (
                <ActionsMenuButton actions={[
                    {
                        label: isActive ? 'Pause' : 'Resume',
                        icon: isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />,
                        className: isActive ? 'text-amber-600 hover:bg-amber-500/10 hover:text-amber-600' : 'text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-600',
                        onClick: () => handlePauseUnpause(r)
                    },
                    { label: 'Modify', icon: <Edit3 className="w-4 h-4 text-text-subtle" />, onClick: () => handleOpenEditModal(r) },
                    { label: 'Delete', icon: <Trash2 className="w-4 h-4 text-danger" />, danger: true, onClick: () => handleDelete(r) }
                ]} />
            );
        } }
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-[26px] font-bold text-text-primary">Deployments</h2>
                    <p className="text-[16px] text-text-muted mt-1">Manage live model deployments, execution schedules, and background inference tasks.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchDeployments}
                        disabled={isLoading}
                        title="Refresh Deployments"
                        className="p-2 border border-border rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-2 transition-colors cursor-pointer disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                        onClick={handleOpenCreateModal}
                        className="flex items-center gap-2 bg-brand text-white px-4 py-2 rounded-lg hover:bg-brand-hover font-medium text-[16px] transition-colors cursor-pointer"
                    >
                        <Plus className="w-4 h-4" /> Deploy Model
                    </button>
                </div>
            </div>

            {/* Filter tabs with counts */}
            <div className="flex gap-2 bg-surface-2 p-1 rounded-lg w-max">
                {depFilterOptions.map(f => (
                    <button
                        key={f.key}
                        onClick={() => setActiveDepFilter(f.key)}
                        className={`px-4 py-1.5 text-[16px] font-medium rounded-md transition-colors cursor-pointer ${
                            activeDepFilter === f.key ? 'bg-surface text-text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'
                        }`}
                    >
                        {f.label} ({f.count})
                    </button>
                ))}
            </div>

            {/* Deployments Table Container */}
            <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
                <DataTable
                    columns={columns}
                    rows={filteredDeployments}
                    loading={isLoading && deploymentsList.length === 0}
                    emptyIcon={<Globe className="w-12 h-12 text-border-strong" />}
                    emptyTitle="No deployments found"
                    emptyDescription={activeDepFilter === 'All' ? 'There are currently no model deployments configured. Click "Deploy Model" to launch your first deployment.' : `No deployments found for environment "${activeDepFilter}".`}
                />
            </div>

            {/* Deploy / Modify Modal */}
            <DeploymentModal
                isOpen={isDeployModalOpen}
                onClose={() => setIsDeployModalOpen(false)}
                isEditMode={isEditMode}
                formData={formData}
                setFormData={setFormData}
                expOptions={expOptions}
                cronValidation={cronValidation}
                isSaving={isSaving}
                onSubmit={handleSubmitModal}
            />
        </div>
    );
}
