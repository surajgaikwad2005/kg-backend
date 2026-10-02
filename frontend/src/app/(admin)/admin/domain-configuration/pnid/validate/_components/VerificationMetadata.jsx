'use client';

/**
 * VerificationMetadata — surfaces the baseline source, page reference, and any
 * explanation/baseline message from the latest validation result.
 */
import React from 'react';
import { useValidateContext } from '@/src/app/(admin)/admin/domain-configuration/pnid/validate/_context/ValidateContext';

export default function VerificationMetadata() {
    const { validationResult, getValidationIconAndCls } = useValidateContext();
    if (!validationResult) return null;

    const { panel } = getValidationIconAndCls(validationResult.valid);

    const Item = ({ label, value, wide }) => (
        <div className={`bg-surface rounded-xl border border-border p-3 shadow-sm ${wide ? 'col-span-2' : ''}`}>
            <p className="font-black text-text-subtle uppercase tracking-wider text-2xs mb-1">{label}</p>
            <p className="font-bold text-text-secondary">{value}</p>
        </div>
    );

    return (
        <div className={`rounded-3xl border p-6 flex flex-col md:flex-row gap-6 shadow-card ${panel}`}>
            <div className="flex-1 space-y-4">
                <h3 className="text-sm font-black uppercase tracking-tight text-text-secondary">Verification Metadata</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                    <Item label="Baseline Source" value={<span className="uppercase">{validationResult.source}</span>} />
                    <Item label="Page Reference" value={`Sheet ${validationResult.page_no || 'N/A'}`} />
                    {validationResult.reason && <Item label="Explanation" value={validationResult.reason} wide />}
                    {validationResult.message && <Item label="Baseline Info" value={validationResult.message} wide />}
                </div>
            </div>
        </div>
    );
}
