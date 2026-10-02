'use client';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronLeft, ChevronRight, CheckCircle2, X, Edit2, Trash2, Loader2, ExternalLink } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { Tooltip } from '@/src/components/ui/Tooltip';

export function DocsReviewTable({
    displayCategories, selectedDocCategory, filteredRows, pagedRows, search, onSearchChange,
    page, setPage, totalPages, PAGE_SIZE, isCommitted, editingRow, setEditingRow,
    editingRowData, setEditingRowData, savingRowKey, deletingRowKey,
    handleSaveRow, handleDeleteRow,
}) {
    const inputCls = 'w-full bg-canvas border border-border rounded px-2 py-1 text-caption text-text-primary focus:outline-none focus:border-brand transition-colors';

    return (
        <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
            {/* Panel header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3.5 border-b border-border bg-canvas">
                <div className="flex items-center gap-3 min-w-0">
                    <h4 className="text-body-sm font-bold text-text-primary">
                        {displayCategories.find(c => c.id === selectedDocCategory)?.label || selectedDocCategory}
                    </h4>
                    <span className="text-label font-bold px-2 py-0.5 rounded-full bg-surface-2 text-text-muted shrink-0">
                        {filteredRows.length} row{filteredRows.length !== 1 ? 's' : ''}
                    </span>
                </div>
                {/* Search */}
                <div className="relative w-full sm:w-64">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Search rows…"
                        value={search}
                        onChange={onSearchChange}
                        className="w-full pl-8 pr-3 py-1.5 text-caption bg-surface border border-border rounded-lg text-text-primary placeholder:text-text-subtle focus:outline-none focus:border-brand transition-colors"
                        aria-label="Search documents"
                    />
                </div>
            </div>

            {/* Scrollable table */}
            <div className="overflow-x-auto">
                <table className="w-full min-w-225 text-left text-sm">
                    <thead className="sticky top-0 z-10 bg-canvas border-b border-border">
                        <tr className="text-text-muted">
                            <th className="px-4 py-3 font-semibold text-caption uppercase tracking-wider whitespace-nowrap w-40">Document ID</th>
                            <th className="px-4 py-3 font-semibold text-caption uppercase tracking-wider whitespace-nowrap w-36">Type</th>
                            <th className="px-4 py-3 font-semibold text-caption uppercase tracking-wider">Title</th>
                            <th className="px-4 py-3 font-semibold text-caption uppercase tracking-wider whitespace-nowrap w-44">Equipment</th>
                            <th className="px-4 py-3 font-semibold text-caption uppercase tracking-wider w-48">Extracted Entities</th>
                            {!isCommitted && (
                                <th className="px-4 py-3 font-semibold text-caption uppercase tracking-wider text-right whitespace-nowrap w-28">Actions</th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                        <AnimatePresence initial={false}>
                            {pagedRows.length === 0 ? (
                                <tr>
                                    <td colSpan={isCommitted ? 5 : 6} className="px-4 py-12 text-center text-text-subtle text-caption">
                                        {search ? 'No rows match your search.' : 'No data in this category.'}
                                    </td>
                                </tr>
                            ) : pagedRows.map((row, i) => {
                                const absIdx = page * PAGE_SIZE + i;
                                const stableId = `${absIdx}:${row.id || row._raw?.document_id || row._raw?.id || ''}`;
                                const rowKey = `doc:${selectedDocCategory}:${stableId}`;
                                const isRowEditing = !isCommitted && editingRow === rowKey;
                                const isRowSaving = savingRowKey === rowKey;
                                const isRowDeleting = deletingRowKey === rowKey;

                                return (
                                    <motion.tr
                                        key={rowKey}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className={cn(
                                            'transition-colors group',
                                            isRowEditing
                                                ? 'bg-brand/3 border-l-2 border-l-brand'
                                                : 'hover:bg-surface-2',
                                        )}
                                    >
                                        {/* Document ID (Non-editable) */}
                                        <td className="px-4 py-3">
                                            <span className={cn("font-mono text-caption text-text-secondary block truncate max-w-37.5", isRowEditing ? "text-text-muted select-none opacity-80" : "")} title={row.id}>
                                                {row.id || <span className="text-text-subtle italic">—</span>}
                                            </span>
                                        </td>

                                        {/* Type */}
                                        <td className="px-4 py-3">
                                            {isRowEditing ? (
                                                <input type="text" value={editingRowData.type ?? ''} onChange={e => setEditingRowData({ ...editingRowData, type: e.target.value })} className={inputCls} aria-label="Type" />
                                            ) : row.type ? (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-brand/10 text-brand text-label font-semibold capitalize whitespace-nowrap">
                                                    {row.type.replace(/_/g, ' ')}
                                                </span>
                                            ) : (
                                                <span className="text-text-subtle italic text-caption">—</span>
                                            )}
                                        </td>

                                        {/* Title */}
                                        <td className="px-4 py-3">
                                            {isRowEditing ? (
                                                <input type="text" value={editingRowData.title ?? ''} onChange={e => setEditingRowData({ ...editingRowData, title: e.target.value })} className={inputCls} aria-label="Title" />
                                            ) : (
                                                <div className="flex items-center gap-1.5 min-w-0">
                                                    <span className="text-caption font-medium text-text-primary truncate min-w-0" title={row.title}>
                                                        {row.title || <span className="text-text-subtle italic">—</span>}
                                                    </span>
                                                    <Tooltip
                                                        label={row.fileHref
                                                            ? `Open ${row.title || 'file'} in a new tab`
                                                            : 'File preview is not available yet for this document'}
                                                        side="top"
                                                    >
                                                        <button
                                                            type="button"
                                                            onClick={() => row.fileHref && window.open(row.fileHref, '_blank', 'noopener,noreferrer')}
                                                            disabled={!row.fileHref}
                                                            aria-label={`Open ${row.title || row.sourceFile || 'source file'} in a new tab`}
                                                            className={cn(
                                                                'p-1 rounded-md shrink-0 transition-all',
                                                                row.fileHref
                                                                    ? 'text-text-subtle hover:text-brand hover:bg-brand/10 cursor-pointer'
                                                                    : 'text-text-subtle/50 cursor-not-allowed',
                                                            )}
                                                        >
                                                            <ExternalLink size={12} />
                                                        </button>
                                                    </Tooltip>
                                                </div>
                                            )}
                                        </td>

                                        {/* Equipment */}
                                        <td className="px-4 py-3">
                                            {isRowEditing ? (
                                                <input type="text" value={editingRowData.equip ?? ''} onChange={e => setEditingRowData({ ...editingRowData, equip: e.target.value })} className={inputCls} aria-label="Equipment" />
                                            ) : row.equip ? (
                                                <span className="text-caption font-semibold text-brand block truncate max-w-40" title={row.equip}>{row.equip}</span>
                                            ) : (
                                                <span className="text-text-subtle italic text-caption">—</span>
                                            )}
                                        </td>

                                        {/* Extracted Entities */}
                                        <td className="px-4 py-3">
                                            {isRowEditing ? (
                                                <input type="text" value={editingRowData.entities ?? ''} onChange={e => setEditingRowData({ ...editingRowData, entities: e.target.value })} className={inputCls} aria-label="Extracted entities" />
                                            ) : row.entities ? (
                                                <span className="text-caption text-text-muted block truncate max-w-45" title={row.entities}>{row.entities}</span>
                                            ) : (
                                                <span className="text-text-subtle italic text-caption">—</span>
                                            )}
                                        </td>

                                        {/* Actions */}
                                        {!isCommitted && (
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-end gap-1.5 min-w-[70px]">
                                                    {isRowEditing ? (
                                                        <>
                                                            <button
                                                                aria-label="Save edit"
                                                                title="Save edit"
                                                                disabled={isRowSaving}
                                                                aria-busy={isRowSaving}
                                                                onClick={() => handleSaveRow(i)}
                                                                className="p-1.5 text-success hover:bg-success/10 rounded-lg transition-all cursor-pointer disabled:opacity-50 shrink-0"
                                                            >
                                                                {isRowSaving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                                                            </button>
                                                            <button
                                                                aria-label="Discard edit"
                                                                title="Discard edit"
                                                                disabled={isRowSaving}
                                                                onClick={() => setEditingRow(null)}
                                                                className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-surface-2 rounded-lg transition-all cursor-pointer disabled:opacity-50 shrink-0"
                                                            >
                                                                <X size={14} />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <div className="flex items-center justify-end gap-1 shrink-0">
                                                            <button
                                                                aria-label="Edit row"
                                                                title="Edit row"
                                                                onClick={() => { setEditingRow(rowKey); setEditingRowData({ id: row.id, type: row.type, title: row.title, equip: row.equip, entities: row.entities }); }}
                                                                className="p-1.5 text-text-secondary hover:text-brand hover:bg-brand/10 rounded-lg transition-all cursor-pointer"
                                                            >
                                                                <Edit2 size={14} />
                                                            </button>
                                                            <button
                                                                aria-label="Delete row"
                                                                title="Delete row"
                                                                disabled={isRowDeleting}
                                                                aria-busy={isRowDeleting}
                                                                onClick={() => handleDeleteRow(i)}
                                                                className="p-1.5 text-text-secondary hover:text-danger hover:bg-danger/10 rounded-lg transition-all cursor-pointer disabled:opacity-50"
                                                            >
                                                                {isRowDeleting ? <Loader2 size={14} className="animate-spin text-danger" /> : <Trash2 size={14} />}
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        )}
                                    </motion.tr>
                                );
                            })}
                        </AnimatePresence>
                    </tbody>
                </table>
            </div>

            {/* Pagination footer */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-border bg-canvas">
                    <span className="text-caption text-text-muted">
                        Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filteredRows.length)} of {filteredRows.length}
                    </span>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setPage(p => Math.max(0, p - 1))}
                            disabled={page === 0}
                            aria-label="Previous page"
                            className="p-1.5 rounded-lg text-text-muted hover:bg-surface-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                        >
                            <ChevronLeft size={15} />
                        </button>
                        {Array.from({ length: Math.min(totalPages, 7) }, (_, idx) => {
                            const p = totalPages <= 7 ? idx : (page < 4 ? idx : page - 3 + idx);
                            if (p >= totalPages) return null;
                            return (
                                <button
                                    key={p}
                                    onClick={() => setPage(p)}
                                    className={cn(
                                        'min-w-7 h-7 px-2 rounded-lg text-caption font-bold transition-colors cursor-pointer',
                                        p === page
                                            ? 'bg-brand text-white'
                                            : 'text-text-muted hover:bg-surface-2',
                                    )}
                                >
                                    {p + 1}
                                </button>
                            );
                        })}
                        <button
                            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                            disabled={page >= totalPages - 1}
                            aria-label="Next page"
                            className="p-1.5 rounded-lg text-text-muted hover:bg-surface-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                        >
                            <ChevronRight size={15} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
