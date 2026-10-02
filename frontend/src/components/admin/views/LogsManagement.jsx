'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Activity, ScrollText, Terminal, Search, RotateCw,
    AlertTriangle, AlertOctagon, Info, XCircle, Cpu, Database,
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { useLogsSummary, useLogActivity, useLogEvents } from '@/src/components/admin/_queries/useLogManagementQueries';
import { useApp } from '@/src/context/AppContext';
import { PipelineLogsViewer } from '@/src/components/admin/views/PipelineLogsViewer';
import { ActivityHistogram } from '@/src/components/admin/views/_ActivityHistogram';
import { FacetSidebar } from '@/src/components/admin/views/_FacetSidebar';
// timeAgo/fmtTime normalize the backend's offset-less (UTC) timestamps so "ago"
// is accurate regardless of the viewer's time zone.
import { timeAgo, fmtTime } from '@/src/lib/time';

const LEVEL_META = {
    CRITICAL: { cls: 'text-danger bg-danger/10 border-danger/30', Icon: AlertOctagon },
    ERROR:    { cls: 'text-danger bg-danger/10 border-danger/30',   Icon: XCircle },
    WARNING:  { cls: 'text-warning bg-warning/10 border-warning/30', Icon: AlertTriangle },
    INFO:     { cls: 'text-info bg-info/10 border-info/30',   Icon: Info },
    DEBUG:    { cls: 'text-text-muted bg-text-muted/10 border-text-muted/30', Icon: Info },
};
const statusTone = (s) => {
    const v = (s || '').toLowerCase();
    if (['committed', 'completed', 'done', 'success'].includes(v)) return 'text-success bg-success/10';
    if (['failed', 'error', 'partial'].includes(v)) return 'text-danger bg-danger/10';
    if (['running', 'queued', 'committing', 'processing'].includes(v)) return 'text-brand bg-brand/10';
    return 'text-text-muted bg-surface-2';
};

// ── Summary strip ──────────────────────────────────────────────────────────────
function StatCard({ label, value, tone, Icon }) {
    return (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-surface">
            <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0', tone)}>
                <Icon size={16} />
            </div>
            <div className="min-w-0">
                <div className="text-title font-extrabold text-text-primary leading-none">{value}</div>
                <div className="text-caption text-text-muted mt-1 truncate">{label}</div>
            </div>
        </div>
    );
}

function SummaryStrip({ summary }) {
    const lv = summary?.events_by_level || {};
    const jobs = summary?.jobs || {};
    const commits = summary?.commits || {};
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard label="Errors today" value={(lv.CRITICAL || 0) + (lv.ERROR || 0)}
                      tone="bg-danger/10 text-danger" Icon={XCircle} />
            <StatCard label="Warnings today" value={lv.WARNING || 0}
                      tone="bg-warning/10 text-warning" Icon={AlertTriangle} />
            <StatCard label="Pipeline runs (✓ / ✗)" value={`${jobs.completed || 0} / ${jobs.failed || 0}`}
                      tone="bg-brand/10 text-brand" Icon={Cpu} />
            <StatCard label="Commits today" value={commits.today || 0}
                      tone="bg-success/10 text-success" Icon={Database} />
        </div>
    );
}

// ── Activity tab (who did what) ────────────────────────────────────────────────
function ActivityRow({ a }) {
    const isCommit = a.action === 'commit';
    return (
        <tr className="border-b border-border/50 hover:bg-surface-2/50 transition-colors">
            <td className="px-4 py-2.5 whitespace-nowrap text-caption text-text-muted" title={fmtTime(a.ts)}>
                {timeAgo(a.ts)}
            </td>
            <td className="px-4 py-2.5 whitespace-nowrap">
                <span className="text-caption font-semibold text-text-primary">{a.actor || 'system'}</span>
            </td>
            <td className="px-4 py-2.5 whitespace-nowrap">
                <span className="inline-flex items-center gap-1.5 text-caption font-medium text-text-secondary">
                    {isCommit ? <Database size={12} className="text-highlight" />
                              : <Cpu size={12} className="text-brand" />}
                    {isCommit ? 'Committed' : 'Pipeline'} <span className="uppercase text-text-muted">{a.source}</span>
                </span>
            </td>
            <td className="px-4 py-2.5 whitespace-nowrap text-caption font-mono text-text-muted">{a.plant_code || '—'}</td>
            <td className="px-4 py-2.5 whitespace-nowrap text-caption text-text-muted">
                {typeof a.rows === 'number' ? a.rows.toLocaleString() : '—'}
            </td>
            <td className="px-4 py-2.5 whitespace-nowrap">
                <span className={cn('text-2xs font-bold uppercase px-2 py-0.5 rounded-md', statusTone(a.status))}>
                    {a.status || '—'}
                </span>
            </td>
        </tr>
    );
}

