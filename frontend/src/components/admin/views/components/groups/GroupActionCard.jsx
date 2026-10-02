'use client';
import React from 'react';
import { Button } from '@/src/components/ui/Button';

/**
 * Shared shell for a single-purpose Group Management action form (icon +
 * title + fields + submit). Keeps each action card focused on its own
 * fields/service call while the icon header, error row, and submit button
 * stay visually consistent.
 */
export function GroupActionCard({ icon: Icon, title, description, onSubmit, isSubmitting, submitLabel, error, children }) {
    return (
        <form onSubmit={onSubmit} className="bg-surface border border-border rounded-2xl p-6 shadow-xl space-y-5 h-fit">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-muted rounded-xl flex items-center justify-center text-brand shrink-0">
                    <Icon size={18} />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-text-primary">{title}</h3>
                    <p className="text-xs text-text-muted">{description}</p>
                </div>
            </div>

            <div className="space-y-4">{children}</div>

            {error && (
                <p role="alert" className="text-xs text-danger font-semibold">{error}</p>
            )}

            <Button type="submit" variant="primary" size="sm" isPending={isSubmitting} className="w-full">
                {submitLabel}
            </Button>
        </form>
    );
}
