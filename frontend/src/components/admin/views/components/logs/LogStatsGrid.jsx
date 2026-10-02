'use client';
import React from 'react';
import { CheckCircle2, X, AlertTriangle, Clock, Database } from 'lucide-react';

export function LogStatsGrid({ realLogEntries, logStats, activeLogEntries }) {
    const stats = [
        { label: 'Successful Runs', value: (realLogEntries ? logStats.success : '—').toString(), icon: <CheckCircle2 className="text-success" />, sub: 'Parsed from logs' },
        { label: 'Failed Runs', value: (realLogEntries ? logStats.failed : '—').toString(), icon: <X className="text-danger" />, sub: 'Errors detected' },
        { label: 'Warnings', value: (realLogEntries ? logStats.warnings : '—').toString(), icon: <AlertTriangle className="text-warning" />, sub: 'Warnings detected' },
        { label: 'Total Entries', value: (realLogEntries ? activeLogEntries.length : '—').toString(), icon: <Clock className="text-brand" />, sub: 'Log lines parsed' },
        { label: 'Records Referenced', value: logStats.records > 0 ? logStats.records.toLocaleString() : '—', icon: <Database className="text-highlight" />, sub: 'From log messages' },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {stats.map((stat) => (
                <div key={stat.label} className="bg-surface border border-border p-5 rounded-2xl space-y-2 hover:border-brand/50 transition-colors group cursor-default">
                    <div className="flex items-center justify-between">
                        <span className="text-label font-bold text-text-muted uppercase tracking-widest">{stat.label}</span>
                        <div className="p-2 bg-surface-2 rounded-lg group-hover:bg-border/50 transition-colors">
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