function ActivityTab({ rows, loading }) {
    if (loading && rows.length === 0) return <EmptyState text="Loading activity…" />;
    if (rows.length === 0) return <EmptyState text="No activity yet. Process or commit a source to see it here." />;
    return (
        <div className="border border-border rounded-2xl overflow-hidden">
            <table className="w-full text-left">
                <thead className="bg-surface-2/60">
                    <tr className="text-label font-bold text-text-muted uppercase tracking-wider">
                        <th className="px-4 py-2.5">When</th>
                        <th className="px-4 py-2.5">Actor</th>
                        <th className="px-4 py-2.5">Action</th>
                        <th className="px-4 py-2.5">Plant</th>
                        <th className="px-4 py-2.5">Rows</th>
                        <th className="px-4 py-2.5">Status</th>
                    </tr>
                </thead>
                <tbody>{rows.map((a, i) => <ActivityRow key={a.ref || i} a={a} />)}</tbody>
            </table>
        </div>
    );
}

// ── Logs tab (parsed events) ───────────────────────────────────────────────────
function EventRow({ e }) {
    const meta = LEVEL_META[e.level] || LEVEL_META.INFO;
    return (
        <div className="flex items-start gap-3 px-4 py-2 border-b border-border/40 hover:bg-surface-2/40 font-mono text-caption">
            <span className="text-text-subtle whitespace-nowrap shrink-0 w-36" title={fmtTime(e.ts)}>{fmtTime(e.ts)}</span>
            <span className={cn('text-2xs font-bold uppercase px-1.5 py-0.5 rounded border shrink-0 w-20 text-center', meta.cls)}>
                {e.level}
            </span>
            <span className="text-text-muted shrink-0 w-24 truncate">{e.source}</span>
            <span className="text-text-secondary break-all">{e.message}</span>
        </div>
    );
}

const LEVELS = ['ALL', 'ERROR', 'WARNING', 'INFO', 'DEBUG'];

// Histogram series for log events, grouped by severity: error / warn / info.
const EVENT_HIST_SERIES = [
    { key: 'ERROR',   label: 'Error',   cls: 'bg-danger' },
    { key: 'WARNING', label: 'Warning', cls: 'bg-warning' },
    { key: 'INFO',    label: 'Info',    cls: 'bg-info' },
    { key: 'OTHER',   label: 'Other',   cls: 'bg-text-muted' },
];
const eventSeriesKey = (e) => (['ERROR', 'WARNING', 'INFO'].includes(e.level) ? e.level
    : e.level === 'CRITICAL' ? 'ERROR' : 'OTHER');

