'use client';

/**
 * Route-level error boundary for the whole Domain Configuration feature.
 *
 * This is the OUTER net. Next.js renders it in place of the route's page when
 * anything inside throws during render, which keeps the admin shell (sidebar,
 * header) mounted instead of blanking the window — previously a single
 * malformed row from a legacy SAP export or a scanned P&ID unmounted the entire
 * tree to a white screen.
 *
 * Prefer the finer-grained `<ErrorBoundary>` around individual tables and panels
 * (src/components/ui/ErrorBoundary.jsx): reaching THIS file means the whole
 * screen is gone, whereas a wrapped region fails alone and leaves the rest of
 * the page usable. This exists so that the cases nobody wrapped still degrade
 * into something recoverable.
 *
 * `reset` is Next's own re-render of the segment; it clears the error without a
 * full page load, so unsaved state elsewhere in the app survives.
 */
import { AlertTriangle, RotateCcw } from 'lucide-react';
import Link from 'next/link';

export default function DomainConfigurationError({ error, reset }) {
    return (
        <div
            role="alert"
            className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center"
        >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-danger/10 border border-danger/20">
                <AlertTriangle size={22} className="text-danger" aria-hidden="true" />
            </div>

            <div className="max-w-md">
                <h2 className="text-base font-bold text-text-primary">
                    This screen could not be displayed
                </h2>
                <p className="mt-1 text-sm text-text-muted">
                    Your data is safe — nothing was saved or deleted. This is usually a record
                    that does not match the shape this screen expects.
                </p>
                {error?.message && (
                    <p className="mt-3 font-mono text-xs text-text-subtle break-words">
                        {error.message}
                    </p>
                )}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                    type="button"
                    onClick={reset}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-brand px-5 py-2 text-sm font-bold text-white transition-all hover:bg-brand-hover cursor-pointer"
                >
                    <RotateCcw size={14} aria-hidden="true" />
                    Try again
                </button>
                <Link
                    href="/admin/domain-configuration"
                    className="inline-flex items-center rounded-xl border border-border bg-surface px-5 py-2 text-sm font-bold text-text-secondary transition-all hover:bg-surface-2 cursor-pointer"
                >
                    Back to Domain Configuration
                </Link>
            </div>
        </div>
    );
}
