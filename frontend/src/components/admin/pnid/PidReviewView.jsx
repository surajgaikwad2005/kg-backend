'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Loader2, Save, RotateCcw } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { useAdminNav, useAdminEntities, usePnidForm } from '@/src/components/admin/AdminPanelContext';
import { SharedSourceHeader } from '@/src/components/admin/views/_SharedSourceHeader';
import { CommittedCta } from '@/src/components/admin/views/_CommittedCta';
import { usePidPreview } from '@/src/components/admin/views/hooks/usePidPreview';
import { PidFileTabs } from '@/src/components/admin/views/components/pidReview/PidFileTabs';
import { PidFilePreview } from '@/src/components/admin/views/components/pidReview/PidFilePreview';
import { EquipmentTable } from '@/src/components/admin/views/components/pidReview/EquipmentTable';
import { ConnectivityTable } from '@/src/components/admin/views/components/pidReview/ConnectivityTable';
import { Skeleton } from '@/src/components/ui/Skeleton';
import { PageFooter } from '@/src/components/admin/views/components/PageFooter';
import { removeRowByIdentity } from '@/src/components/admin/admin.utils';
import { ContextTruncationNotice } from '@/src/components/admin/views/components/ContextTruncationNotice';
import { useRouter } from 'next/navigation';

const pidRowId = (row) =>
    row?._rowKey ?? ((row?.source && row?.destination) ? `${row.source}->${row.destination}` : undefined);

