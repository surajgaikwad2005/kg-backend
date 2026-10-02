'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { FileSearch, ChevronLeft, ChevronRight, RotateCcw, Save, Loader2 } from 'lucide-react';
import { SharedSourceHeader } from '@/src/components/admin/views/_SharedSourceHeader';
import { CommittedCta } from '@/src/components/admin/views/_CommittedCta';
import { PageFooter } from '@/src/components/admin/views/components/PageFooter';
import { ContextTruncationNotice } from '@/src/components/admin/views/components/ContextTruncationNotice';
import { useDocsReview } from './hooks/useDocsReview';
import { DocsCategorySelector } from './DocsCategorySelector';
import { DocsCategoryTabs } from './DocsCategoryTabs';
import { DocsReviewTable } from './DocsReviewTable';
import { PipelineRunRow } from '@/src/components/admin/pipeline/PipelineRunRow';
import { PIPELINE_ROWS } from '@/src/components/admin/pipeline/pipelineRun.utils';

const DOCS_RUN_META = PIPELINE_ROWS.find((r) => r.key === 'docs');

export function DocsReviewView({ standalone = false }) {
    const {
        selectedDocCategory, setSelectedDocCategory,
        docCategoryStep, setDocCategoryStep,
        docsTruncation, router,
        search, handleSearchChange,
        page, setPage, PAGE_SIZE,
        isCommitted, isProcessed,
        docsRun, isDocsRunActive,
        unsavedCount, hasUnsavedEdits, isSavingBatch,
        displayCategories, filteredRows, totalPages, pagedRows,
        editingRow, setEditingRow, editingRowData, setEditingRowData,
        savingRowKey, deletingRowKey,
        commitDocsContext,
        handleSaveRow, handleSaveAllDirtyRows, handleDiscardAllEdits, handleDeleteRow,
    } = useDocsReview();

    if (!isProcessed) {
        return (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-12">
                {!standalone && <SharedSourceHeader />}
                <div className="bg-surface border border-border rounded-2xl p-10 text-center">
                    <FileSearch size={40} className="text-text-subtle mx-auto mb-4" />
                    <p className="text-text-muted mb-4">No processed data found. Please upload and run the pipeline first.</p>
                    <button
                        onClick={() => router.push('/admin/domain-configuration/data-source-integration')}
                        className="bg-brand hover:bg-brand-hover text-white font-bold py-2 px-6 rounded-xl transition-all cursor-pointer"
                    >
                        Go to Data Configuration
                    </button>
                </div>
            </motion.div>
        );
    }

    const handleSelectCategory = (catId, idx) => {
        setSelectedDocCategory(catId);
        setDocCategoryStep(idx);
        setPage(0);
        handleSearchChange({ target: { value: '' } });
    };

    return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
            {!standalone && <SharedSourceHeader />}

            <ContextTruncationNotice truncation={docsTruncation} noun="documents" />

            {/* Only while the batch's own extraction job is still running/queued —
                once it reaches a terminal status this would just be a redundant
                completed bar sitting above a screen whose whole premise is that
                extraction already finished. Same PipelineRunRow the run modal and
                its minimized dock render, so this can never disagree with them
                about status, percent or the current phase. */}
            {isDocsRunActive && (
                <PipelineRunRow
                    label={DOCS_RUN_META?.label || 'Document Processing'}
                    icon={DOCS_RUN_META?.icon}
                    run={docsRun}
                    compact
                />
            )}

            {!selectedDocCategory ? (
                <DocsCategorySelector
                    displayCategories={displayCategories}
                    onSelectCategory={handleSelectCategory}
                />
            ) : (
                <div className="space-y-5">
                    <DocsCategoryTabs
                        displayCategories={displayCategories}
                        selectedDocCategory={selectedDocCategory}
                        onSelectCategory={handleSelectCategory}
                    />

                    <DocsReviewTable
                        displayCategories={displayCategories}
                        selectedDocCategory={selectedDocCategory}
                        filteredRows={filteredRows}
                        pagedRows={pagedRows}
                        search={search}
                        onSearchChange={handleSearchChange}
                        page={page}
                        setPage={setPage}
                        totalPages={totalPages}
                        PAGE_SIZE={PAGE_SIZE}
                        isCommitted={isCommitted}
                        editingRow={editingRow}
                        setEditingRow={setEditingRow}
                        editingRowData={editingRowData}
                        setEditingRowData={setEditingRowData}
                        savingRowKey={savingRowKey}
                        deletingRowKey={deletingRowKey}
                        handleSaveRow={handleSaveRow}
                        handleDeleteRow={handleDeleteRow}
                    />

                    {/* Navigation footer */}
                    {!standalone ? (
                        <PageFooter>
                            <div className="flex justify-between items-center gap-4">
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => {
                                            if (docCategoryStep === 0) { setSelectedDocCategory(null); }
                                            else {
                                                const prev = displayCategories[docCategoryStep - 1];
                                                handleSelectCategory(prev.id, docCategoryStep - 1);
                                            }
                                        }}
                                        className="flex items-center gap-2 bg-surface-2 hover:bg-surface border border-border text-text-primary font-bold py-3 px-8 rounded-xl text-body-sm transition-all cursor-pointer"
                                    >
                                        <ChevronLeft size={16} />
                                        {docCategoryStep === 0 ? 'Back' : 'Previous'}
                                    </button>
                                    {hasUnsavedEdits && (
                                        <div className="flex items-center gap-2 text-warning text-xs font-bold pl-2">
                                            <span className="w-2 h-2 rounded-full bg-warning animate-pulse" />
                                            <span>{unsavedCount} edited document row(s) pending save</span>
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
                                    {docCategoryStep < displayCategories.length - 1 ? (
                                        <button
                                            onClick={() => {
                                                const next = displayCategories[docCategoryStep + 1];
                                                handleSelectCategory(next.id, docCategoryStep + 1);
                                            }}
                                            className="flex items-center gap-2 bg-brand hover:bg-brand-hover text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-brand/20 text-body-sm transition-all cursor-pointer"
                                        >
                                            Next
                                            <ChevronRight size={16} />
                                        </button>
                                    ) : isCommitted ? (
                                        <CommittedCta />
                                    ) : (
                                        <button
                                            onClick={commitDocsContext}
                                            className="flex items-center gap-2 bg-brand hover:bg-brand-hover text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-brand/20 text-body-sm transition-all cursor-pointer"
                                        >
                                            Configure Context
                                        </button>
                                    )}
                                </div>
                            </div>
                        </PageFooter>
                    ) : (
                        <div className="flex justify-end gap-4 pt-2 pb-16">
                            {isCommitted ? (
                                <CommittedCta />
                            ) : (
                                <button
                                    onClick={commitDocsContext}
                                    className="bg-brand hover:bg-brand-hover text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-brand/20 transition-all cursor-pointer"
                                >
                                    Commit to Database
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}
        </motion.div>
    );
}
