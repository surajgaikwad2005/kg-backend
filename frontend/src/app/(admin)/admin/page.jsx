'use client';
import React, { useRef, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Play, Database, ArrowRight, CheckCircle2, ChevronDown, Flame, Wind, Factory } from 'lucide-react';
import { updateUserConfig } from '@/src/services/domain-configuration/common';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/src/lib/utils';
import { toBackendIndustry, toUiIndustry } from '@/src/lib/industry';
import { useApp } from '@/src/context/AppContext';
import { usePlants } from '@/src/context/PlantsContext';
import IndustryGateModal from '@/src/components/admin/IndustryGateModal';
import { IndustrialDoodleBackground } from '@/src/components/admin/IndustrialDoodleBackground';
import { useToast } from '@/src/components/ui/Toast';

const INDUSTRIES = [
    {
        value: 'refinery',
        label: 'Refinery',
        description: 'Oil & Gas Refinery Operations',
        icon: Flame,
        iconCls: 'text-chart-4',
        bgCls: 'bg-chart-4/10',
    },
    {
        value: 'lng',
        label: 'LNG',
        description: 'Liquefied Natural Gas Facility',
        icon: Wind,
        iconCls: 'text-info',
        bgCls: 'bg-info/10',
    },
    {
        value: 'cement',
        label: 'Cement',
        description: 'Cement Manufacturing Plant',
        icon: Factory,
        iconCls: 'text-warning',
        bgCls: 'bg-warning/10',
    },
];

