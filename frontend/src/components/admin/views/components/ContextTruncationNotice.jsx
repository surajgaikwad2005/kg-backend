'use client';

/**
 * ContextTruncationNotice — the banner that says "you are not looking at
 * everything".
 *
 * Every review screen (timeseries / SAP / P&ID / documents) fetches ONE page of
 * staged context rows and renders it as if it were the whole set. On a Petronas
 * plant that is routinely false: 50,000 tags arrive as the first 500. Committing
 * from a table you believe is complete, when it is not, is the single most
 * expensive mistake this feature can produce — so this is deliberately loud
 * (warning colours, `role="alert"`, stated counts) rather than a subtle caption.
 *
 * It renders nothing when the payload is complete, so screens can mount it
 * unconditionally.
 *
 * Responds to: accent/semantic tokens, --do-radius geometry, font scale, and
 * layout density via the shared token set. It sets no fixed colours, sizes or
 * radii of its own, so every Appearance and Interface control applies. It has no
 * animation, so motion-speed settings do not apply to it.
 */
import { AlertTriangle } from 'lucide-react';

const nf = new Intl.NumberFormat();

export function ContextTruncationNotice({
    truncation,
    noun = 'rows',
    className = '',
}) {
    if (!truncation?.isTruncated) return null;

    const { shown, total } = truncation;
    const remaining = total != null ? Math.max(total - shown, 0) : null;

    return (
        <div
            role="alert"
            className={`flex items-start gap-3 rounded-(--do-radius) border border-warning/30 bg-warning/10 px-4 py-3 ${className}`}
        >
            <AlertTriangle size={18} className="mt-0.5 shrink-0 text-warning" aria-hidden="true" />
            <div className="min-w-0">
                <p className="text-body-sm font-bold text-text-primary">
                    {total != null
                        ? `Showing ${nf.format(shown)} of ${nf.format(total)} ${noun}`
                        : `Showing the first ${nf.format(shown)} ${noun}`}
                </p>
                <p className="text-caption text-text-secondary mt-0.5">
                    {remaining != null
                        ? `${nf.format(remaining)} more ${noun} exist for this plant and are not listed here. `
                        : `More ${noun} exist for this plant and are not listed here. `}
                    Reviewing and committing from this screen does not mean the
                    {' '}{noun}{' '} below are all of them — check with your data team before you commit.
                </p>
            </div>
        </div>
    );
}
