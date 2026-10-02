'use client';

/**
 * ActionBar — selection summary + primary actions (delete selected, process,
 * validate).
 * - 0 files selected: both Process Selected and Validate Results are DISABLED.
 * - Any selected file is unextracted: Validate Results is HIDDEN, Process Selected is ENABLED.
 * - All selected files extracted: Validate Results is ENABLED.
 */
import React, { useState } from 'react';
import { CheckSquare, Trash2, Play, Loader2, ShieldCheck, AlertCircle } from 'lucide-react';
import { ConfirmDialog } from '@/src/components/ui/ConfirmDialog';

export default function ActionBar({
    totalSelected,
    unextractedSelectedCount = 0,
    hasExtractedFiles = false,
    isSubmitting = false,
    isPipelineActive = false,
    onProcess,
    onValidate,
    onDeleteSelected,
}) {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteConfirm = async () => {
        setIsDeleting(true);
        try {
            await onDeleteSelected?.();
        } finally {
            setIsDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    const isSelectionEmpty = totalSelected === 0;
    const hasUnextractedSelected = unextractedSelectedCount > 0;

    return (
        <>
            <div className="bg-surface rounded-[32px] border border-border p-6 shadow-card flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-muted text-brand flex items-center justify-center border border-brand/20">
                        <CheckSquare size={20} />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-text-primary uppercase tracking-tight">Selected Files</h3>
                        <div className="flex items-center gap-2">
                            <p className="text-caption font-bold text-text-muted">{totalSelected} file(s) selected</p>
                            {unextractedSelectedCount > 0 && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-warning/10 text-warning border border-warning/30">
                                    <AlertCircle size={10} />
                                    {unextractedSelectedCount} unextracted
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                    <button
                        disabled={isSelectionEmpty || isDeleting}
                        onClick={() => setShowDeleteConfirm(true)}
                        className="px-5 py-3 bg-surface border border-border hover:bg-danger/10 text-text-muted hover:text-danger hover:border-danger/20 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                        Delete Selected
                    </button>

                    {/* Case 1: 0 files selected -> Render both Process Selected & Validate Results disabled */}
                    {isSelectionEmpty && (
                        <>
                            <button
                                disabled={true}
                                className="px-6 py-3 bg-brand text-white font-bold text-xs uppercase tracking-wider rounded-xl opacity-40 cursor-not-allowed flex items-center gap-2"
                            >
                                <Play size={14} /> Process Selected
                            </button>
                            <button
                                disabled={true}
                                className="px-6 py-3 bg-success text-white font-bold text-xs uppercase tracking-wider rounded-xl opacity-40 cursor-not-allowed flex items-center gap-2"
                            >
                                <ShieldCheck size={14} /> Validate Results
                            </button>
                        </>
                    )}

                    {/* Case 2: Files selected and at least one is NOT extracted -> Show Process Selected, HIDE Validate Results */}
                    {!isSelectionEmpty && hasUnextractedSelected && (
                        <button
                            disabled={isSubmitting || isPipelineActive}
                            onClick={onProcess}
                            aria-busy={isSubmitting}
                            className="px-6 py-3 bg-brand hover:bg-brand-hover text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
                            {isSubmitting ? 'Processing…' : `Process Selected (${unextractedSelectedCount})`}
                        </button>
                    )}

                    {/* Case 3: Files selected and ALL selected files ARE extracted -> Show Validate Results enabled */}
                    {!isSelectionEmpty && !hasUnextractedSelected && (
                        <button
                            onClick={onValidate}
                            className="px-6 py-3 bg-success hover:bg-success/80 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95 duration-200"
                        >
                            <ShieldCheck size={14} /> Validate Results
                        </button>
                    )}
                </div>
            </div>

            <ConfirmDialog
                open={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={handleDeleteConfirm}
                title="Delete Selected Files?"
                description={`Are you sure you want to delete ${totalSelected} selected file(s)? This action cannot be undone.`}
                confirmLabel="Delete Files"
                cancelLabel="Cancel"
                intent="danger"
                isPending={isDeleting}
            />
        </>
    );
}