export function PidReviewView() {
    const { setView } = useAdminNav();
    const {
        editingRow, setEditingRow, editingRowData, setEditingRowData,
        setDeleteConfirm, commitPidContext, committedSources, processedSources,
        validatedSources, selectedPlantId, pipelineStatuses,
        saveContextRow, deleteContextRow, savingRowKey, deletingRowKey,
    } = useAdminEntities();
    const { pids, pidStep, setPidStep, setSelectedPid, connectivityByFile, equipmentPidData, pidData, setPidData, pidDataLoading, pidTruncation } = usePnidForm();
    const router = useRouter();

    const isCommitted = committedSources.has('P&ID');
    const isProcessed = processedSources.has('P&ID') || validatedSources.has('P&ID') || committedSources.has('P&ID');
    const [editedRows, setEditedRows] = useState(new Set());
    const [pendingEdits, setPendingEdits] = useState({});
    const [originalSnapshot, setOriginalSnapshot] = useState(null);

    const plantId = selectedPlantId?.id;
    useEffect(() => {
        setPendingEdits({});
        setOriginalSnapshot(null);
        setEditingRow(null);
        setEditedRows(new Set());
    }, [plantId, setEditingRow]);

    useEffect(() => {
        setEditedRows(new Set());
    }, [pidStep]);

    const unsavedCount = Object.keys(pendingEdits).length;
    const hasUnsavedEdits = unsavedCount > 0;
    const isSavingBatch = savingRowKey === 'batch:pnid';

    const { previewBlobUrl } = usePidPreview({ pids, pidStep });

    const currentPid = pids[pidStep];
    const currentFileConnectivity = currentPid
        ? connectivityByFile[currentPid.name] || connectivityByFile[currentPid.name.replace(/\.pdf$/i, '')] || []
        : [];
    const displayData = currentFileConnectivity.map(r => ({
        source:      r.from_equipment_ref || r.source_asset      || r.source      || Object.values(r)[0] || '',
        destination: r.to_equipment_ref   || r.destination_asset || r.destination || Object.values(r)[1] || '',
    }));
    const currentFileEquipment = currentPid
        ? equipmentPidData.filter(r =>
            (r.source_file || '') === currentPid.name ||
            (r.source_file || '') === currentPid.name.replace(/\.pdf$/i, ''),
          )
        : [];

    const handleSaveRow = (i) => {
        const row = pidData[i] || displayData[i] || {};
        const updatedRow = {
            ...row,
            from_equipment_ref: editingRowData.source ?? row.source ?? '',
            to_equipment_ref: editingRowData.destination ?? row.destination ?? '',
            source: editingRowData.source ?? row.source ?? '',
            destination: editingRowData.destination ?? row.destination ?? '',
        };
        const stableId = row._rowKey || ((updatedRow.source && updatedRow.destination) ? `${updatedRow.source}->${updatedRow.destination}` : i);

        setPendingEdits(prev => ({ ...prev, [stableId]: updatedRow }));

        const nd = [...pidData];
        nd[i] = updatedRow;
        setPidData(nd);
        setEditingRow(null);
        setEditedRows(prev => new Set([...prev, i]));
    };

    const handleSaveAllDirtyRows = async () => {
        if (!hasUnsavedEdits || !saveContextRow) return;
        const allRows = (pidData.length > 0 ? pidData : displayData).map((r) => ({
            ...r,
            plant_code_id: selectedPlantId?.id,
            plant_code: selectedPlantId?.id,
        }));

        await saveContextRow({
            connector: 'pnid',
            rowData: allRows,
            plantCode: selectedPlantId?.id,
            batchId: pipelineStatuses?.pnid?.batchId,
            rowKey: 'batch:pnid',
            onSuccess: () => {
                setPendingEdits({});
                setEditingRow(null);
            },
        });
    };

    const handleDiscardAllEdits = () => {
        if (originalSnapshot) {
            setPidData(originalSnapshot);
        }
        setPendingEdits({});
        setEditingRow(null);
    };

    const handleDeleteRow = (i, row) => {
        const rowKey = `pid:${pidRowId(row) ?? i}`;
        const dropRow = () => {
            setPidData(prev => removeRowByIdentity(prev, row, pidRowId));
            setDeleteConfirm(prev => ({ ...prev, open: false }));
        };
        setDeleteConfirm({
            open: true,
            title: 'Delete Row',
            message: `Delete row "${row.source} → ${row.destination}"?`,
            onConfirm: async () => {
                if (deleteContextRow) {
                    await deleteContextRow({
                        connector: 'pnid',
                        rowData: row,
                        plantCode: selectedPlantId?.id,
                        batchId: pipelineStatuses?.pnid?.batchId,
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
                <ContextTruncationNotice truncation={pidTruncation} noun="connections" />
                {pidDataLoading ? (
                    <>
                        <div className="flex items-center gap-2 flex-wrap">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <Skeleton key={i} className="h-9 w-28 rounded-xl" delay={i * 0.1} />
                            ))}
                        </div>
                        <Skeleton className="h-64 w-full rounded-2xl" />
                        <div className="bg-surface border border-border rounded-2xl overflow-hidden p-4 space-y-4">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="flex gap-4">
                                    <Skeleton className="h-4 w-1/3" delay={i * 0.1} />
                                    <Skeleton className="h-4 w-1/3" delay={i * 0.1} />
                                    <Skeleton className="h-4 w-1/4" delay={i * 0.1} />
                                </div>
                            ))}
                        </div>
                    </>
                ) : pids.length === 0 ? (
                    <div className="bg-surface border border-border rounded-2xl p-10 text-center">
                        <p className="text-text-muted mb-4">No P&ID pages found for this batch. The pipeline may still be processing, or no files matched this plant/batch.</p>
                        <button onClick={() => router.push('/admin/domain-configuration/data-source-integration')} className="bg-brand hover:bg-brand-hover text-white font-bold py-2 px-6 rounded-xl transition-all cursor-pointer">
                            Go to Data Configuration
                        </button>
                    </div>
                ) : (
                    <>
                        <PidFileTabs
                            pids={pids}
                            pidStep={pidStep}
                            onSelect={(idx) => {
                                setPidStep(idx);
                                if (pids[idx]?.id) {
                                    setSelectedPid(pids[idx].id);
                                }
                            }}
                        />

                        {currentPid && (
                            <>
                                <PidFilePreview pid={currentPid} previewBlobUrl={previewBlobUrl} />

                                <div className="bg-surface border border-border rounded-2xl overflow-hidden">
                                    <div className="p-4 border-b border-border bg-surface-2 flex items-center justify-between">
                                        <h4 className="text-sm font-bold text-text-primary">
                                            Processed Data — {currentPid.name}
                                        </h4>
                                        {hasUnsavedEdits && (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-warning/10 text-warning text-xs font-bold">
                                                <span className="w-2 h-2 rounded-full bg-warning animate-pulse" />
                                                {unsavedCount} edited row(s)
                                            </span>
                                        )}
                                    </div>
                                    {displayData.length === 0 && currentFileEquipment.length === 0 ? (
                                        <div className="px-6 py-10 text-center text-text-subtle text-sm">
                                            No processed data found for this file. Pipeline may still be processing.
                                        </div>
                                    ) : displayData.length === 0 && currentFileEquipment.length > 0 ? (
                                        <EquipmentTable currentFileEquipment={currentFileEquipment} />
                                    ) : (
                                        <ConnectivityTable
                                            displayData={displayData}
                                            isCommitted={isCommitted}
                                            editingRow={editingRow}
                                            editingRowData={editingRowData}
                                            setEditingRow={setEditingRow}
                                            setEditingRowData={setEditingRowData}
                                            editedRows={editedRows}
                                            setEditedRows={setEditedRows}
                                            onSaveRow={handleSaveRow}
                                            onDeleteRow={handleDeleteRow}
                                            savingRowKey={savingRowKey}
                                            deletingRowKey={deletingRowKey}
                                        />
                                    )}
                                </div>

                                <PageFooter>
                                    <div className="flex justify-between items-center gap-4">
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => {
                                                    if (pidStep > 0) {
                                                        setPidStep(pidStep - 1);
                                                        setSelectedPid(pids[pidStep - 1].id);
                                                    }
                                                }}
                                                disabled={pidStep === 0}
                                                className={cn(
                                                    'bg-canvas hover:bg-surface-2 text-text-primary font-bold py-3 px-8 rounded-xl text-sm border border-border transition-all flex items-center gap-2 cursor-pointer',
                                                    pidStep === 0 && 'opacity-40 cursor-not-allowed',
                                                )}
                                            >
                                                <ChevronDown size={18} className="rotate-90" />
                                                <span>Previous</span>
                                            </button>
                                            {hasUnsavedEdits && (
                                                <div className="flex items-center gap-2 text-warning text-xs font-bold pl-2">
                                                    <span className="w-2 h-2 rounded-full bg-warning animate-pulse" />
                                                    <span>{unsavedCount} edited row(s) pending save</span>
                                                </div>
                                            )}
                                        </div>

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
                                            {pidStep < pids.length - 1 ? (
                                                <button
                                                    onClick={() => {
                                                        const next = pids[pidStep + 1];
                                                        setPidStep(pidStep + 1);
                                                        setSelectedPid(next.id);
                                                    }}
                                                    className="bg-brand hover:bg-brand-hover text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-brand/20 transition-all flex items-center gap-2 cursor-pointer"
                                                >
                                                    <span>Next</span>
                                                    <ChevronDown size={18} className="-rotate-90" />
                                                </button>
                                            ) : isCommitted ? (
                                                <CommittedCta />
                                            ) : (
                                                <button
                                                    onClick={commitPidContext}
                                                    className="bg-brand hover:bg-brand-hover text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-brand/20 transition-all cursor-pointer"
                                                >
                                                    Commit to Database
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </PageFooter>
                            </>
                        )}
                    </>
                )}
            </div>
        </motion.div>
    );
}
