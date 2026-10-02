'use client';
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, CheckCircle2 } from 'lucide-react';
import { Select } from '@/src/components/ui/Select';
import { useAdminNav, useDocsForm, useAdminEntities } from '@/src/components/admin/AdminPanelContext';
import { usePlants } from '@/src/context/PlantsContext';
import { updateUserConfig } from '@/src/services/domain-configuration/common';
import { toBackendIndustry, toUiIndustry } from '@/src/lib/industry';
import { IndustrialDoodleBackground } from '@/src/components/admin/IndustrialDoodleBackground';

export function WelcomeView() {
    const { setView } = useAdminNav();
    const { selectedIndustry, setSelectedIndustry } = useDocsForm();
    const { selectedPlantId } = useAdminEntities();
    const { plants } = usePlants();

    useEffect(() => {
        if (!plants || plants.length === 0 || !selectedPlantId?.id) return;
        const matching = plants.find((p) => p.id === selectedPlantId.id || p.plant_code_id === selectedPlantId.id);
        if (matching?.industry) {
            const uiInd = toUiIndustry(matching.industry);
            if (uiInd && uiInd !== selectedIndustry) {
                setSelectedIndustry(uiInd);
            }
        }
    }, [plants, selectedPlantId, selectedIndustry, setSelectedIndustry]);

    return (
        <div className="relative flex flex-col items-center justify-center min-h-[60vh] text-center overflow-hidden w-full">
            <IndustrialDoodleBackground />
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative z-10 flex flex-col items-center justify-center w-full"
            >
            <h1 className="text-6xl font-bold text-text-primary mb-8">
                Welcome to <span className="text-text-primary">Decision Ops</span>
            </h1>

            <button className="flex items-center gap-3 text-text-muted hover:text-text-primary transition-colors mb-10 group cursor-pointer">
                <div className="w-12 h-12 rounded-full bg-surface-2 flex items-center justify-center group-hover:bg-border transition-colors">
                    <Play size={24} fill="currentColor" />
                </div>
                <span className="text-lg font-medium">How to get started</span>
            </button>

            {/* Industry Selector */}
            <div className="w-full max-w-md mb-10 space-y-3">
                <label className="block text-sm font-bold text-text-muted uppercase tracking-widest">
                    Select Your Industry
                </label>
                <Select
                    value={selectedIndustry || ''}
                    onChange={async (industry) => {
                        setSelectedIndustry(industry);
                        const configIndustry = toBackendIndustry(industry);
                        try {
                            await updateUserConfig({ industry: configIndustry }, selectedPlantId?.id);
                        } catch {}
                    }}
                    placeholder="Choose an industry..."
                    options={[
                        { value: 'refinery', label: 'Refinery' },
                        { value: 'lng', label: 'LNG' },
                        { value: 'cement', label: 'Cement' },
                    ]}
                    size="md"
                />
                {selectedIndustry && (
                    <p className="text-caption text-success font-medium flex items-center justify-center gap-1.5">
                        <CheckCircle2 size={12} />
                    </p>
                )}
            </div>

            <button
                onClick={() => setView('data-config')}
                disabled={!selectedIndustry}
                className={`font-black py-4 px-12 rounded-2xl shadow-lg transition-all active:scale-95 text-lg uppercase tracking-wider cursor-pointer ${
                    selectedIndustry
                        ? 'bg-brand hover:bg-brand-hover text-white shadow-brand/20'
                        : 'bg-surface-2 text-text-subtle cursor-not-allowed shadow-none'
                }`}
            >
                Get started with Data Models
            </button>
            </motion.div>
        </div>
    );
}
