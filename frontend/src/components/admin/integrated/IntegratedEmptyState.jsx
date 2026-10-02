'use client';
import React from 'react';
import { ArrowLeft, Layers } from 'lucide-react';

export function IntegratedEmptyState({
    message = 'No integrated records found for this plant domain.',
    onBackToSource,
}) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center rounded-2xl bg-surface border border-dashed border-border-strong shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-brand/10 text-brand flex items-center justify-center mb-4 ring-8 ring-brand/5">
                <Layers className="w-8 h-8" />
            </div>

            <h3 className="text-base font-extrabold text-text-primary tracking-tight">
                No Integrated View Rows Yet
            </h3>

            <p className="text-body-sm text-text-muted max-w-md mt-1.5 leading-relaxed">
                {message}
            </p>

            {onBackToSource && (
                <div className="flex items-center justify-center mt-6">
                    <button
                        type="button"
                        onClick={onBackToSource}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-brand hover:bg-brand-hover text-white transition-all shadow-xs cursor-pointer"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Go to Source Review</span>
                    </button>
                </div>
            )}
        </div>
    );
}
