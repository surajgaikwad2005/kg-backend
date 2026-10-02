'use client';

/**
 * ExtractPanel — Step 2 (LLM mode, no line list): AI extraction status, log,
 * result summary, and a retry action on failure.
 */
import React from 'react';
import { Cpu, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import PanelShell, { ResultCard } from '@/src/app/(admin)/admin/domain-configuration/pnid/manage-files/_components/PanelShell';
import ProcessLog from '@/src/app/(admin)/admin/domain-configuration/pnid/manage-files/_components/ProcessLog';

export default function ExtractPanel({ status, result, error, progress, currentFile, providerLabel, selectedLlm, onRetry }) {
    const subtitle = status === 'skipped' ? 'Skipped — line list present' : `Provider: ${providerLabel}`;

    return (
        <PanelShell status={status} icon={Cpu} title="Step 2 — AI Extraction" subtitle={subtitle}>
            {status === 'running' && !currentFile && (
                <div className="px-6 py-8 flex flex-col items-center gap-4 bg-surface-2 border-b border-border">
                    <Loader2 size={28} className="animate-spin text-brand" />
                    <p className="text-xs font-black text-text-secondary uppercase tracking-widest animate-pulse">Queueing AI Extraction…</p>
                    {selectedLlm && (
                        <p className="text-label text-text-subtle font-medium">Using <span className="font-black text-brand">{selectedLlm.toUpperCase()}</span></p>
                    )}
                </div>
            )}

            {status === 'running' && currentFile && (
                <div className="flex items-center gap-3 px-6 py-3 bg-brand text-white text-xs font-bold">
                    <Loader2 size={13} className="animate-spin shrink-0" />
                    <span className="truncate">Processing: {currentFile}</span>
                </div>
            )}

            {progress.length > 0 && ['running', 'done', 'error'].includes(status) && (
                <ProcessLog entries={progress} running={status === 'running'} />
            )}

            {(status === 'done' || status === 'skipped') && result && (
                <div className="px-6 py-5 bg-success/5 dark:bg-success/5">
                    <p className="text-xs font-black text-success uppercase tracking-wider mb-3 flex items-center gap-2">
                        <CheckCircle2 size={14} /> {result.skipped ? 'Extraction Skipped' : 'Extraction Complete'}
                    </p>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                        {result.message && <ResultCard label="Message" className="col-span-2"><p className="text-label text-text-secondary leading-relaxed">{result.message}</p></ResultCard>}
                        {result.provider && <ResultCard label="Provider" tone="blue"><p className="font-bold text-brand">{result.provider}</p></ResultCard>}
                        {result.files_processed != null && <ResultCard label="Files Processed" tone="emerald"><p className="font-bold text-text-primary">{result.files_processed}</p></ResultCard>}
                        {result.extraction_result && <ResultCard label="Output Path" className="col-span-2"><p className="font-mono text-label text-text-secondary truncate">{result.extraction_result}</p></ResultCard>}
                        {result.output_files?.length > 0 && (
                            <ResultCard label={`Output Files (${result.output_files.length})`} className="col-span-2">
                                <div className="space-y-1">
                                    {result.output_files.map((f) => <p key={f} className="font-mono text-label text-text-muted truncate">• {f}</p>)}
                                </div>
                            </ResultCard>
                        )}
                    </div>
                </div>
            )}

            {status === 'error' && error && (
                <div className="px-6 py-5 bg-danger/5 dark:bg-danger/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="flex-1">
                        <p className="text-xs font-black text-danger uppercase tracking-wider mb-2 flex items-center gap-2"><AlertCircle size={14} /> Extraction Failed</p>
                        <p className="text-xs text-danger font-medium leading-relaxed">{error}</p>
                    </div>
                    <button onClick={onRetry} className="px-5 py-2.5 bg-danger hover:bg-danger/80 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all shrink-0 cursor-pointer active:scale-95">
                        Retry Extract
                    </button>
                </div>
            )}
        </PanelShell>
    );
}
