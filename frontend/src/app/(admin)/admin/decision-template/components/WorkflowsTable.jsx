'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Edit2, LayoutGrid, MoreVertical, Trash2 } from 'lucide-react';
import { Spinner } from '@/src/components/ui/Spinner';

// Progressive disclosure: the widest columns drop first as the viewport
// narrows, and whatever is hidden gets re-surfaced inline under the template
// name so no data is lost on tablet/mobile.
const COL_CLASS = {
    id: 'px-4 lg:px-6 py-3.5',
    name: 'px-4 lg:px-6 py-3.5',
    class: 'px-4 lg:px-6 py-3.5 hidden sm:table-cell',
    createdBy: 'px-4 lg:px-6 py-3.5 hidden lg:table-cell',
    updatedAt: 'px-4 lg:px-6 py-3.5 hidden xl:table-cell',
    createdAt: 'px-4 lg:px-6 py-3.5 hidden xl:table-cell',
    actions: 'px-4 lg:px-6 py-3.5 w-16 text-right',
};

const formatDate = (value) => (value ? new Date(value).toLocaleString() : '—');

function WorkflowRowSkeleton() {
    return Array.from({ length: 5 }).map((_, i) => (
        <tr key={i} className="border-b border-border">
            <td className={COL_CLASS.id}><div className="h-3.5 w-10 rounded-md bg-surface-2 skeleton-shimmer" /></td>
            <td className={COL_CLASS.name}><div className="h-3.5 w-32 rounded-md bg-surface-2 skeleton-shimmer" /></td>
            <td className={COL_CLASS.class}><div className="h-5 w-16 rounded-full bg-surface-2 skeleton-shimmer" /></td>
            <td className={COL_CLASS.createdBy}><div className="h-3.5 w-20 rounded-md bg-surface-2 skeleton-shimmer" /></td>
            <td className={COL_CLASS.updatedAt}><div className="h-3.5 w-28 rounded-md bg-surface-2 skeleton-shimmer" /></td>
            <td className={COL_CLASS.createdAt}><div className="h-3.5 w-28 rounded-md bg-surface-2 skeleton-shimmer" /></td>
            <td className={COL_CLASS.actions}><div className="h-7 w-7 rounded-full bg-surface-2 skeleton-shimmer ml-auto" /></td>
        </tr>
    ));
}

function EmptyState({ onCreateClick }) {
    return (
        <tr>
            <td colSpan={7} className="px-6 py-16 text-center">
                <p className="text-sm font-semibold text-text-primary mb-1">No templates found</p>
                <p className="text-xs text-text-secondary">
                    No templates match your search, or none have been created yet.{' '}
                    <button onClick={onCreateClick} className="text-brand hover:underline cursor-pointer">
                        Create one now
                    </button>
                </p>
            </td>
        </tr>
    );
}

function NoPlantSelectedState() {
    return (
        <tr>
            <td colSpan={7} className="px-6 py-16 text-center">
                <Building2 className="w-8 h-8 text-text-subtle mx-auto mb-3" />
                <p className="text-sm font-semibold text-text-primary mb-1">No plant selected</p>
                <p className="text-xs text-text-secondary">
                    Select a plant code to view and manage its decision templates.
                </p>
            </td>
        </tr>
    );
}

function ClassBadge({ value }) {
    if (!value) return <span className="text-text-subtle">—</span>;
    return (
        <span className="inline-block px-2.5 py-1 text-xs font-semibold rounded-full text-brand bg-brand-muted max-w-40 truncate align-middle">
            {value}
        </span>
    );
}

