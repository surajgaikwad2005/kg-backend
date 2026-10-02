'use client';
import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSourceTabs } from '@/src/components/admin/views/hooks/useSourceTabs';
import { useAdminEntities } from '@/src/components/admin/AdminPanelContext';
import { cn } from '@/src/lib/utils';
import { Tooltip } from '@/src/components/ui/Tooltip';

export function SharedSourceHeader({ actions }) {
    const { showTabs, view, viewLabel } = useSourceTabs();
    const { processedSources, committedSources, validatedSources } = useAdminEntities();
    const router = useRouter();
    const searchParams = useSearchParams();

    if (!showTabs) return null;

    const isIntegrated = view === 'integrated-review';
    const isReviewView = view !== 'data-config';

    const hasProcessedData = (processedSources?.size ?? 0) > 0 ||
        (committedSources?.size ?? 0) > 0 ||
        (validatedSources?.size ?? 0) > 0;

    const handleToggle = (toIntegrated) => {
        if (toIntegrated) {
            router.push(`/admin/domain-configuration/data-source-integration/review?view=integrated-review&source_view=${view}`);
        } else {
            const previousView = searchParams.get('source_view') || 'ts-review';
            router.push(`/admin/domain-configuration/data-source-integration/review?view=${previousView}`);
        }
    };

    return (
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2">
            <div className="min-w-0">
                <h2 className="text-title font-extrabold text-text-primary tracking-tight">
                    {viewLabel}
                </h2>
                <p className="text-body-sm text-text-muted mt-0.5">
                    {view === 'data-config'
                        ? 'Select a source to begin orchestration'
                        : isIntegrated
                            ? 'Consolidated tabular view across Integrity, Reliability, Production, and Maintenance domains'
                            : 'Review and validate extracted relationships'
                    }
                </p>
            </div>

            {actions ? (
                <div className="shrink-0">{actions}</div>
            ) : isReviewView ? (
                <div className="inline-flex p-1 rounded-xl bg-surface-2 border border-border shrink-0">
                    <button
                        type="button"
                        onClick={() => handleToggle(false)}
                        className={cn(
                            'px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer',
                            !isIntegrated
                                ? 'bg-surface text-text-primary shadow-xs'
                                : 'text-text-muted hover:text-text-primary'
                        )}
                    >
                        Source Review
                    </button>

                    <Tooltip label={!hasProcessedData ? 'Process at least one data source to unlock Integrated View' : ''}>
                        <button
                            type="button"
                            disabled={!hasProcessedData}
                            onClick={() => handleToggle(true)}
                            aria-pressed={isIntegrated}
                            className={cn(
                                'flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all',
                                !hasProcessedData
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
            ) : null}
        </div>
    );
}
