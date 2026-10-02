'use client';
import React, { useMemo } from 'react';
import { Shield, Activity, Cpu, Wrench, CircleDot } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { Skeleton } from '@/src/components/ui/Skeleton';

const LABEL_ICONS = {
    integrity: Shield,
    reliability: Activity,
    production: Cpu,
    maintenance: Wrench,
};

const DEFAULT_LABELS = [
    { key: 'integrity', label: 'Integrity', colour: 'green', sort_order: 1, row_count: 0 },
    { key: 'reliability', label: 'Reliability', colour: 'blue', sort_order: 2, row_count: 0 },
    { key: 'production', label: 'Production', colour: 'amber', sort_order: 3, row_count: 0 },
    { key: 'maintenance', label: 'Maintenance', colour: 'purple', sort_order: 4, row_count: 0 },
];

export function IntegratedLabelTabs({
    labels = [],
    activeLabel = 'integrity',
    onSelectLabel,
    isLoading = false,
}) {
    const displayLabels = useMemo(() => {
        if (labels && labels.length > 0) {
            return [...labels].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
        }
        return DEFAULT_LABELS;
    }, [labels]);

    if (isLoading) {
        return (
            <div className="flex items-center gap-2.5 overflow-x-auto py-2">
                {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-10 w-36 rounded-xl shrink-0" />
                ))}
            </div>
        );
    }

    return (
        <div role="tablist" aria-label="Integrated Domain Tabs" className="flex items-center gap-2.5 overflow-x-auto py-1 scrollbar-none">
            {displayLabels.map((item) => {
                const isActive = item.key === activeLabel;
                const IconComponent = LABEL_ICONS[item.key] || CircleDot;
                const count = item.row_count ?? 0;

                return (
                    <button
                        key={item.key}
                        role="tab"
                        type="button"
                        aria-selected={isActive}
                        onClick={() => onSelectLabel && onSelectLabel(item.key)}
                        className={cn(
                            'group flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all shrink-0 cursor-pointer',
                            isActive
                                ? 'bg-surface border-brand text-brand shadow-xs ring-2 ring-brand/10'
                                : 'bg-surface hover:bg-surface-2 border-border text-text-secondary hover:text-text-primary'
                        )}
                    >
                        <IconComponent className={cn('w-4 h-4 transition-colors', isActive ? 'text-brand' : 'text-text-muted group-hover:text-text-primary')} />
                        <span>{item.label}</span>
                        <span
                            className={cn(
                                'px-2 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide transition-colors',
                                isActive
                                    ? 'bg-brand/15 text-brand'
                                    : 'bg-surface-2 text-text-muted group-hover:text-text-secondary'
                            )}
                        >
                            {count}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
