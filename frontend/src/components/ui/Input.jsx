import React from 'react';
import { cn } from '@/src/lib/utils';

const sizes = {
    // Original oversized style — used by the login screen.
    lg: {
        label: 'text-[10px] uppercase tracking-[0.3em] font-black text-text-subtle px-1 block',
        input: 'py-5 text-[18px] font-bold tracking-tight rounded-(--do-radius) bg-canvas border-border/50 focus:ring-[12px] focus:ring-brand/[0.04] focus:bg-surface',
        iconPad: 'pl-14',
        iconPos: 'pl-5',
        icon: 'w-5 h-5',
        rightPad: 'pr-14',
    },
    // Compact style for dense admin-panel forms/modals.
    sm: {
        label: 'text-xs font-bold text-text-muted uppercase tracking-wider mb-2 block',
        input: 'py-2.5 text-sm rounded-lg bg-surface border-border',
        iconPad: 'pl-10',
        iconPos: 'pl-3',
        icon: 'w-4 h-4',
        rightPad: 'pr-10',
    },
};

export function Input({
    label,
    icon: Icon,
    rightElement,
    error,
    size = 'lg',
    className = '',
    wrapperClassName = '',
    id,
    type = 'text',
    ...props
}) {
    const s = sizes[size] || sizes.lg;
    return (
        <div className={cn(size === 'sm' ? 'space-y-1' : 'space-y-3', wrapperClassName)}>
            {label && (
                <label htmlFor={id} className={s.label}>
                    {label}
                </label>
            )}
            <div className="relative group">
                {Icon && (
                    <div className={cn('absolute inset-y-0 left-0 flex items-center pointer-events-none text-text-subtle group-focus-within:text-brand transition-colors', s.iconPos)}>
                        <Icon className={s.icon} />
                    </div>
                )}

                <input
                    id={id}
                    type={type}
                    className={cn(
                        'w-full border text-text-primary placeholder:text-border-strong focus:outline-none focus:border-brand transition-all',
                        s.input,
                        Icon ? s.iconPad : (size === 'sm' ? 'px-4' : 'pl-6'),
                        rightElement ? s.rightPad : (size === 'sm' ? 'px-4' : 'pr-6'),
                        className
                    )}
                    {...props}
                />

                {rightElement && (
                    <div className="absolute inset-y-0 right-0 pr-5 flex items-center">
                        {rightElement}
                    </div>
                )}
            </div>
            {error && (
                <p className="text-xs text-danger font-semibold mt-1 px-1">
                    {error}
                </p>
            )}
        </div>
    );
}
