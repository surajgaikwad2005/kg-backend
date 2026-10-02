'use client';
import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Skeleton } from '@/src/components/ui/Skeleton';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { cn } from '@/src/lib/utils';

/**
 * Shared loading / empty / error states for every panel on the board, so a
 * slow or offline telemetry backend degrades consistently instead of leaving
 * blank cards behind.
 *
 * Loading uses the project's shimmer `Skeleton` (theme-aware in light, dark and
 * system), never a spinner-only placeholder.
 */

/**
 * Fixed height ramp for the chart shimmer. Deterministic (not random) so the
 * server and client render identical markup, and expressed as utility classes
 * rather than inline styles per the styling rules.
 */
const BAR_HEIGHTS = [
    'h-[38%]', 'h-[62%]', 'h-[45%]', 'h-[78%]', 'h-[52%]', 'h-[88%]',
    'h-[60%]', 'h-[41%]', 'h-[72%]', 'h-[35%]', 'h-[66%]', 'h-[50%]',
];

/** Shimmer stand-in shaped like a trend chart. */
export function ChartSkeleton({ bars = 12, className }) {
    return (
        <div className={cn('flex h-full w-full flex-col gap-3 p-4', className)}>
            <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="ml-auto h-3 w-14" />
            </div>
            <div className="flex min-h-0 flex-1 items-end gap-1.5">
                {Array.from({ length: bars }, (_, i) => (
                    <Skeleton
                        key={`bar-${i}`}
                        delay={i * 0.06}
                        className={cn('w-full rounded-sm', BAR_HEIGHTS[i % BAR_HEIGHTS.length])}
                    />
                ))}
            </div>
        </div>
    );
}

/** Shimmer stand-in for the KPI tile strip. */
export function TileSkeleton({ count = 4 }) {
    return (
        <div className="grid h-full grid-cols-2 gap-3 p-3 sm:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: count }, (_, i) => (
                <div
                    key={`tile-${i}`}
                    className="flex flex-col justify-between gap-2 rounded-lg border border-border bg-canvas p-3"
                >
                    <Skeleton delay={i * 0.08} className="h-2.5 w-3/4" />
                    <Skeleton delay={i * 0.08 + 0.1} className="h-6 w-1/2" />
                    <Skeleton delay={i * 0.08 + 0.2} className="h-2 w-2/3" />
                </div>
            ))}
        </div>
    );
}

/** Recoverable failure with a retry affordance. */
export function PanelError({ message, onRetry }) {
    return (
        <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-danger/20 bg-danger/10">
                <AlertCircle aria-hidden="true" className="h-6 w-6 text-danger" />
            </div>
            <div>
                <p className="text-sm font-bold text-text-primary">Telemetry unavailable</p>
                <p className="mx-auto mt-1 max-w-[26ch] text-xs leading-relaxed text-text-muted">
                    {message || 'The plant data service did not return a reading for this window.'}
                </p>
            </div>
            {onRetry && (
                <button
                    type="button"
                    onClick={onRetry}
                    className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-surface px-3 py-1.5 text-tiny font-black uppercase tracking-wider text-text-secondary transition-colors duration-(--duration-fast) hover:border-border-strong hover:text-text-primary"
                >
                    <RefreshCw aria-hidden="true" className="h-3 w-3" />
                    Retry
                </button>
            )}
        </div>
    );
}

/** Successful call, nothing to draw. */
export function PanelEmpty({ icon, title, description, action }) {
    return (
        <div className="flex h-full items-center justify-center">
            <EmptyState icon={icon} title={title} description={description} action={action} className="py-6" />
        </div>
    );
}

/**
 * PanelContent — one place that decides between loading / error / empty /
 * content, so every panel on the board resolves its states identically instead
 * of each repeating the same ternary ladder.
 */
export function PanelContent({ loading, error, isEmpty, skeleton, empty, onRetry, children }) {
    if (loading) return skeleton ?? <ChartSkeleton />;
    if (error) return <PanelError message={error} onRetry={onRetry} />;
    if (isEmpty) return empty ?? <PanelEmpty title="No data for this window" />;
    return children;
}
