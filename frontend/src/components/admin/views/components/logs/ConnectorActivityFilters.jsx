'use client';
import React from 'react';
import { Search, RotateCcw } from 'lucide-react';
import { Select } from '@/src/components/ui/Select';

export function ConnectorActivityFilters({ filterStatus, setFilterStatus, searchQuery, setSearchQuery }) {
    return (
        <div className="bg-surface border border-border p-6 rounded-2xl shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4">
                <div className="space-y-2">
                    <label className="text-label font-bold text-text-muted uppercase tracking-widest">Date Range</label>
                    <div className="relative group">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-brand transition-colors w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        <input type="text" placeholder="Last 24h" className="w-full bg-surface border border-border rounded-xl pl-9 pr-4 py-2 text-xs text-text-primary focus:outline-none focus:border-brand transition-all" />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-label font-bold text-text-muted uppercase tracking-widest">Source Type</label>
                    <Select
                        options={['All Sources', 'SAP', 'Database', 'Historian', 'File']}
                    />
                </div>

                <div className="space-y-2 lg:col-span-1">
                    <label className="text-label font-bold text-text-muted uppercase tracking-widest">Search Logs</label>
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-brand transition-colors" size={14} />
                        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Run ID, Connector..." className="w-full bg-surface border border-border rounded-xl pl-9 pr-4 py-2 text-xs text-text-primary focus:outline-none focus:border-brand transition-all" />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-label font-bold text-text-muted uppercase tracking-widest">Log Level</label>
                    <Select
                        options={['All Levels', 'INFO', 'WARNING', 'ERROR', 'DEBUG']}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-label font-bold text-text-muted uppercase tracking-widest">Status</label>
                    <Select
                        value={filterStatus}
                        onChange={setFilterStatus}
                        options={['All', 'Success', 'Failed', 'Warning']}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-label font-bold text-text-muted uppercase tracking-widest">Environment</label>
                    <Select
                        options={['Production', 'QA', 'Development']}
                    />
                </div>

                <div className="flex items-end">
                    <button
                        onClick={() => { setFilterStatus('All'); setSearchQuery(''); }}
                        className="w-full bg-surface-2 hover:bg-border/40 text-text-primary font-bold py-2 rounded-xl text-xs border border-border transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                        <RotateCcw size={14} />
                        Reset
                    </button>
                </div>
            </div>
        </div>
    );
}
