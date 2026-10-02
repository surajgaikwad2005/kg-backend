'use client';

/**
 * ConnectorGroupsSummary — the taxonomy breakdown from
 * GET /connectors/{connector}/state?include_groups=true.
 *
 * Only the per-connector endpoint returns `groups[]`; the all-connectors
 * rollup does not, which is the entire reason that endpoint is worth a second
 * request. So this renders ONLY when the grid is filtered to one source —
 * "all sources" has no single connector to ask about, and asking for seven
 * would be seven requests for a strip of sub-rows.
 *
 * The breakdown is what makes a two-flow connector legible: timeseries reports
 * `Metadata Upload` and `Values Upload` as separate groups with their own
 * counts, a split the flat file list can only imply.
 */
import React from 'react';
import { cn } from '@/src/lib/utils';
import { Skeleton } from '@/src/components/ui/Skeleton';
import { useConnectorState } from '@/src/components/admin/_queries/useDsiQueries';
import { CONNECTOR_BY_FLOW } from '@/src/components/admin/connectorState';
import { humanizeKey } from './flowFilePresentation';

/** Count keys worth surfacing per group, in reading order. Zero-valued ones are
 *  dropped at render: seven counters that all read 0 tell the user nothing. */
const COUNT_CHIPS = [
    ['pending', 'pending', 'text-warning'],
    ['processing', 'processing', 'text-info'],
    ['processed', 'processed', 'text-success'],
    ['failed', 'failed', 'text-danger'],
    ['skipped', 'skipped', 'text-text-subtle'],
    ['superseded', 'superseded', 'text-text-subtle'],
];

function GroupRow({ group }) {
    const counts = group.counts || {};
    const chips = COUNT_CHIPS.filter(([key]) => Number(counts[key]) > 0);

    return (
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-2 px-3 rounded-(--do-radius) bg-surface-2/60">
            <div className="min-w-0">
                <p className="text-caption font-semibold text-text-secondary truncate">
                    {group.label || humanizeKey(group.group_key)}
                </p>
                <p className="text-2xs text-text-subtle">
                    {counts.files_total ?? 0} file{(counts.files_total ?? 0) !== 1 ? 's' : ''}
                    {group.group_kind ? ` · ${humanizeKey(group.group_kind)}` : ''}
                </p>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
                {chips.length === 0 ? (
                    <span className="text-2xs text-text-subtle">No activity</span>
                ) : (
                    chips.map(([key, label, tone]) => (
                        <span key={key} className={cn('text-2xs tabular-nums', tone)}>
                            {counts[key]} {label}
                        </span>
                    ))
                )}
            </div>
        </div>
    );
}

export function ConnectorGroupsSummary({ plantCode, flow }) {
    const connector = CONNECTOR_BY_FLOW[flow] || null;

    const { data, isLoading, isError } = useConnectorState(plantCode, connector, {
        includeGroups: true,
        enabled: !!connector,
    });

    if (!connector) return null;

    if (isLoading) {
        return (
            <div className="space-y-1.5" aria-hidden="true">
                {Array.from({ length: 2 }).map((_, i) => (
                    <Skeleton key={`group-skeleton-${i}`} delay={i * 0.08} className="h-11 w-full" />
                ))}
            </div>
        );
    }

    // A failed breakdown is not worth an error state of its own: the file grid
    // beside it is the primary content and is unaffected. Same for a connector
    // the backend reports no groups for.
    if (isError) return null;

    const groups = data?.groups;
    if (!Array.isArray(groups) || groups.length === 0) return null;

    const sorted = [...groups].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

    return (
        <section aria-label={`${connector} breakdown`} className="space-y-1.5">
            <div className="flex items-baseline gap-2 px-1">
                <h4 className="text-2xs font-bold uppercase tracking-widest text-text-muted">Breakdown</h4>
                {data?.status && (
                    <span className="text-2xs text-text-subtle">{humanizeKey(data.status)}</span>
                )}
            </div>
            <div className="space-y-1.5">
                {sorted.map((group) => (
                    <GroupRow key={`${group.group_kind}:${group.group_key}`} group={group} />
                ))}
            </div>
        </section>
    );
}
