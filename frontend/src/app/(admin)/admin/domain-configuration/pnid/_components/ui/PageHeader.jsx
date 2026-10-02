'use client';

/**
 * PageHeader — shared top bar for every P&ID page.
 * Composes: optional back button, title + subtitle, slot for page actions,
 * and a close button. Theme-aware + sticky.
 */
import React from 'react';
import { ArrowLeft, X } from 'lucide-react';
import { usePnidRouter } from '@/src/app/(admin)/admin/domain-configuration/pnid/_context/PnidRouterContext';

export default function PageHeader({ title, subtitle, onBack, children }) {
    const { router } = usePnidRouter();

    return (
        <header className="h-16 sm:h-20 flex items-center justify-between px-3 sm:px-6 lg:px-10 shrink-0 bg-surface border-b border-border sticky top-0 z-50">
            <div className="flex items-center gap-2 sm:gap-4 lg:gap-6 min-w-0">
                {onBack && (
                    <button
                        onClick={onBack}
                        aria-label="Go back"
                        className="p-1.5 sm:p-2 -ml-1 sm:-ml-2 text-text-subtle hover:text-text-primary bg-surface-2 hover:bg-surface rounded-xl transition-all cursor-pointer shrink-0"
                    >
                        <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                )}
                <div className="flex flex-col min-w-0">
                    <h1 className="text-base sm:text-xl lg:text-[26px] font-black text-text-primary tracking-tight leading-tight truncate">
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="text-label font-black text-text-subtle tracking-wider sm:tracking-[0.2em] mt-0.5 uppercase truncate">
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-3 lg:gap-5 shrink-0">
                {children}

                {router?.onClose && (
                    <button
                        onClick={router.onClose}
                        aria-label="Close"
                        className="p-2 sm:p-2.5 text-text-subtle hover:text-text-primary bg-surface-2 hover:bg-surface rounded-xl transition-all cursor-pointer border border-border"
                    >
                        <X className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                )}
            </div>
        </header>
    );
}
