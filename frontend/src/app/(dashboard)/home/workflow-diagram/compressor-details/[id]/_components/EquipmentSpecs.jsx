'use client';
import React, { useMemo } from 'react';
import { Link2Off } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { Skeleton } from '@/src/components/ui/Skeleton';

/**
 * EquipmentSpecs — what this page actually knows about the node, and nothing
 * more. Every row is a fact already resolved elsewhere on screen (the drawing's
 * origin, the P1 asset the node was bound to, how many of its signals exist and
 * how many are charted) rather than an invented rating.
 *
 * This replaces the previous page's "Availability 98.2% / Efficiency 85.4% /
 * MTBF 720 Hrs" tile grid, which was a hardcoded constant array persisted to
 * localStorage — the same six numbers for every equipment on every plant.
 */

const SOURCE_LABEL = {
    plant: 'Plant component library',
    library: 'Built-in equipment library',
};

function SpecRow({ label, value, tone = 'default', title }) {
    return (
        <div className="flex items-baseline justify-between gap-3 py-2">
            <dt className="shrink-0 text-tiny font-black uppercase tracking-wider text-text-subtle">
                {label}
            </dt>
            <dd
                title={title || (typeof value === 'string' ? value : undefined)}
                className={cn(
                    'min-w-0 truncate text-right text-xs font-bold',
                    tone === 'muted' ? 'text-text-muted' : 'text-text-secondary',
                    tone === 'warning' && 'text-warning'
                )}
            >
                {value}
            </dd>
        </div>
    );
}

export function EquipmentSpecs({
    componentType,
    graphic,
    graphicLoading,
    equipment,
    isUnbound,
    tagCount,
    chartedCount,
    fleet,
    loading,
}) {
    const rows = useMemo(
        () => [
            {
                key: 'type',
                label: 'Component type',
                value: componentType,
                title: componentType,
            },
            {
                key: 'drawing',
                label: 'Drawing source',
                value: graphicLoading
                    ? 'Resolving…'
                    : graphic
                        ? SOURCE_LABEL[graphic.source]
                        : 'Not available',
                tone: !graphicLoading && !graphic ? 'muted' : 'default',
            },
            {
                key: 'asset',
                label: 'Bound asset',
                value: loading ? 'Resolving…' : equipment ? equipment.label : 'Not bound',
                tone: isUnbound ? 'warning' : 'default',
                title: equipment ? `${equipment.label} (${equipment.id})` : undefined,
            },
            {
                key: 'signals',
                label: 'Signals available',
                value: loading ? '—' : String(tagCount),
            },
            {
                key: 'charted',
                label: 'Signals charted',
                value: loading ? '—' : `${chartedCount} of ${tagCount}`,
            },
            {
                key: 'band',
                label: 'Within ±2σ band',
                value:
                    fleet.healthPct === null
                        ? '—'
                        : `${fleet.inBand} of ${fleet.tracked}`,
                tone: fleet.deviating > 0 ? 'warning' : 'default',
            },
        ],
        [componentType, graphic, graphicLoading, equipment, isUnbound, tagCount, chartedCount, fleet, loading]
    );

    return (
        <div className="flex h-full flex-col overflow-y-auto p-4">
            {isUnbound && (
                <div className="mb-3 flex shrink-0 items-start gap-2 rounded-lg border border-warning/25 bg-warning/5 p-2.5">
                    <Link2Off aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" />
                    <p className="text-tiny font-semibold leading-relaxed text-text-secondary">
                        No asset on this plant matches this node, so there is no telemetry to
                        chart. Pin one from the toolbar to bind it.
                    </p>
                </div>
            )}

            <dl className="divide-y divide-border">
                {rows.map((row) =>
                    loading && row.key === 'asset' ? (
                        <div key={row.key} className="flex items-center justify-between gap-3 py-2">
                            <dt className="text-tiny font-black uppercase tracking-wider text-text-subtle">
                                {row.label}
                            </dt>
                            <dd className="min-w-0 flex-1">
                                <Skeleton className="ml-auto h-3 w-24" />
                            </dd>
                        </div>
                    ) : (
                        <SpecRow
                            key={row.key}
                            label={row.label}
                            value={row.value}
                            tone={row.tone}
                            title={row.title}
                        />
                    )
                )}
            </dl>
        </div>
    );
}
