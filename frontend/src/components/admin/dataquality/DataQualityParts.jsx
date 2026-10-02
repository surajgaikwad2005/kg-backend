'use client';
import React from 'react';
import { cn } from '@/src/lib/utils';
import {
    TONES, scoreTone, statusTone, fmtInt, fmtPct, fmtNum, fmtDateTime,
} from '@/src/components/admin/dataquality/qualityUtils';

// ── ScoreRing ─────────────────────────────────────────────────────────────────
export function ScoreRing({ value, size = 132, stroke = 11, label = 'Quality Score' }) {
    const safe = Math.max(0, Math.min(100, Number(value) || 0));
    const r = (size - stroke) / 2;
    const c = 2 * Math.PI * r;
    const offset = c - (safe / 100) * c;
    const tone = scoreTone(value);
    return (
        <div className="relative shrink-0" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="-rotate-90">
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={stroke} />
                <circle
                    cx={size / 2} cy={size / 2} r={r} fill="none" stroke={tone.ring}
                    strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c}
                    strokeDashoffset={offset}
                    style={{ transition: 'stroke-dashoffset 0.9s cubic-bezier(0.34,1.56,0.64,1)' }}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={cn('text-2xl font-extrabold tabular-nums', tone.text)}>
                    {value == null ? '—' : `${Math.round(safe * 10) / 10}`}
                </span>
                <span className="text-2xs font-bold uppercase tracking-widest text-text-subtle">{label}</span>
            </div>
        </div>
    );
}

// ── MiniBar ───────────────────────────────────────────────────────────────────
export function MiniBar({ pct, tone }) {
    const safe = Math.max(0, Math.min(100, Number(pct) || 0));
    return (
        <div className="flex items-center gap-2 min-w-22">
            <div className="h-1.5 flex-1 rounded-full bg-surface-2 overflow-hidden">
                <div
                    style={{ '--safe-w': `${Math.max(safe, safe > 0 ? 4 : 0)}%` }}
                    className={cn('h-full rounded-full transition-all duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)] w-[var(--safe-w)]', (tone || (safe === 0 ? TONES.good : safe >= 25 ? TONES.bad : TONES.warn)).soft)}
                />
            </div>
            <span className="text-caption font-semibold tabular-nums text-text-muted w-10 text-right">{fmtPct(pct)}</span>
        </div>
    );
}

// ── StatusPill ────────────────────────────────────────────────────────────────
export function StatusPill({ status }) {
    if (!status) return null;
    const tone = statusTone(status);
    return (
        <span className={cn(
            'inline-flex items-center px-2 py-0.5 rounded-full text-label font-bold uppercase tracking-wider',
            tone.bg, tone.text,
        )}>
            {status}
        </span>
    );
}

// ── StatCard ──────────────────────────────────────────────────────────────────
export function StatCard({ label, value, sub }) {
    return (
        <div className="rounded-xl border border-border bg-surface px-3.5 py-3">
            <p className="text-label font-bold uppercase tracking-widest text-text-subtle">{label}</p>
            <p className="mt-1 text-sm font-extrabold text-text-primary tabular-nums truncate" title={String(value)}>{value}</p>
            {sub && <p className="text-caption text-text-subtle truncate">{sub}</p>}
        </div>
    );
}

// ── Cell renderer for FindingsTable ───────────────────────────────────────────
function renderCell(col, row) {
    const v = row[col.key];
    switch (col.kind) {
        case 'int':  return fmtInt(v);
        case 'pct':  return fmtPct(v);
        case 'num':  return fmtNum(v);
        case 'date': return <span className="text-text-muted">{fmtDateTime(v)}</span>;
        case 'bar':  return <MiniBar pct={v} />;
        default:     return v ?? '—';
    }
}

// ── FindingsTable ─────────────────────────────────────────────────────────────
export function FindingsTable({ columns, rows, defaultStatus = 'FAIL' }) {
    return (
        <div className="max-h-72 overflow-auto rounded-xl border border-border">
            <table className="w-full text-left text-sm">
                <thead className="sticky top-0 z-10 bg-surface-2">
                    <tr className="text-text-muted border-b border-border">
                        {columns.map((col) => (
                            <th
                                key={col.key}
                                className={cn(
                                    'px-3.5 py-2.5 font-semibold text-caption uppercase tracking-wider whitespace-nowrap',
                                    col.align === 'right' && 'text-right',
                                )}
                            >
                                {col.label}
                            </th>
                        ))}
                        <th className="px-3.5 py-2.5 font-semibold text-caption uppercase tracking-wider text-right">Status</th>
                    </tr>
                </thead>
                <tbody className="text-text-secondary">
                    {rows.map((row, i) => (
                        <tr key={i} className="border-b border-border last:border-0 hover:bg-surface-2/70 transition-colors">
                            {columns.map((col) => (
                                <td
                                    key={col.key}
                                    className={cn(
                                        'px-3.5 py-2.5 whitespace-nowrap text-xs',
                                        col.align === 'right' && 'text-right tabular-nums',
                                        col.mono && 'font-mono text-brand',
                                    )}
                                >
                                    {renderCell(col, row)}
                                </td>
                            ))}
                            <td className="px-3.5 py-2.5 text-right">
                                <StatusPill status={row.status || defaultStatus} />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// ── Shimmer skeleton (light/dark/system via design tokens + CSS animation) ────
export function ShimmerBlock({ className, style }) {
    return (
        <div
            className={cn('rounded-md bg-surface-2 skeleton-shimmer', className)}
            style={style}
        />
    );
}
