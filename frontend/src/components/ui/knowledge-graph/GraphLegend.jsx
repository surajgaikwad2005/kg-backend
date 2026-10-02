'use client';

/**
 * GraphLegend — reusable collapsible colour/type key for the knowledge graph.
 * Dynamically computes live counts per distinct node type, with matching
 * distinct colors and labels for each type present in the dataset.
 *
 * @param {{ labels?: string[], type?: string, properties?: object }[]} [nodes]
 * @param {Record<string|number, number>} [counts]
 * @param {boolean} [hideZero]  default true — omit types with a count of 0
 * @param {string}  [className]
 * @param {boolean} [defaultOpen] default true
 */
import React, { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Info, Eye, EyeOff } from 'lucide-react';
import { getNodeType, getTypeConfig, GROUP_CONFIG, groupOf } from './groups';
import { cn } from '@/src/lib/utils';

export default function GraphLegend({
    nodes,
    counts: countsProp,
    hiddenGroups,
    onToggleGroup,
    hideZero = true,
    className,
    defaultOpen = true,
}) {
    const [open, setOpen] = useState(defaultOpen);

    // Compute live distinct node type counts
    const typeTally = useMemo(() => {
        if (countsProp) return countsProp;
        const tally = {};
        (nodes || []).forEach((n) => {
            const type = getNodeType(n);
            tally[type] = (tally[type] || 0) + 1;
        });
        return tally;
    }, [countsProp, nodes]);

    // Build item list with distinct colors and counts
    const items = useMemo(() => {
        if (nodes && Array.isArray(nodes)) {
            // Derived from actual nodes present
            const uniqueTypes = Object.keys(typeTally);
            const list = uniqueTypes.map((typeKey) => {
                const config = getTypeConfig(typeKey);
                const isHidden = hiddenGroups
                    ? hiddenGroups.has(typeKey) || hiddenGroups.has(groupOf(typeKey))
                    : false;
                return {
                    key: typeKey,
                    label: config.label || typeKey,
                    color: config.color,
                    count: typeTally[typeKey] || 0,
                    isHidden,
                };
            });
            // Sort by count descending, then alphabetical
            list.sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
            return hideZero ? list.filter((it) => it.count > 0) : list;
        }

        // Fallback when only counts dictionary is provided
        const list = Object.keys(typeTally).map((key) => {
            const isNum = !isNaN(Number(key));
            const config = isNum ? (GROUP_CONFIG[Number(key)] || getTypeConfig(key)) : getTypeConfig(key);
            const isHidden = hiddenGroups
                ? hiddenGroups.has(key) || (isNum && hiddenGroups.has(Number(key))) || hiddenGroups.has(groupOf(key))
                : false;
            return {
                key,
                label: config.label || String(key),
                color: config.color,
                count: typeTally[key] || 0,
                isHidden,
            };
        });
        list.sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
        return hideZero ? list.filter((it) => it.count > 0) : list;
    }, [nodes, typeTally, hideZero, hiddenGroups]);

    const total = useMemo(() => {
        return items.reduce((sum, it) => sum + (it.count || 0), 0);
    }, [items]);

    const hiddenCount = useMemo(() => {
        return items.filter((it) => it.isHidden).length;
    }, [items]);

    // Nothing to show — don't render an empty card
    if (items.length === 0) return null;

    const Chevron = open ? ChevronDown : ChevronUp;

    return (
        <div
            className={cn(
                'w-64 rounded-2xl border border-border bg-surface/90 backdrop-blur-xl shadow-card select-none overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300',
                className,
            )}
        >
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                className="w-full flex items-center gap-2 px-3.5 py-2.5 cursor-pointer hover:bg-surface-2/60 transition-colors"
            >
                <Info size={13} className="text-brand shrink-0" />
                <span className="text-label font-black uppercase tracking-widest text-text-subtle flex-1 text-left">Legend</span>
                {hiddenCount > 0 && (
                    <span className="text-2xs font-extrabold px-1.5 py-0.5 rounded-md bg-brand-muted text-brand tracking-wider">
                        {hiddenCount} hidden
                    </span>
                )}
                <span className="text-label font-black tabular-nums text-text-muted">{total}</span>
                <Chevron size={14} className="text-text-subtle transition-transform duration-300 shrink-0" />
            </button>

            <div className={`grid transition-all duration-300 ease-out ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                    <div className="px-2 pb-2.5 pt-0.5 max-h-64 overflow-y-auto thin-scrollbar grid grid-cols-1 gap-y-0.5">
                        {items.map((it) => {
                            const isClickable = !!onToggleGroup;
                            return (
                                <button
                                    key={it.key}
                                    type="button"
                                    disabled={!isClickable}
                                    onClick={() => onToggleGroup?.(it.key)}
                                    aria-label={`${it.isHidden ? 'Show' : 'Hide'} ${it.label} nodes (${it.count})`}
                                    title={isClickable ? `${it.isHidden ? 'Show' : 'Hide'} ${it.label} nodes` : undefined}
                                    className={cn(
                                        'w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-left transition-all duration-200 group',
                                        isClickable && 'cursor-pointer hover:bg-surface-2/70 active:scale-[0.98]',
                                        it.isHidden
                                            ? 'opacity-40 bg-surface-2/30 hover:opacity-75'
                                            : 'hover:bg-surface-2/60'
                                    )}
                                >
                                    <span
                                        className={cn(
                                            'w-2.5 h-2.5 rounded-full ring-2 ring-surface shadow-xs shrink-0 transition-all duration-200',
                                            it.isHidden ? 'scale-75 opacity-50 grayscale' : 'group-hover:scale-125'
                                        )}
                                        style={{ backgroundColor: it.color }}
                                    />
                                    <span
                                        className={cn(
                                            'text-caption font-bold truncate flex-1 transition-colors',
                                            it.isHidden ? 'text-text-subtle line-through' : 'text-text-secondary group-hover:text-text-primary'
                                        )}
                                    >
                                        {it.label}
                                    </span>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        {isClickable && (
                                            <span className="opacity-0 group-hover:opacity-100 transition-opacity text-text-subtle">
                                                {it.isHidden ? <Eye size={12} className="text-brand" /> : <EyeOff size={12} />}
                                            </span>
                                        )}
                                        <span className="text-label font-black tabular-nums text-text-muted min-w-4 text-right">
                                            {it.count}
                                        </span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
