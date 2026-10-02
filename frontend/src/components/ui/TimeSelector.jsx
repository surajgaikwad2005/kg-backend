'use client';
import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Calendar, X, Check, Clock, Globe, ChevronDown } from 'lucide-react';
import { Skeleton } from '@/src/components/ui/Skeleton';
import { Select } from '@/src/components/ui/Select';
import { useMenuMotion } from '@/src/components/layout/menuMotion';

const PRESETS = [
  { label: '1h',  hours: 1 },
  { label: '6h',  hours: 6 },
  { label: '12h', hours: 12 },
  { label: '1d',  hours: 24 },
  { label: '7d',  hours: 168 },
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
  { label: 'São Paulo / Buenos Aires (UTC-3)', value: 'America/Sao_Paulo' },
];

function getLocalTimezone() {
  try { return Intl.DateTimeFormat().resolvedOptions().timeZone; } catch { return 'UTC'; }
}

function readStoredRange() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('timeRange');
    if (!raw) return null;
    const { start, end, timezone } = JSON.parse(raw);
    const s = start ? new Date(start) : null;
    const e = end ? new Date(end) : null;
    if (!s || isNaN(s.getTime()) || !e || isNaN(e.getTime())) return null;
    return { start: s, end: e, timezone: timezone || getLocalTimezone() };
  } catch { return null; }
}

function buildDefault() {
  const end = new Date();
  const start = new Date(end.getTime() - 6 * 3600000);
  return { start, end, timezone: getLocalTimezone() };
}

