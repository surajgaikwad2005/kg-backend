'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Trash2, Plus, ChevronDown } from 'lucide-react';
import { Select } from '@/src/components/ui/Select';
import { useSapForm, useAdminEntities } from '@/src/components/admin/AdminPanelContext';
import { useToast } from '@/src/components/ui/Toast';
import { SharedSourceHeader } from '@/src/components/admin/views/_SharedSourceHeader';
import { PageFooter } from '@/src/components/admin/views/components/PageFooter';
import { SAP_TABLE_COLUMNS } from '@/src/components/admin/admin.constants';
import { updateUserConfig } from '@/src/services/domain-configuration/common';
import { generateId } from '@/src/lib/utils';
import { useRouter } from 'next/navigation';

export function SapJoinsView() {
    const { sapJoins, setSapJoins, sapTables } = useSapForm();
    const { processedSources, validatedSources, committedSources, selectedPlantId } = useAdminEntities();
    const { error } = useToast();
    const router = useRouter();

    const isProcessed = processedSources.has('SAP') || validatedSources.has('SAP') || committedSources.has('SAP');

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

    const allTableNames = [...sapTables.filter(t => t.selected).map(t => t.name), 'WO', 'TL', 'MAT']
        .filter((v, i, a) => a.indexOf(v) === i);

    const getColsFor = (tbl) => SAP_TABLE_COLUMNS[tbl] || [];

    const handleSaveAndNext = async () => {
        const joinOverrides = {};
        for (const join of sapJoins) {
            if (!join.leftTable || !join.leftColumn || !join.rightTable || !join.rightColumn) continue;
            const stepKey = `${join.leftTable.toLowerCase()}_${join.rightTable.toLowerCase()}`;
            let dataset = join.pipeline === 'custom' ? 'workorder' : (join.pipeline || 'workorder');
            if (!joinOverrides[dataset]) joinOverrides[dataset] = {};
            if (!joinOverrides[dataset][stepKey]) joinOverrides[dataset][stepKey] = [];
            if (!joinOverrides[dataset][stepKey].includes(join.leftColumn)) {
                joinOverrides[dataset][stepKey].push(join.leftColumn);
            }
        }
        try {
            await updateUserConfig({ sap_processing: { join_overrides: joinOverrides } }, selectedPlantId?.id);
        } catch {
            error('Save Failed', 'Could not save SAP join overrides. Please try again.');
        }
        router.push('/admin/domain-configuration/data-source-integration/review?view=sap-tables');
    };

    const updateJoin = (idx, patch) => setSapJoins(prev => {
        const next = [...prev];
        next[idx] = { ...next[idx], ...patch };
        return next;
    });

    const removeJoin = (idx) => setSapJoins(prev => prev.filter((_, j) => j !== idx));

    const renderJoinCard = (join, idx, isCustom = false) => {
        const cardCls = isCustom
            ? 'p-4 bg-success/5 border border-success/30 rounded-xl hover:border-success/50 transition-all'
            : 'p-4 bg-surface border border-border rounded-xl hover:border-brand/30 transition-all';
        const iconCls = isCustom ? 'bg-success/10 text-success' : 'bg-brand/10 text-brand';

        return (
            <div key={join.id} className={cardCls}>
                <div className="flex items-center gap-4">
                    <div className="flex-1 space-y-2">
                        <label className="text-2xs font-bold text-text-subtle uppercase tracking-widest">Left Table</label>
                        <Select
                            value={join.leftTable}
                            onChange={(val) => updateJoin(idx, { leftTable: val, leftColumn: '' })}
                            placeholder="Select table..."
                            options={allTableNames.map((t) => ({ value: t, label: t }))}
                            searchable
                        />
                        <label className="text-2xs font-bold text-text-subtle uppercase tracking-widest">Join Column</label>
                        <Select
                            value={join.leftColumn}
                            onChange={(val) => updateJoin(idx, { leftColumn: val })}
                            placeholder="Select column..."
                            options={getColsFor(join.leftTable).map((c) => ({ value: c, label: c }))}
                            searchable
                        />
                    </div>

                    <div className="flex flex-col items-center shrink-0 gap-1">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${iconCls}`}>
                            <span className="font-bold text-xs">⟷</span>
                        </div>
                        <span className="text-[8px] text-text-subtle font-bold uppercase">Join</span>
                    </div>

                    <div className="flex-1 space-y-2">
                        <label className="text-2xs font-bold text-text-subtle uppercase tracking-widest">Right Table</label>
                        <Select
                            value={join.rightTable}
                            onChange={(val) => updateJoin(idx, { rightTable: val, rightColumn: '' })}
                            placeholder="Select table..."
                            options={allTableNames.map((t) => ({ value: t, label: t }))}
                            searchable
                        />
                        <label className="text-2xs font-bold text-text-subtle uppercase tracking-widest">Join Column</label>
                        <Select
                            value={join.rightColumn}
                            onChange={(val) => updateJoin(idx, { rightColumn: val })}
                            placeholder="Select column..."
                            options={getColsFor(join.rightTable).map((c) => ({ value: c, label: c }))}
                            searchable
                        />
                    </div>

                    <button onClick={() => removeJoin(idx)} aria-label="Remove join" className="p-2 text-text-subtle hover:text-danger hover:bg-danger/5 rounded-lg shrink-0 transition-all self-start mt-5 cursor-pointer">
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>
        );
    };

    const customJoins = sapJoins.filter(j => j.step === 'custom');

    return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-12">
            <SharedSourceHeader />
            <div className="space-y-6">
                <p className="text-sm text-text-muted">
                    Define how SAP tables are joined in the merge pipeline. Pre-populated from CDM template — edit join columns as needed.
                </p>

                {['workorder', 'floc', 'tasklist', 'material'].map(pipeline => {
                    const pipelineJoins = sapJoins.filter(j => j.pipeline === pipeline && j.step !== 'custom');
                    if (pipelineJoins.length === 0) return null;
                    return (
                        <div key={pipeline} className="space-y-3">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-brand" />
                                <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">{pipeline} Pipeline</h3>
                                <span className="text-label text-text-subtle font-medium">{pipelineJoins.length} join{pipelineJoins.length !== 1 ? 's' : ''}</span>
                            </div>
                            <div className="grid gap-3">
                                {pipelineJoins.map(join => renderJoinCard(join, sapJoins.indexOf(join), false))}
                            </div>
                        </div>
                    );
                })}

                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-success" />
                        <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">Added Joins</h3>
                        <span className="text-label text-text-subtle font-medium">{customJoins.length} custom join{customJoins.length !== 1 ? 's' : ''}</span>
                    </div>
                    {customJoins.length > 0 && (
                        <div className="grid gap-3">
                            {customJoins.map(join => renderJoinCard(join, sapJoins.indexOf(join), true))}
                        </div>
                    )}
                    <button
                        onClick={() => setSapJoins(prev => [...prev, { id: generateId(), leftTable: '', leftColumn: '', rightTable: '', rightColumn: '', pipeline: 'custom', step: 'custom' }])}
                        className="w-full py-3 border border-dashed border-border rounded-xl flex items-center justify-center gap-2 text-text-muted hover:text-success hover:border-success transition-all cursor-pointer"
                    >
                        <Plus size={14} />
                        <span className="text-xs font-bold uppercase tracking-widest">Add Join Mapping</span>
                    </button>
                </div>

                <PageFooter>
                    <div className="flex justify-between items-center">
                        <button onClick={() => router.push('/admin/domain-configuration/data-source-integration')} className="bg-surface hover:bg-surface-2 text-text-primary font-bold py-3 px-8 rounded-xl text-sm border border-border transition-all flex items-center gap-2 cursor-pointer">
                            <ChevronDown size={18} className="rotate-90" />
                            <span>Back</span>
                        </button>
                        <button onClick={handleSaveAndNext} className="bg-brand hover:bg-brand-hover text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-brand/20 transition-all flex items-center gap-2 cursor-pointer">
                            <span>Save & Next</span>
                            <ChevronDown size={18} className="-rotate-90" />
                        </button>
                    </div>
                </PageFooter>
            </div>
        </motion.div>
    );
}
