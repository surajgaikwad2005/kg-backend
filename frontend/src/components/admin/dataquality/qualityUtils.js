/**
 * qualityUtils.js
 * Pure helpers + declarative config for the Timeseries Data-Quality feature.
 * Keeps the summary card and modal free of formatting / threshold logic.
 *
 * Shapes come from GET /api/domain-configuration/timeseries/data-quality/analyze
 * → `data` (quality_score,
 * dataset_overview, checks_summary, and per-check finding arrays).
 */

// ── Tone helpers ─────────────────────────────────────────────────────────────
/** Score → semantic tone (slate/blue admin palette). */
export function scoreTone(score) {
    if (score == null || Number.isNaN(score)) return TONES.neutral;
    if (score >= 80) return TONES.good;
    if (score >= 60) return TONES.warn;
    return TONES.bad;
}

/** A check is "clean" when nothing is affected. */
export function checkTone({ affectedPct, status }) {
    if (status === 'PASS') return TONES.good;
    if (status === 'FAIL') return TONES.bad;
    if (!affectedPct) return TONES.good;
    return affectedPct >= 25 ? TONES.bad : TONES.warn;
}

export function statusTone(status) {
    if (status === 'PASS') return TONES.good;
    if (status === 'FAIL') return TONES.bad;
    return TONES.warn;
}

export const TONES = {
    good:    { text: 'text-success',    bg: 'bg-success/10',  border: 'border-success/30',  ring: 'var(--color-success)', soft: 'bg-success' },
    warn:    { text: 'text-warning',    bg: 'bg-warning/10',  border: 'border-warning/30',  ring: 'var(--color-warning)', soft: 'bg-warning' },
    bad:     { text: 'text-danger',     bg: 'bg-danger/10',   border: 'border-danger/30',   ring: 'var(--color-danger)',  soft: 'bg-danger' },
    neutral: { text: 'text-text-muted', bg: 'bg-canvas',      border: 'border-border',      ring: 'var(--color-text-muted)', soft: 'bg-border-strong' },
};

// ── Formatters ───────────────────────────────────────────────────────────────
export const fmtInt = (n) =>
    n == null || n === '' ? '—' : Number(n).toLocaleString('en-US');

export const fmtPct = (n) =>
    n == null || Number.isNaN(Number(n)) ? '—' : `${Math.round(Number(n) * 100) / 100}%`;

export const fmtNum = (n, digits = 3) =>
    n == null || Number.isNaN(Number(n)) ? '—' : String(Math.round(Number(n) * 10 ** digits) / 10 ** digits);

/** "672930" minutes → "1y 100d" style compact duration. */
export function fmtDuration(minutes) {
    if (!minutes) return '—';
    const days = Math.floor(minutes / 1440);
    const hours = Math.floor((minutes % 1440) / 60);
    if (days >= 365) {
        const years = Math.floor(days / 365);
        const remDays = days % 365;
        return `${years}y ${remDays}d`;
    }
    if (days > 0) return `${days}d ${hours}h`;
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
}

/** "2025-01-01 00:00:07" → "01 Jan 2025, 00:00". Falls back to the raw string. */
export function fmtDateTime(value) {
    if (!value) return '—';
    const d = new Date(String(value).replace(' ', 'T'));
    if (Number.isNaN(d.getTime())) return String(value);
    return d.toLocaleString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
}

// ── checks_summary → display rows ────────────────────────────────────────────
const SUMMARY_META = {
    missing_values:    { label: 'Missing Values',    desc: 'Null gaps in sensor streams' },
    null_bursts:       { label: 'Null Bursts',       desc: 'Long consecutive null runs' },
    frozen_signals:    { label: 'Frozen Signals',    desc: 'Value stuck for long stretches' },
    stuck_at_zero:     { label: 'Stuck at Zero',     desc: 'Reading pinned to zero' },
    dead_sensors:      { label: 'Dead Sensors',      desc: 'Almost no unique values' },
    spikes:            { label: 'Spikes',            desc: 'Statistical outliers' },
    duplicate_signals: { label: 'Duplicate Signals', desc: 'Highly-correlated pairs' },
    duplicate_rows:    { label: 'Duplicate Rows',    desc: 'Repeated full records' },
    timestamp_gaps:    { label: 'Timestamp Gaps',    desc: 'Missing time slots' },
};

const SUMMARY_ORDER = [
    'missing_values', 'null_bursts', 'frozen_signals', 'stuck_at_zero',
    'dead_sensors', 'spikes', 'duplicate_signals', 'duplicate_rows', 'timestamp_gaps',
];

