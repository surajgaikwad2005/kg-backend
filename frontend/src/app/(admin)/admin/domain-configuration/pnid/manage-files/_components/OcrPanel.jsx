'use client';

/**
 * OcrPanel — Step 1 of the pipeline: live OCR job status, streaming log, and a
 * result/error summary.
 */
import React from 'react';
import { Terminal, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import PanelShell, { ResultCard } from '@/src/app/(admin)/admin/domain-configuration/pnid/manage-files/_components/PanelShell';
import ProcessLog from '@/src/app/(admin)/admin/domain-configuration/pnid/manage-files/_components/ProcessLog';

export default function OcrPanel({ jobId, jobStatus, jobProgress, currentFile, jobResult, jobError }) {
    const isActive = jobStatus === 'queued' || jobStatus === 'running';

    return (
        <PanelShell
            status={jobStatus}
            icon={Terminal}
            title="Step 1 — OCR Pipeline"
            subtitle={jobId ? `Job ID: ${jobId}` : undefined}
        >
            {isActive && currentFile && (
                <div className="flex items-center gap-3 px-6 py-3 bg-brand text-white text-xs font-bold">
                    <Loader2 size={13} className="animate-spin shrink-0" />
                    <span className="truncate">Processing: {currentFile}</span>
                </div>
            )}

            <ProcessLog entries={jobProgress} running={isActive} />

            {jobStatus === 'done' && jobResult && (
                <div className="px-6 py-5 border-t border-success/20 dark:border-success/20 bg-success/5 dark:bg-success/5">
                    <p className="text-xs font-black text-success uppercase tracking-wider mb-3 flex items-center gap-2">
                        <CheckCircle2 size={14} /> OCR Complete
                    </p>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                        {jobResult.processed_files?.length > 0 && (
                            <ResultCard label="Processed" tone="emerald"><p className="font-bold text-text-primary">{jobResult.processed_files.length} file(s)</p></ResultCard>
                        )}
                        {jobResult.skipped_files?.length > 0 && (
                            <ResultCard label="Skipped" tone="amber"><p className="font-bold text-text-primary">{jobResult.skipped_files.length} file(s)</p></ResultCard>
                        )}
                        {jobResult.ocr_excel_path && (
                            <ResultCard label="Output Excel" className="col-span-2"><p className="font-mono text-label text-text-secondary truncate">{jobResult.ocr_excel_path}</p></ResultCard>
                        )}
                    </div>
                </div>
            )}

            {jobStatus === 'error' && jobError && (
                <div className="px-6 py-5 border-t border-danger/20 dark:border-danger/20 bg-danger/5 dark:bg-danger/5">
                    <p className="text-xs font-black text-danger uppercase tracking-wider mb-2 flex items-center gap-2"><AlertCircle size={14} /> OCR Failed</p>
                    <p className="text-xs text-danger font-medium leading-relaxed">{jobError}</p>
                </div>
            )}
        </PanelShell>
    );
}
