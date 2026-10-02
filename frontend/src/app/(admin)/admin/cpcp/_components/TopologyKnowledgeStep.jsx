'use client';

import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { WizardStepHeader } from './WizardStepHeader';
import { SiteParametersTable } from './SiteParametersTable';
import { ParallelGroupsTable } from './ParallelGroupsTable';
import { SeriesCapacityChainTable } from './SeriesCapacityChainTable';
import { RepairAssumptionsTable } from './RepairAssumptionsTable';
import { EmergencyRoutesTable } from './EmergencyRoutesTable';

/** Step — Topology Knowledge: site parameters, groups, capacity chain, repair assumptions and alternate routes. */
export function TopologyKnowledgeStep({ onBack, onNext }) {
    // Progressive disclosure state tracking
    const [siteParamsSaved, setSiteParamsSaved] = useState(false);
    const [parallelGroupsSaved, setParallelGroupsSaved] = useState(false);
    const [seriesCapacitySaved, setSeriesCapacitySaved] = useState(false);
    const [repairAssumptionsSaved, setRepairAssumptionsSaved] = useState(false);
    const [emergencyRoutesSaved, setEmergencyRoutesSaved] = useState(false);

    const allTablesSaved =
        siteParamsSaved &&
        parallelGroupsSaved &&
        seriesCapacitySaved &&
        repairAssumptionsSaved &&
        emergencyRoutesSaved;

    return (
        <div className="w-full max-w-5xl mx-auto">
            <WizardStepHeader
                onBack={onBack}
                backLabel="Back to Source to Sink Setup"
                title="Topology Knowledge"
                subtitle="Define site parameters and emergency routes."
            />

            <div className="flex flex-col gap-8 mb-8">
                {/* 1. Always visible */}
                <SiteParametersTable onSaved={setSiteParamsSaved} />

                {/* 2. Unlocks after Site Parameters */}
                {siteParamsSaved && (
                    <ParallelGroupsTable onSaved={setParallelGroupsSaved} />
                )}

                {/* 3. Unlocks after Parallel Groups */}
                {parallelGroupsSaved && (
                    <SeriesCapacityChainTable onSaved={setSeriesCapacitySaved} />
                )}

                {/* 4. Unlocks after Series Capacity Chain */}
                {seriesCapacitySaved && (
                    <RepairAssumptionsTable onSaved={setRepairAssumptionsSaved} />
                )}

                {/* 5. Unlocks after Repair Assumptions */}
                {repairAssumptionsSaved && (
                    <EmergencyRoutesTable onSaved={setEmergencyRoutesSaved} />
                )}
            </div>

            <div className="flex items-center justify-end gap-4 mt-8 pt-6 border-t border-border">
                <button
                    disabled={!allTablesSaved}
                    onClick={onNext}
                    title={
                        allTablesSaved
                            ? 'Proceed to Rule Configuration'
                            : 'Please save all topology tables sequentially to proceed'
                    }
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand hover:bg-brand-hover text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-brand/20 focus:outline-none focus:ring-4 focus:ring-brand/20 active:scale-95 cursor-pointer disabled:opacity-50 disabled:bg-surface-2 disabled:text-text-subtle disabled:border disabled:border-border disabled:shadow-none disabled:cursor-not-allowed"
                >
                    Next
                    <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
