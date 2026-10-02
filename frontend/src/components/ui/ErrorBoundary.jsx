'use client';

/**
 * ErrorBoundary — the only thing that stops ONE bad row from blanking the page.
 *
 * React unmounts the entire tree when a render throws, so before this existed a
 * single malformed record took the whole admin panel to a white screen, with no
 * recovery short of a reload that also discarded every unsaved edit. Petronas
 * data arrives from legacy SAP exports, hand-built spreadsheets and scanned
 * P&IDs, so a row that violates a shape the UI assumes is normal traffic, not a
 * rare event.
 *
 * Wrap each independently-failing REGION (a table, a preview pane, a panel)
 * rather than the whole screen: the point is that the rest of the page keeps
 * working while the broken region shows a retry. The route-level
 * `error.jsx` files are the outer net for everything not wrapped here.
 *
 * `resetKeys` re-mounts the subtree when a value changes — pass the plant code
 * (and anything else that selects WHICH data renders) so switching plants clears
 * a stuck error instead of stranding the user on it.
 *
 * This must stay a class component: `getDerivedStateFromError` /
 * `componentDidCatch` have no hook equivalent.
 */
import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

const arraysDiffer = (a = [], b = []) =>
    a.length !== b.length || a.some((v, i) => !Object.is(v, b[i]));

export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { error: null };
        this.reset = this.reset.bind(this);
    }

    static getDerivedStateFromError(error) {
        return { error };
    }

    componentDidUpdate(prevProps) {
        // A different plant (or batch, or file) is different data — a failure
        // against the old one should not survive into the new one.
        if (this.state.error && arraysDiffer(prevProps.resetKeys, this.props.resetKeys)) {
            this.reset();
        }
    }

    componentDidCatch(error, info) {
        this.props.onError?.(error, info);
    }

    reset() {
        this.setState({ error: null });
        this.props.onReset?.();
    }

    render() {
        const { error } = this.state;
        if (!error) return this.props.children;

        const { fallback, title, description, className = '' } = this.props;
        if (typeof fallback === 'function') return fallback({ error, reset: this.reset });
        if (fallback) return fallback;

        return (
            <div
                role="alert"
                className={`flex flex-col items-center justify-center gap-3 py-12 px-4 text-center rounded-(--do-radius) border border-danger/20 bg-danger/5 ${className}`}
            >
                <AlertTriangle size={22} className="text-danger" aria-hidden="true" />
                <div>
                    <p className="text-body-sm font-semibold text-text-primary">
                        {title || 'Something broke while rendering this section'}
                    </p>
                    <p className="text-caption text-text-muted mt-0.5 max-w-md">
                        {description
                            || 'The rest of the page is still usable. Try again, and if it keeps failing the data for this section is probably malformed.'}
                    </p>
                    {/* The message is the one actionable detail for a developer;
                        the stack is not shown because this renders in-product. */}
                    {error?.message && (
                        <p className="text-caption text-text-subtle mt-2 font-mono break-words max-w-md">
                            {error.message}
                        </p>
                    )}
                </div>
                <button
                    type="button"
                    onClick={this.reset}
                    className="inline-flex items-center gap-1.5 py-1.5 px-4 rounded-(--do-radius) text-label font-bold bg-danger/10 text-danger border border-danger/20 hover:bg-danger/15 transition-all duration-200 cursor-pointer"
                >
                    <RotateCcw size={13} aria-hidden="true" />
                    Try again
                </button>
            </div>
        );
    }
}
