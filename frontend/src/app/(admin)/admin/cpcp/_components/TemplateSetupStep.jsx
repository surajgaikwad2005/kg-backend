'use client';

import { Save, ArrowRight } from 'lucide-react';
import { Select } from '@/src/components/ui/Select';
import { WizardStepHeader } from './WizardStepHeader';
import { FormSection } from './FormSection';
import { FormField } from './FormField';
import { useSearchParams } from 'next/navigation';
import { useOperatingOutcomesQuery, useCreateTemplateMutation } from '../_queries/useCpcpWizardQueries';
import { useState } from 'react';
import { useApp } from '@/src/context/AppContext';

/** Step 1 — Identity & Outcome, Asset Details, Specifications. */
export function TemplateSetupStep({ formData, onChange, onSaveDraft, onNext, onBack }) {
    const { plantId } = useApp();
    const plantCode = plantId?.id ?? '';
    const { data: res } = useOperatingOutcomesQuery(plantCode);
    const data = Array.isArray(res) ? res : res?.data;
    const outcomes = data ? data.map(opt => ({ value: opt, label: opt })) : [];

    const { mutateAsync: createTemplate, isPending: saving } = useCreateTemplateMutation();

    const setField = (name, value) => onChange({ target: { name, value } });

    const handleNext = async () => {
        try {
            // Split by newline or comma to get an array of strings
            const decisionsArray = formData.supportedDecisions
                ? formData.supportedDecisions.split(/[\n,]+/).map(s => s.trim()).filter(Boolean)
                : [];

            const payload = {
                operating_outcome: formData.operatingOutcome,
                outcome_statement: formData.outcomeStatement,
                archetype_version: formData.archetypeVersion,
                supported_decisions: decisionsArray,
                cpcp_name: formData.cpcpName,
                owner: formData.owner,
                site: formData.site,
                cpcp_id: formData.cpcpId,
                required_export_rate: formData.requiredExportRate ? parseFloat(formData.requiredExportRate) : null,
            };

            await createTemplate({ plantCode, data: payload });
            onNext();
        } catch (error) {
            onNext(); // Proceed anyway for now if it fails
        }
    };

    return (
        <div className="w-full max-w-6xl mx-auto">
            <WizardStepHeader
                onBack={onBack}
                backLabel="Back to Templates"
                title="CPCP Template Setup"
                subtitle="Define operational outcomes, archetype versions, and supported decisions."
            />

            <form className="space-y-8 pb-4" onSubmit={(e) => e.preventDefault()}>
                <FormSection index={1} accent="brand" title="Identity & Outcome" description="Define the core objective and operational outcome statement for this specific scope.">
                    <div>
                        <label htmlFor="operatingOutcome" className="block text-xs font-semibold text-text-secondary mb-2">
                            Operating outcome
                        </label>
                        <Select
                            id="operatingOutcome"
                            value={formData.operatingOutcome}
                            onChange={(val) => setField('operatingOutcome', val)}
                            options={outcomes}
                            placeholder="Select an outcome…"
                            size="md"
                        />
                    </div>

                    <FormField
                        as="textarea"
                        id="outcomeStatement"
                        label="Outcome statement"
                        value={formData.outcomeStatement}
                        onChange={onChange}
                        rows={2}
                        placeholder="e.g. Deliver export gas at required rate and pressure"
                        emphasize
                    />
                </FormSection>

                <FormSection index={2} accent="info" title="Asset Details" description="Provide identifying information for the platform, site, and responsible owners.">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <FormField id="cpcpName" label="CpCp Name" value={formData.cpcpName} onChange={onChange} wrapperClassName="sm:col-span-2" />
                        <FormField id="cpcpId" label="CpCp ID" value={formData.cpcpId} onChange={onChange} />
                        <FormField id="site" label="Site Location" value={formData.site} onChange={onChange} />
                        <FormField id="owner" label="Owner / Responsible Role" value={formData.owner} onChange={onChange} wrapperClassName="sm:col-span-2" />
                    </div>
                </FormSection>

                <FormSection index={3} accent="success" title="Specifications" description="Configure export requirements, active archetypes, and outline supported decision frameworks.">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <FormField id="archetypeVersion" label="Archetype & Version" value={formData.archetypeVersion} onChange={onChange} />
                        <FormField
                            id="requiredExportRate"
                            label="Required Export Rate (MMscfd)"
                            type="number"
                            step="0.1"
                            value={formData.requiredExportRate}
                            onChange={onChange}
                        />
                    </div>
                    <FormField
                        as="textarea"
                        id="supportedDecisions"
                        label="Supported Decisions"
                        value={formData.supportedDecisions}
                        onChange={onChange}
                        rows={3}
                        emphasize
                    />
                </FormSection>

                <div className="flex items-center justify-end gap-4 mt-4 pt-6 border-t border-border">
                    {/* <button
                        type="button"
                        onClick={onSaveDraft}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-surface hover:bg-surface-2 text-text-secondary border border-border text-sm font-semibold rounded-xl transition-all shadow-sm focus:outline-none focus:ring-4 focus:ring-border/40 active:scale-95 cursor-pointer"
                    >
                        <Save className="w-4 h-4 text-text-muted" />
                        Save Template
                    </button> */}
                    <button
                        type="button"
                        onClick={handleNext}
                        disabled={saving}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand hover:bg-brand-hover text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-brand/20 focus:outline-none focus:ring-4 focus:ring-brand/20 active:scale-95 cursor-pointer disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : 'Next'}
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </form>
        </div>
    );
}
