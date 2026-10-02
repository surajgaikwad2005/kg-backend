import React, { useMemo } from 'react';
import { Filter, ChevronDown } from 'lucide-react';
import { GROUP_CONFIG, getTypeConfig, LABEL_GROUP_MAP } from '@/src/components/ui/knowledge-graph/groups';

export default function GraphFilterPanel({
    isFilterOpen,
    setIsFilterOpen,
    groupCounts,
    hiddenGroups,
    toggleGroup
}) {
    const filterButtons = useMemo(() => {
        // Collect unique keys (both groups and string types)
        const entries = Object.entries(groupCounts)
            .filter(([key, count]) => count > 0 && isNaN(Number(key))) // Use type names for cleaner UI
            .map(([typeKey, count]) => {
                const config = getTypeConfig(typeKey);
                const isHidden = hiddenGroups.has(typeKey) || (config && hiddenGroups.has(LABEL_GROUP_MAP[typeKey]));
                return {
                    key: typeKey,
                    label: config.label || typeKey,
                    color: config.color,
                    count,
                    isHidden,
                };
            });

        // Fallback to numeric groups if no string keys present
        const list = entries.length > 0 ? entries : Object.keys(groupCounts).map((groupIdStr) => {
            const groupId = Number(groupIdStr);
            const count = groupCounts[groupId] || 0;
            if (count === 0) return null;
            const config = GROUP_CONFIG[groupId];
            if (!config) return null;
            const isHidden = hiddenGroups.has(groupId);
            return {
                key: groupId,
                label: config.label,
                color: config.color,
                count,
                isHidden,
            };
        }).filter(Boolean);

        list.sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));

        return list.map((item) => (
            <button
                key={item.key}
                type="button"
                onClick={() => toggleGroup(item.key)}
                className={`flex items-center gap-2 px-2.5 py-1.5 text-2xs font-bold uppercase tracking-wider rounded-lg border transition-all cursor-pointer w-full justify-start ${
                    item.isHidden
                        ? 'bg-surface-2/45 border-border/40 text-text-subtle line-through opacity-60 hover:opacity-85'
                        : 'bg-surface hover:bg-surface-2 border-border text-text-secondary shadow-2xs hover:text-text-primary'
                }`}
            >
                <span
                    className={`w-2 h-2 rounded-full flex-shrink-0 transition-opacity ${item.isHidden ? 'grayscale opacity-40' : ''}`}
                    style={{ backgroundColor: item.color }}
                />
                <span className="flex-1 text-left truncate">{item.label}</span>
                <span className="opacity-60 tabular-nums flex-shrink-0">({item.count})</span>
            </button>
        ));
    }, [groupCounts, hiddenGroups, toggleGroup]);

    return (
        <div className="flex flex-col items-end gap-2 pointer-events-auto relative">
            <button
                type="button"
                onClick={() => setIsFilterOpen((v) => !v)}
                className={`flex items-center gap-2 px-3.5 h-9 rounded-xl border border-border bg-surface text-text-secondary hover:text-text-primary hover:bg-surface-2 text-2xs font-extrabold uppercase tracking-wider transition-all cursor-pointer shadow-sm active:scale-95 ${
                    isFilterOpen ? 'bg-surface-2 text-text-primary ring-2 ring-brand/25' : ''
                }`}
            >
                <Filter className={`w-3.5 h-3.5 transition-transform duration-300 ${isFilterOpen ? 'text-brand' : 'text-text-subtle'}`} />
                <span className="select-none">Filter</span>
                <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${isFilterOpen ? 'rotate-180 text-brand' : 'text-text-subtle'}`} />
            </button>

            <div
                className={`absolute top-[calc(100%+0.5rem)] right-0 transition-all duration-300 ease-out overflow-hidden bg-surface/85 border rounded-xl backdrop-blur-sm ${
                    isFilterOpen
                        ? 'max-h-[260px] opacity-100 border-border shadow-card'
                        : 'max-h-0 opacity-0 pointer-events-none border-transparent shadow-none'
                }`}
            >
                <div className="flex flex-col gap-1.5 p-2 min-w-[200px] max-h-[240px] overflow-y-auto thin-scrollbar">
                    {filterButtons}
                </div>
            </div>
        </div>
    );
}
