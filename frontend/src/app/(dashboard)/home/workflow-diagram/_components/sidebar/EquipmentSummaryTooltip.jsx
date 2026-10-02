'use client';
import React from 'react';
import { AlertCircle, CircleSlash, Database } from 'lucide-react';

/**
 * EquipmentSummaryTooltip — body of the hover panel on an "Available Equipment"
 * card. Renders the card's own identity (name + description, which the native
 * `title` attribute used to carry) above the plant's Detailed Equipment Summary
 * status from GET /clients/detailedEquipmentSummary/status.
 *
 * That endpoint reports the cached summary as a whole — `generated`,
 * `total_records`, `last_modified` — and accepts no equipment name, so the
 * figures below are plant-level and identical across cards by design, not a
 * lookup miss. See useEquipmentSummaryStatus for the fuller note.
 *
 * Colors: the host bubble is `bg-overlay text-white` (Tooltip's `panel`
 * variant), so text here rides that overlay in white/alpha the same way the
 * app's other tooltips do; status accents use the semantic success/warning/
 * danger tokens, so all 12 theme variants and the accent color still apply.
 */

const DATE_FORMAT = {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
};

function formatTimestamp(iso) {
    if (!iso) return '—';
    const parsed = new Date(iso);
    if (Number.isNaN(parsed.getTime())) return '—';
    return parsed.toLocaleString(undefined, DATE_FORMAT);
}

function StatRow({ label, value }) {
    return (
        <div className="flex items-baseline justify-between gap-3">
            <span className="shrink-0 text-[9px] font-black uppercase tracking-widest text-white/45">
                {label}
            </span>
            <span className="min-w-0 truncate text-right text-[10px] font-bold text-white/90">
                {value}
            </span>
        </div>
    );
}

function StatusBody({ status, loading, error }) {
    if (loading && !status) {
        return (
            <div className="space-y-2" aria-busy="true">
                <div className="skeleton-shimmer h-2.5 w-full rounded bg-white/15" />
                <div className="skeleton-shimmer h-2.5 w-3/5 rounded bg-white/15" style={{ '--sk-delay': '0.08s' }} />
                <span className="sr-only">Loading equipment summary status</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-start gap-1.5">
                <AlertCircle aria-hidden="true" className="mt-px h-3 w-3 shrink-0 text-danger" />
                <p className="text-[10px] font-semibold leading-relaxed text-white/75">{error}</p>
            </div>
        );
    }

    if (!status) return null;

    if (!status.generated) {
        return (
            <div className="flex items-start gap-1.5">
                <CircleSlash aria-hidden="true" className="mt-px h-3 w-3 shrink-0 text-warning" />
                <p className="text-[10px] font-semibold leading-relaxed text-white/75">
                    Summary not generated for this plant yet. Generate it from the AI tab.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-1.5">
            <StatRow label="Records" value={status.total_records ?? '—'} />
            <StatRow label="Updated" value={formatTimestamp(status.last_modified)} />
        </div>
    );
}

export function EquipmentSummaryTooltip({ name, description, status, loading, error }) {
    return (
        <div className="text-left">
            <p className="truncate text-[11px] font-black uppercase tracking-tight text-white">
                {name}
            </p>
            {description && (
                <p className="mt-1 line-clamp-3 text-[10px] font-semibold leading-relaxed text-white/65">
                    {description}
                </p>
            )}

            <div className="mt-2.5 border-t border-white/15 pt-2.5">
                <div className="mb-1.5 flex items-center gap-1.5">
                    <Database aria-hidden="true" className="h-2.5 w-2.5 shrink-0 text-white/45" />
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/45">
                        Equipment Summary
                    </p>
                </div>
                <StatusBody status={status} loading={loading} error={error} />
            </div>
        </div>
    );
}
