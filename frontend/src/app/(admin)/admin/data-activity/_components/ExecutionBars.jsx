'use client';
import React from 'react';

const BAR_CLS = {
    Success: 'bg-success h-full',
    Failed: 'bg-danger h-full',
    Running: 'bg-brand h-full animate-pulse',
    Warning: 'bg-warning h-4',
};

export function ExecutionBars({ runs }) {
    const padded = [...runs].reverse();
    while (padded.length < 12) padded.unshift(null);
    return (
        <div className="flex items-end gap-[2px] h-6">
            {padded.slice(-12).map((r, i) => (
                <div
                    key={r ? `bar-${r.id}` : `bar-pad-${i}`}
                    className={`w-1.5 rounded-full transition-all ${!r ? 'bg-border h-3' : (BAR_CLS[r.status] ?? 'bg-surface-2 h-4')}`}
                    title={r ? `${r.id} — ${r.status}` : ''}
                />
            ))}
        </div>
    );
}
