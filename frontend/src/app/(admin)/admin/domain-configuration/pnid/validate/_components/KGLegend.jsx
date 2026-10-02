'use client';

/**
 * KGLegend — collapsible colour/type key for the knowledge-graph overlay.
 * Mirrors the group → colour mapping used by CustomNode so users can read the
 * graph at a glance, and shows the live node count per type. Theme-token driven
 * to match the app surface.
 */
import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';
import { GROUP_CONFIG } from '@/src/components/ui/knowledge-graph/groups';



export default function KGLegend({ counts }) {
    const [open, setOpen] = useState(true);

    const hasCounts = !!counts;
    
    const items = useMemo(() => {
        const list = Object.keys(GROUP_CONFIG).map(groupId => ({
            group: Number(groupId),
            color: GROUP_CONFIG[groupId].color,
            dot: GROUP_CONFIG[groupId].dotClass,
            label: GROUP_CONFIG[groupId].label
        }));
        if (hasCounts) {
            return list.filter((it) => (counts[it.group] ?? 0) > 0);
        }
        return list;
    }, [counts, hasCounts]);

    const total = useMemo(() => {
        return hasCounts ? items.reduce((sum, it) => sum + (counts[it.group] ?? 0), 0) : 0;
    }, [counts, items, hasCounts]);

    // Collapsed → ChevronUp (expand upward); expanded → ChevronDown (collapse).
    const Chevron = open ? ChevronDown : ChevronUp;

    return (
        <div className="absolute bottom-5 left-5 z-40 w-56 rounded-2xl border border-border bg-surface/90 backdrop-blur-xl shadow-card select-none overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
            <button
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                className="w-full flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-surface-2/60 transition-colors"
            >
                <Info size={13} className="text-brand" />
                <span className="text-label font-black uppercase tracking-widest text-text-subtle flex-1 text-left">Legend</span>
                {hasCounts && (
                    <span className="text-label font-black tabular-nums text-text-muted">{total}</span>
                )}
                <Chevron size={14} className="text-text-subtle transition-transform duration-300" />
            </button>
            <div className={`grid transition-all duration-300 ease-out ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                    <div className="px-3 pb-3 pt-0.5 grid grid-cols-1 gap-y-1.5">
                        {items.map((it) => (
                            <div key={it.label} className="flex items-center gap-2">
                                <span
                                    className="w-2.5 h-2.5 rounded-full ring-2 ring-surface shadow-sm shrink-0"
                                    style={{ backgroundColor: it.color }}
                                />
                                <span className="text-caption font-bold text-text-secondary truncate flex-1">{it.label}</span>
                                {hasCounts && (
                                    <span className="text-label font-black tabular-nums text-text-muted shrink-0 min-w-4 text-right">
                                        {counts[it.group] ?? 0}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
