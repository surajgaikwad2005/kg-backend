'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, X, Edit2, Trash2, Loader2, Save, RotateCcw } from 'lucide-react';
import { useAdminEntities, useTsForm } from '@/src/components/admin/AdminPanelContext';
import { SharedSourceHeader } from '@/src/components/admin/views/_SharedSourceHeader';
import { CommittedCta } from '@/src/components/admin/views/_CommittedCta';
import { Skeleton } from '@/src/components/ui/Skeleton';
import { PageFooter } from '@/src/components/admin/views/components/PageFooter';
import { useRouter } from 'next/navigation';
import { cn } from '@/src/lib/utils';

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

export function TsReviewView({ standalone = false }) {
    const {
        editingRow, setEditingRow, editingRowData, setEditingRowData,
        setDeleteConfirm, commitTsContext, committedSources, processedSources,
        validatedSources, selectedPlantId, pipelineStatuses,
        saveContextRow, deleteContextRow, savingRowKey, deletingRowKey,
        countsByType,
    } = useAdminEntities();
    const { tsData, setTsData, tsDataLoading } = useTsForm();
    const router = useRouter();

    const [pendingEdits, setPendingEdits] = useState({});
    const [originalSnapshot, setOriginalSnapshot] = useState(null);

    const plantId = selectedPlantId?.id;
    useEffect(() => {
        setPendingEdits({});
        setOriginalSnapshot(null);
        setEditingRow(null);
    }, [plantId, setEditingRow]);

    const tsCounts = countsByType?.['Historian/Timeseries'];
    const hasUnprocessedFiles = Boolean(tsCounts?.hasUnprocessed || (tsCounts?.unprocessed ?? 0) > 0);
    const isCommitted = committedSources.has('Historian/Timeseries') && !hasUnprocessedFiles;
    const isProcessed = processedSources.has('Historian/Timeseries') || validatedSources.has('Historian/Timeseries') || committedSources.has('Historian/Timeseries');

    if (!isProcessed) {
        return (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-12">
                {!standalone && <SharedSourceHeader />}
                <div className="bg-surface border border-border rounded-2xl p-10 text-center">
                    <p className="text-text-muted mb-4">No processed data found. Please upload and run the pipeline first.</p>
                    <button onClick={() => router.push('/admin/domain-configuration/data-source-integration')} className="bg-brand hover:bg-brand-hover text-white font-bold py-2 px-6 rounded-xl transition-all cursor-pointer">
                        Go to Data Configuration
                    </button>
                </div>
            </motion.div>
        );
    }

    const tsCols = tsData.length > 0 ? Object.keys(tsData[0]).filter(k => k !== '_id') : [];
    const displayCols = tsDataLoading ? ['tag_name', 'description', 'lower_limit', 'upper_limit', 'unit'] : tsCols;

    const unsavedCount = Object.keys(pendingEdits).length;
    const hasUnsavedEdits = unsavedCount > 0;
    const isSavingBatch = savingRowKey === 'batch:ts';

    const handleSaveRow = (i, row) => {
        const sanitizedEdits = { ...editingRowData };
        if (row.plant_code_id) sanitizedEdits.plant_code_id = row.plant_code_id;
        if (row.plant_code) sanitizedEdits.plant_code = row.plant_code;
        if (row.site) sanitizedEdits.site = row.site;
        if (row.ts_uid) sanitizedEdits.ts_uid = row.ts_uid;

        const updatedRow = { ...row, ...sanitizedEdits };
        const stableId = row._id || row.ts_uid || row.iotdb_tag_id || row.tag_name || i;

        setPendingEdits(prev => ({ ...prev, [stableId]: updatedRow }));

        const nd = [...tsData];
        nd[i] = updatedRow;
        setTsData(nd);
        setEditingRow(null);
    };

    const handleSaveAllDirtyRows = async () => {
        if (!hasUnsavedEdits || !saveContextRow) return;
        const allRows = tsData.map((r) => ({
            ...r,
            plant_code_id: selectedPlantId?.id,
            plant_code: selectedPlantId?.id,
        }));

        await saveContextRow({
            connector: 'timeseries',
            rowData: allRows,
            plantCode: selectedPlantId?.id,
            batchId: pipelineStatuses?.ts?.batchId,
            rowKey: 'batch:ts',
            onSuccess: () => {
                setPendingEdits({});
                setEditingRow(null);
            },
        });
    };

    const handleDiscardAllEdits = () => {
        if (originalSnapshot) {
            setTsData(originalSnapshot);
        }
        setPendingEdits({});
        setEditingRow(null);
    };

    const handleDeleteRow = (i, row, rowKey) => {
        setDeleteConfirm({
            open: true,
            title: 'Delete Row',
            message: `Delete tag "${row.tag_name || row[tsCols[0]] || ''}"?`,
            onConfirm: async () => {
                if (deleteContextRow) {
                    await deleteContextRow({
                        connector: 'timeseries',
                        rowData: row,
                        plantCode: selectedPlantId?.id,
                        batchId: pipelineStatuses?.ts?.batchId,
                        rowKey,
                        onSuccess: () => {
                            setTsData(prev => prev.filter((_, j) => j !== i));
                            setDeleteConfirm(prev => ({ ...prev, open: false }));
                        },
                    });
                } else {
                    setTsData(prev => prev.filter((_, j) => j !== i));
                    setDeleteConfirm(prev => ({ ...prev, open: false }));
                }
            },
        });
    };

    return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-12">
            {!standalone && <SharedSourceHeader />}
            <div className="space-y-8">
                {/* <DataQualitySummary plantCode={selectedPlantId?.id} /> */}
                <div className="bg-surface border border-border rounded-2xl overflow-hidden">
                    <div className="p-4 border-b border-border bg-surface-2 flex items-center justify-between">
                        <div>
                            <h4 className="text-sm font-bold text-text-primary">Tag Mapping</h4>
                            <p className="text-label text-text-muted">{tsData.length > 0 ? `${tsCols.length} columns` : ''}</p>
                        </div>
                        {hasUnsavedEdits && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-warning/10 text-warning text-xs font-bold">
                                <span className="w-2 h-2 rounded-full bg-warning animate-pulse" />
                                {unsavedCount} edited row(s)
                            </span>
                        )}
                    </div>
                    <div className="overflow-auto max-h-[600px] custom-scrollbar">
                        <table className="w-full text-left text-sm relative">
                            <thead className="sticky top-0 z-20 bg-surface-2 shadow-sm ring-1 ring-border">
                                <tr className="text-text-muted">
                                    {displayCols.map(col => (
                                        <th key={col} className="px-6 py-4 font-bold tracking-wider uppercase whitespace-nowrap text-[10px]">
                                            {tsDataLoading ? <Skeleton className="h-3 w-16" /> : col}
                                        </th>
                                    ))}
                                    <th className="px-6 py-4 font-bold tracking-wider uppercase whitespace-nowrap text-[10px] w-28 text-right sticky right-0 bg-surface-2 border-l border-border z-30">
                                        {tsDataLoading ? <Skeleton className="h-3 w-12 ml-auto" /> : 'Actions'}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="text-text-secondary divide-y divide-border/50">
                                {tsDataLoading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={`skel-${i}`} className="border-b border-border/50">
                                            {displayCols.map((col, j) => (
                                                <td key={col} className="px-6 py-3">
                                                    <Skeleton className={`h-4 w-full ${j === 0 ? 'max-w-[140px]' : 'max-w-[100px]'}`} delay={j * 0.1} />
                                                </td>
                                            ))}
                                            <td className="px-6 py-3 text-right sticky right-0 bg-surface border-l border-border z-10">
                                                <Skeleton className="h-4 w-6 ml-auto inline-block rounded" />
                                            </td>
                                        </tr>
                                    ))
                                ) : tsData.length === 0 ? (
                                    <tr>
                                        <td colSpan={displayCols.length + 1} className="px-6 py-10 text-center text-text-muted">
                                            No tag mapping data available.
                                        </td>
                                    </tr>
                                ) : tsData.map((row, i) => {
                                    const stableId = row._id || row.ts_uid || row.iotdb_tag_id || row.tag_name || i;
                                    const rowKey = `ts:${stableId}`;
                                    const isRowEditing = !isCommitted && editingRow === rowKey;
                                    const isRowSaving = savingRowKey === rowKey;
                                    const isRowDeleting = deletingRowKey === rowKey;
                                    const isDirty = Boolean(pendingEdits[stableId]);

                                    return (
                                        <tr key={row._id || row.ts_uid || row.tag_name || i} className={`group transition-colors ${isDirty ? 'bg-warning/[0.06] border-l-2 border-l-warning' : 'hover:bg-surface-2/80'}`}>
                                            {tsCols.map((col, j) => {
                                                const isFieldLocked = isNonEditableField(col);
                                                return (
                                                    <td key={col} className={`px-6 py-3 whitespace-nowrap ${j === 0 ? 'font-mono text-brand font-medium' : ''} text-xs`}>
                                                        {isRowEditing && !isFieldLocked ? (
                                                            <input
                                                                type="text"
                                                                value={editingRowData[col] ?? ''}
                                                                onChange={e => setEditingRowData({ ...editingRowData, [col]: e.target.value })}
                                                                className="w-full bg-surface border border-border rounded-lg px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all min-w-[120px] shadow-sm"
                                                            />
                                                        ) : (
                                                            <span className={cn(isRowEditing && isFieldLocked ? "text-text-muted opacity-80 select-none cursor-not-allowed font-medium px-2 py-1 bg-surface-2 rounded-md border border-border inline-block" : "")}>
                                                                {row[col] || '—'}
                                                            </span>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                            <td className="px-6 py-3 text-right sticky right-0 bg-surface border-l border-border z-10 group-hover:bg-surface-2/80 transition-colors">
                                                {isCommitted ? (
                                                    <span className="text-xs text-text-subtle">—</span>
                                                ) : (
                                                    <div className="flex items-center justify-end gap-1">
                                                        {isRowEditing ? (
                                                            <>
                                                                <button
                                                                    aria-label="Save row"
                                                                    title="Save row"
                                                                    disabled={isRowSaving}
                                                                    aria-busy={isRowSaving}
                                                                    onClick={() => handleSaveRow(i, row)}
                                                                    className="p-1 text-success hover:bg-success/10 rounded transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1"
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
                                                                        const rd = {};
                                                                        tsCols.forEach(c => rd[c] = row[c] ?? '');
                                                                        setEditingRowData(rd);
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
                                <button onClick={commitTsContext} className="bg-brand hover:bg-brand-hover text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-brand/20 transition-all cursor-pointer">
                                    {standalone ? 'Commit to Database' : 'Configure Context'}
                                </button>
                            )}
                        </div>
                    </div>
                </PageFooter>
            </div>
        </motion.div>
    );
}
