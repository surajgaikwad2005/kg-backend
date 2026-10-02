/**
 * lib/time.js — shared time formatting for audit/activity views.
 *
 * The backend stamps audit timestamps with Postgres `now()` into TIMESTAMP
 * (no time zone) columns and serializes them with `.isoformat()`, producing
 * offset-less strings like "2026-06-22T05:13:48" that are actually UTC. JS
 * `new Date("...no offset...")` parses those as LOCAL time, so a job done minutes
 * ago shows as hours ago (off by the viewer's UTC offset). parseUTC fixes this by
 * treating offset-less timestamps as UTC; strings that already carry a zone
 * (Z / ±hh:mm) are left untouched.
 */

/** Parse a backend timestamp, treating offset-less values as UTC. Returns a Date. */
export function parseUTC(iso) {
    if (!iso) return new Date(NaN);
    if (iso instanceof Date) return iso;
    const s = String(iso);
    // Already zoned? (ends with Z, or has a ±hh:mm offset after the time).
    const hasZone = /[zZ]$/.test(s) || /[+-]\d{2}:?\d{2}$/.test(s);
    return new Date(hasZone ? s : s + 'Z');
}

/** "5s ago" / "12m ago" / "3h ago" / "Jun 20". `nowMs` lets callers pin a stable now. */
export function timeAgo(iso, nowMs) {
    const d = parseUTC(iso);
    if (Number.isNaN(d.getTime())) return iso || '—';
    const ref = typeof nowMs === 'number' ? nowMs : Date.now();
    const s = Math.floor((ref - d.getTime()) / 1000);
    if (s < 0) return 'just now';
    if (s < 60) return `${s}s ago`;
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

/** Absolute local time, e.g. "Jun 22, 10:43:48 AM" — for tooltips/detail. */
export function fmtTime(iso) {
    if (!iso) return '';
    const d = parseUTC(iso);
    return Number.isNaN(d.getTime()) ? String(iso) : d.toLocaleString([], {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
}
