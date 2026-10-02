'use client';

/**
 * SegmentedControl — a small set of mutually exclusive options rendered as one
 * pill-shaped switch.
 *
 * Extracted from the lifecycle filter that FlowFilesPanel had inlined, because
 * the Data Configuration view needed the identical control for its
 * Sources/Files switch. Two hand-rolled copies of the same widget drift; one
 * configurable component does not (rule 16).
 *
 * Rendered as a real tablist: arrow keys move between options and only the
 * active tab is in the tab order, which is what assistive tech expects from a
 * control that looks like this. A plain row of buttons would announce as N
 * unrelated buttons and take N tab stops.
 */
import React, { useCallback, useRef } from 'react';
import { cn } from '@/src/lib/utils';

const SIZES = {
    sm: 'px-2.5 py-1 text-tiny',
    md: 'px-3 py-1.5 text-caption',
};

export function SegmentedControl({
    options = [],
    value,
    onChange,
    size = 'sm',
    ariaLabel,
    className,
}) {
    const ref = useRef(null);

    // Roving focus: Left/Right (and Home/End) move selection, matching the
    // WAI-ARIA tabs pattern.
    const onKeyDown = useCallback((e) => {
        const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];
        if (!keys.includes(e.key)) return;
        e.preventDefault();
        const idx = options.findIndex((o) => o.value === value);
        if (idx === -1) return;
        let next = idx;
        if (e.key === 'ArrowLeft') next = (idx - 1 + options.length) % options.length;
        else if (e.key === 'ArrowRight') next = (idx + 1) % options.length;
        else if (e.key === 'Home') next = 0;
        else if (e.key === 'End') next = options.length - 1;
        onChange?.(options[next].value);
        // Move focus with selection so the next arrow key continues from here.
        ref.current?.querySelectorAll('[role="tab"]')?.[next]?.focus();
    }, [options, value, onChange]);

    return (
        <div
            ref={ref}
            role="tablist"
            aria-label={ariaLabel}
            onKeyDown={onKeyDown}
            className={cn(
                'inline-flex items-center gap-0.5 p-0.5 rounded-(--do-radius)',
                'bg-surface-2 border border-border',
                className,
            )}
        >
            {options.map((opt) => {
                const isActive = opt.value === value;
                return (
                    <button
                        key={opt.value}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        tabIndex={isActive ? 0 : -1}
                        onClick={() => onChange?.(opt.value)}
                        className={cn(
                            'inline-flex items-center gap-1.5 rounded-(--do-radius) font-bold uppercase tracking-wider',
                            'transition-all duration-200 cursor-pointer',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50',
                            SIZES[size] ?? SIZES.sm,
                            isActive
                                ? 'bg-surface text-text-primary shadow-sm'
                                : 'text-text-subtle hover:text-text-secondary',
                        )}
                    >
                        {opt.icon}
                        {opt.label}
                        {opt.count != null && (
                            <span className={cn(
                                'tabular-nums font-semibold',
                                isActive ? 'text-text-muted' : 'text-text-subtle',
                            )}>
                                {opt.count}
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}
