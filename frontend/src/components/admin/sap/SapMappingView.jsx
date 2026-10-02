'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, X, Edit2, Trash2, Loader2, Save, RotateCcw } from 'lucide-react';
import { useAdminEntities, useSapForm } from '@/src/components/admin/AdminPanelContext';
import { SharedSourceHeader } from '@/src/components/admin/views/_SharedSourceHeader';
import { CommittedCta } from '@/src/components/admin/views/_CommittedCta';
import { PageFooter } from '@/src/components/admin/views/components/PageFooter';
import { removeRowByIdentity } from '@/src/components/admin/admin.utils';
import { ContextTruncationNotice } from '@/src/components/admin/views/components/ContextTruncationNotice';
import { useRouter } from 'next/navigation';
import { cn } from '@/src/lib/utils';

const mappingRowId = (row) =>
    (row?.pidAsset && row?.sapAsset) ? `${row.pidAsset}->${row.sapAsset}` : row?.id;

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

export function SapMappingView() {
    const {
        editingRow, setEditingRow, editingRowData, setEditingRowData,
        setDeleteConfirm, commitSapContext, committedSources, processedSources,
        validatedSources, selectedPlantId, pipelineStatuses,
        saveContextRow, deleteContextRow, savingRowKey, deletingRowKey,
    } = useAdminEntities();
    const { mappingData, setMappingData, sapTruncation } = useSapForm();
    const isCommitted = committedSources.has('SAP');
    const isProcessed = processedSources.has('SAP') || validatedSources.has('SAP') || committedSources.has('SAP');
    const router = useRouter();

    const [pendingEdits, setPendingEdits] = useState({});
    const [originalSnapshot, setOriginalSnapshot] = useState(null);

    const plantId = selectedPlantId?.id;
    useEffect(() => {
        setPendingEdits({});
        setOriginalSnapshot(null);
        setEditingRow(null);
    }, [plantId, setEditingRow]);


    const unsavedCount = Object.keys(pendingEdits).length;
    const hasUnsavedEdits = unsavedCount > 0;
    const isSavingBatch = savingRowKey === 'batch:sap';

    const handleSaveRow = (i, row, keys) => {
        const updatedRow = Object.fromEntries(keys.map(k => {
            if (isNonEditableField(k)) return [k, row[k] ?? ''];
            return [k, editingRowData[k] ?? row[k] ?? ''];
        }));
        const stableId = mappingRowId(row) ?? i;

        setPendingEdits(prev => ({ ...prev, [stableId]: updatedRow }));

        const nd = [...mappingData];
        nd[i] = updatedRow;
        setMappingData(nd);
        setEditingRow(null);
    };

    const handleSaveAllDirtyRows = async () => {
        if (!hasUnsavedEdits || !saveContextRow) return;
        const allRows = mappingData.map((r) => ({
            ...r,
            plant_code_id: selectedPlantId?.id,
            plant_code: selectedPlantId?.id,
        }));

        await saveContextRow({
            connector: 'sap',
            rowData: allRows,
            plantCode: selectedPlantId?.id,
            batchId: pipelineStatuses?.sap?.batchId,
            rowKey: 'batch:sap',
            onSuccess: () => {
                setPendingEdits({});
                setEditingRow(null);
            },
        });
    };

    const handleDiscardAllEdits = () => {
        if (originalSnapshot) {
            setMappingData(originalSnapshot);
        }
        setPendingEdits({});
        setEditingRow(null);
    };

    const handleDeleteRow = (i, row, rowKey) => {
        const dropRow = () => {
            setMappingData(prev => removeRowByIdentity(prev, row, mappingRowId));
            setDeleteConfirm(prev => ({ ...prev, open: false }));
        };
        setDeleteConfirm({
            open: true,
            title: 'Delete Row',
            message: `Delete mapping "${row.pidAsset} → ${row.sapAsset}"?`,
            onConfirm: async () => {
                if (deleteContextRow) {
                    await deleteContextRow({
                        connector: 'sap',
                        rowData: row,
                        plantCode: selectedPlantId?.id,
                        batchId: pipelineStatuses?.sap?.batchId,
                        rowKey,
                        onSuccess: dropRow,
                    });
                } else {
                    dropRow();
                }
            },
        });
    };

    if (!isProcessed) {
        return (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-12">
                <SharedSourceHeader />
                <div className="bg-surface border border-border rounded-2xl p-10 text-center">
                    <p className="text-text-muted mb-4">No processed data found. Please upload and run the pipeline first.</p>
                    <button onClick={() => router.push('/admin/domain-configuration/data-source-integration')} className="bg-brand hover:bg-brand-hover text-white font-bold py-2 px-6 rounded-xl transition-all cursor-pointer">
                        Go to Data Configuration
                    </button>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-12">
            <SharedSourceHeader />
            <div className="space-y-8">
                <ContextTruncationNotice truncation={sapTruncation} noun="mappings" />
                <div className="bg-surface border border-border rounded-2xl overflow-hidden">
                    <div className="p-4 border-b border-border bg-surface-2 flex items-center justify-between">
                        <h4 className="text-sm font-bold text-text-primary">Asset Mapping (P&amp;ID to SAP)</h4>
                        {hasUnsavedEdits && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-warning/10 text-warning text-xs font-bold">
                                <span className="w-2 h-2 rounded-full bg-warning animate-pulse" />
                                {unsavedCount} edited row(s)
                            </span>
                        )}
                    </div>
                    {mappingData.length === 0 ? (
                        <div className="px-6 py-12 text-center text-sm text-text-subtle">
                            No asset mappings yet. Upload and process SAP and P&amp;ID sources to generate mappings.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                        <table className="w-full min-w-150 text-left text-sm">
                            <thead>
                                <tr className="text-text-muted border-b border-border">
                                    {Object.keys(mappingData[0]).map(key => (
                                        <th key={key} className="px-6 py-4 font-semibold capitalize whitespace-nowrap">{key.replace(/([A-Z])/g, ' $1')}</th>
                                    ))}
                                    <th className="px-6 py-4 font-semibold w-24 whitespace-nowrap">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="text-text-secondary">
                                {mappingData.map((row, i) => {
                                    const stableId = mappingRowId(row) ?? i;
                                    const rowKey = `map:${stableId}`;
                                    const isRowEditing = !isCommitted && editingRow === rowKey;
                                    const isRowSaving = savingRowKey === rowKey;
                                    const isRowDeleting = deletingRowKey === rowKey;
                                    const isDirty = Boolean(pendingEdits[stableId]);
                                    const keys = Object.keys(row);

                                    return (
                                        <tr key={row.pidAsset ?? row.id ?? i} className={`border-b border-border/50 transition-colors ${isDirty ? 'bg-warning/[0.06] border-l-2 border-l-warning' : 'hover:bg-surface-2'}`}>
                                            {keys.map((key, j) => {
                                                const isFieldLocked = isNonEditableField(key);
                                                return (
                                                    <td key={key} className={`px-6 py-4 whitespace-nowrap ${j === 0 ? 'font-mono text-brand' : ''}`}>
                                                        {isRowEditing && !isFieldLocked ? (
                                                            <input
                                                                type="text"
                                                                value={editingRowData[key] ?? ''}
                                                                onChange={e => setEditingRowData({ ...editingRowData, [key]: e.target.value })}
                                                                className="w-full min-w-30 bg-surface-2 border border-border rounded px-2 py-1 text-sm text-text-primary focus:outline-none focus:border-brand"
                                                            />
                                                        ) : j === keys.length - 1 ? (
                                                            <span className="px-2 py-1 bg-success/10 text-success text-label font-bold rounded uppercase tracking-wider">{row[key]}</span>
                                                        ) : (
                                                            <span className={cn(isRowEditing && isFieldLocked ? "text-text-muted opacity-80 select-none cursor-not-allowed font-medium px-2 py-1 bg-surface-2 rounded-md border border-border inline-block" : "")}>
                                                                {row[key] ?? '—'}
                                                            </span>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {isCommitted ? (
                                                    <span className="text-xs text-text-subtle">—</span>
                                                ) : (
                                                    <div className="flex items-center gap-1">
                                                        {isRowEditing ? (
                                                            <>
                                                                <button
                                                                    aria-label="Save row"
                                                                    title="Save row"
                                                                    disabled={isRowSaving}
                                                                    aria-busy={isRowSaving}
                                                                    onClick={() => handleSaveRow(i, row, keys)}
                                                                    className="p-1 text-success hover:bg-success/10 rounded transition-all cursor-pointer disabled:opacity-50"
                                                                >
                                                                    {isRowSaving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                                                                </button>
                                                                <button
                                                                    aria-label="Discard edit"
                                                                    title="Discard edit"
                                                                    disabled={isRowSaving}
                                                                    onClick={() => setEditingRow(null)}
                                                                    className="p-1 text-text-muted hover:text-text-primary rounded transition-all cursor-pointer disabled:opacity-50"
                                                                >
                                                                    <X size={14} />
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <button
                                                                    aria-label="Edit row"
                                                                    onClick={() => {
                                                                        setEditingRow(rowKey);
                                                                        setEditingRowData(Object.fromEntries(keys.map(k => [k, row[k]])));
                                                                    }}
                                                                    className="p-1 text-text-muted hover:text-brand hover:bg-surface-2 rounded transition-all cursor-pointer"
                                                                >
                                                                    <Edit2 size={14} />
                                                                </button>
                                                                <button
                                                                    aria-label="Delete row"
                                                                    disabled={isRowDeleting}
                                                                    aria-busy={isRowDeleting}
                                                                    onClick={() => handleDeleteRow(i, row, rowKey)}
                                                                    className="p-1 text-text-muted hover:text-danger hover:bg-danger/10 rounded transition-all cursor-pointer disabled:opacity-50"
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
                    )}
                </div>

                <PageFooter>
                    <div className="flex justify-between items-center gap-4">
                        {hasUnsavedEdits ? (
                            <div className="flex items-center gap-2 text-warning text-xs font-bold">
                                <span className="w-2 h-2 rounded-full bg-warning animate-pulse" />
                                <span>{unsavedCount} edited row(s) pending save</span>
                            </div>
                        ) : <div />}
                        <div className="flex items-center gap-3">
                            {hasUnsavedEdits && (
                                <>
                                    <button
                                        onClick={handleDiscardAllEdits}
                                        disabled={isSavingBatch}
                                        className="px-4 py-2.5 rounded-xl border border-border bg-surface-2 hover:bg-surface text-text-primary text-xs font-bold transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                                    >
                                        <RotateCcw size={14} />
                                        <span>Discard Changes</span>
                                    </button>
                                    <button
                                        onClick={handleSaveAllDirtyRows}
                                        disabled={isSavingBatch}
                                        aria-busy={isSavingBatch}
                                        className="px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-brand/20 disabled:opacity-50"
                                    >
                                        {isSavingBatch ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                                        <span>Save Changes</span>
                                    </button>
                                </>
                            )}
                            {isCommitted ? (
                                <CommittedCta />
                            ) : (
                                <button onClick={commitSapContext} className="bg-brand hover:bg-brand-hover text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-brand/20 transition-all cursor-pointer">
                                    Configure Context
                                </button>
                            )}
                        </div>
                    </div>
                </PageFooter>
            </div>
        </motion.div>
    );
}
