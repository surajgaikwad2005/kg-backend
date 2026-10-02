'use client';
import React from 'react';
import { cn } from '@/src/lib/utils';

/**
 * FacetSidebar — a left-hand faceted filter panel for log/run exploration.
 *
 * Each group is a facet (e.g. Status, Source) with values + counts; clicking a
 * value toggles it in the active set. Multi-select within a group. Purely
 * presentational — the parent owns the selected state and does the filtering.
 *
 * @param {Array<{key,label,values:Array<{value,count,dotCls?}>}>} groups
 * @param {Record<string,Set<string>>} selected  groupKey → Set(selected values)
 * @param {(groupKey, value)=>void} onToggle
 */
export function FacetSidebar({ groups = [], selected = {}, onToggle }) {
    return (
        <div className="w-48 shrink-0 space-y-5">
            {groups.map(g => (
                <div key={g.key}>
                    <div className="text-label font-bold text-text-muted uppercase tracking-wider mb-2">{g.label}</div>
                    <div className="space-y-0.5">
                        {g.values.length === 0 && <div className="text-2xs text-text-subtle">—</div>}
                        {g.values.map(v => {
                            const active = selected[g.key]?.has(v.value);
                            return (
                                <button key={v.value} type="button"
                                    onClick={() => onToggle(g.key, v.value)}
                                    className={cn(
                                        'w-full flex items-center gap-2 px-2 py-1 rounded-md text-caption transition-colors cursor-pointer',
                                        active ? 'bg-brand/10 text-brand' : 'text-text-secondary hover:bg-surface-2',
                                    )}>
                                    <span className={cn('w-2 h-2 rounded-sm shrink-0', v.dotCls || 'bg-text-subtle')} />
                                    <span className="flex-1 text-left truncate">{v.label || v.value}</span>
                                    <span className="text-2xs text-text-subtle tabular-nums">{v.count}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}