export function WorkflowsTable({
    workflows, loading, noPlantSelected, openDropdownId, setOpenDropdownId,
    onEdit, onDelete, onCreateClick, editLoadingId, deletingId,
}) {
    const router = useRouter();

    return (
        <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto thin-scrollbar">
                <table className="w-full text-left text-sm">
                    <thead className="border-b border-border text-text-secondary font-semibold uppercase text-xs tracking-wider bg-border/10">
                        <tr>
                            <th className={COL_CLASS.id}>Template ID</th>
                            <th className={COL_CLASS.name}>Template Name</th>
                            <th className={COL_CLASS.class}>Template Class</th>
                            <th className={COL_CLASS.createdBy}>Created By</th>
                            <th className={COL_CLASS.updatedAt}>Updated At</th>
                            <th className={COL_CLASS.createdAt}>Created At</th>
                            <th className={COL_CLASS.actions}>Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {loading ? (
                            <WorkflowRowSkeleton />
                        ) : noPlantSelected ? (
                            <NoPlantSelectedState />
                        ) : workflows.length > 0 ? (
                            workflows.map((wf) => {
                                const rowBusy = editLoadingId === wf.template_id || deletingId === wf.template_id;
                                const isOpen = openDropdownId === wf.template_id;

                                return (
                                    <tr key={wf.template_id} className="hover:bg-border/10 transition-colors duration-fast">
                                        <td className={`${COL_CLASS.id} font-mono text-xs text-text-secondary whitespace-nowrap`}>
                                            {wf.template_id}
                                        </td>

                                        <td className={COL_CLASS.name}>
                                            <span className="font-semibold text-text-primary block truncate max-w-40 sm:max-w-56">
                                                {wf.template_name}
                                            </span>
                                            {/* Columns hidden at this breakpoint, re-surfaced inline */}
                                            <span className="sm:hidden mt-1 block">
                                                <ClassBadge value={wf.template_class} />
                                            </span>
                                            <span className="lg:hidden mt-1 block text-xs text-text-secondary truncate">
                                                {wf.created_by || 'System'}
                                                <span className="xl:hidden"> · {formatDate(wf.updated_at)}</span>
                                            </span>
                                        </td>

                                        <td className={COL_CLASS.class}>
                                            <ClassBadge value={wf.template_class} />
                                        </td>

                                        <td className={`${COL_CLASS.createdBy} text-text-secondary whitespace-nowrap`}>
                                            {wf.created_by || 'System'}
                                        </td>

                                        <td className={`${COL_CLASS.updatedAt} text-xs text-text-secondary whitespace-nowrap`}>
                                            {formatDate(wf.updated_at)}
                                        </td>

                                        <td className={`${COL_CLASS.createdAt} text-xs text-text-secondary whitespace-nowrap`}>
                                            {formatDate(wf.created_at)}
                                        </td>

                                        <td className={COL_CLASS.actions}>
                                            <div className="relative flex justify-end">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setOpenDropdownId(isOpen ? null : wf.template_id);
                                                    }}
                                                    disabled={rowBusy}
                                                    aria-busy={rowBusy}
                                                    aria-haspopup="menu"
                                                    aria-expanded={isOpen}
                                                    aria-label={rowBusy ? 'Working…' : `Actions for ${wf.template_name || 'template'}`}
                                                    className={`p-1.5 rounded-full transition-colors duration-fast cursor-pointer disabled:cursor-not-allowed ${
                                                        isOpen
                                                            ? 'bg-border/60 text-text-primary'
                                                            : 'text-text-secondary hover:text-text-primary hover:bg-border/50'
                                                    }`}
                                                >
                                                    {rowBusy ? <Spinner size="xs" /> : <MoreVertical className="w-4 h-4" />}
                                                </button>

                                                {!rowBusy && isOpen && (
                                                    <>
                                                        {/* Click-away catcher — the trigger is always visible now,
                                                            so an open menu must close on any outside click. */}
                                                        <button
                                                            type="button"
                                                            aria-label="Close menu"
                                                            onClick={(e) => { e.stopPropagation(); setOpenDropdownId(null); }}
                                                            className="fixed inset-0 z-40 cursor-default"
                                                        />
                                                        <div
                                                            role="menu"
                                                            className="absolute right-0 top-full mt-1 w-40 bg-surface rounded-xl shadow-lg border border-border z-50 overflow-hidden animate-time-selector-in"
                                                        >
                                                            <button
                                                                role="menuitem"
                                                                onClick={(e) => { e.stopPropagation(); setOpenDropdownId(null); onEdit(wf); }}
                                                                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-text-primary hover:bg-border/30 transition-colors duration-fast text-left border-b border-border cursor-pointer"
                                                            >
                                                                <Edit2 className="w-4 h-4 text-brand shrink-0" />
                                                                Modify
                                                            </button>
                                                            <button
                                                                role="menuitem"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setOpenDropdownId(null);
                                                                    router.push(`/admin/decision-template/${wf.template_id}?name=${encodeURIComponent(wf.template_name || '')}`);
                                                                }}
                                                                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-text-primary hover:bg-border/30 transition-colors duration-fast text-left border-b border-border cursor-pointer"
                                                            >
                                                                <LayoutGrid className="w-4 h-4 text-highlight shrink-0" />
                                                                Design Layout
                                                            </button>
                                                            <button
                                                                role="menuitem"
                                                                onClick={(e) => { e.stopPropagation(); setOpenDropdownId(null); onDelete(wf); }}
                                                                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-danger hover:bg-danger/10 transition-colors duration-fast text-left cursor-pointer"
                                                            >
                                                                <Trash2 className="w-4 h-4 shrink-0" />
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <EmptyState onCreateClick={onCreateClick} />
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
