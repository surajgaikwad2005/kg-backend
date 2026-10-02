'use client';
import React from 'react';
import { CheckCircle2, Lock } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { SOURCE_STATUS } from '@/src/components/admin/domainSources';
import { Tooltip } from '@/src/components/ui/Tooltip';

/**
 * Icon-only stand-in for SourceRailItem, rendered when DataSourceSidebar is
 * collapsed. Mirrors the same status → color mapping so a source's state
 * (done/validated/locked/active) still reads correctly at a glance; the
 * label + tag move into a hover Tooltip since there's no room to render text.
 */
export function SourceRailItemCompact({ tab }) {
    const { type, icon: Icon, status, tag, isActive, onClick } = tab;

    const isHasUnprocessed = Boolean(tag && tag.toLowerCase().includes('unprocessed'));
    const isSelectedTag = tag === 'Selected' || isHasUnprocessed;
    const isCommitted = status === SOURCE_STATUS.COMMITTED && !isHasUnprocessed;
    const isProcessed = status === SOURCE_STATUS.PROCESSED && !isHasUnprocessed;
    const isValidated = status === SOURCE_STATUS.VALIDATED && !isHasUnprocessed;
    const isLocked = status === SOURCE_STATUS.LOCKED;
    const isDone = (status === SOURCE_STATUS.UPLOADED || isProcessed || isCommitted) && !isHasUnprocessed;

    const wrapCls = isActive
        ? 'bg-brand-muted border-brand/30'
        : isValidated || isSelectedTag
            ? 'bg-warning/[0.06] border-warning/40 hover:border-warning/60'
            : isDone
                ? 'bg-success/[0.06] border-success/40 hover:border-success/60'
                : isLocked
                    ? 'bg-surface border-border opacity-60'
                    : 'bg-surface border-border hover:border-brand/25 hover:bg-brand-muted/40';

    const iconCls = isActive
        ? 'text-brand'
        : isValidated || isSelectedTag
            ? 'text-warning'
            : isDone
                ? 'text-success'
                : isLocked
                    ? 'text-text-subtle'
                    : 'text-text-muted';

    return (
        <Tooltip label={`${type}${tag ? ` · ${tag}` : ''}`} side="right">
            <button
                type="button"
                onClick={onClick}
                aria-label={type}
                aria-current={isActive ? 'true' : undefined}
                aria-disabled={isLocked}
                className={cn(
                    'relative flex items-center justify-center w-10 h-10 mx-auto rounded-xl border shrink-0 cursor-pointer',
                    'transition-all duration-[var(--duration-fast,150ms)]',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50',
                    wrapCls,
                )}
            >
                {isCommitted ? (
                    <CheckCircle2 className={cn('w-4.5 h-4.5', iconCls)} />
                ) : (
                    <Icon className={cn('w-4.5 h-4.5', iconCls)} />
                )}
                {isLocked && (
                    <Lock
                        className="absolute -bottom-1 -right-1 w-3 h-3 text-text-subtle bg-surface rounded-full p-0.5"
                        aria-hidden="true"
                    />
                )}
            </button>
        </Tooltip>
    );
}
