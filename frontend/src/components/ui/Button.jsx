import React from 'react';
import { cn } from '@/src/lib/utils';

export function Button({
    variant = 'primary',
    size = 'md',
    className = '',
    disabled = false,
    isPending = false,
    onClick,
    type = 'button',
    children,
    ...props
}) {
    const baseStyles = 'inline-flex items-center justify-center gap-2 transition-all duration-500 focus:outline-none select-none font-black uppercase cursor-pointer disabled:cursor-not-allowed';

    const variants = {
        primary: 'bg-brand hover:bg-brand-hover disabled:bg-surface-2 text-white shadow-lg shadow-brand/20 active:scale-[0.98]',
        secondary: 'bg-overlay hover:bg-overlay-hover text-white shadow-sm active:scale-95',
        outline: 'bg-surface border border-border hover:border-border-strong hover:bg-surface-2 text-text-muted hover:text-text-primary hover:shadow-xs',
        danger: 'bg-danger hover:bg-danger/90 disabled:bg-surface-2 text-white shadow-lg shadow-danger/20 active:scale-[0.98]',
        dangerOutline: 'bg-surface hover:bg-danger hover:text-white text-danger border border-danger/20 shadow-xs',
        ghost: 'text-text-subtle hover:text-text-primary hover:bg-surface-2/60 bg-transparent',
        dangerGhost: 'text-danger hover:bg-danger/10 font-semibold',
        success: 'bg-success hover:bg-success/90 disabled:bg-surface-2 text-white shadow-lg active:scale-[0.98]',
        warning: 'bg-warning hover:bg-warning/90 disabled:bg-surface-2 text-white shadow-lg active:scale-[0.98]',
    };

    const sizes = {
        sm: 'px-6 py-2 text-[10px] tracking-widest rounded-(--do-radius)',
        md: 'px-6 py-3 text-[10px] tracking-[0.2em] rounded-(--do-radius)',
        lg: 'py-6 px-8 text-[14px] tracking-[0.3em] rounded-(--do-radius) w-full',
        ghost: 'p-0 text-[11px] tracking-[0.3em]',
        raw: '', // fallback for legacy custom sizing
    };

    const currentVariant = variants[variant] || variants.primary;
    const currentSize = sizes[size] || sizes.md;

    return (
        <button
            type={type}
            disabled={disabled || isPending}
            aria-busy={isPending}
            onClick={onClick}
            className={cn(
                baseStyles,
                currentVariant,
                currentSize,
                className
            )}
            {...props}
        >
            {isPending && (
                <svg className="animate-spin w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
            )}
            {children}
        </button>
    );
}
