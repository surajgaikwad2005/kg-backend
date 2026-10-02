'use client';
import React from 'react';
import { CheckCircle2, X, Edit2, Trash2 } from 'lucide-react';
import { SAP_RENAME_TEMPLATE } from '@/src/components/admin/admin.constants';
import { Skeleton } from '@/src/components/ui/Skeleton';

const isNonEditableField = (fieldName) => {
    if (!fieldName) return false;
    const name = String(fieldName).toLowerCase().trim().replace(/[\s_-]+/g, '');
    return (
        name === 'plantcodeid' ||
        name === 'plantcode' ||
        name === 'plantid' ||
        name === 'site' ||
        name === 'tsuid' ||
        name === 'piduid' ||
        name === 'plant'
    );
};

export function SapTablePanel({
    currentTable,
    tableCols,
    visibleSapColumns,
    sapColumnMappings,
    setSapColumnMappings,
    sapData,
    setSapData,
    sapDataLoading,
    isCommitted,
    editingRow,
    editingRowData,
    setEditingRow,
    setEditingRowData,
    setDeleteConfirm,
    onSaveMappings,
}) {
    return (
        <div className="flex-1 bg-surface border border-border rounded-2xl overflow-hidden min-w-0">
            <div className="p-4 border-b border-border bg-surface-2 flex items-center justify-between">
                <div>
                    <h4 className="text-sm font-bold text-text-primary">Table: {currentTable.name}</h4>
                    <p className="text-[10px] text-text-muted">{currentTable.desc} — {tableCols.length} columns</p>
                </div>
                <button onClick={onSaveMappings} className="px-4 py-2 bg-success/5 border border-success/20 text-success rounded-lg text-xs font-bold hover:bg-success/10 transition-all cursor-pointer">
                    Save Mappings
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="bg-surface-2 border-b border-border">
                            <th className="px-4 py-3 text-[9px] font-bold text-text-muted uppercase tracking-widest w-36 shrink-0 sticky left-0 bg-surface-2 z-10">
                                Detected Schema
                            </th>
                            {visibleSapColumns.map(col => (
                                <th key={col} className="px-4 py-3 whitespace-nowrap">
                                    <span className="text-xs font-mono font-bold text-text-primary">{col}</span>
                                </th>
                            ))}
                            <th className="px-4 py-3 whitespace-nowrap text-right text-[9px] font-bold text-text-muted uppercase tracking-widest">Actions</th>
                        </tr>
                        <tr className="bg-brand/5 border-b border-brand/10">
                            <th className="px-4 py-3 text-[9px] font-bold text-brand uppercase tracking-widest w-36 shrink-0 sticky left-0 bg-surface-2 z-10">
                                CDM Display Name
                            </th>
                            {visibleSapColumns.map(col => {
                                const templateValue = SAP_RENAME_TEMPLATE[col] || '';
                                const currentValue = sapColumnMappings[currentTable.name]?.[col];
                                const displayValue = currentValue !== undefined ? currentValue : templateValue;
                                return (
                                    <th key={col} className="px-3 py-2 whitespace-nowrap">
                                        <input
                                            type="text"
                                            placeholder={templateValue || col.toLowerCase()}
                                            value={displayValue}
                                            onChange={e => setSapColumnMappings(prev => ({
                                                ...prev,
                                                [currentTable.name]: { ...(prev[currentTable.name] || {}), [col]: e.target.value },
                                            }))}
                                            className="w-full min-w-[120px] bg-surface border border-brand/20 rounded-lg px-2.5 py-1.5 text-[11px] text-text-primary focus:outline-none focus:border-brand transition-colors"
                                        />
                                    </th>
                                );
                            })}
                            <th className="px-4 py-3"></th>
                        </tr>
                    </thead>
                    <tbody className="text-text-secondary">
                        {sapDataLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <tr key={`skel-${i}`} className="border-b border-border/50">
                                    <td className="px-4 py-4 sticky left-0 bg-surface z-10"><Skeleton className="h-4 w-12" delay={0} /></td>
                                    {visibleSapColumns.map((col, j) => (
                                        <td key={col} className="px-4 py-4"><Skeleton className="h-4 w-full min-w-[80px]" delay={(j + 1) * 0.1} /></td>
                                    ))}
                                    <td className="px-4 py-4 text-right"><Skeleton className="h-4 w-12 ml-auto" /></td>
                                </tr>
                            ))
                        ) : sapData.map((row, i) => {
                            const rowKey = `sap:${i}`;
                            const isRowEditing = !isCommitted && editingRow === rowKey;
                            return (
                                <tr key={i} className="border-b border-border/50 hover:bg-surface-2 transition-colors">
                                    <td className="px-4 py-4 text-[9px] font-bold text-text-muted uppercase tracking-widest sticky left-0 bg-surface z-10">
                                        Row {i + 1}
                                    </td>
                                    {visibleSapColumns.map((col, j) => {
                                        const isFieldLocked = isNonEditableField(col);
                                        return (
                                            <td key={col} className={`px-4 py-4 whitespace-nowrap ${j === 0 ? 'font-mono text-brand' : ''}`}>
                                                {isRowEditing && !isFieldLocked ? (
                                                    <input type="text" value={editingRowData[col] ?? ''} onChange={e => setEditingRowData({ ...editingRowData, [col]: e.target.value })} className="w-full bg-surface-2 border border-border rounded px-2 py-1 text-sm text-text-primary focus:outline-none focus:border-brand min-w-[80px]" />
                                                ) : (
                                                    <span className={isRowEditing && isFieldLocked ? "text-text-muted opacity-80 select-none cursor-not-allowed font-medium px-2 py-1 bg-surface-2 rounded-md border border-border inline-block" : ""}>
                                                        {row[col] || '—'}
                                                    </span>
                                                )}
                                            </td>
                                        );
                                    })}
                                    <td className="px-4 py-4 text-right whitespace-nowrap">
                                        {isCommitted ? (
                                            <span className="text-xs text-text-muted">—</span>
                                        ) : (
                                            <div className="flex items-center justify-end gap-1">
                                                {isRowEditing ? (
                                                    <>
                                                        <button aria-label="Save edit" onClick={() => { const nd = [...sapData]; nd[i] = { ...nd[i], ...editingRowData }; setSapData(nd); setEditingRow(null); }} className="p-1 text-success hover:bg-success/10 rounded transition-all cursor-pointer"><CheckCircle2 size={14} /></button>
                                                        <button aria-label="Cancel edit" onClick={() => setEditingRow(null)} className="p-1 text-text-muted hover:text-text-primary rounded transition-all cursor-pointer"><X size={14} /></button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button aria-label="Edit row" onClick={() => { setEditingRow(rowKey); const rd = {}; visibleSapColumns.forEach(c => { rd[c] = row[c] || ''; }); setEditingRowData(rd); }} className="p-1 text-text-muted hover:text-brand hover:bg-surface-2 rounded transition-all cursor-pointer"><Edit2 size={14} /></button>
                                                        <button aria-label="Delete row" onClick={() => setDeleteConfirm({ open: true, title: 'Delete Row', message: `Delete SAP record "${row[visibleSapColumns[0]] || ''}"?`, onConfirm: () => { setSapData(prev => prev.filter((_, j) => j !== i)); setDeleteConfirm(prev => ({ ...prev, open: false })); } })} className="p-1 text-text-muted hover:text-danger hover:bg-danger/10 rounded transition-all cursor-pointer"><Trash2 size={14} /></button>
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
        </div>
    );
}
