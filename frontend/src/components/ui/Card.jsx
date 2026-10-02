import React from 'react';
import { cn } from '@/src/lib/utils';

export function Card({
    variant = 'default',
    status = 'default',
    className = '',
    children,
    ...props
}) {
    const baseStyle = 'border rounded-(--do-radius) transition-all duration-500 overflow-hidden';

    const variants = {
        default: 'bg-surface border-border shadow-sm',
        login: 'w-full max-w-md relative z-10 p-10 lg:p-12 rounded-(--do-radius) bg-surface border border-border shadow-2xl transition-all duration-500',
        interactive: 'border border-border rounded-(--do-radius) p-4 transition-all duration-300 hover:shadow-md hover:border-border-strong group',
        command: 'w-full group relative flex items-center gap-6 p-6 rounded-(--do-radius) bg-surface-2/70 hover:bg-surface-2 border border-border hover:border-brand/50 text-left shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden',
    };

    const statuses = {
        default: '',
        critical: 'bg-danger/10 border-danger/20',
        warning: 'bg-warning/10 border-warning/20',
        info: 'bg-brand-muted border-brand/20',
    };

    const currentVariant = variants[variant] || '';
    const currentStatus = statuses[status] || '';

    return (
        <div
            className={cn(
                (variant === 'login' || variant === 'command' || variant === 'interactive') ? '' : baseStyle,
                currentVariant,
                currentStatus,
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

export function CardHeader({ className = '', children, ...props }) {
    return (
        <div className={cn('flex flex-col space-y-1.5', className)} {...props}>
            {children}
        </div>
    );
}

export function CardTitle({ className = '', children, ...props }) {
    return (
        <h3 className={cn('font-bold text-text-primary leading-tight tracking-tight', className)} {...props}>
            {children}
        </h3>
    );
}

export function CardDescription({ className = '', children, ...props }) {
    return (
        <p className={cn('text-text-muted text-sm leading-relaxed font-medium', className)} {...props}>
            {children}
        </p>
    );
}

export function CardContent({ className = '', children, ...props }) {
    return (
        <div className={cn('pt-0', className)} {...props}>
            {children}
        </div>
    );
}

export function CardFooter({ className = '', children, ...props }) {
    return (
        <div className={cn('flex items-center pt-4', className)} {...props}>
            {children}
        </div>
    );
}