function LogsTab({ events, loading, level, setLevel, source, setSource, query, setQuery, facets, onSearch }) {
    // Facet groups from the backend-computed counts (full filtered set).
    const levelGroup = {
        key: 'level', label: 'Level',
        values: LEVELS.filter(l => l !== 'ALL').map(l => ({
            value: l, count: facets?.level?.[l] ?? 0,
            dotCls: (LEVEL_META[l] || LEVEL_META.INFO).cls.split(' ').find(c => c.startsWith('text-'))?.replace('text-', 'bg-') || 'bg-text-subtle',
        })),
    };
    const sourceGroup = {
        key: 'source', label: 'Source',
        values: Object.entries(facets?.source || {})
            .sort((a, b) => b[1] - a[1])
            .map(([s, c]) => ({ value: s, count: c, dotCls: 'bg-brand' })),
    };
    const onToggle = (group, value) => {
        if (group === 'level') setLevel(level === value ? 'ALL' : value);
        else setSource(source === value ? '' : value);
    };
    const selected = {
        level: new Set(level && level !== 'ALL' ? [level] : []),
        source: new Set(source ? [source] : []),
    };

    return (
        <div className="space-y-3">
            {/* Search */}
            <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle" />
                <input value={query} onChange={e => setQuery(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && onSearch()}
                    placeholder="Search message… (Enter to apply)"
                    className="w-full text-caption bg-surface border border-border rounded-lg pl-9 pr-3 py-1.5 text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/30" />
            </div>

            {/* Level histogram over time */}
            <ActivityHistogram items={events} series={EVENT_HIST_SERIES}
                tsAccessor={e => e.ts} seriesAccessor={eventSeriesKey} />

            {/* Facet sidebar + event list */}
            <div className="flex gap-6">
                <FacetSidebar groups={[levelGroup, sourceGroup]} selected={selected} onToggle={onToggle} />
                <div className="flex-1 min-w-0">
                    {loading && events.length === 0 ? <EmptyState text="Loading events…" />
                      : events.length === 0 ? <EmptyState text="No matching log events." />
                      : (
                        <div className="border border-border rounded-2xl overflow-hidden max-h-[60vh] overflow-y-auto scrollbar-thin bg-canvas">
                            {events.map((e, i) => <EventRow key={i} e={e} />)}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function EmptyState({ text }) {
    return (
        <div className="flex items-center justify-center py-16 text-caption text-text-muted border border-border rounded-2xl bg-surface">
            {text}
        </div>
    );
}

// ── Main ───────────────────────────────────────────────────────────────────────
const TABS = [
    { key: 'activity', label: 'Activity', Icon: Activity },
    { key: 'logs',     label: 'Logs',     Icon: ScrollText },
    { key: 'raw',      label: 'Raw logs', Icon: Terminal },
];

export function LogsManagement() {
    const { plantCode } = useApp();
    const [tab, setTab] = useState('activity');

    // Logs-tab filters (sent to the backend — no client-side parsing/filtering).
    const [level, setLevel] = useState('ALL');
    const [source, setSource] = useState('');
    const [query, setQuery] = useState('');

    // Summary + activity refresh every 30s while mounted, via refetchInterval —
    // replaces the hand-rolled setInterval pair. Events only fetch while the
    // Logs tab is open (`enabled`), and refetch automatically whenever the
    // filters change since they're baked into the query key.
    const summaryQuery = useLogsSummary(plantCode);
    const activityQuery = useLogActivity(plantCode, 100);
    const eventsQuery = useLogEvents(plantCode, { level, source, query, limit: 800 }, { enabled: tab === 'logs' });

    const summary = summaryQuery.data ?? null;
    const activity = activityQuery.data ?? [];
    const activityLoading = activityQuery.isLoading;
    const events = eventsQuery.data?.events ?? [];
    const eventFacets = eventsQuery.data?.facets ?? { level: {}, source: {} };
    const eventsLoading = eventsQuery.isLoading;

    const refresh = () => {
        summaryQuery.refetch();
        activityQuery.refetch();
        if (tab === 'logs') eventsQuery.refetch();
    };

    return (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h2 className="text-title font-extrabold text-text-primary tracking-tight">Log Management</h2>
                    <p className="text-body-sm text-text-muted mt-0.5">
                        System activity, audit trail & logs across the platform
                    </p>
                </div>
                <button onClick={refresh}
                    className="flex items-center gap-1.5 text-caption font-bold px-3 py-1.5 rounded-lg border border-border text-text-muted hover:text-text-primary hover:bg-surface-2 transition-colors cursor-pointer shrink-0">
                    <RotateCw size={13} /> Refresh
                </button>
            </div>

            <SummaryStrip summary={summary} />

            {/* Tabs */}
            <div className="flex items-center gap-1 border-b border-border">
                {TABS.map(({ key, label, Icon }) => (
                    <button key={key} onClick={() => setTab(key)}
                        className={cn('flex items-center gap-2 px-4 py-2.5 text-body-sm font-bold border-b-2 -mb-px transition-colors cursor-pointer',
                            tab === key ? 'border-brand text-brand' : 'border-transparent text-text-muted hover:text-text-primary')}>
                        <Icon size={15} /> {label}
                    </button>
                ))}
            </div>

            {tab === 'activity' && <ActivityTab rows={activity} loading={activityLoading} />}
            {tab === 'logs' && (
                <LogsTab events={events} loading={eventsLoading}
                    level={level} setLevel={setLevel} source={source} setSource={setSource}
                    query={query} setQuery={setQuery} facets={eventFacets} onSearch={() => eventsQuery.refetch()} />
            )}
            {tab === 'raw' && <PipelineLogsViewer />}
        </motion.div>
    );
}
