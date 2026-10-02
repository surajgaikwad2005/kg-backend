'use client';

import { FileText, Activity } from 'lucide-react';
import { WizardStepHeader } from './WizardStepHeader';

const PATH_OPTIONS = [
    {
        type: 'pid',
        icon: FileText,
        title: 'P&ID',
        description: 'Draw and extract paths directly from a Piping and Instrumentation Diagram.',
    },
    {
        type: 'ontology',
        icon: Activity,
        title: 'Domain Ontology',
        description: 'Use structured domain knowledge and asset relationships to define paths.',
    },
];

/** Step 2 — choose how the source-to-sink path will be defined. */
export function PathSelectionStep({ onBack, onSelect }) {

    return (
        <div className="w-full max-w-5xl mx-auto flex flex-col">
            <WizardStepHeader
                onBack={onBack}
                backLabel="Back to Template Setup"
                title="Select Path Setup Method"
                subtitle="Choose how you want to configure the path from source to sink."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {PATH_OPTIONS.map(({ type, icon: Icon, title, description }) => (
                    <button
                        key={type}
                        onClick={() => onSelect(type)}
                        className="relative overflow-hidden group text-left p-6 rounded-2xl border-2 transition-all duration-200 border-border bg-surface hover:border-brand/40 cursor-pointer"
                    >
                        <div className="flex items-start gap-4">
                            <div className="p-3 rounded-xl bg-surface-2 text-text-muted group-hover:bg-brand-muted group-hover:text-brand transition-colors">
                                <Icon className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-text-primary mb-1">{title}</h3>
                                <p className="text-sm text-text-muted leading-relaxed">{description}</p>
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
