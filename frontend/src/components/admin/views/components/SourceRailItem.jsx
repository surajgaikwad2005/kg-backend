'use client';
import React from 'react';
import { CheckCircle2, Lock, ArrowRight, Plus, Cpu } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { SOURCE_STATUS } from '@/src/components/admin/domainSources';

export function SourceRailItem({ tab }) {
    const { type, icon: Icon, status, tag, isActive, onReview, onAddFiles, onProcess, onClick } = tab;

    const lowerTag = String(tag ?? '').toLowerCase();
    const isHasUnprocessed = lowerTag.includes('unprocessed');
    // A subtype whose files all FAILED has nothing unprocessed and nothing
    // processed, so without this it fell through to `isDone` and rendered in
    // the success palette — a green row for a source that produced no data.
    const isHasFailed = lowerTag.includes('failed');
    const isSelectedTag = tag === 'Selected' || isHasUnprocessed || isHasFailed;
    const isNotDone = isHasUnprocessed || isHasFailed;
    const isCommitted = status === SOURCE_STATUS.COMMITTED && !isNotDone;
    const isProcessed = status === SOURCE_STATUS.PROCESSED && !isNotDone;
    const isValidated = status === SOURCE_STATUS.VALIDATED && !isNotDone;
    const isLocked    = status === SOURCE_STATUS.LOCKED;
    const isDone       = (status === SOURCE_STATUS.UPLOADED || isProcessed || isCommitted) && !isNotDone;
    const hasActions  = Boolean(onReview || onAddFiles || onProcess);

    const wrapCls = isActive
        ? 'bg-brand-muted border-brand/30'
        : isValidated || isSelectedTag
            ? 'bg-warning/[0.06] border-warning/40 hover:border-warning/60'
            : isDone
                ? 'bg-success/[0.06] border-success/40 hover:border-success/60'
                : isLocked
                    ? 'bg-surface border-border opacity-60'
                    : 'bg-surface border-border hover:border-brand/25 hover:bg-brand-muted/40';

    const iconWrapCls = isActive
        ? 'bg-brand/10 text-brand'
        : isValidated || isSelectedTag
            ? 'bg-warning/10 text-warning'
            : isDone
                ? 'bg-success/10 text-success'
                : isLocked
                    ? 'bg-surface-2 text-text-subtle'
                    : 'bg-surface-2 text-text-muted group-hover:bg-brand/10 group-hover:text-brand';

    const labelCls = isActive
        ? 'text-brand'
        : isValidated || isSelectedTag
            ? 'text-warning'
            : isDone
                ? 'text-success'
                : isLocked
                    ? 'text-text-subtle'
                    : 'text-text-primary';

    const tagCls = isActive
        ? 'bg-brand/10 text-brand'
        : isValidated || isSelectedTag
            ? 'bg-warning/10 text-warning'
            : isDone
                ? 'bg-success/10 text-success'
                : 'bg-surface-2 text-text-muted';

    const neutralActionCls = cn(
        'flex items-center gap-1 py-1 px-2 rounded-lg text-label font-bold',
        'bg-surface text-text-muted border border-border',
        'hover:bg-surface-2 hover:text-brand hover:border-brand/30 active:scale-[0.98]',
        'transition-all duration-200 cursor-pointer',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40',
    );

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={onClick}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick?.()}
            aria-disabled={isLocked}
            aria-current={isActive ? 'true' : undefined}
            className={cn(
                'group relative flex w-full flex-col gap-2 rounded-xl border p-3 text-left transition-all duration-200 cursor-pointer',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50',
                wrapCls,
            )}
        >
            <div className="flex items-center gap-2.5 min-w-0">
                <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors duration-200', iconWrapCls)}>
                    {isCommitted ? <CheckCircle2 className="w-4.5 h-4.5" /> : <Icon className="w-4.5 h-4.5" />}
                </div>
                <div className="min-w-0 flex-1">
                    <p className={cn('text-body-sm font-bold leading-tight wrap-break-word transition-colors duration-200', labelCls)}>
                        {type}
                    </p>
                    {tag && (
                        <span className={cn('inline-block mt-1 text-label font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md', tagCls)}>
                            {tag}
                        </span>
                    )}
                </div>
                {isLocked && <Lock className="w-3.5 h-3.5 text-text-subtle shrink-0" aria-hidden="true" />}
            </div>

            {hasActions && (
                <div className="flex items-center gap-1.5 pl-11.5">
                    {onReview && (
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); onReview(); }}
                            aria-label={`Review ${type}`}
                            title={`Review ${type}`}
                            className={cn(
                                'flex items-center gap-1 py-1 px-2 rounded-lg text-label font-bold',
                                'bg-brand/[0.07] text-brand border border-brand/20',
                                'hover:bg-brand/13 hover:border-brand/35 active:scale-[0.98]',
                                'transition-all duration-200 cursor-pointer',
                                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40',
                            )}
                        >
                            Review <ArrowRight size={11} />
                        </button>
                    )}
                    {onAddFiles && (
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); onAddFiles(); }}
                            aria-label={`Add files to ${type}`}
                            title={`Add files to ${type}`}
                            className={neutralActionCls}
                        >
                            <Plus size={11} />
                        </button>
                    )}
                    {onProcess && (
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); onProcess(); }}
                            aria-label={`Process ${type}`}
                            title={`Process pending files in ${type}`}
                            className={neutralActionCls}
                        >
                            <Cpu size={11} />
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
