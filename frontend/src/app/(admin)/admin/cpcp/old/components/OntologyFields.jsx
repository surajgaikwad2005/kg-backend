'use client';

import React from 'react';
import { Check, X, Minus } from 'lucide-react';
import { cn } from '@/src/lib/utils';

const baseField =
    'w-full px-3 py-2 text-[13px] rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-brand/20';
const viewField =
    'bg-surface-2/30 border border-border/50 text-text-muted cursor-default flex items-center h-[38px]';
const editField =
    'border border-border bg-surface text-text-secondary hover:border-border-strong';

/** Read-only / editable single-line text cell. `onChange` receives the value. */
export function TextCell({ value, isEditing, onChange, placeholder = '', className }) {
    if (!isEditing) {
        return (
            <div className={cn(baseField, viewField, className)}>
                <span className="truncate">{value || placeholder || '—'}</span>
            </div>
        );
    }
    return (
        <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={cn(baseField, editField, 'h-[38px]', className)}
        />
    );
}

const pillTone = {
    Y: 'bg-success/10 text-success ring-success/20',
    N: 'bg-danger/10 text-danger ring-danger/20',
    '': 'bg-surface-2 text-text-muted ring-border',
};

/** Compact read-only badge for an ontology Y / N / — flag. */
export function FlagPill({ value }) {
    const v = value === 'Y' || value === 'N' ? value : '';
    const Icon = v === 'Y' ? Check : v === 'N' ? X : Minus;
    return (
        <span
            className={cn(
                'inline-flex items-center justify-center gap-1 min-w-[2.75rem] px-2.5 py-1 rounded-full text-[12px] font-bold ring-1 ring-inset transition-colors',
                pillTone[v]
            )}
            title={v === 'Y' ? 'Yes' : v === 'N' ? 'No' : 'Not set'}
        >
            <Icon className="w-3 h-3" strokeWidth={3} />
            {v || '—'}
        </span>
    );
}

/**
 * Tri-state segmented toggle for a boolean ontology flag. Selecting the active
 * segment again clears it back to "not set" (empty string).
 */
export function FlagToggle({ value, onChange, disabled }) {
    const segments = [
        { val: 'Y', label: 'Y', on: 'bg-success text-white shadow-sm', icon: Check },
        { val: 'N', label: 'N', on: 'bg-danger text-white shadow-sm', icon: X },
    ];

    return (
        <div
            role="radiogroup"
            className="inline-flex items-center gap-0.5 p-0.5 rounded-lg bg-surface-2 border border-border"
        >
            {segments.map(({ val, label, on, icon: Icon }) => {
                const active = value === val;
                return (
                    <button
                        key={val}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        disabled={disabled}
                        title={val === 'Y' ? 'Yes' : 'No'}
                        onClick={() => onChange(active ? '' : val)}
                        className={cn(
                            'flex items-center justify-center gap-1 min-w-[2.25rem] h-7 px-2 rounded-md text-[12px] font-bold transition-all active:scale-95 cursor-pointer disabled:cursor-not-allowed',
                            active
                                ? on
                                : 'text-text-muted hover:bg-surface'
                        )}
                    >
                        <Icon className="w-3 h-3" strokeWidth={3} />
                        {label}
                    </button>
                );
            })}
        </div>
    );
}

/** Polymorphic flag cell: read-only pill or editable tri-state toggle. */
export function FlagCell({ value, isEditing, onChange }) {
    return (
        <div className="flex justify-center">
            {isEditing ? <FlagToggle value={value} onChange={onChange} /> : <FlagPill value={value} />}
        </div>
    );
}
