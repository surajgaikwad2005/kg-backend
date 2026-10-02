'use client';

import { Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';

import { useCpcpTemplates } from './_hooks/useCpcpTemplates';
import { TemplatesTable } from './_components/TemplatesTable';

import { useCpcpWizard } from './_hooks/useCpcpWizard';
import { WizardProgress } from './_components/WizardProgress';
import { TemplateSetupStep } from './_components/TemplateSetupStep';
import { PathSelectionStep } from './_components/PathSelectionStep';
import { PidDrawingStep } from './_components/PidDrawingStep';
import { OntologySetupStep } from './_components/OntologySetupStep';
import { SourceToSinkStep } from './_components/SourceToSinkStep';
import { TopologyKnowledgeStep } from './_components/TopologyKnowledgeStep';
import { RuleConfigurationStep } from './_components/RuleConfigurationStep';

const stepTransition = { duration: 0.25 };
const stepMotion = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
};

export default function CpcpOperationsPage() {
    return (
        <Suspense fallback={null}>
            <CpcpRouter />
        </Suspense>
    );
}

function CpcpRouter() {
    const searchParams = useSearchParams();
    const action = searchParams.get('action');

    if (action === 'new') {
        return <CpcpWizardContent />;
    }

    return <CpcpListContent />;
}

function CpcpListContent() {
    const router = useRouter();
    const { templates, loading } = useCpcpTemplates();

    const openWizard = useCallback(() => {
        router.push('/admin/cpcp?action=new&step=setup');
    }, [router]);

    return (
        <div className="flex-1 overflow-y-auto thin-scrollbar p-6 md:p-8">
            <div className="max-w-6xl mx-auto space-y-6 pb-12">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-text-primary tracking-tight">Operational Templates</h1>
                        <p className="text-sm text-text-muted mt-1.5">
                            Overview of all active and draft identity &amp; scope definitions.
                        </p>
                    </div>
                    <button
                        onClick={openWizard}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-brand hover:bg-brand-hover text-white text-sm font-medium rounded-xl transition-all shadow-md shadow-brand/20 focus:outline-none focus:ring-4 focus:ring-brand/20 active:scale-95 cursor-pointer shrink-0"
                    >
                        <Plus className="w-4 h-4" />
                        New Template
                    </button>
                </div>

                <TemplatesTable
                    templates={templates}
                    loading={loading}
                    onRowClick={openWizard}
                    onCreateClick={openWizard}
                />
            </div>
        </div>
    );
}

function CpcpWizardContent() {
    const router = useRouter();
    const wizard = useCpcpWizard();
    const { step, goToStep, selectedPathType, setSelectedPathType } = wizard;

    return (
        <div className="flex-1 overflow-y-auto thin-scrollbar p-6 md:p-8">
            <div className="max-w-7xl mx-auto pb-12">
                <WizardProgress step={step} />

                <AnimatePresence mode="wait">
                    <motion.div key={step} {...stepMotion} transition={stepTransition}>
                        {step === 'setup' && (
                            <TemplateSetupStep
                                formData={wizard.formData}
                                onChange={wizard.handleFormChange}
                                onBack={() => router.push('/admin/cpcp')}
                                onSaveDraft={wizard.saveDraft}
                                onNext={() => goToStep('path-selection')}
                            />
                        )}

                        {step === 'path-selection' && (
                            <PathSelectionStep
                                onBack={() => goToStep('setup')}
                                onSelect={(type) => {
                                    setSelectedPathType(type);
                                    goToStep(type === 'pid' ? 'pid-drawing' : 'ontology-setup');
                                }}
                            />
                        )}

                        {step === 'pid-drawing' && (
                            <PidDrawingStep
                                setAssetMappings={wizard.setAssetMappings}
                                onBack={() => goToStep('path-selection')}
                                onNext={() => goToStep('source-sink')}
                            />
                        )}

                        {step === 'ontology-setup' && (
                            <OntologySetupStep
                                ontologyFrom={wizard.ontologyFrom}
                                setOntologyFrom={wizard.setOntologyFrom}
                                ontologyTo={wizard.ontologyTo}
                                setOntologyTo={wizard.setOntologyTo}
                                setAssetMappings={wizard.setAssetMappings}
                                onBack={() => goToStep('path-selection')}
                                onNext={() => goToStep('source-sink')}
                            />
                        )}

                        {step === 'source-sink' && (
                            <SourceToSinkStep
                                assetMappings={wizard.assetMappings}
                                onChange={wizard.handleAssetMappingChange}
                                setAssetMappings={wizard.setAssetMappings}
                                onBack={() => goToStep(selectedPathType === 'ontology' ? 'ontology-setup' : 'pid-drawing')}
                                onNext={() => goToStep('topology')}
                            />
                        )}

                        {step === 'topology' && (
                            <TopologyKnowledgeStep
                                repairAssumptions={wizard.repairAssumptions}
                                onRepairChange={wizard.handleRepairAssumptionChange}
                                emergencyRoutes={wizard.emergencyRoutes}
                                onRouteChange={wizard.handleEmergencyRouteChange}
                                onBack={() => goToStep('source-sink')}
                                onNext={() => goToStep('rules')}
                            />
                        )}

                        {step === 'rules' && (
                            <RuleConfigurationStep
                                ruleConfigurations={wizard.ruleConfigurations}
                                ruleColumns={wizard.ruleColumns}
                                onChange={wizard.handleRuleConfigurationChange}
                                onRuleConfigurationsSet={wizard.handleRuleConfigurationsSet}
                                onRuleColumnsChange={wizard.handleRuleColumnsChange}
                                onBack={() => goToStep('topology')}
                                onComplete={wizard.completeSetup}
                            />
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