/** Normalize the heterogeneous checks_summary into uniform card descriptors. */
export function toSummaryCards(checksSummary = {}) {
    return SUMMARY_ORDER
        .filter((key) => checksSummary[key])
        .map((key) => {
            const c = checksSummary[key];
            const meta = SUMMARY_META[key];
            const affectedPct = c.affected_pct ?? (c.status === 'PASS' ? 0 : null);
            let metric;
            if (c.affected_sensors != null && c.total_sensors != null) {
                metric = `${c.affected_sensors} / ${c.total_sensors} sensors`;
            } else if (c.duplicate_pairs != null) {
                metric = `${c.duplicate_pairs} pair${c.duplicate_pairs === 1 ? '' : 's'}`;
            } else if (c.duplicate_rows != null) {
                metric = `${fmtInt(c.duplicate_rows)} rows`;
            } else if (c.gap_count != null) {
                metric = `${fmtInt(c.gap_count)} gaps`;
            } else {
                metric = '—';
            }
            const status = c.status || (affectedPct ? 'FAIL' : 'PASS');
            return { key, ...meta, metric, affectedPct, status, extra: c.total_spike_count };
        });
}

// ── Per-check finding tables (modal "Findings" sections) ─────────────────────
// Each column: { key, label, align?, mono?, render?(row) }. `affected` is shared.
const AFFECTED_COL = { key: 'affected_pct', label: 'Affected', kind: 'bar' };

export const FINDING_SECTIONS = [
    {
        key: 'missing_values', title: 'Missing Values', dataKey: 'missing_values',
        columns: [
            { key: 'sensor', label: 'Sensor', mono: true },
            { key: 'missing_count', label: 'Missing', align: 'right', kind: 'int' },
            { key: 'missing_pct', label: '%', align: 'right', kind: 'pct' },
            { key: 'first_null_at', label: 'First null', kind: 'date' },
            AFFECTED_COL,
        ],
    },
    {
        key: 'null_bursts', title: 'Null Bursts', dataKey: 'null_bursts',
        columns: [
            { key: 'sensor', label: 'Sensor', mono: true },
            { key: 'max_null_burst', label: 'Longest run', align: 'right', kind: 'int' },
            { key: 'burst_minutes', label: 'Minutes', align: 'right', kind: 'int' },
            { key: 'burst_start_time', label: 'Started', kind: 'date' },
            AFFECTED_COL,
        ],
    },
    {
        key: 'frozen_signals', title: 'Frozen Signals', dataKey: 'frozen_signals',
        columns: [
            { key: 'sensor', label: 'Sensor', mono: true },
            { key: 'frozen_value', label: 'Value', align: 'right', kind: 'num' },
            { key: 'frozen_rows', label: 'Rows', align: 'right', kind: 'int' },
            { key: 'since', label: 'Since', kind: 'date' },
            AFFECTED_COL,
        ],
    },
    {
        key: 'spikes', title: 'Spikes', dataKey: 'spikes',
        columns: [
            { key: 'sensor', label: 'Sensor', mono: true },
            { key: 'spike_count', label: 'Spikes', align: 'right', kind: 'int' },
            { key: 'threshold_rule', label: 'Rule', mono: true },
            AFFECTED_COL,
        ],
    },
    {
        key: 'duplicate_signals', title: 'Duplicate Signals', dataKey: 'duplicate_signals',
        defaultStatus: 'DUP',
        columns: [
            { key: 'sensor_a', label: 'Sensor A', mono: true },
            { key: 'sensor_b', label: 'Sensor B', mono: true },
            { key: 'correlation', label: 'Correlation', align: 'right', kind: 'num' },
            AFFECTED_COL,
        ],
    },
    {
        key: 'stuck_at_zero', title: 'Stuck at Zero', dataKey: 'stuck_at_zero',
        columns: [
            { key: 'sensor', label: 'Sensor', mono: true },
            { key: 'zero_rows', label: 'Zero rows', align: 'right', kind: 'int' },
            { key: 'zero_pct', label: '%', align: 'right', kind: 'pct' },
            AFFECTED_COL,
        ],
    },
    {
        key: 'dead_sensors', title: 'Dead Sensors', dataKey: 'dead_sensors',
        columns: [
            { key: 'sensor', label: 'Sensor', mono: true },
            { key: 'unique_values', label: 'Unique values', align: 'right', kind: 'int' },
            { key: 'unique_ratio', label: 'Unique ratio', align: 'right', kind: 'num' },
            AFFECTED_COL,
        ],
    },
];
