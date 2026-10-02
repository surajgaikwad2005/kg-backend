'use client';
import { Table2, Plus, Pencil, Trash2 } from 'lucide-react';
import { DataTable } from '@/src/components/ui/DataTable';
import { ActionsMenuButton } from '@/src/components/ui/ActionsMenuButton';
import { useExperimentTab } from '../_hooks/useExperimentTab';
import { ExperimentModal } from '../_components/ExperimentModal';

export function ExperimentTab() {
    const t = useExperimentTab();

    const linkLabel = (list, idKey, id, describe) => {
        if (id == null) return '—';
        const found = list.find(x => x[idKey] === id);
        const detail = found && describe(found);
        return detail ? `#${id} · ${detail}` : `#${id}`;
    };

    const columns = [
        { key: 'experiment_id', label: 'ID', render: r => <span className="font-bold text-text-primary">{r.experiment_id}</span> },
        { key: 'optimizer_function_id', label: 'Objective Fn', render: r => <span className="text-text-secondary">{linkLabel(t.objectiveFunctions, 'optimizer_function_id', r.optimizer_function_id, fn => fn.function?.expression)}</span> },
        { key: 'constraint_id', label: 'Constraint', render: r => <span className="text-text-secondary">{linkLabel(t.constraints, 'constraint_id', r.constraint_id, c => c.description)}</span> },
        { key: 'constants_id', label: 'Constants', render: r => <span className="text-text-secondary">{linkLabel(t.constants, 'constant_id', r.constants_id, c => c.description)}</span> },
        { key: 'solver', label: 'Solver', render: r => <span className="font-mono text-body-sm text-text-secondary">{r.solver || '—'}</span> },
        { key: 'description', label: 'Description', render: r => <span className="text-text-secondary">{r.description || '—'}</span> },
        { key: 'created_by', label: 'Created By', render: r => r.created_by || '—' },
        { key: 'created_at', label: 'Created At', render: r => r.created_at ? new Date(r.created_at).toLocaleString() : '—' },
        {
            key: 'actions', label: '', className: 'w-10', cellClassName: 'text-right', render: r => (
                <ActionsMenuButton actions={[
                    { label: 'Modify', icon: <Pencil className="w-4 h-4" />, onClick: () => t.openEdit(r) },
                    { label: 'Delete', icon: <Trash2 className="w-4 h-4" />, danger: true, loading: t.deletingId === r.experiment_id, disabled: t.deletingId === r.experiment_id, onClick: () => t.handleDelete(r) },
                ]} />
            ),
        },
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-12">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-[20px] font-bold text-text-primary">Experiment</h2>
                    <p className="text-body-sm text-text-muted mt-1">Link an objective function, constraints, constants, and a solver into a runnable experiment.</p>
                </div>
                <button onClick={t.openCreate} className="flex items-center gap-2 bg-brand text-white px-4 py-2 rounded-lg hover:bg-brand-hover font-medium text-body-sm transition-colors cursor-pointer shrink-0">
                    <Plus className="w-4 h-4" /> Add Experiment
                </button>
            </div>

            <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
                <DataTable
                    columns={columns} rows={t.list} loading={t.isLoading}
                    emptyIcon={<Table2 className="w-10 h-10" />}
                    emptyTitle="No experiments yet"
                    emptyDescription="Create an experiment to link an objective function with constraints, constants, and a solver."
                />
            </div>

            {t.isModalOpen && (
                <ExperimentModal
                    isEditMode={t.isEditMode} form={t.form} setForm={t.setForm}
                    objectiveFunctions={t.objectiveFunctions} constraints={t.constraints} constants={t.constants}
                    isSaving={t.isSaving} onClose={t.closeModal} onSave={t.handleSave}
                />
            )}
        </div>
    );
}
