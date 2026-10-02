'use client';
import React, { useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useAdminEntities, useSapForm } from '@/src/components/admin/AdminPanelContext';
import { SharedSourceHeader } from '@/src/components/admin/views/_SharedSourceHeader';
import { CommittedCta } from '@/src/components/admin/views/_CommittedCta';
import { PageFooter } from '@/src/components/admin/views/components/PageFooter';
import { SAP_TABLE_COLUMNS } from '@/src/components/admin/admin.constants';
import { updateColumnRenames } from '@/src/services/domain-configuration/common';
import { useToast } from '@/src/components/ui/Toast';
import { SapTablePanel } from '@/src/components/admin/views/components/sapTables/SapTablePanel';
import { SapColumnFilter } from '@/src/components/admin/views/components/sapTables/SapColumnFilter';
import { useRouter } from 'next/navigation';

export function SapTablesView({ standalone = false }) {
    const { editingRow, setEditingRow, editingRowData, setEditingRowData, setDeleteConfirm, commitSapContext, committedSources, processedSources, validatedSources, selectedPlantId } = useAdminEntities();
    const { sapTables, sapTableStep, setSapTableStep, setSelectedSapTable, sapColumnMappings, setSapColumnMappings, visibleSapColumns, setVisibleSapColumns, allSapColumns, sapData, setSapData, sapDataLoading } = useSapForm();
    const { error } = useToast();
    const router = useRouter();

    const isCommitted = committedSources.has('SAP');
    const isProcessed = processedSources.has('SAP') || validatedSources.has('SAP') || committedSources.has('SAP');

    const selectedTables = useMemo(() => sapTables.filter(t => t.selected), [sapTables]);
    const currentTable = selectedTables[sapTableStep];
    const currentTableName = currentTable?.name;

    const handleSaveMappings = useCallback(async () => {
        if (!currentTableName) return;
        const tableCols = SAP_TABLE_COLUMNS[currentTableName] || [];
        const renames = {};
        tableCols.forEach(col => {
            const val = sapColumnMappings[currentTableName]?.[col];
            if (val && val.trim()) renames[col] = val.trim();
        });
        try {
            await updateColumnRenames(currentTableName.toLowerCase(), renames, selectedPlantId?.id);
        } catch {
            error('Save Failed', 'Could not save column renames. Please try again.');
        }
    }, [currentTableName, sapColumnMappings, error, selectedPlantId]);

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

    if (!currentTable) return null;

    const tableCols = SAP_TABLE_COLUMNS[currentTable.name] || [];

    return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-12">
            {!standalone && <SharedSourceHeader />}
            <div className="space-y-8">
                <div className="flex items-center gap-2 flex-wrap">
                    {selectedTables.map((table, idx) => (
                        <button key={table.name}
                            onClick={() => { setSapTableStep(idx); setSelectedSapTable(table.name); }}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${idx === sapTableStep ? 'bg-brand text-white' : 'bg-surface border border-border text-text-muted hover:border-brand/30 hover:text-text-primary'}`}>
                            {table.name}
                        </button>
                    ))}
                </div>

                <div className="flex gap-6">
                    <SapTablePanel
                        currentTable={currentTable}
                        tableCols={tableCols}
                        visibleSapColumns={visibleSapColumns}
                        sapColumnMappings={sapColumnMappings}
                        setSapColumnMappings={setSapColumnMappings}
                        sapData={sapData}
                        setSapData={setSapData}
                        sapDataLoading={sapDataLoading}
                        isCommitted={isCommitted}
                        editingRow={editingRow}
                        editingRowData={editingRowData}
                        setEditingRow={setEditingRow}
                        setEditingRowData={setEditingRowData}
                        setDeleteConfirm={setDeleteConfirm}
                        onSaveMappings={handleSaveMappings}
                    />
                    <SapColumnFilter
                        allSapColumns={allSapColumns}
                        visibleSapColumns={visibleSapColumns}
                        setVisibleSapColumns={setVisibleSapColumns}
                    />
                </div>

                {!standalone ? (
                    <PageFooter>
                        <div className="flex justify-between items-center gap-4">
                            <button onClick={() => {
                                if (sapTableStep > 0) {
                                    setSapTableStep(sapTableStep - 1);
                                    setSelectedSapTable(selectedTables[sapTableStep - 1].name);
                                } else {
                                    router.push('/admin/domain-configuration/data-source-integration/review?view=sap-joins');
                                }
                            }} className="bg-surface hover:bg-surface-2 text-text-primary font-bold py-3 px-8 rounded-xl text-sm border border-border transition-all flex items-center gap-2 cursor-pointer">
                                <ChevronDown size={18} className="rotate-90" />
                                <span>{sapTableStep === 0 ? 'Back to Joins' : 'Previous'}</span>
                            </button>

                            {sapTableStep < selectedTables.length - 1 ? (
                                <button onClick={() => { setSapTableStep(sapTableStep + 1); setSelectedSapTable(selectedTables[sapTableStep + 1].name); }}
                                    className="bg-brand hover:bg-brand-hover text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-brand/20 transition-all flex items-center gap-2 cursor-pointer">
                                    <span>Next Table</span>
                                    <ChevronDown size={18} className="-rotate-90" />
                                </button>
                            ) : (
                                <button onClick={() => router.push('/admin/domain-configuration/data-source-integration/review?view=sap-mapping')}
                                    className="bg-brand hover:bg-brand-hover text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-brand/20 transition-all flex items-center gap-2 cursor-pointer">
                                    <span>Next</span>
                                    <ChevronDown size={18} className="-rotate-90" />
                                </button>
                            )}
                        </div>
                    </PageFooter>
                ) : (
                    <div className="flex justify-between items-center gap-4 pt-6 pb-16">
                        <div className="flex w-full justify-end">
                            {sapTableStep < selectedTables.length - 1 ? (
                                <button onClick={() => { setSapTableStep(sapTableStep + 1); setSelectedSapTable(selectedTables[sapTableStep + 1].name); }}
                                    className="bg-surface hover:bg-surface-2 text-text-primary font-bold py-3 px-8 rounded-xl shadow-sm border border-border transition-all flex items-center gap-2 cursor-pointer">
                                    <span>Next Table</span>
                                    <ChevronDown size={18} className="-rotate-90" />
                                </button>
                            ) : isCommitted ? (
                                <CommittedCta />
                            ) : (
                                <button onClick={commitSapContext}
                                    className="bg-brand hover:bg-brand-hover text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-brand/20 transition-all cursor-pointer">
                                    Commit to Database
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
