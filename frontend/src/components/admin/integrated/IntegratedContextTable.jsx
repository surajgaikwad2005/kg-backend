'use client';
import React, { useState, useMemo } from 'react';
import { Search, Edit2, Trash2, Check, X, Info, Save, AlertCircle, Lock } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { Input } from '@/src/components/ui/Input';
import { Tooltip } from '@/src/components/ui/Tooltip';

const DEFAULT_COLS = [
    { key: 'equipment_id', name: 'Equipment ID', layer: 'asset', source_label: 'Asset Master' },
    { key: 'primary_tag', name: 'Primary Tag / Ref', layer: 'asset', source_label: 'Historian' },
    { key: 'source_type', name: 'Source Type', layer: 'process', source_label: 'P&ID' },
    { key: 'key_metric', name: 'Key Metric / Finding', layer: 'performance', source_label: 'Inspection' },
    { key: 'criticality', name: 'Criticality', layer: 'performance', source_label: 'FMEA' },
    { key: 'extracted_rule', name: 'Extracted Rule', layer: 'knowledge', source_label: 'Rule Engine' },
    { key: 'status', name: 'Status', layer: 'action', source_label: 'System' },
];

function resolveFieldKey(col, cIdx) {
    if (col.key) return col.key;
    if (col.name) {
        return col.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    }
    return `col_${cIdx}`;
}

function resolveCellValue(row, col, cIdx) {
    if (!row || typeof row !== 'object') return '—';

    // 1. Direct col.key
    if (col.key && row[col.key] !== undefined && row[col.key] !== null) return row[col.key];

    // 2. Direct col.name
    if (col.name && row[col.name] !== undefined && row[col.name] !== null) return row[col.name];

    // 3. Clean snake_case of name
    if (col.name) {
        const cleanSnake = col.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
        if (cleanSnake && row[cleanSnake] !== undefined && row[cleanSnake] !== null) return row[cleanSnake];

        const spaceSnake = col.name.toLowerCase().replace(/\s+/g, '_');
        if (spaceSnake && row[spaceSnake] !== undefined && row[spaceSnake] !== null) return row[spaceSnake];

        const lower = col.name.toLowerCase();
        if (lower && row[lower] !== undefined && row[lower] !== null) return row[lower];
    }

    // 4. Fallback indexed key
    if (row[`col_${cIdx}`] !== undefined && row[`col_${cIdx}`] !== null) return row[`col_${cIdx}`];

    return '—';
}

