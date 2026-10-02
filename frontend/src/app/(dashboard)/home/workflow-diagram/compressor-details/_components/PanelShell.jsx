'use client';
import React from 'react';
import { GripVertical } from 'lucide-react';
import { cn } from '@/src/lib/utils';

/**
 * PanelShell — the single card chrome every panel on this board uses.
 *
 * Replaces the three near-identical hand-rolled headers the page carried before
 * (each with its own `bg-white border-black` markup). Everything here is driven
 * by semantic tokens and `--do-radius`, so panels follow the active theme
 * variant, accent color, density and geometry from Settings.
 *
 * @param {object}   props
 * @param {string}   props.title
 * @param {Function} [props.icon]        — lucide icon component
 * @param {React.ReactNode} [props.badge]  — status chip beside the title
 * @param {React.ReactNode} [props.actions] — right-aligned controls
 * @param {boolean}  [props.draggable]    — render the react-grid-layout drag handle
 * @param {React.ReactNode} props.children — panel body
 */
export const PanelShell = React.forwardRef(function PanelShell(
    { title, icon: Icon, badge, actions, draggable = true, className, bodyClassName, children, ...rest },
    ref
) {
    return (
        <div
            ref={ref}
            className={cn(
                'group/panel flex h-full flex-col overflow-hidden',
                'rounded-lg border border-border bg-surface',
                'shadow-card transition-shadow duration-(--duration-base) hover:shadow-panel',
                className
            )}
            {...rest}
        >
            <div
                className={cn(
                    'flex shrink-0 items-center justify-between gap-2 border-b border-border',
                    'bg-surface px-3 py-2.5',
                    draggable && 'drag-handle cursor-move'
                )}
            >
                <div className="flex min-w-0 items-center gap-2">
                    {draggable && (
                        <GripVertical
                            aria-hidden="true"
                            className="h-3.5 w-3.5 shrink-0 text-text-subtle opacity-0 transition-opacity duration-(--duration-fast) group-hover/panel:opacity-100"
                        />
                    )}
                    {Icon && <Icon aria-hidden="true" className="h-4 w-4 shrink-0 text-brand" />}
                    <h2 className="truncate text-label font-black uppercase tracking-wider text-text-primary">
                        {title}
                    </h2>
                    {badge}
                </div>

                {actions && (
                    <div
                        className="flex shrink-0 items-center gap-1"
                        // Keep toolbar clicks from starting a panel drag.
                        onPointerDown={(e) => e.stopPropagation()}
                    >
                        {actions}
                    </div>
                )}
            </div>

            <div className={cn('min-h-0 flex-1', bodyClassName)}>{children}</div>
        </div>
    );
});

/** Small pill used for counts/status beside a panel title. */
export function PanelBadge({ tone = 'neutral', children }) {
    const tones = {
        neutral: 'bg-surface-2 text-text-muted border-border',
        brand: 'bg-brand-muted text-brand border-brand/20',
        success: 'bg-success/10 text-success border-success/20',
        warning: 'bg-warning/10 text-warning border-warning/20',
        danger: 'bg-danger/10 text-danger border-danger/20',
    };
    return (
        <span
            className={cn(
                'shrink-0 rounded-full border px-2 py-0.5 text-tiny font-black uppercase tracking-wider',
                tones[tone] || tones.neutral
            )}
        >
            {children}
        </span>
    );
}
