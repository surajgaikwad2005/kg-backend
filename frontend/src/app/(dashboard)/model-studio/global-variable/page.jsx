'use client';
import React from 'react';
import { Plus, Search, Globe, Settings, Trash2 } from 'lucide-react';
import { ConfirmDialog } from '@/src/components/ui/ConfirmDialog';
import { ActionsMenuButton } from '@/src/components/ui/ActionsMenuButton';
import { DataTable } from '@/src/components/ui/DataTable';
import { useToast } from '@/src/components/ui/Toast';
import { useGlobalVariablePage } from './_hooks/useGlobalVariablePage';
import { GlobalVariableModal } from './_components/GlobalVariableModal';

export default function GlobalVariablesPage() {
    const g = useGlobalVariablePage();
    const toast = useToast();

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return dateStr;
            return date.toLocaleString('en-US', {
                month: 'numeric',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                second: '2-digit',
                hour12: true,
            });
        } catch {
            return dateStr;
        }
    };



    return (
        <div className="flex-1 overflow-y-auto relative bg-canvas/50 p-8 h-full">
            <div className="max-w-7xl mx-auto space-y-6 pb-16">

                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-[26px] font-bold text-text-primary tracking-tight">Global Variables</h1>
                        <p className="text-[15px] text-text-muted mt-1">
                            Manage shared constants and configuration values available across all optimizer and model configurations.
                        </p>
                    </div>
                    <button
                        onClick={g.openNewModal}
                        className="flex items-center justify-center gap-2 bg-brand text-white hover:bg-brand-hover px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors shadow-sm cursor-pointer shrink-0"
                    >
                        <Plus className="w-4 h-4" /> Add Global Variable
                    </button>
                </div>

                {/* Main Table Container */}
                <div className="space-y-4 pt-4">

                    {/* Search Bar */}
                    <div className="relative max-w-full">
                        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-subtle" />
                        <input
                            type="text"
                            value={g.searchQuery}
                            onChange={(e) => g.setSearchQuery(e.target.value)}
                            placeholder="Search global variables by key, value, description or creator..."
                            className="w-full pl-10 pr-4 py-2.5 text-[14px] bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all shadow-xs"
                        />
                    </div>

                    {/* Table Card */}
                    <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-xs">
                        <DataTable
                            columns={[
                                { key: 'id', label: 'GLOBAL VAR ID', render: r => <span className="font-bold text-text-primary">{r.globalvar_id || r.global_var_id || r.id}</span> },
                                { key: 'var', label: 'VAR', render: r => <span className="font-semibold text-text-primary">{r.var || r.key || ''}</span> },
                                { key: 'value', label: 'VALUE', render: r => <span className="font-mono text-[13px] text-text-secondary max-w-xs truncate" title={r.value}>{r.value}</span> },
                                { key: 'description', label: 'DESCRIPTION', render: r => <span className="text-text-muted max-w-xs truncate">{r.description || '—'}</span> },
                                { key: 'created_by', label: 'CREATED BY', render: r => <span className="text-text-muted">{r.created_by || '—'}</span> },
                                { key: 'created_at', label: 'CREATED AT', render: r => <span className="text-text-muted text-xs">{formatDate(r.created_at)}</span> },
                                { key: 'actions', label: 'ACTION', cellClassName: 'text-right', render: r => (
                                    <ActionsMenuButton actions={[
                                        { label: 'Modify', icon: <Settings className="w-4 h-4 text-text-muted" />, onClick: () => g.openEditModal(r) },
                                        { label: 'Delete', icon: <Trash2 className="w-4 h-4 text-danger" />, danger: true, divider: true, onClick: () => g.openDeleteModal(r) }
                                    ]} />
                                ) }
                            ]}
                            rows={g.filteredVariables}
                            loading={g.loading}
                            error={g.error}
                            onRetry={g.fetchVariables}
                            emptyIcon={<Globe className="w-12 h-12 text-text-subtle/50" />}
                            emptyTitle="No global variables found"
                            emptyDescription={g.searchQuery ? 'Try adjusting your search query' : 'Click "+ Add Global Variable" to create your first constant.'}
                        />
                    </div>
                </div>

            </div>

            {/* Add / Edit Modal */}
            <GlobalVariableModal
                open={g.isModalOpen}
                onClose={g.closeModal}
                editingVariable={g.editingVariable}
                onSubmit={g.handleSaveOrUpdate}
                actionLoading={g.actionLoading}
            />

            {/* Confirm Delete Dialog */}
            <ConfirmDialog
                open={g.isDeleteModalOpen}
                onClose={g.closeDeleteModal}
                onConfirm={g.handleConfirmDelete}
                title="Delete Global Variable"
                description={`Are you sure you want to delete variable "${g.deletingVariable?.var || g.deletingVariable?.key}"? This action cannot be undone.`}
                confirmLabel="Delete"
                intent="danger"
                isPending={g.actionLoading}
            />
        </div>
    );
}
