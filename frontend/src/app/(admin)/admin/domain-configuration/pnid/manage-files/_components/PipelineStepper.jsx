'use client';

/**
 * PipelineStepper — compact OCR → (Extract) → Compare progress indicator with a
 * close button when the pipeline is idle.
 */
import React from 'react';
import { X } from 'lucide-react';
import { StepDot, StepLine } from '@/src/app/(admin)/admin/domain-configuration/pnid/manage-files/_components/PipelineIndicators';

export default function PipelineStepper({ jobStatus, extractStatus, compareStatus, showExtract, stepCount, canClose, onClose }) {
    return (
        <div className="bg-surface rounded-[24px] border border-border shadow-card px-6 py-4 flex items-center gap-3">
            <StepDot n={1} status={jobStatus} />
            <div className="text-label font-black text-text-muted uppercase tracking-widest shrink-0">OCR</div>
            <StepLine done={jobStatus === 'done' || jobStatus === 'error'} />

            {showExtract && (
                <>
                    <StepDot n={2} status={extractStatus} />
                    <div className="text-label font-black text-text-muted uppercase tracking-widest shrink-0">Extract</div>
                    <StepLine done={extractStatus === 'done' || extractStatus === 'skipped' || extractStatus === 'error'} />
                </>
            )}

            <StepDot n={stepCount} status={compareStatus} />
            <div className="text-label font-black text-text-muted uppercase tracking-widest shrink-0">Compare</div>

            <div className="ml-auto">
                {canClose && (
                    <button onClick={onClose} className="text-text-subtle hover:text-text-secondary transition-colors p-1 cursor-pointer">
                        <X size={15} />
                    </button>
                )}
            </div>
        </div>
    );
}
