'use client';
import { Rocket, Plus, Pencil, Trash2 } from 'lucide-react';
import { DataTable } from '@/src/components/ui/DataTable';
import { ActionsMenuButton } from '@/src/components/ui/ActionsMenuButton';
import { useDeploymentTab } from '../_hooks/useDeploymentTab';
import { DeploymentModal } from '../_components/DeploymentModal';

const ENV_STYLES = {
    production: 'bg-success/10 text-success border-success/20',
    staging: 'bg-warning/10 text-warning border-warning/20',
    development: 'bg-surface-2 text-text-muted border-border',
};

export function DeploymentTab() {
    const t = useDeploymentTab();

    const columns = [
        { key: 'deployment_id', label: 'ID', render: r => <span className="font-bold text-text-primary">{r.deployment_id}</span> },
        {
            key: 'experiment_id', label: 'Experiment', render: r => {
                const exp = t.experiments.find(e => e.experiment_id === r.experiment_id);
                return <span className="text-text-secondary">{r.experiment_id != null ? `#${r.experiment_id}${exp?.description ? ` · ${exp.description}` : ''}` : '—'}</span>;
            },
        },
        {
            key: 'environment', label: 'Environment', render: r => (
                <span className={`px-2 py-0.5 text-[11px] font-bold uppercase rounded border capitalize ${ENV_STYLES[r.environment] || ENV_STYLES.development}`}>{r.environment || '—'}</span>
            ),
        },
        { key: 'cron_schedule', label: 'Cron Schedule', render: r => <span className="font-mono text-body-sm text-text-secondary">{r.cron_schedule || '—'}</span> },
        { key: 'created_by', label: 'Created By', render: r => r.created_by || '—' },
        { key: 'created_at', label: 'Created At', render: r => r.created_at ? new Date(r.created_at).toLocaleString() : '—' },
        {
            key: 'actions', label: '', className: 'w-10', cellClassName: 'text-right', render: r => (
                <ActionsMenuButton actions={[
                    { label: 'Modify', icon: <Pencil className="w-4 h-4" />, onClick: () => t.openEdit(r) },
                    { label: 'Delete', icon: <Trash2 className="w-4 h-4" />, danger: true, loading: t.deletingId === r.deployment_id, disabled: t.deletingId === r.deployment_id, onClick: () => t.handleDelete(r) },
                ]} />
            ),
        },
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-12">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-[20px] font-bold text-text-primary">Deployment</h2>
                    <p className="text-body-sm text-text-muted mt-1">Schedule optimizer experiments to run in an environment, optionally on a cron schedule.</p>
                </div>
                <button onClick={t.openCreate} className="flex items-center gap-2 bg-brand text-white px-4 py-2 rounded-lg hover:bg-brand-hover font-medium text-body-sm transition-colors cursor-pointer shrink-0">
                    <Plus className="w-4 h-4" /> Add Deployment
                </button>
            </div>

            <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
                <DataTable
                    columns={columns} rows={t.list} loading={t.isLoading}
                    emptyIcon={<Rocket className="w-10 h-10" />}
                    emptyTitle="No deployments yet"
                    emptyDescription="Deploy an experiment to an environment to start running it on schedule."
                />
            </div>

            {t.isModalOpen && (
                <DeploymentModal isEditMode={t.isEditMode} form={t.form} setForm={t.setForm} experiments={t.experiments} isSaving={t.isSaving} onClose={t.closeModal} onSave={t.handleSave} />
            )}
        </div>
    );
}
