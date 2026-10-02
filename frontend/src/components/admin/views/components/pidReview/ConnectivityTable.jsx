'use client';
import React from 'react';
import { CheckCircle2, X, Edit2, Trash2, Pencil, Loader2 } from 'lucide-react';
import { cn } from '@/src/lib/utils';

export function ConnectivityTable({
    displayData,
    isCommitted,
    editingRow,
    editingRowData,
    setEditingRow,
    setEditingRowData,
    editedRows,
    setEditedRows,
    onSaveRow,
    onDeleteRow,
    savingRowKey,
    deletingRowKey,
}) {
    return (
        <div className="overflow-auto max-h-96">
            <table className="w-full text-left text-sm">
                <thead className="sticky top-0 z-10 bg-surface">
                    <tr className="text-text-muted border-b border-border">
                        <th className="px-6 py-4 font-semibold">Source Asset</th>
                        <th className="px-6 py-4 font-semibold">Destination Asset</th>
                        <th className="px-6 py-4 font-semibold w-24">Actions</th>
                    </tr>
                </thead>
                <tbody className="text-text-secondary">
                    {displayData.map((row, i) => {
                        const stableId = row._rowKey || ((row.source && row.destination) ? `${row.source}->${row.destination}` : i);
                        const rowKey = `pid:${stableId}`;
                        const isRowEditing = !isCommitted && editingRow === rowKey;
                        const isRowSaving = savingRowKey === rowKey;
                        const isRowDeleting = deletingRowKey === rowKey;
                        const isEdited = editedRows.has(i);

                        return (
                            <tr
                                key={rowKey}
                                className={cn(
                                    'border-b border-border/50 transition-colors',
                                    isEdited
                                        ? 'bg-warning/[0.06] border-l-[3px] border-l-warning hover:bg-warning/10'
                                        : 'hover:bg-surface-2',
                                )}
                            >
                                <td className="px-6 py-4">
                                    {isRowEditing ? (
                                        <input
                                            type="text"
                                            value={editingRowData.source ?? ''}
                                            onChange={e => setEditingRowData({ ...editingRowData, source: e.target.value })}
                                            className="w-full bg-canvas border border-border rounded px-2 py-1 text-sm text-text-primary focus:outline-none focus:border-brand"
                                        />
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <span>{row.source}</span>
                                            {isEdited && (
                                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-warning/10 text-warning text-label font-bold shrink-0">
                                                    <Pencil size={9} />
                                                    Edited
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    {isRowEditing ? (
                                        <input
                                            type="text"
                                            value={editingRowData.destination ?? ''}
                                            onChange={e => setEditingRowData({ ...editingRowData, destination: e.target.value })}
                                            className="w-full bg-canvas border border-border rounded px-2 py-1 text-sm text-text-primary focus:outline-none focus:border-brand"
                                        />
                                    ) : (
                                        row.destination
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    {isCommitted ? (
                                        <span className="text-xs text-text-subtle">—</span>
                                    ) : (
                                        <div className="flex items-center gap-1">
                                            {isRowEditing ? (
                                                <>
                                                    <button
                                                        onClick={() => onSaveRow(i)}
                                                        disabled={isRowSaving}
                                                        aria-busy={isRowSaving}
                                                        className="p-1 text-success hover:bg-success/10 rounded transition-all cursor-pointer disabled:opacity-50"
                                                        aria-label="Save row"
                                                        title="Save row"
                                                    >
                                                        {isRowSaving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingRow(null)}
                                                        disabled={isRowSaving}
                                                        className="p-1 text-text-muted hover:text-text-primary rounded transition-all cursor-pointer disabled:opacity-50"
                                                        aria-label="Discard edit"
                                                        title="Discard edit"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => {
                                                            setEditingRow(rowKey);
                                                            setEditingRowData({ source: row.source, destination: row.destination });
                                                        }}
                                                        className="p-1 text-text-muted hover:text-brand hover:bg-surface-2 rounded transition-all cursor-pointer"
                                                        aria-label="Edit row"
                                                    >
                                                        <Edit2 size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => onDeleteRow(i, row)}
                                                        disabled={isRowDeleting}
                                                        aria-busy={isRowDeleting}
                                                        className="p-1 text-text-muted hover:text-danger hover:bg-danger/10 rounded transition-all cursor-pointer disabled:opacity-50"
                                                        aria-label="Delete row"
                                                    >
                                                        {isRowDeleting ? <Loader2 size={14} className="animate-spin text-danger" /> : <Trash2 size={14} />}
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

