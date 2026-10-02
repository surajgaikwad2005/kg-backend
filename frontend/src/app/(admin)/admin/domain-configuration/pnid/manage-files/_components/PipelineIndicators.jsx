'use client';

/**
 * Shared pipeline status visuals: StatusBadge, StepDot, StepLine, and the
 * panel colour helpers (border / header / icon) keyed by step status. Reused by
 * the stepper and every pipeline panel so colours stay consistent.
 */
import React from 'react';
import { Clock, Loader2, CheckCircle2, AlertCircle, X } from 'lucide-react';

const BADGE = {
    queued: { label: 'Queued', cls: 'bg-warning/10 dark:bg-warning/10 border-warning/20 dark:border-warning/30 text-warning', icon: <Clock size={11} /> },
    running: { label: 'Running', cls: 'bg-brand-muted dark:bg-brand/10 border-brand/20 dark:border-brand/30 text-brand', icon: <Loader2 size={11} className="animate-spin" /> },
    done: { label: 'Done', cls: 'bg-success/10 dark:bg-success/10 border-success/20 dark:border-success/30 text-success', icon: <CheckCircle2 size={11} /> },
    error: { label: 'Error', cls: 'bg-danger/10 dark:bg-danger/10 border-danger/20 dark:border-danger/30 text-danger', icon: <AlertCircle size={11} /> },
    skipped: { label: 'Skipped', cls: 'bg-surface-2 border-border text-text-muted', icon: <X size={11} /> },
    blocked: { label: 'Blocked', cls: 'bg-danger/10 dark:bg-danger/10 border-danger/20 dark:border-danger/30 text-danger', icon: <X size={11} /> },
    idle: { label: 'Waiting', cls: 'bg-surface-2 border-border text-text-subtle', icon: <Clock size={11} /> },
};

export function StatusBadge({ status }) {
    const { label, cls, icon } = BADGE[status] ?? BADGE.idle;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-label font-black uppercase tracking-wider ${cls}`}>
            {icon}{label}
        </span>
    );
}

const isDone = (s) => s === 'done' || s === 'skipped';
const isErr = (s) => s === 'error' || s === 'blocked';

export const panelBorder = (s) =>
    isDone(s) ? 'border-success/20 dark:border-success/30' : isErr(s) ? 'border-danger/20 dark:border-danger/30' : 'border-brand/20 dark:border-brand/30';
export const panelHeader = (s) =>
    isDone(s) ? 'bg-success/5 dark:bg-success/10 border-success/10 dark:border-success/20' : isErr(s) ? 'bg-danger/5 dark:bg-danger/10 border-danger/10 dark:border-danger/20' : 'bg-brand-muted/60 dark:bg-brand/10 border-brand/10 dark:border-brand/20';
export const panelIcon = (s) =>
    isDone(s) ? 'bg-success/10 dark:bg-success/20 border-success/20 dark:border-success/30 text-success' : isErr(s) ? 'bg-danger/10 dark:bg-danger/20 border-danger/20 dark:border-danger/30 text-danger' : 'bg-brand-muted dark:bg-brand/20 border-brand/20 dark:border-brand/30 text-brand';

export function StepDot({ n, status }) {
    const done = isDone(status);
    const active = status === 'running' || status === 'queued';
    const errored = isErr(status);
    return (
        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-label font-black border-2 transition-all ${
            done ? 'bg-success border-success text-white'
                : errored ? 'bg-danger border-danger text-white'
                : active ? 'bg-brand border-brand text-white'
                : 'bg-surface border-border-strong text-text-subtle'
        }`}>
            {done ? <CheckCircle2 size={13} /> : errored ? <AlertCircle size={13} /> : n}
        </div>
    );
}

export function StepLine({ done }) {
    return <div className={`flex-1 h-0.5 transition-all ${done ? 'bg-success/40 dark:bg-success/50' : 'bg-border'}`} />;
}
