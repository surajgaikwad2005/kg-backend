'use client';
import React from 'react';
import { LayoutGrid, RefreshCw } from 'lucide-react';
import TimeSelector from '@/src/components/ui/TimeSelector';
import { cn } from '@/src/lib/utils';

/**
 * BoardToolbar — the control strip shared by every draggable board under
 * compressor-details (the train board and the single-equipment detail board).
 *
 * The right-hand cluster (shared time window + refresh + reset layout) is
 * identical on both, so it lives here once; each board contributes only its own
 * selectors through `children`. Composition over duplication — adding a third
 * board should never mean re-implementing these three controls again.
 *
 * @param {object}   props
 * @param {React.ReactNode} [props.children]   — board-specific controls (left side)
 * @param {Function} props.onRefresh
 * @param {Function} props.onResetLayout
 * @param {boolean}  [props.canResetLayout]    — false when already at the default
 * @param {boolean}  [props.isRefreshing]
 */
export function BoardToolbar({
    children,
    onRefresh,
    onResetLayout,
    canResetLayout,
    isRefreshing,
    className,
}) {
    return (
        <div
            className={cn(
                'flex shrink-0 flex-wrap items-center gap-2 border-b border-border bg-surface px-4 py-2.5 sm:px-6',
                className
            )}
        >
            {children}

            <div className="ml-auto flex items-center gap-2">
                <TimeSelector compact />

                <button
                    type="button"
                    onClick={onRefresh}
                    disabled={isRefreshing}
                    aria-busy={isRefreshing}
                    aria-label="Refresh telemetry"
                    title="Refresh telemetry"
                    className="flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 text-text-secondary transition-all duration-(--duration-fast) hover:border-border-strong hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <RefreshCw aria-hidden="true" className={cn('h-3.5 w-3.5', isRefreshing && 'animate-spin')} />
                </button>

                <button
                    type="button"
                    onClick={onResetLayout}
                    disabled={!canResetLayout}
                    aria-label="Reset panel layout"
                    title={canResetLayout ? 'Reset panel layout' : 'Layout is already at its default'}
                    className="flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 text-xs font-bold text-text-secondary transition-all duration-(--duration-fast) hover:border-border-strong hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40"
                >
                    <LayoutGrid aria-hidden="true" className="h-3.5 w-3.5" />
                    <span className="hidden lg:inline">Reset layout</span>
                </button>
            </div>
        </div>
    );
}
