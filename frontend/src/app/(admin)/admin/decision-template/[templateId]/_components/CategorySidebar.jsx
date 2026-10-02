'use client';
import React from 'react';
import { useApp } from '@/src/context/AppContext';

const CATEGORY_COLOR_MAP = {
    home: { dot: 'bg-success' },
    observe: { dot: 'bg-brand' },
    investigate: { dot: 'bg-warning' },
    diagnose: { dot: 'bg-success' },
};

function CategorySidebarSkeleton() {
    return (
        <div className="p-3 space-y-2">
            {[1, 2, 3].map((i) => (
                <div key={i} className="h-11 rounded-xl bg-surface-2 skeleton-shimmer" />
            ))}
        </div>
    );
}

export function CategorySidebar({ categories, loading, error, activeCategory, onSelect, activeCounts, noPlantSelected }) {
    const { plantCode } = useApp();

    return (
        <aside className="w-60 sm:w-64 shrink-0 bg-surface border-r border-border flex flex-col h-full overflow-hidden">
            <div className="px-4 py-4 border-b border-border flex items-center justify-between shrink-0 gap-2">
                <span className="text-xs font-black text-text-secondary uppercase tracking-widest">Category List</span>
                {plantCode && (
                    <span className="text-[11px] font-bold text-brand bg-brand-muted px-2 py-0.5 rounded-full shrink-0 truncate max-w-24">
                        {plantCode}
                    </span>
                )}
            </div>

            <div className="flex-1 overflow-y-auto thin-scrollbar p-3 space-y-1.5">
                {loading ? (
                    <CategorySidebarSkeleton />
                ) : noPlantSelected ? (
                    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                        <p className="text-sm text-text-secondary">Select a plant to view categories.</p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                        <p className="text-sm font-semibold text-danger mb-1">Failed to load categories</p>
                        <p className="text-xs text-text-secondary">{error}</p>
                    </div>
                ) : categories.length > 0 ? (
                    categories.map((cat) => {
                        const key = cat.template;
                        const colors = CATEGORY_COLOR_MAP[key] || { dot: 'bg-text-subtle' };
                        const label = key ? key.charAt(0).toUpperCase() + key.slice(1) : 'Untitled';
                        const isActive = activeCategory === key;
                        const count = activeCounts[key] || 0;

                        return (
                            <button
                                key={key}
                                type="button"
                                onClick={() => onSelect(key)}
                                aria-current={isActive ? 'true' : undefined}
                                className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-fast ease-default cursor-pointer
                                    ${isActive ? 'border-brand bg-brand-muted text-brand' : 'border-transparent text-text-primary hover:bg-surface-2'}`}
                            >
                                <span className="flex items-center gap-2 min-w-0">
                                    <span className={`w-2 h-2 rounded-full shrink-0 ${colors.dot}`} />
                                    <span className="truncate">{label}</span>
                                </span>
                                {count > 0 && (
                                    <span
                                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${isActive ? 'bg-brand text-white' : 'bg-surface-2 text-text-secondary'}`}
                                    >
                                        {count} active
                                    </span>
                                )}
                            </button>
                        );
                    })
                ) : (
                    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                        <p className="text-sm text-text-secondary">No categories available.</p>
                    </div>
                )}
            </div>
        </aside>
    );
}
