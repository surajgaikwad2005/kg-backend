'use client';
import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/src/lib/utils';

/**
 * Disabled "already committed" indicator shown in place of a commit CTA
 * (Configure Context / Commit to Database) once a source has been written to the
 * database. Makes it clear to the user that the source is done — no further
 * commit is possible or needed.
 */
export function CommittedCta({ label = 'Committed to Database', className }) {
    return (
        <div
            role="status"
            aria-disabled="true"
            title="This source has already been committed to the database."
            className={cn(
                'inline-flex items-center gap-2 py-3 px-8 rounded-xl font-bold text-sm cursor-default select-none',
                'bg-success/10 text-success border border-success/20',
                className,
            )}
        >
            <CheckCircle2 size={16} />
            {label}
        </div>
    );
}