export function IntegratedContextTable({
    columns = [],
    rows = [],
    onSaveRow,
    onDeleteRow,
    onSaveAll,
    hasUnsavedEdits = false,
    isSaving = false,
}) {
    const [search, setSearch] = useState('');
    const [editingIdx, setEditingIdx] = useState(null);
    const [editData, setEditData] = useState({});

    const displayCols = useMemo(() => {
        if (columns && columns.length > 0) return columns;
        return DEFAULT_COLS;
    }, [columns]);

    const filteredRows = useMemo(() => {
        if (!search.trim()) return rows;
        const q = search.toLowerCase();
        return rows.filter((r) =>
            Object.values(r || {}).some((v) =>
                typeof v === 'object' ? false : String(v).toLowerCase().includes(q)
            )
        );
    }, [rows, search]);

    const handleStartEdit = (idx, row) => {
        setEditingIdx(idx);
        const initialEditData = {};
        displayCols.forEach((col, cIdx) => {
            const key = resolveFieldKey(col, cIdx);
            const val = resolveCellValue(row, col, cIdx);
            initialEditData[key] = val === '—' ? '' : val;
        });
        setEditData(initialEditData);
    };

    const handleCancelEdit = () => {
        setEditingIdx(null);
        setEditData({});
    };

    const handleConfirmSave = (idx) => {
        if (onSaveRow) onSaveRow(idx, editData);
        setEditingIdx(null);
        setEditData({});
    };

    return (
        <div className="rounded-2xl bg-surface border border-border overflow-hidden shadow-xs space-y-0">
            {/* Table Search & Unsaved Banner Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 border-b border-border bg-surface-2/40">
                <div className="w-64 max-w-full">
                    <Input
                        size="sm"
                        icon={Search}
                        placeholder="Search matrix entries..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        aria-label="Search matrix entries"
                    />
                </div>

                <div className="flex items-center gap-3">
                    <div className="text-xs font-bold text-text-muted">
                        {filteredRows.length} {filteredRows.length === 1 ? 'entry' : 'entries'} mapped
                    </div>

                    {hasUnsavedEdits && onSaveAll && (
                        <button
                            type="button"
                            onClick={onSaveAll}
                            disabled={isSaving}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-brand hover:bg-brand-hover text-white transition-all shadow-xs cursor-pointer disabled:opacity-50"
                        >
                            <Save className="w-3.5 h-3.5" />
                            <span>Save Changes</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Matrix Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-surface-2/70 text-text-muted font-bold uppercase tracking-wider border-b border-border">
                        <tr>
                            {displayCols.map((col, idx) => (
                                <th key={col.key || col.name || idx} className="py-3 px-4 font-extrabold whitespace-nowrap">
                                    <div className="flex items-center gap-1.5">
                                        <span>{col.name}</span>
                                        {(col.source_label || col.note || col.layer || col.status) && (
                                            <Tooltip label={`Layer: ${col.layer || 'asset'}${col.source_label ? ` | Source: ${col.source_label}` : ''}${col.status ? ` | Status: ${col.status.replace(/_/g, ' ')}` : ''}${col.note ? ` | Note: ${col.note}` : ''}`}>
                                                <Info className={cn("w-3 h-3 cursor-help transition-colors", col.status === 'not_yet_backed' ? "text-warning/80 hover:text-warning" : "text-text-subtle hover:text-brand")} />
                                            </Tooltip>
                                        )}
                                    </div>
                                </th>
                            ))}
                            <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {filteredRows.map((row, idx) => {
                            const isEditing = editingIdx === idx;
                            return (
                                <tr key={row.id || row._rowKey || idx} className={cn('transition-colors', isEditing ? 'bg-brand/5' : 'hover:bg-surface-2/50')}>
                                    {displayCols.map((col, cIdx) => {
                                        const fieldKey = resolveFieldKey(col, cIdx);
                                        const cellVal = isEditing
                                            ? editData[fieldKey] ?? ''
                                            : resolveCellValue(row, col, cIdx);
                                        const isLockedField = /^(plant_code_id|plant_code|plant_id|plantcode|site|ts_uid|pid_uid|uid)$/i.test(fieldKey) ||
                                                              /^(plant\s*code|plant\s*id|plant\s*code\s*id|site|plant)$/i.test(col.name || '');

                                        return (
                                            <td key={fieldKey} className="py-3 px-4 text-text-secondary whitespace-nowrap">
                                                {isEditing ? (
                                                    isLockedField ? (
                                                        <span className="px-2 py-1 text-xs rounded-lg bg-surface-2 text-text-muted border border-border select-none inline-flex items-center gap-1 cursor-not-allowed" title={`${col.name || fieldKey} cannot be edited`}>
                                                            <Lock className="w-2.5 h-2.5 opacity-60 shrink-0" />
                                                            <span>{cellVal || '—'}</span>
                                                        </span>
                                                    ) : (
                                                        <input
                                                            type="text"
                                                            value={cellVal}
                                                            onChange={(e) => setEditData((prev) => ({ ...prev, [fieldKey]: e.target.value }))}
                                                            className="px-2 py-1 text-xs rounded-lg border border-brand bg-surface text-text-primary focus:outline-none"
                                                        />
                                                    )
                                                ) : (
                                                    <span>{typeof cellVal === 'object' ? JSON.stringify(cellVal) : String(cellVal)}</span>
                                                )}
                                            </td>
                                        );
                                    })}
                                    <td className="py-3 px-4 text-right whitespace-nowrap">
                                        <div className="flex items-center justify-end gap-1.5">
                                            {isEditing ? (
                                                <>
                                                    <button type="button" onClick={() => handleConfirmSave(idx)} disabled={isSaving} className="p-1 rounded-md text-success hover:bg-success/10 cursor-pointer disabled:opacity-50" aria-label="Confirm row edit">
                                                        <Check className="w-4 h-4" />
                                                    </button>
                                                    <button type="button" onClick={handleCancelEdit} className="p-1 rounded-md text-text-muted hover:bg-surface-2 cursor-pointer" aria-label="Cancel edit">
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button type="button" onClick={() => handleStartEdit(idx, row)} className="p-1 rounded-md text-text-muted hover:text-brand hover:bg-brand/10 cursor-pointer" aria-label="Edit row">
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                    </button>
                                                    {onDeleteRow && (
                                                        <button type="button" onClick={() => onDeleteRow(idx, row)} className="p-1 rounded-md text-text-muted hover:text-danger hover:bg-danger/10 cursor-pointer" aria-label="Delete row">
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
