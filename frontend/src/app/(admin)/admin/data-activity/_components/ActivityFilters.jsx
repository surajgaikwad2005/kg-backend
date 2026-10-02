'use client';
import React from 'react';
import { Search, RotateCcw } from 'lucide-react';
import { Select } from '@/src/components/ui/Select';

export function ActivityFilters({ filterStatus, setFilterStatus, filterSource, setFilterSource, searchQuery, setSearchQuery, onReset }) {
    return (
        <div className="bg-surface border border-border p-5 rounded-2xl">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="md:col-span-2 space-y-2">
                    <label className="text-label font-bold text-text-muted uppercase tracking-widest">Search Jobs</label>
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-brand transition-colors" size={14} />
                        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Job ID, Namespace…"
                            className="w-full bg-surface border border-border rounded-xl pl-9 pr-4 py-2 text-xs text-text-primary focus:outline-none focus:border-brand transition-all" />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-label font-bold text-text-muted uppercase tracking-widest">Source</label>
                    <Select
                        value={filterSource}
                        onChange={setFilterSource}
                        options={['All', 'SAP', 'Documents', 'Historian', 'P&ID', 'Database']}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-label font-bold text-text-muted uppercase tracking-widest">Status</label>
                    <Select
                        value={filterStatus}
                        onChange={setFilterStatus}
                        options={['All', 'Success', 'Failed', 'Running', 'Warning']}
                    />
                </div>
                <div className="flex items-end">
                    <button onClick={onReset}
                        className="w-full bg-surface-2 hover:bg-border/40 text-text-primary font-bold py-2 rounded-xl text-xs border border-border transition-all flex items-center justify-center gap-2 cursor-pointer">
                        <RotateCcw size={14} />Reset
                    </button>
                </div>
            </div>
        </div>
    );
}
