'use client';
import React from 'react';
import { Filter } from 'lucide-react';

export function SapColumnFilter({ allSapColumns, visibleSapColumns, setVisibleSapColumns }) {
    return (
        <div className="w-56 shrink-0 bg-surface border border-border rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-border bg-surface-2 flex items-center gap-2">
                <Filter size={14} className="text-text-muted" />
                <h4 className="text-xs font-bold text-text-muted uppercase tracking-widest">Columns</h4>
            </div>
            <div className="p-3 space-y-1 max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300">
                {allSapColumns.map((col) => {
                    const isVisible = visibleSapColumns.includes(col);
                    return (
                        <label key={col} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all ${isVisible ? 'bg-brand/10 border border-brand/30' : 'hover:bg-surface-2 border border-transparent'}`}>
                            <input
                                type="checkbox"
                                checked={isVisible}
                                onChange={() => {
                                    if (isVisible) {
                                        setVisibleSapColumns(visibleSapColumns.filter(c => c !== col));
                                    } else {
                                        setVisibleSapColumns(allSapColumns.filter(c => visibleSapColumns.includes(c) || c === col));
                                    }
                                }}
                                className="w-4 h-4 rounded border-border bg-[#f8fafc] text-brand focus:ring-brand"
                            />
                            <span className={`text-xs font-medium ${isVisible ? 'text-text-primary' : 'text-text-muted'}`}>
                                {col}
                            </span>
                        </label>
                    );
                })}
            </div>
        </div>
    );
}
