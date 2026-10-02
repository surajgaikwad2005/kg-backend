'use client';
import React from 'react';
import { Layers } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { Tooltip } from '@/src/components/ui/Tooltip';

export function IntegratedViewHeader({
    isIntegrated = true,
    onToggleView,
    canToggle = true,
    disabledReason,
}) {
    return (
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-border">
            <div className="min-w-0">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-brand/10 text-brand flex items-center justify-center shrink-0">
                        <Layers className="w-4 h-4" />
                    </div>
                    <div>
                        <h2 className="text-title font-extrabold text-text-primary tracking-tight">
                            Integrated Domain Intelligence Review
                        </h2>
                        <p className="text-body-sm text-text-muted mt-0.5">
                            Consolidated tabular view across Integrity, Reliability, Production, and Maintenance domains
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
                {/* Segmented View Toggle Button */}
                <div className="inline-flex p-1 rounded-xl bg-surface-2 border border-border">
                    <button
                        type="button"
                        onClick={() => onToggleView && onToggleView(false)}
                        className={cn(
                            'px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer',
                            !isIntegrated
                                ? 'bg-surface text-text-primary shadow-xs'
                                : 'text-text-muted hover:text-text-primary'
                        )}
                    >
                        Source Review
                    </button>

                    <Tooltip label={!canToggle ? (disabledReason || 'Process data first to unlock Integrated View') : ''}>
                        <button
                            type="button"
                            disabled={!canToggle}
                            onClick={() => onToggleView && onToggleView(true)}
                            aria-pressed={isIntegrated}
                            className={cn(
                                'flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all',
                                !canToggle
                                    ? 'opacity-40 cursor-not-allowed text-text-subtle'
                                    : isIntegrated
                                        ? 'bg-brand text-white shadow-xs cursor-pointer'
                                        : 'text-text-muted hover:text-text-primary cursor-pointer'
                            )}
                        >
                            <span className={cn('w-1.5 h-1.5 rounded-full', isIntegrated ? 'bg-white animate-pulse' : 'bg-text-subtle')} />
                            Integrated View
                        </button>
                    </Tooltip>
                </div>
            </div>
        </div>
    );
}
