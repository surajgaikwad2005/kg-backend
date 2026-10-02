'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Calendar, ChevronDown, Clock, Globe, X } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { Select } from '@/src/components/ui/Select';

/**
 * DateRangePicker — the shared global time-range control rendered by
 * PageHeader (showDateRange). Persists {start, end, timezone} to the
 * `timeRange` localStorage key that dashboard/workspace hooks read.
 */

const DEFAULT_RANGE = { start: '2025-01-01T00:00', end: '2025-02-28T23:59' };

const PRESETS = [
    { id: 'h1',  label: '1h',  hours: 1 },
    { id: 'h6',  label: '6h',  hours: 6 },
    { id: 'h12', label: '12h', hours: 12 },
    { id: 'd1',  label: '1d',  hours: 24 },
    { id: 'd7',  label: '7d',  hours: 168 },
];

const TIMEZONES = [
    { label: 'UTC (UTC+0)',                      value: 'UTC' },
    { label: 'London / Dublin (UTC+0)',           value: 'Europe/London' },
    { label: 'Paris / Berlin / Rome (UTC+1)',     value: 'Europe/Paris' },
    { label: 'Helsinki / Athens (UTC+2)',         value: 'Europe/Helsinki' },
    { label: 'Moscow / Riyadh (UTC+3)',           value: 'Europe/Moscow' },
    { label: 'Dubai / Abu Dhabi (UTC+4)',         value: 'Asia/Dubai' },
    { label: 'Karachi / Tashkent (UTC+5)',        value: 'Asia/Karachi' },
    { label: 'Mumbai / Kolkata (UTC+5:30)',       value: 'Asia/Kolkata' },
    { label: 'Dhaka / Almaty (UTC+6)',            value: 'Asia/Dhaka' },
    { label: 'Bangkok / Jakarta (UTC+7)',         value: 'Asia/Bangkok' },
    { label: 'Shanghai / Singapore (UTC+8)',      value: 'Asia/Shanghai' },
    { label: 'Tokyo / Seoul (UTC+9)',             value: 'Asia/Tokyo' },
    { label: 'Sydney / Melbourne (UTC+10)',       value: 'Australia/Sydney' },
    { label: 'Auckland (UTC+12)',                 value: 'Pacific/Auckland' },
    { label: 'Honolulu (UTC-10)',                 value: 'Pacific/Honolulu' },
    { label: 'Los Angeles / Seattle (UTC-8)',     value: 'America/Los_Angeles' },
    { label: 'Denver / Phoenix (UTC-7)',          value: 'America/Denver' },
    { label: 'Chicago / Dallas (UTC-6)',          value: 'America/Chicago' },
    { label: 'New York / Miami (UTC-5)',          value: 'America/New_York' },
    { label: 'Halifax / Bermuda (UTC-4)',         value: 'America/Halifax' },
    { label: 'São Paulo / Buenos Aires (UTC-3)', value: 'America/Sao_Paulo' },
];

function getLocalTz() {
    try { return Intl.DateTimeFormat().resolvedOptions().timeZone; } catch { return 'UTC'; }
}

function getTzAbbr(tz) {
    try {
        const parts = new Intl.DateTimeFormat('en-US', {
            timeZone: tz,
            timeZoneName: 'short',
        }).formatToParts(new Date());
        return parts.find(p => p.type === 'timeZoneName')?.value ?? tz.split('/').pop();
    } catch {
        return tz.split('/').pop();
    }
}

function getPresetRange(hours) {
    const end = new Date();
    const start = new Date(end.getTime() - hours * 3600000);
    return {
        start: start.toISOString().slice(0, 16),
        end:   end.toISOString().slice(0, 16),
    };
}

