'use client';
import { useState, useEffect } from 'react';

function getLocalTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

/** Read and validate the stored timeRange from localStorage. Returns null if absent or corrupt. */
function parseStoredRange() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('timeRange');
    if (!raw) return null;
    const { start, end, timezone } = JSON.parse(raw);
    const s = start ? new Date(start) : null;
    const e = end ? new Date(end) : null;
    if (!s || isNaN(s.getTime()) || !e || isNaN(e.getTime())) return null;
    return { start: s, end: e, timezone: timezone || getLocalTimezone() };
  } catch {
    return null;
  }
}

/**
 * Write sensible defaults to localStorage (now−6h → now, local timezone) and
 * notify all listeners. Called only when no valid stored range exists.
 */
function initDefaultRange() {
  const end = new Date();
  const start = new Date(end.getTime() - 6 * 60 * 60 * 1000);
  const timezone = getLocalTimezone();
  try {
    localStorage.setItem('timeRange', JSON.stringify({
      start: start.toISOString(),
      end: end.toISOString(),
      timezone,
    }));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('timeRangeChanged'));
    }
  } catch {}
  return { start, end, timezone };
}

/**
 * Hook that returns the global time range kept in localStorage.
 *
 * @returns {{ start: Date, end: Date, timezone: string }}
 *
 * If localStorage has no valid entry the hook writes a default (now−6h → now,
 * browser local timezone) before returning, so every consumer always has a
 * real value to work with.
 *
 * Listens for the `timeRangeChanged` window event dispatched by the global
 * DateRangePicker (PageHeader) and TimeSelector components and re-renders
 * automatically.
 */
export function useTimeRange() {
  const [range, setRange] = useState(() => {
    const stored = parseStoredRange();
    return stored ?? initDefaultRange();
  });

  useEffect(() => {
    const sync = () => {
      const stored = parseStoredRange();
      if (stored) setRange(stored);
    };
    window.addEventListener('timeRangeChanged', sync);
    return () => window.removeEventListener('timeRangeChanged', sync);
  }, []);

  return range; // { start: Date, end: Date, timezone: string }
}
