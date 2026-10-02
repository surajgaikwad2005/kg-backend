'use client';
import React, { useState } from 'react';
import { MoreVertical } from 'lucide-react';
import { cn } from '@/src/lib/utils';

/**
 * ActionsMenuButton — a "⋮" trigger that opens a fixed-position dropdown of
 * row actions matching modern popover aesthetics.
 *
 * actions: Array<{ label, icon?, onClick, danger?, divider?, disabled? }>
 */
export function ActionsMenuButton({ actions = [], className = '' }) {
    const [open, setOpen] = useState(false);
    const [position, setPosition] = useState(null);

    const close = () => { setOpen(false); setPosition(null); };

    const toggle = (e) => {
        e.stopPropagation();
        if (open) { close(); return; }
        const rect = e.currentTarget.getBoundingClientRect();
        setPosition({ top: rect.bottom + 6, left: rect.right - 144 });
        setOpen(true);
    };

    return (
        <div className={cn('relative inline-block text-left', className)}>
            <button
                type="button"
                aria-label="Row actions"
                onClick={toggle}
                className="text-text-subtle hover:text-text-primary p-1.5 rounded-lg hover:bg-canvas transition-colors cursor-pointer"
            >
                <MoreVertical className="w-4 h-4" />
            </button>

            {open && position && (
                <>
                    <div className="fixed inset-0 z-[60]" onClick={close} />
                    <div
                        style={{ top: position.top, left: position.left }}
                        className="fixed w-36 bg-surface border border-border/80 rounded-2xl shadow-xl z-[70] py-1 overflow-hidden backdrop-blur-xs"
                    >
                        {actions.map((a, idx) => (
                            <React.Fragment key={a.label || idx}>
                                {a.divider && <div className="my-1 border-t border-border/60" />}
                                <button
                                    type="button"
                                    disabled={a.disabled}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        close();
                                        a.onClick?.();
                                    }}
                                    className={cn(
                                        'w-full text-left px-4 py-2.5 text-sm font-medium flex items-center gap-3 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
                                        a.danger
                                            ? 'text-danger hover:bg-danger/10'
                                            : 'text-text-primary hover:bg-canvas'
                                    )}
                                >
                                    {a.icon}
                                    <span>{a.label}</span>
                                </button>
                            </React.Fragment>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
