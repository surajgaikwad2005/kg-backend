'use client';

import { cn } from '@/src/lib/utils';

const baseField =
    'w-full rounded-lg border bg-surface px-4 py-3 text-sm font-medium text-text-primary transition-all placeholder:text-text-subtle focus:outline-none focus:ring-2 focus:ring-brand/20';

/** Labeled text input / textarea for the wizard's plain form steps. */
export function FormField({ label, id, name, as = 'input', emphasize, className, wrapperClassName, ...props }) {
    const Tag = as;
    return (
        <div className={wrapperClassName}>
            <label htmlFor={id} className="block text-xs font-semibold text-text-secondary mb-2">
                {label}
            </label>
            <Tag
                id={id}
                name={name || id}
                className={cn(
                    baseField,
                    emphasize ? 'border-brand/50 hover:border-brand' : 'border-border hover:border-border-strong',
                    as === 'textarea' && 'resize-none',
                    className
                )}
                {...props}
            />
        </div>
    );
}
