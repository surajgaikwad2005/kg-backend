'use client';
import { Target, Plus, Pencil, Trash2 } from 'lucide-react';
import { DataTable } from '@/src/components/ui/DataTable';
import { ActionsMenuButton } from '@/src/components/ui/ActionsMenuButton';
import { useObjectiveFunctionTab } from '../_hooks/useObjectiveFunctionTab';
import { ObjectiveFunctionModal } from '../_components/ObjectiveFunctionModal';

function formatBounds(bounds) {
    const entries = Object.entries(bounds || {});
    if (!entries.length) return '—';
    return entries.map(([k, v]) => `${v?.[0] ?? 0} < ${k} < ${v?.[1] ?? 0}`).join(', ');
}

export function ObjectiveFunctionTab() {
    const t = useObjectiveFunctionTab();

    const columns = [
        { key: 'optimizer_function_id', label: 'ID', render: r => <span className="font-bold text-text-primary">{r.optimizer_function_id}</span> },
        {
            key: 'type', label: 'Type', render: r => (
                <span className="px-2 py-0.5 text-[11px] font-bold uppercase rounded bg-brand-muted text-brand border border-brand/20">{r.type}</span>
            ),
        },
        { key: 'bounds', label: 'Bounds', render: r => <span className="font-mono text-body-sm text-text-secondary">{formatBounds(r.bounds)}</span> },
        { key: 'description', label: 'Description', render: r => <span className="text-text-secondary">{r.description || '—'}</span> },
        { key: 'created_by', label: 'Created By', render: r => r.created_by || '—' },
        { key: 'created_at', label: 'Created At', render: r => r.created_at ? new Date(r.created_at).toLocaleString() : '—' },
        {
            key: 'actions', label: '', className: 'w-10', cellClassName: 'text-right', render: r => (
                <ActionsMenuButton actions={[
                    { label: 'Modify', icon: <Pencil className="w-4 h-4" />, onClick: () => t.openEdit(r) },
                    { label: 'Delete', icon: <Trash2 className="w-4 h-4" />, danger: true, loading: t.deletingId === r.optimizer_function_id, disabled: t.deletingId === r.optimizer_function_id, onClick: () => t.handleDelete(r) },
                ]} />
            ),
        },
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-12">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-[20px] font-bold text-text-primary">Objective-Function</h2>
                    <p className="text-body-sm text-text-muted mt-1">Define the objective functions to maximize or minimize.</p>
                </div>
                <button onClick={t.openCreate} className="flex items-center gap-2 bg-brand text-white px-4 py-2 rounded-lg hover:bg-brand-hover font-medium text-body-sm transition-colors cursor-pointer shrink-0">
                    <Plus className="w-4 h-4" /> Add Objective Function
                </button>
            </div>

            <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
                <DataTable
                    columns={columns} rows={t.list} loading={t.isLoading}
                    emptyIcon={<Target className="w-10 h-10" />}
                    emptyTitle="No objective functions yet"
                    emptyDescription="Add a max/min objective function to link into optimizer experiments."
                />
            </div>

            {t.isModalOpen && (
                <ObjectiveFunctionModal isEditMode={t.isEditMode} form={t.form} setForm={t.setForm} isSaving={t.isSaving} onClose={t.closeModal} onSave={t.handleSave} />
            )}
        </div>
    );
}
