'use client';

/**
 * IngestionLoader — progress overlay shown while a workspace is being ingested.
 * Reflects the upload progress (%) and the current pipeline step.
 */
import React from 'react';
import { Check, Loader2 } from 'lucide-react';

const STEP_LABELS = {
    1: 'Connecting…',
    2: 'Ingesting archives…',
    3: 'Parsing vectors…',
    4: 'Finalizing manifest…',
};

function ChecklistItem({ done, active, children }) {
    return (
        <div className="flex items-center gap-3 text-xs font-bold">
            {done ? (
                <span className="w-5 h-5 flex items-center justify-center rounded-full bg-success/10 dark:bg-success/20 text-success dark:text-success shrink-0">
                    <Check size={12} strokeWidth={3} />
                </span>
            ) : (
                <span className="w-5 h-5 border border-border rounded-full flex items-center justify-center shrink-0">
                    {active && <span className="w-1.5 h-1.5 rounded-full bg-text-subtle animate-ping" />}
                </span>
            )}
            <span className={done ? 'text-text-secondary' : 'text-text-subtle'}>{children}</span>
        </div>
    );
}

export default function IngestionLoader({ plantCode, progress, step }) {
    return (
        <div className="bg-surface rounded-[40px] border border-border shadow-login p-12 max-w-xl w-full text-center space-y-8 animate-in fade-in duration-300">
            <Loader2 className="w-16 h-16 mx-auto text-brand animate-spin" />
            <div className="space-y-3">
                <h3 className="text-2xl font-black text-text-primary uppercase tracking-tight">Ingesting Client Records</h3>
                <p className="text-xs text-text-subtle font-bold max-w-xs mx-auto leading-relaxed">
                    Uploading files to client directory and indexing P&ID sheets.
                </p>
            </div>

            <div className="space-y-2">
                <div className="w-full bg-surface-2 rounded-full h-3 overflow-hidden shadow-inner">
                    <div
                        style={{ '--progress': `${progress}%` }}
                        className="bg-gradient-to-r from-brand to-highlight h-full rounded-full transition-all duration-300 w-[var(--progress)]"
                    />
                </div>
                <div className="flex justify-between text-caption font-bold text-text-subtle font-mono">
                    <span>{progress}% UPLOADED</span>
                    <span className="uppercase text-brand">{STEP_LABELS[step]}</span>
                </div>
            </div>

            <div className="border-t border-border pt-6 text-left space-y-3 max-w-sm mx-auto">
                <ChecklistItem done>Establish Plant context: {plantCode}</ChecklistItem>
                <ChecklistItem done={step >= 2} active>Ingest source PDF and Excel sheets</ChecklistItem>
                <ChecklistItem done={step >= 3}>Process layout shape extraction</ChecklistItem>
            </div>
        </div>
    );
}
