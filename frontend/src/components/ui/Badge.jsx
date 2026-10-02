import React from 'react';
import { cn } from '@/src/lib/utils';

export function Badge({
    variant = 'info',
    dot = true,
    pulse = true,
    banner = false,
    className = '',
    children,
    ...props
}) {
    const variants = {
        primary: {
            text: 'text-brand/80',
            bg: 'bg-brand/10 border border-brand/20',
            dot: 'bg-brand/60'
        },
        info: {
            text: 'text-brand',
            bg: 'bg-brand-muted border border-brand/20',
            dot: 'bg-brand'
        },
        warning: {
            text: 'text-warning',
            bg: 'bg-warning/10 border border-warning/20',
            dot: 'bg-warning'
        },
        critical: {
            text: 'text-danger',
            bg: 'bg-danger/10 border border-danger/20',
            dot: 'bg-danger'
        },
        success: {
            text: 'text-success',
            bg: 'bg-success/10 border border-success/20',
            dot: 'bg-success'
        },
        errorBanner: {
            text: 'text-danger font-black tracking-widest uppercase text-[11px]',
            bg: 'p-5 rounded-2xl bg-danger/10 border-2 border-danger/20',
            dot: 'bg-danger'
        }
    };

    const currentVariant = variants[variant] || variants.info;

    if (banner || variant === 'errorBanner') {
        return (
            <div
                className={cn(
                    'flex items-center gap-4',
                    currentVariant.bg,
                    currentVariant.text,
                    className
                )}
                {...props}
            >
                {children}
            </div>
        );
    }

    return (
        <span
            className={cn(
                'inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] uppercase tracking-[0.15em] font-black',
                currentVariant.bg ? currentVariant.text : '',
                currentVariant.bg || '',
                className
            )}
            {...props}
        >
            {dot && (
                <span
                    className={cn(
                        'w-1.5 h-1.5 rounded-full shrink-0',
                        currentVariant.dot,
                        pulse && 'animate-pulse'
                    )}
                />
            )}
            {children}
        </span>
    );
}
