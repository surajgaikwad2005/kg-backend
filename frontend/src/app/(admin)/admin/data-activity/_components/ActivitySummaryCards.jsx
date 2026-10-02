'use client';
import React from 'react';
import { CheckCircle2, X, Hash, ArrowUpRight, Activity } from 'lucide-react';

export function ActivitySummaryCards({ stats }) {
    const cards = [
        { label: 'Total Jobs', value: stats.total.toString(), icon: <Hash size={18} className="text-brand" />, sub: 'Configured' },
        { label: 'Successful', value: stats.success.toString(), icon: <CheckCircle2 size={18} className="text-success" />, sub: stats.total > 0 ? `${Math.round((stats.success / stats.total) * 100)}% rate` : '—' },
        { label: 'Failed', value: stats.failed.toString(), icon: <X size={18} className="text-danger" />, sub: 'Needs attention' },
        { label: 'Records Synced', value: stats.totalRecords.toLocaleString(), icon: <ArrowUpRight size={18} className="text-brand" />, sub: `${stats.totalInserts.toLocaleString()} inserts` },
        { label: 'Running Now', value: stats.running.toString(), icon: <Activity size={18} className="text-brand" />, sub: 'In progress' },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {cards.map((stat) => (
                <div key={stat.label} className="bg-surface border border-border p-5 rounded-2xl space-y-2 hover:border-brand/50 transition-colors group cursor-default">
                    <div className="flex items-center justify-between">
                        <span className="text-label font-bold text-text-muted uppercase tracking-widest">{stat.label}</span>
                        <div className="p-2 bg-surface-2 rounded-lg group-hover:bg-border/40 transition-colors">
                            {stat.icon}
                        </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-text-primary">{stat.value}</span>
                        <span className="text-label text-text-muted">{stat.sub}</span>
                    </div>
                </div>
            ))}
        </div>
    );
}
