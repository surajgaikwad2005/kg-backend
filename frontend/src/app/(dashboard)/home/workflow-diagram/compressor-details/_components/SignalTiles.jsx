'use client';
import React, { useMemo } from 'react';
import { Activity, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { formatDeltaPct, formatReading } from '../_utils/telemetryStats';

/**
 * SignalTiles — the live reading strip that replaced the page's three invented
 * "Integrity / Reliability / Process" score gauges.
 *
 * Every figure comes from the samples POST /createVisual actually returned:
 * latest reading, movement across the selected window, and the min–max band the
 * signal occupied. Nothing is scored or synthesized.
 */

/** Tiny inline trend line. `currentColor` keeps it on the tile's token color. */
function Sparkline({ values, className }) {
    const path = useMemo(() => {
        if (!values || values.length < 2) return null;
        const min = Math.min(...values);
        const max = Math.max(...values);
        const span = max - min || 1;
        const step = 100 / (values.length - 1);
        return values
            .map((v, i) => `${i === 0 ? 'M' : 'L'} ${(i * step).toFixed(2)} ${(28 - ((v - min) / span) * 26).toFixed(2)}`)
            .join(' ');
    }, [values]);

    if (!path) return null;
    return (
        <svg
            aria-hidden="true"
            viewBox="0 0 100 30"
            preserveAspectRatio="none"
            className={cn('h-7 w-full', className)}
        >
            <path d={path} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        </svg>
    );
}

function DeltaBadge({ deltaPct }) {
    const text = formatDeltaPct(deltaPct);
    if (text === null) return null;

    const flat = Math.abs(deltaPct) < 0.05;
    const Icon = flat ? Minus : deltaPct > 0 ? TrendingUp : TrendingDown;
    const tone = flat ? 'text-text-muted' : deltaPct > 0 ? 'text-success' : 'text-danger';

    return (
        <span className={cn('flex items-center gap-1 text-tiny font-black tabular-nums', tone)}>
            <Icon aria-hidden="true" className="h-3 w-3" />
            {text}
        </span>
    );
}

function SignalTile({ summary }) {
    const { label, unit, latest, min, max, deltaPct, inBand, values, hasData } = summary;

    return (
        <article
            className={cn(
                'flex min-w-0 flex-col justify-between gap-2 rounded-lg border p-3',
                'transition-all duration-(--duration-base) hover:-translate-y-0.5 hover:shadow-panel',
                inBand ? 'border-border bg-canvas' : 'border-warning/30 bg-warning/5'
            )}
        >
            <header className="flex items-start justify-between gap-2">
                <h3 className="min-w-0 truncate text-tiny font-black uppercase tracking-wider text-text-muted" title={label}>
                    {label}
                </h3>
                <span
                    aria-hidden="true"
                    className={cn(
                        'mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full',
                        !hasData ? 'bg-text-subtle' : inBand ? 'bg-success' : 'animate-pulse bg-warning'
                    )}
                />
            </header>

            <div className="flex items-baseline gap-1.5">
                <span className="truncate text-xl font-black tabular-nums tracking-tight text-text-primary">
                    {formatReading(latest)}
                </span>
                {unit && <span className="shrink-0 text-tiny font-bold uppercase text-text-subtle">{unit}</span>}
            </div>

            <div className={cn('-mx-0.5', inBand ? 'text-brand' : 'text-warning')}>
                <Sparkline values={values} />
            </div>

            <footer className="flex items-center justify-between gap-2">
                <DeltaBadge deltaPct={deltaPct} />
                <span className="truncate text-tiny font-semibold tabular-nums text-text-subtle">
                    {formatReading(min)} – {formatReading(max)}
                </span>
            </footer>
        </article>
    );
}

export function SignalTiles({ summaries }) {
    return (
        <div className="grid h-full auto-rows-fr grid-cols-2 gap-3 overflow-y-auto p-3 sm:grid-cols-3 xl:grid-cols-4">
            {summaries.map((summary) => (
                <SignalTile key={summary.id || summary.tag} summary={summary} />
            ))}
        </div>
    );
}

export const SignalTilesIcon = Activity;
