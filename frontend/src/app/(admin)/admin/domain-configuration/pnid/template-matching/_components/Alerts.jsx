'use client';

/** Alerts — error + success banners for the matching console. */
import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { useTemplateMatchingContext } from '@/src/app/(admin)/admin/domain-configuration/pnid/template-matching/_context/TemplateMatchingContext';

export default function Alerts() {
    const { errorMessage, successMessage } = useTemplateMatchingContext();
    return (
        <>
            {errorMessage && (
                <div className="mx-6 mt-6 p-4 bg-danger/10 dark:bg-danger/10 border border-danger/20 dark:border-danger/30 rounded-2xl flex gap-3 text-xs text-danger animate-in fade-in slide-in-from-top-4 duration-300">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <p className="font-semibold leading-relaxed">{errorMessage}</p>
                </div>
            )}
            {successMessage && (
                <div className="mx-6 mt-6 p-4 bg-success/10 dark:bg-success/10 border border-success/20 dark:border-success/30 rounded-2xl flex gap-3 text-xs text-success animate-in fade-in slide-in-from-top-4 duration-300">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                    <p className="font-semibold leading-relaxed">{successMessage}</p>
                </div>
            )}
        </>
    );
}
