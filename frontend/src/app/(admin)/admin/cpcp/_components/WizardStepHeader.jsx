'use client';

import { ArrowLeft } from 'lucide-react';

/** Shared back-link + title/subtitle block used at the top of every wizard step. */
export function WizardStepHeader({ onBack, backLabel, title, subtitle, actions }) {
    return (
        <div className="mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
                {onBack && (
                    <button
                        onClick={onBack}
                        className="inline-flex items-center gap-2 text-sm font-medium text-text-muted hover:text-brand transition-colors mb-4 group cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        {backLabel}
                    </button>
                )}
                <h1 className="text-2xl font-bold text-text-primary tracking-tight">{title}</h1>
                {subtitle && <p className="text-sm text-text-muted mt-1.5">{subtitle}</p>}
            </div>
            {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
        </div>
    );
}
