'use client';
import { Anchor, Plus, Pencil, Trash2 } from 'lucide-react';
import { DataTable } from '@/src/components/ui/DataTable';
import { ActionsMenuButton } from '@/src/components/ui/ActionsMenuButton';
import { useConstantsTab } from '../_hooks/useConstantsTab';
import { ConstantModal } from '../_components/ConstantModal';

export function ConstantTab() {
    const t = useConstantsTab();

    const columns = [
        { key: 'constant_id', label: 'ID', render: r => <span className="font-bold text-text-primary">{r.constant_id}</span> },
        { key: 'constants', label: 'Constants', render: r => <span className="font-mono text-body-sm text-text-secondary">{Object.entries(r.constants || {}).map(([k, v]) => `${k}=${v}`).join(', ') || '—'}</span> },
        { key: 'description', label: 'Description', render: r => <span className="text-text-secondary">{r.description || '—'}</span> },
        { key: 'created_by', label: 'Created By', render: r => r.created_by || '—' },
        { key: 'created_at', label: 'Created At', render: r => r.created_at ? new Date(r.created_at).toLocaleString() : '—' },
        {
            key: 'actions', label: '', className: 'w-10', cellClassName: 'text-right', render: r => (
                <ActionsMenuButton actions={[
                    { label: 'Modify', icon: <Pencil className="w-4 h-4" />, onClick: () => t.openEdit(r) },
                    { label: 'Delete', icon: <Trash2 className="w-4 h-4" />, danger: true, loading: t.deletingId === r.constant_id, disabled: t.deletingId === r.constant_id, onClick: () => t.handleDelete(r) },
                ]} />
            ),
        },
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-12">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-[20px] font-bold text-text-primary">Constant</h2>
                    <p className="text-body-sm text-text-muted mt-1">Define named numeric constants for use in optimizer experiments.</p>
                </div>
                <button onClick={t.openCreate} className="flex items-center gap-2 bg-brand text-white px-4 py-2 rounded-lg hover:bg-brand-hover font-medium text-body-sm transition-colors cursor-pointer shrink-0">
                    <Plus className="w-4 h-4" /> Add Constant
                </button>
            </div>

            <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
                <DataTable
                    columns={columns} rows={t.list} loading={t.isLoading}
                    emptyIcon={<Anchor className="w-10 h-10" />}
                    emptyTitle="No constants yet"
                    emptyDescription="Add a set of named constants to use inside optimizer objective functions and constraints."
                />
            </div>

            {t.isModalOpen && (
                <ConstantModal isEditMode={t.isEditMode} form={t.form} setForm={t.setForm} isSaving={t.isSaving} onClose={t.closeModal} onSave={t.handleSave} />
            )}
        </div>
    );
}
