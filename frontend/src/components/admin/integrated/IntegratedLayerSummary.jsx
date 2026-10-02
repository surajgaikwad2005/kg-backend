'use client';
import React from 'react';
import { CheckCircle2, AlertCircle, Bookmark } from 'lucide-react';
import { Skeleton } from '@/src/components/ui/Skeleton';

export function IntegratedLayerSummary({
    columnsData,
    isLoading = false,
}) {
    if (isLoading) {
        return (
            <div className="p-4 rounded-2xl bg-surface border border-border space-y-2">
                <Skeleton className="h-5 w-48 rounded-md" />
                <Skeleton className="h-4 w-full max-w-2xl rounded-md" />
            </div>
        );
    }

    if (!columnsData) return null;

    const {
        title = 'Domain Intelligence Matrix',
        description = '',
        backed = 0,
        not_yet_backed = 0,
        layers = [],
    } = columnsData;

    return (
        <div className="p-4 sm:p-5 rounded-2xl bg-surface border border-border shadow-xs space-y-3.5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <Bookmark className="w-4 h-4 text-brand shrink-0" />
                        <h3 className="text-sm font-extrabold text-text-primary uppercase tracking-wider">
                            {title}
                        </h3>
                    </div>
                    {description && (
                        <p className="text-body-sm text-text-muted mt-1 leading-relaxed">
                            {description}
                        </p>
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-success/10 border border-success/20 text-success text-xs font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{backed} Backed Columns</span>
                    </div>

                    {not_yet_backed > 0 && (
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-surface-2 border border-border text-text-muted text-xs font-bold">
                            <AlertCircle className="w-3.5 h-3.5 text-warning" />
                            <span>{not_yet_backed} Not Yet Backed</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Architecture Layers & Standards */}
            {Array.isArray(layers) && layers.length > 0 && (
                <div className="pt-3 border-t border-border flex flex-wrap items-center gap-2">
                    {layers.map((l) => {
                        const backedCount = l.fields?.filter((f) => f.status === 'backed').length || 0;
                        const totalCount = l.fields?.length || 0;
                        return (
                            <div
                                key={l.layer}
                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-2 border border-border text-xs"
                                title={`Layer: ${l.layer} | Standard: ${l.standard || 'N/A'}`}
                            >
                                <span className="font-extrabold uppercase text-text-primary text-caption tracking-wider">
                                    {l.layer}
                                </span>
                                <span className="text-text-subtle text-caption font-mono">
                                    {backedCount}/{totalCount}
                                </span>
                                {l.standard && (
                                    <span className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-brand/10 text-brand text-[10px] font-medium border border-brand/20">
                                        {l.standard.split(',')[0]}
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