function toInputStr(date, tz) {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hour12: false,
    }).formatToParts(date);
    const get = t => parts.find(p => p.type === t)?.value ?? '00';
    const hr = get('hour') === '24' ? '00' : get('hour');
    return `${get('year')}-${get('month')}-${get('day')}T${hr}:${get('minute')}`;
  } catch {
    const p = n => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}T${p(date.getHours())}:${p(date.getMinutes())}`;
  }
}

function fmtDisplay(date, tz) {
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: tz, month: 'short', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hour12: false,
    }).format(date);
  } catch {
    const p = n => String(n).padStart(2, '0');
    return `${date.getDate()} ${date.toLocaleString('en-US', { month: 'short' })} ${p(date.getHours())}:${p(date.getMinutes())}`;
  }
}

function getTzAbbr(tz) {
  try {
    const parts = new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'short' }).formatToParts(new Date());
    return parts.find(p => p.type === 'timeZoneName')?.value ?? tz.split('/').pop();
  } catch { return tz.split('/').pop(); }
}

function calcDuration(start, end) {
  const ms = end - start;
  if (ms <= 0) return null;
  const mins = Math.round(ms / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.round(ms / 3600000);
  if (hrs < 48) return `${hrs}h`;
  return `${Math.round(ms / 86400000)}d`;
}

/**
 * Global time-range selector. Reads/writes localStorage `timeRange`
 * ({ start, end, timezone }) and fires `timeRangeChanged` so all
 * useTimeRange consumers re-render automatically.
 *
 * @param {{ compact?: boolean }} props
 */
export default function TimeSelector({ compact = false }) {
  const containerRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const { panelMotion } = useMenuMotion();

  // `null` until mount — the real value depends on `new Date()`/localStorage,
  // which must not be computed during the initial render (server and client
  // resolve it at different instants, causing a hydration text mismatch).
  const [applied, setApplied] = useState(null);
  const [draft, setDraft] = useState(null);

  // Resolve the actual range on mount (client-only), then sync with external
  // timeRangeChanged events (e.g. PageHeader DateRangePicker).
  useEffect(() => {
    const initial = readStoredRange() ?? buildDefault();
    setApplied(initial);
    setDraft(initial);
    const sync = () => {
      const stored = readStoredRange();
      if (stored) { setApplied(stored); setDraft(stored); }
    };
    window.addEventListener('timeRangeChanged', sync);
    return () => window.removeEventListener('timeRangeChanged', sync);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const fn = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, [isOpen]);

  const applyPreset = (hours) => {
    const end = new Date();
    const start = new Date(end.getTime() - hours * 3600000);
    setDraft(d => ({ ...d, start, end }));
  };

  const handleApply = () => {
    setApplied(draft);
    localStorage.setItem('timeRange', JSON.stringify({
      start: draft.start.toISOString(),
      end: draft.end.toISOString(),
      timezone: draft.timezone,
    }));
    window.dispatchEvent(new Event('timeRangeChanged'));
    setIsOpen(false);
  };

  const handleCancel = () => { setDraft(applied); setIsOpen(false); };

  // Pre-mount placeholder: `applied` is null until the client-only effect
  // above resolves the real (non-deterministic) range, so nothing here may
  // read `applied.*` yet.
  if (!applied || !draft) {
    return (
      <div className="relative shrink-0">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-surface">
          <Skeleton className="w-3.25 h-3.25 rounded-sm" />
          <Skeleton className={`w-24 h-3.25 rounded-sm ${compact ? 'hidden xl:inline-block' : 'hidden md:inline-block'}`} />
          <Skeleton className="w-9 h-4 rounded" />
        </div>
      </div>
    );
  }

  const tzAbbr = getTzAbbr(applied.timezone);
  const duration = calcDuration(applied.start, applied.end);

  return (
    <div className="relative shrink-0" ref={containerRef}>
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(v => !v)}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className={`flex items-center gap-1.5 px-3 h-8 rounded-lg border cursor-pointer font-semibold whitespace-nowrap transition-all duration-200 ${
          isOpen
            ? 'border-indigo-600 bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400'
            : 'border-border bg-surface text-text-secondary hover:border-indigo-300 hover:bg-surface-2'
        }`}
      >
        <Calendar size={13} className={isOpen ? 'text-indigo-600 dark:text-indigo-400' : 'text-text-subtle'} />
        <span className={`text-xs font-semibold ${compact ? 'hidden xl:inline' : 'hidden md:inline'}`}>
          {fmtDisplay(applied.start, applied.timezone)}
          <span className="mx-1 text-text-subtle">→</span>
          {fmtDisplay(applied.end, applied.timezone)}
        </span>
        {duration && (
          <span className="hidden lg:inline-block text-[11px] font-bold text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 rounded px-1.5 py-0.5">
            {duration}
          </span>
        )}
        <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium border ${isOpen ? 'bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800' : 'bg-surface-2 text-text-secondary border-border'}`}>
          <Globe size={10} className="shrink-0" />
          <span className="hidden sm:inline">{tzAbbr}</span>
        </span>
        <ChevronDown size={11} className={`transition-transform duration-200 text-text-subtle ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
      {isOpen && (
        <motion.div
          role="dialog"
          aria-label="Select time range"
          initial={panelMotion.initial}
          animate={panelMotion.animate}
          exit={panelMotion.exit}
          transition={panelMotion.transition}
          style={{ transformOrigin: 'top right' }}
          className="absolute top-[calc(100%+8px)] right-0 z-500 w-[min(400px,calc(100vw-1rem))] bg-surface border border-border rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.16)] overflow-hidden"
        >

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-surface-2 bg-canvas">
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-brand" />
              <span className="text-caption font-black text-text-primary tracking-widest uppercase">Time Window</span>
            </div>
            <button onClick={() => setIsOpen(false)} aria-label="Close" className="bg-surface border border-border rounded-lg p-1 cursor-pointer text-text-muted hover:bg-surface-2 transition-colors">
              <X size={13} />
            </button>
          </div>

          <div className="p-4 flex flex-col gap-4">
            {/* Quick presets */}
            <div>
              <p className="text-2xs font-black text-text-muted uppercase tracking-widest mb-2">Quick Presets</p>
              <div className="flex gap-1.5 flex-wrap">
                {PRESETS.map(p => (
                  <button
                    key={p.label}
                    onClick={() => applyPreset(p.hours)}
                    className="px-3 py-1 bg-surface-2 hover:bg-brand hover:text-white rounded-full text-label font-black uppercase cursor-pointer border border-transparent hover:border-brand transition-all duration-150"
                  >
                    Last {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Start / End */}
            <div className="grid grid-cols-2 gap-3">
              {[['Start', 'start'], ['End', 'end']].map(([label, key]) => (
                <div key={key}>
                  <label className="block text-2xs font-black text-text-muted uppercase tracking-widest mb-1.5">{label}</label>
                  <input
                    type="datetime-local"
                    value={toInputStr(draft[key], draft.timezone)}
                    onChange={e => { const d = new Date(e.target.value); if (!isNaN(d.getTime())) setDraft(v => ({ ...v, [key]: d })); }}
                    className="w-full px-2.5 py-2 rounded-lg border-[1.5px] border-border text-label font-bold text-text-primary outline-none box-border bg-canvas focus:border-brand focus:ring-2 focus:ring-brand/10 transition-all"
                  />
                </div>
              ))}
            </div>

            {/* Timezone */}
            <Select
              label={<span className="flex items-center gap-1"><Globe size={10} /> Timezone</span>}
              value={draft.timezone}
              onChange={tz => setDraft(v => ({ ...v, timezone: tz }))}
              options={TIMEZONES}
            />
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-surface-2 bg-canvas flex gap-2">
            <button
              onClick={handleCancel}
              className="flex-1 py-2 rounded-xl border border-border bg-surface text-label font-black text-text-muted cursor-pointer hover:bg-surface-2 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="flex-1 py-2 rounded-xl bg-brand hover:bg-brand-hover text-label font-black text-white cursor-pointer flex items-center justify-center gap-1.5 shadow-[0_4px_12px_rgba(37,99,235,0.25)] transition-all"
            >
              <Check size={13} /> Apply
            </button>
          </div>

          {panelMotion.sheen && <div className="liquid-glass-sheen" />}
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}