function formatRangeLabel(start, end) {
    if (!start || !end) return 'Select range';
    try {
        const s = new Date(start);
        const e = new Date(end);
        const pad = n => String(n).padStart(2, '0');
        const fmt = d =>
            `${d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' })} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
        if (s.getFullYear() === e.getFullYear()) {
            return `${fmt(s)} – ${fmt(e)}, ${e.getFullYear()}`;
        }
        return `${fmt(s)}, ${s.getFullYear()} – ${fmt(e)}, ${e.getFullYear()}`;
    } catch { return 'Select range'; }
}

function calcDuration(start, end) {
    try {
        const ms = new Date(end) - new Date(start);
        if (ms <= 0) return null;
        const mins = Math.round(ms / 60000);
        if (mins < 60)  return `${mins} min`;
        const hrs = Math.round(ms / 3600000);
        if (hrs < 48)   return `${hrs} hrs`;
        return `${Math.round(ms / 86400000)} days`;
    } catch { return null; }
}

export function DateRangePicker() {
    const [open, setOpen]                     = useState(false);
    const [range, setRange]                   = useState(DEFAULT_RANGE);
    const [draft, setDraft]                   = useState(DEFAULT_RANGE);
    const [activePreset, setActivePreset]     = useState(null);
    const [timezone, setTimezone]             = useState(getLocalTz);
    const [draftTz, setDraftTz]               = useState(getLocalTz);
    const popRef = useRef(null);

    useEffect(() => {
        try {
            const saved = localStorage.getItem('timeRange');
            if (saved) {
                const p = JSON.parse(saved);
                const r = {
                    start: (p.start ?? DEFAULT_RANGE.start).slice(0, 16),
                    end:   (p.end   ?? DEFAULT_RANGE.end  ).slice(0, 16),
                };
                setRange(r);
                setDraft(r);
                if (p.timezone) { setTimezone(p.timezone); setDraftTz(p.timezone); }
            }
        } catch {}
    }, []);

    useEffect(() => {
        if (!open) return;
        const handler = (e) => {
            if (popRef.current && !popRef.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    const handlePreset = (preset) => {
        setDraft(getPresetRange(preset.hours));
        setActivePreset(preset.id);
    };

    const handleInput = (key, val) => {
        setDraft(d => ({ ...d, [key]: val }));
        setActivePreset(null);
    };

    const handleApply = () => {
        setRange(draft);
        setTimezone(draftTz);
        localStorage.setItem('timeRange', JSON.stringify({
            start:    draft.start + ':00',
            end:      draft.end   + ':00',
            timezone: draftTz,
        }));
        setOpen(false);
    };

    const handleCancel = () => {
        setDraft(range);
        setDraftTz(timezone);
        setActivePreset(null);
        setOpen(false);
    };

    const duration = calcDuration(draft.start, draft.end);
    const tzAbbr   = getTzAbbr(timezone);

    return (
        <div className="relative" ref={popRef}>
            {/* Trigger button */}
            <button
                onClick={() => setOpen(v => !v)}
                aria-label="Select time range"
                aria-expanded={open}
                aria-haspopup="dialog"
                title={formatRangeLabel(range.start, range.end)}
                className={cn(
                    'group flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-2 rounded-xl text-[12px] font-semibold transition-all duration-200 border cursor-pointer',
                    open
                        ? 'bg-brand-muted border-brand/30 shadow-sm shadow-brand/10'
                        : 'bg-canvas border-border hover:bg-brand-muted/60 hover:border-brand/20 hover:shadow-sm',
                    'text-text-secondary',
                )}
            >
                <Calendar className={cn(
                    'w-3.5 h-3.5 shrink-0 transition-colors',
                    open ? 'text-brand' : 'text-text-subtle group-hover:text-brand/70',
                )} />
                <span className="hidden sm:inline whitespace-nowrap">{formatRangeLabel(range.start, range.end)}</span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wide bg-surface-2 text-text-muted">
                    {tzAbbr}
                </span>
                <ChevronDown className={cn(
                    'w-3 h-3 shrink-0 transition-all duration-200',
                    open ? 'rotate-180 text-brand' : 'text-text-subtle',
                )} />
            </button>

            {/* Dropdown panel */}
            {open && (
                <div className={cn(
                    // z-100 — shared header-popover tier (see PlantSwitcher/ProfileMenu);
                    // clears page-level sticky toolbars that sit at z-50.
                    'absolute right-0 top-full mt-2 z-100 w-[min(22.5rem,calc(100vw-2rem))] rounded-2xl border shadow-2xl shadow-black/15 overflow-hidden',
                    'bg-surface border-border',
                )}>
                    {/* Panel header */}
                    <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-border/40">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-brand shrink-0" />
                            <span className="text-[13px] font-bold text-text-secondary">Time Range</span>
                        </div>
                        <button
                            onClick={handleCancel}
                            aria-label="Close time range picker"
                            className="w-6 h-6 flex items-center justify-center rounded-lg text-text-subtle hover:text-text-muted hover:bg-surface-2 transition-colors cursor-pointer"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    <div className="p-5 space-y-4">
                        {/* Quick presets */}
                        <div>
                            <p className="text-[10px] font-bold text-text-subtle uppercase tracking-widest mb-2.5">
                                Quick Select
                            </p>
                            <div className="grid grid-cols-5 gap-1.5">
                                {PRESETS.map(p => (
                                    <button
                                        key={p.id}
                                        onClick={() => handlePreset(p)}
                                        className={cn(
                                            'py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-150 text-center cursor-pointer',
                                            activePreset === p.id
                                                ? 'bg-brand text-white shadow-sm shadow-brand/25'
                                                : 'bg-surface-2 text-text-muted hover:bg-brand-muted hover:text-brand',
                                        )}
                                    >
                                        {p.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="h-px bg-border/40" />

                        {/* Date inputs */}
                        <div className="space-y-3">
                            {[
                                { label: 'From', key: 'start' },
                                { label: 'To',   key: 'end'   },
                            ].map(({ label, key }) => (
                                <div key={key}>
                                    <label htmlFor={`date-range-${key}`} className="block text-[10px] font-bold text-text-subtle uppercase tracking-widest mb-1.5">
                                        {label}
                                    </label>
                                    <input
                                        id={`date-range-${key}`}
                                        type="datetime-local"
                                        value={draft[key]}
                                        onChange={(e) => handleInput(key, e.target.value)}
                                        className={cn(
                                            'w-full rounded-xl px-3.5 py-2.5 text-[12px] font-medium transition-colors',
                                            'bg-canvas border border-border',
                                            'text-text-secondary',
                                            'focus:outline-none focus:ring-2 focus:ring-brand/25 focus:border-brand',
                                            'hover:border-border-strong',
                                        )}
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="h-px bg-border/40" />

                        {/* Timezone selector */}
                        <div>
                            <label htmlFor="date-range-timezone" className="flex items-center gap-1.5 text-[10px] font-bold text-text-subtle uppercase tracking-widest mb-1.5">
                                <Globe className="w-3 h-3" />
                                Timezone
                            </label>
                            <Select
                                id="date-range-timezone"
                                value={draftTz}
                                onChange={setDraftTz}
                                options={TIMEZONES.map((tz) => ({ value: tz.value, label: tz.label }))}
                                searchable
                            />
                        </div>

                        {/* Duration badge */}
                        {duration && (
                            <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-brand-muted border border-brand/20">
                                <Clock className="w-3 h-3 text-brand shrink-0" />
                                <span className="text-[11px] font-semibold text-brand">
                                    {duration} selected
                                </span>
                                <span className="ml-auto text-[10px] font-bold text-brand/70 tracking-wide">
                                    {getTzAbbr(draftTz)}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Footer actions */}
                    <div className="flex gap-2 px-5 pb-5">
                        <button
                            onClick={handleApply}
                            className="flex-1 py-2.5 rounded-xl bg-brand hover:bg-brand-hover active:bg-brand-hover text-white text-[12px] font-bold transition-all active:scale-[0.98] shadow-sm shadow-brand/20 cursor-pointer"
                        >
                            Apply Range
                        </button>
                        <button
                            onClick={handleCancel}
                            className="px-4 py-2.5 rounded-xl bg-surface-2 hover:bg-border text-text-muted text-[12px] font-bold transition-all active:scale-[0.98] cursor-pointer"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
