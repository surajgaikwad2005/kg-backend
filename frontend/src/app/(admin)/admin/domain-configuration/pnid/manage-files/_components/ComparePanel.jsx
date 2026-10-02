'use client';

/**
 * ComparePanel — final pipeline step: filters OCR output against the line-list
 * baseline. Shows before/removed/remaining counts, output paths, a "Validate
 * Results" CTA on success, and a retry on error/blocked.
 */
import React from 'react';
import { GitMerge, Loader2, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import PanelShell, { ResultCard } from '@/src/app/(admin)/admin/domain-configuration/pnid/manage-files/_components/PanelShell';

function CountCard({ label, value, tone }) {
    const color = { before: 'text-text-primary', removed: 'text-danger', after: 'text-success' }[tone];
    const border = { before: 'border-border', removed: 'border-danger/20 dark:border-danger/30', after: 'border-success/20 dark:border-success/30' }[tone];
    return (
        <div className={`bg-surface rounded-xl border p-3 text-center ${border}`}>
            <p className="font-black text-text-subtle uppercase tracking-wider text-2xs mb-1">{label}</p>
            <p className={`font-black text-2xl ${color}`}>{value}</p>
            <p className="text-2xs text-text-subtle uppercase tracking-wider">rows</p>
        </div>
    );
}

export default function ComparePanel({ stepCount, status, result, error, onRetry, onValidate }) {
    return (
        <PanelShell
            status={status}
            icon={GitMerge}
            title={`Step ${stepCount} — Compare & Clean`}
            subtitle="OCR output filtered against line list baseline"
        >
            {status === 'running' && (
                <div className="px-6 py-8 flex flex-col items-center gap-3 bg-surface-2">
                    <Loader2 size={28} className="animate-spin text-brand" />
                    <p className="text-xs font-black text-text-secondary uppercase tracking-widest animate-pulse">Comparing OCR vs Line List…</p>
                </div>
            )}

            {status === 'done' && result && (
                <div className="px-6 py-5 bg-success/5 dark:bg-success/5">
                    <p className="text-xs font-black text-success uppercase tracking-wider mb-4 flex items-center gap-2">
                        <CheckCircle2 size={14} /> Pipeline Complete
                    </p>
                    <div className="grid grid-cols-3 gap-3 text-xs mb-4">
                        {result.rows_before != null && <CountCard label="Before" value={result.rows_before} tone="before" />}
                        {result.rows_removed != null && <CountCard label="Removed" value={result.rows_removed} tone="removed" />}
                        {result.rows_after != null && <CountCard label="Remaining" value={result.rows_after} tone="after" />}
                    </div>
                    <div className="grid grid-cols-1 gap-2 text-xs">
                        {result.ocr_excel && <ResultCard label="Filtered OCR Excel"><p className="font-mono text-label text-text-secondary truncate">{result.ocr_excel}</p></ResultCard>}
                        {result.linelist && <ResultCard label="Line List Used"><p className="font-mono text-label text-text-secondary truncate">{result.linelist}</p></ResultCard>}
                    </div>
                    <div className="mt-5 flex justify-end">
                        <button onClick={onValidate} className="px-6 py-3.5 bg-brand hover:bg-brand-hover text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95">
                            <ShieldCheck size={14} /> Validate Results
                        </button>
                    </div>
                </div>
            )}

            {(status === 'error' || status === 'blocked') && error && (
                <div className="px-6 py-5 bg-danger/5 dark:bg-danger/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="flex-1">
                        <p className="text-xs font-black text-danger uppercase tracking-wider mb-2 flex items-center gap-2">
                            <AlertCircle size={14} /> {status === 'blocked' ? 'Compare Blocked' : 'Compare Failed'}
                        </p>
                        <p className="text-xs text-danger font-medium leading-relaxed">{error}</p>
                    </div>
                    <button onClick={onRetry} className="px-5 py-2.5 bg-danger hover:bg-danger/80 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all shrink-0 cursor-pointer active:scale-95">
                        Retry Compare
                    </button>
                </div>
            )}
        </PanelShell>
    );
}