function IndustryDropdown({ value, onChange }) {
    const [open, setOpen] = React.useState(false);
    const ref = useRef(null);
    const selected = INDUSTRIES.find(i => i.value === value) ?? null;

    useEffect(() => {
        if (!open) return;
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    const handleSelect = (industry) => {
        onChange(industry.value);
        setOpen(false);
    };

    return (
        <div ref={ref} className="relative w-full max-w-md mx-auto">
            <button
                type="button"
                onClick={() => setOpen(v => !v)}
                aria-haspopup="listbox"
                aria-expanded={open}
                className={cn(
                    'w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border-2 transition-all duration-200 text-left cursor-pointer',
                    'bg-surface',
                    open
                        ? 'border-brand shadow-lg shadow-brand/10'
                        : 'border-border hover:border-brand/50 shadow-sm hover:shadow-md',
                )}
            >
                {selected ? (
                    <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0', selected.bgCls)}>
                        <selected.icon size={18} className={selected.iconCls} />
                    </div>
                ) : (
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-surface-2">
                        <Database size={18} className="text-text-muted" />
                    </div>
                )}

                <div className="flex-1 min-w-0">
                    {selected ? (
                        <>
                            <p className="text-sm font-bold text-text-primary leading-tight">{selected.label}</p>
                            <p className="text-xs text-text-subtle leading-tight mt-0.5">{selected.description}</p>
                        </>
                    ) : (
                        <p className="text-sm font-semibold text-text-subtle">Choose an industry…</p>
                    )}
                </div>

                <ChevronDown
                    size={16}
                    className={cn(
                        'shrink-0 text-text-muted transition-transform duration-200',
                        open && 'rotate-180 text-brand',
                    )}
                />
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        role="listbox"
                        aria-label="Select industry"
                        initial={{ opacity: 0, y: -8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.97 }}
                        transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
                        className={cn(
                            'absolute top-full left-0 right-0 mt-2 z-50 overflow-hidden',
                            'rounded-2xl border shadow-2xl shadow-black/10',
                            'bg-surface border-border',
                        )}
                    >
                        <div className="p-1.5 space-y-0.5">
                            {INDUSTRIES.map((industry, i) => {
                                const isSelected = value === industry.value;
                                return (
                                    <motion.button
                                        key={industry.value}
                                        role="option"
                                        aria-selected={isSelected}
                                        type="button"
                                        initial={{ opacity: 0, x: -8 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.15, delay: i * 0.04 }}
                                        onClick={() => handleSelect(industry)}
                                        className={cn(
                                            'w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all duration-150 text-left cursor-pointer group',
                                            isSelected
                                                ? 'bg-brand-muted'
                                                : 'hover:bg-surface-2',
                                        )}
                                    >
                                        <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-150', industry.bgCls)}>
                                            <industry.icon size={18} className={industry.iconCls} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={cn(
                                                'text-sm font-bold leading-tight transition-colors',
                                                isSelected ? 'text-brand' : 'text-text-primary',
                                            )}>
                                                {industry.label}
                                            </p>
                                            <p className="text-xs text-text-subtle leading-tight mt-0.5">{industry.description}</p>
                                        </div>
                                        {isSelected && (
                                            <CheckCircle2 size={16} className="text-brand shrink-0" />
                                        )}
                                    </motion.button>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function AdminLandingPage() {
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);
    const [showPrompt, setShowPrompt] = useState(false);
    const { industry, setIndustry, plantCode } = useApp();
    const { plants } = usePlants();
    const { success: toastSuccess } = useToast();

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Automatically sync industry whenever plantCode changes or plant list arrives
    useEffect(() => {
        if (!plants || plants.length === 0 || !plantCode) return;
        const matching = plants.find((p) => p.id === plantCode || p.plant_code_id === plantCode);
        if (matching?.industry) {
            const uiInd = toUiIndustry(matching.industry);
            if (uiInd && uiInd !== industry) {
                setIndustry(uiInd);
            }
        }
    }, [plants, plantCode, industry, setIndustry]);

    const handleIndustryChange = async (value) => {
        setIndustry(value);
        const label = INDUSTRIES.find(i => i.value === value)?.label || value;
        toastSuccess('Industry selected', label);
        try {
            await updateUserConfig({ industry: toBackendIndustry(value) }, plantCode);
        } catch {
            // AppContext has already persisted to localStorage; backend sync is best-effort
        }
    };

    const handleCTAClick = () => {
        if (!industry || !plantCode) {
            setShowPrompt(true);
            return;
        }
        router.push('/admin/domain-configuration');
    };

    if (!isMounted) return null;

    const canProceed = Boolean(industry && plantCode);

    return (
        <>
            <div className="relative flex-1 flex flex-col items-center justify-center p-12 min-h-full w-full overflow-hidden bg-canvas">
                <IndustrialDoodleBackground />

                <div className="relative z-10 text-center max-w-3xl mx-auto">

                    <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                            className="text-[72px] font-black text-text-primary leading-[0.95] tracking-tighter uppercase mb-8"
                        >
                            Welcome to <span className="text-brand">Decision Ops</span>
                        </motion.h1>

                        <motion.button
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.1 }}
                            className="flex items-center gap-3 text-text-muted hover:text-text-primary transition-colors mb-12 group mx-auto cursor-pointer"
                        >
                            <div className="w-12 h-12 rounded-full bg-surface-2 flex items-center justify-center group-hover:bg-brand-muted group-hover:border-brand/20 border border-border transition-all">
                                <Play size={24} fill="currentColor" className="text-text-muted group-hover:text-brand" />
                            </div>
                            <span className="text-lg font-bold">How to get started</span>
                        </motion.button>

                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.2 }}
                            className="w-full max-w-md mb-8 space-y-3 mx-auto"
                        >
                            <label className="block text-sm font-bold text-text-muted uppercase tracking-widest text-center">
                                Select Your Industry
                            </label>
                            <IndustryDropdown value={industry} onChange={handleIndustryChange} />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.3 }}
                        >
                            <button
                                onClick={handleCTAClick}
                                className={cn(
                                    'inline-flex items-center gap-3 font-black py-5 px-14 rounded-2xl shadow-lg transition-all text-lg uppercase tracking-wider cursor-pointer',
                                    canProceed
                                        ? 'bg-brand hover:bg-brand-hover text-white shadow-brand/20 hover:-translate-y-1 active:scale-95'
                                        : 'bg-surface-2 text-text-subtle shadow-none hover:bg-surface-2',
                                )}
                            >
                                <Database className="w-6 h-6" />
                                Get started with Data Models
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </motion.div>

                    </div>
            </div>

            <IndustryGateModal
                open={showPrompt}
                onClose={() => setShowPrompt(false)}
                onAction={() => setShowPrompt(false)}
                title={!plantCode ? "Select Plant First" : "Select Your Industry First"}
                description={!plantCode
                    ? "Please select a Plant Code ID from the top right selector before proceeding to domain configuration."
                    : "Please choose an industry from the dropdown above. This configures templates, pipeline settings, and AI models for your specific operations."}
                actionLabel="Got it, I'll Select"
            />
        </>
    );
}
