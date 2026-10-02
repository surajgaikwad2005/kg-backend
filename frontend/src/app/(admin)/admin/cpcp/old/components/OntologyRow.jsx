'use client';

import React from 'react';
import { Trash2, Edit2, Check, Loader2 } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { TextCell, FlagCell } from './OntologyFields';

/**
 * One equipment row of the ontology matrix. Presentational — all state lives in
 * the parent hook. `columns` drives the dynamic attribute cells.
 */
export function OntologyRow({ row, index, columns, clientName, onUpdateField, onSetFlag, onToggleEdit, onSave, onDelete, onVerify }) {
    const busy = row.isSaving || row.isDeleting;
    const canSave = !!row.tag.trim() && !busy;

    return (
        <tr className="border-b border-border/30 last:border-0 transition-colors text-[13px] text-text-secondary hover:bg-surface-2/50">
            <td className="px-5 py-4 text-center text-text-muted font-medium">{index + 1}</td>

            <td className="px-4 py-4">
                <div className="flex items-center gap-1.5 justify-between">
                    <TextCell
                        value={row.tag}
                        isEditing={row.isEditing}
                        onChange={(val) => onUpdateField(row.key, 'tag', val)}
                        placeholder="Tag"
                        className={cn(row.isEditing && 'font-semibold')}
                    />
                    {clientName && !row.isEditing && row.status === 'Human Verified' && (
                        <span className="shrink-0 inline-flex items-center justify-center w-5 h-5 rounded-full bg-success/10 text-success ring-1 ring-inset ring-success/20" title="Human Verified">
                            <Check className="w-3 h-3" strokeWidth={3.5} />
                        </span>
                    )}
                </div>
            </td>

            {clientName && (
                <td className="px-4 py-4 w-20">
                    <TextCell
                        value={row.pageNumber}
                        isEditing={row.isEditing}
                        onChange={(val) => onUpdateField(row.key, 'pageNumber', val)}
                        placeholder="Page"
                        className="w-16 text-center"
                    />
                </td>
            )}

            <td className="px-4 py-4">
                <TextCell
                    value={row.description}
                    isEditing={row.isEditing}
                    onChange={(val) => onUpdateField(row.key, 'description', val)}
                    placeholder="Equipment description…"
                />
            </td>

            {columns.map((col) => (
                <td key={col.key} className="px-3 py-4">
                    <FlagCell
                        value={row.attributes[col.key] || ''}
                        isEditing={row.isEditing}
                        onChange={(val) => onSetFlag(row.key, col.key, val)}
                    />
                </td>
            ))}

            <td className="px-5 py-4">
                <div className="flex items-center justify-end gap-2.5">
                    {row.isEditing ? (
                        <button
                            onClick={() => onSave(row.key)}
                            disabled={!canSave}
                            aria-busy={row.isSaving}
                            title={!row.tag.trim() ? 'Tag is required' : 'Save'}
                            className={cn(
                                'bg-brand hover:bg-brand-hover text-white px-4 py-2 rounded-full font-bold text-[10px] tracking-wider uppercase flex items-center gap-1.5 transition-all shadow-sm',
                                canSave ? 'cursor-pointer' : 'opacity-50 grayscale cursor-not-allowed'
                            )}
                        >
                            {row.isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" strokeWidth={3} />}
                            SAVE
                        </button>
                    ) : (
                        <button
                            onClick={() => onToggleEdit(row.key)}
                            disabled={busy}
                            className="bg-surface border border-border hover:border-border-strong hover:bg-surface-2 text-text-muted px-4 py-2 rounded-full font-bold text-[10px] tracking-wider uppercase flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Edit2 className="w-3.5 h-3.5" strokeWidth={2.5} /> EDIT
                        </button>
                    )}
                    <button
                        onClick={() => onDelete(row)}
                        disabled={busy}
                        aria-label="Delete row"
                        aria-busy={row.isDeleting}
                        className="bg-danger hover:bg-danger/80 text-white p-2 rounded-lg transition-colors shadow-sm cursor-pointer flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {row.isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                </div>
            </td>
        </tr>
    );
}
