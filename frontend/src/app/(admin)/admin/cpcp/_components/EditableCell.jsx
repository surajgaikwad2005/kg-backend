'use client';

import { cn } from '@/src/lib/utils';

const cellBase =
    'w-full bg-transparent border border-transparent hover:border-border focus:bg-surface focus:border-brand focus:ring-2 focus:ring-brand/20 rounded-lg px-3 py-2 text-sm text-text-secondary placeholder:text-text-subtle transition-all';

/** Dense inline-editable cell for the wizard's spreadsheet-style tables. Renders a text input or a select. */
export function EditableCell({ value, onChange, placeholder, options, className, align }) {
    if (options) {
        return (
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={cn(cellBase, 'cursor-pointer', className)}
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
        );
    }

    return (
        <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={cn(cellBase, align === 'right' && 'text-right', className)}
        />
    );
}
