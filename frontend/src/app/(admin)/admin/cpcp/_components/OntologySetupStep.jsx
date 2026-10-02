'use client';

import { ArrowRight, Loader2 } from 'lucide-react';
import { WizardStepHeader } from './WizardStepHeader';
import { OntologyNodePicker } from './OntologyNodePicker';
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useEquipmentFlowQuery, useEquipmentsQuery } from '../_queries/useCpcpWizardQueries';
import { useApp } from '@/src/context/AppContext';

/** Step 3b — pick the source/sink pair from the domain ontology knowledge base. */
export function OntologySetupStep({ ontologyFrom, setOntologyFrom, ontologyTo, setOntologyTo, setAssetMappings, onBack, onNext }) {
    const { plantId } = useApp();
    const plantCode = plantId?.id ?? '';
    const canProceed = !!ontologyFrom && !!ontologyTo;

    // Fetch list of equipments to populate the pickers
    const { data: equipmentsRes, isLoading: loadingEquipments } = useEquipmentsQuery(plantCode);
    const equipmentOptions = Array.isArray(equipmentsRes?.data?.equipments)
        ? equipmentsRes.data.equipments.map(String)
        : Array.isArray(equipmentsRes?.equipments)
            ? equipmentsRes.equipments.map(String)
            : Array.isArray(equipmentsRes?.data)
                ? equipmentsRes.data.map(String)
                : Array.isArray(equipmentsRes)
                    ? equipmentsRes.map(String)
                    : [];

    const { data: res } = useEquipmentFlowQuery(plantCode, ontologyFrom, ontologyTo);

    useEffect(() => {
        const payload = res?.relationships ? res : res?.data;
        if (payload?.relationships && setAssetMappings) {
            const newMappings = payload.relationships.map(rel => ({
                id: Math.random().toString(36).substring(2, 9),
                from_equipment: rel.From || '',
                relationship: rel.Type || rel.Relationship || '',
                to_equipment: rel.To || '',
                membership_type: 'Fixed',
                mandatory: 'Yes',
                activation_condition: '',
                parallel_group: '',
                capacity_mmscfd: '',
                capacity_basis: 'Design Capacity',
                running: '1',
                available: '1',
                capacity_now_mmscfd: '',
                capacity_post_switchover_mmscfd: '',
                running_tag: '',
                post_switchover_tag: '',
                routed_rate_mmscfd: 0,
                is_active_path: 'Yes',
                failure_location: 'Active Path',
                risk_type: 'Mechanical',
                alternate_path: 'Stand-By',
                work_order_active: 'No',
                notification_active: 'No',
                capacity_comparison: 'Similar',
                time_to_failure: 0,
                time_for_switchover: 0,
                production_risk: 'Contingent',
            }));
            setAssetMappings(newMappings);
        }
    }, [res, setAssetMappings]);

    return (
        <div className="w-full max-w-4xl mx-auto">
            <WizardStepHeader
                onBack={onBack}
                backLabel="Back to Path Selection"
                title="Domain Ontology Setup"
                subtitle="Select the path from source to sink using the domain knowledge base."
                actions={
                    <button
                        disabled={!canProceed}
                        onClick={onNext}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand hover:bg-brand-hover disabled:bg-surface-2 disabled:text-text-subtle disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-brand/20 focus:outline-none focus:ring-4 focus:ring-brand/20 active:scale-95 cursor-pointer"
                    >
                        Proceed to Setup
                        <ArrowRight className="w-4 h-4" />
                    </button>
                }
            />

            <div className="bg-surface rounded-2xl shadow-sm border border-border p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
                    <div className="hidden md:block absolute left-1/2 top-10 bottom-10 w-px bg-brand/15 -translate-x-1/2">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-brand-muted border-2 border-brand/30 flex items-center justify-center text-brand">
                            {loadingEquipments ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                        </div>
                    </div>

                    <OntologyNodePicker label="From (Source)" placeholder="Search source…" value={ontologyFrom} onSelect={setOntologyFrom} options={equipmentOptions} />
                    <OntologyNodePicker label="To (Sink)" placeholder="Search sink…" value={ontologyTo} onSelect={setOntologyTo} options={equipmentOptions} />
                </div>
            </div>
        </div>
    );
}
