'use client';
import React from 'react';
import { Plus, Settings, Archive, FlaskConical } from 'lucide-react';
import { DataTable } from '@/src/components/ui/DataTable';
import { ActionsMenuButton } from '@/src/components/ui/ActionsMenuButton';
import { useExperimentsTab } from '../_hooks/useExperimentsTab';
import { ExperimentModal } from '../_components/ExperimentModal';

export function ExperimentsTab({ experimentsList, isExperimentsLoading, modelsList, pipelinesList, onRefresh }) {
    const t = useExperimentsTab({ experimentsList, modelsList, pipelinesList, onRefresh });

    const columns = [
        { key: 'experiment_id', label: 'Experiment ID', render: r => <span className="font-bold text-text-primary">{r.experiment_id}</span> },
        { key: 'experiment_name', label: 'Experiment Name', render: r => <div className="font-bold text-text-primary">{r.experiment_name}</div> },
        { key: 'status', label: 'Status', render: r => {
            let statusColor = 'text-text-secondary bg-canvas';
            if (r.status?.toLowerCase() === 'completed') statusColor = 'text-brand bg-brand-muted';
            else if (r.status?.toLowerCase() === 'created') statusColor = 'text-success bg-success/10';
            else if (r.status?.toLowerCase() === 'failed') statusColor = 'text-danger bg-danger/10';
            else if (r.status?.toLowerCase() === 'running') statusColor = 'text-chart-5 bg-chart-5/10';
            return <span className={`px-2.5 py-1 text-body-sm font-semibold rounded-full ${statusColor}`}>{r.status ? r.status.charAt(0).toUpperCase() + r.status.slice(1) : 'Unknown'}</span>;
        } },
        { key: 'metric', label: 'Metric', render: r => <span className="text-text-secondary font-medium">{r.performance?.primary_metric || 'N/A'}</span> },
        { key: 'value', label: 'Value', render: r => <span className="text-base font-bold text-text-primary">{r.performance?.primary_metric_value ?? 'N/A'}</span> },
        { key: 'runtime', label: 'Runtime & Compute', render: r => (
            <div className="flex items-center gap-4 text-sm text-text-secondary">
                <div className="flex flex-col"><span className="text-label font-bold text-text-subtle uppercase tracking-widest">Duration</span><span>{r.duration ?? 0}s</span></div>
                <div className="flex flex-col"><span className="text-label font-bold text-text-subtle uppercase tracking-widest">GPU</span><span>N/A</span></div>
            </div>
        ) },
        { key: 'created_at', label: 'Created At', render: r => <span className="text-text-muted text-sm">{r.created_at ? new Date(r.created_at).toLocaleString() : 'N/A'}</span> },
        { key: 'updated_at', label: 'Updated At', render: r => <span className="text-text-muted text-sm">{r.updated_at ? new Date(r.updated_at).toLocaleString() : 'N/A'}</span> },
        { key: 'created_by', label: 'Created By', render: r => <span className="text-text-muted text-sm">{r.created_by || 'System'}</span> },
        { key: 'actions', label: '', cellClassName: 'text-right', render: r => (
            <ActionsMenuButton actions={[
                { label: 'Modify', icon: <Settings className="w-4 h-4 text-text-subtle" />, onClick: () => t.handleEditExperiment(r) },
                { label: 'Delete', icon: <Archive className="w-4 h-4 text-danger" />, danger: true, onClick: () => t.handleDeleteExperiment(r.experiment_id) }
            ]} />
        ) }
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-12">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-[26px] font-bold text-text-primary">Experiments</h2>
                    <p className="text-base text-text-muted mt-1">Track training runs, compare metrics, and manage ML experiments.</p>
                </div>
                <button onClick={t.handleNewExperiment} className="flex items-center gap-2 bg-brand text-white px-4 py-2 rounded-lg hover:bg-brand-hover font-medium text-base transition-colors cursor-pointer">
                    <Plus className="w-4 h-4" /> New Experiment
                </button>
            </div>

            <div className="flex gap-2 bg-surface-2 p-1 rounded-lg w-max">
                {t.expFilters.map(f => (
                    <button key={f.label} onClick={() => t.setActiveExpFilter(f.label)} className={`px-4 py-1.5 text-base font-medium rounded-md transition-colors cursor-pointer ${t.activeExpFilter === f.label ? 'bg-surface text-text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}>
                        {f.label} ({f.count})
                    </button>
                ))}
            </div>

            <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
                <DataTable
                    columns={columns}
                    rows={t.filteredExperiments}
                    loading={isExperimentsLoading}
                    emptyIcon={<FlaskConical className="w-12 h-12 text-border-strong" />}
                    emptyTitle="No experiments found"
                />
            </div>

            {t.isNewExpModalOpen && (
                <ExperimentModal
                    isExpModifyMode={t.isExpModifyMode}
                    activeExpModalTab={t.activeExpModalTab}
                    setActiveExpModalTab={t.setActiveExpModalTab}
                    newExpForm={t.newExpForm}
                    setNewExpForm={t.setNewExpForm}
                    paramValues={t.paramValues}
                    setParamValues={t.setParamValues}
                    fetchedParams={t.fetchedParams}
                    paramsLoading={t.paramsLoading}
                    paramsError={t.paramsError}
                    metricOptions={t.metricOptions}
                    metricOptionsLoading={t.metricOptionsLoading}
                    isSaving={t.isSaving}
                    modelsList={modelsList}
                    pipelinesList={pipelinesList}
                    onClose={t.closeModal}
                    onLaunch={t.handleLaunchExperiment}
                />
            )}
        </div>
    );
}
