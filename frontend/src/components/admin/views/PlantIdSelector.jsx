'use client';
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, Plus, Building2, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { usePlants } from '@/src/context/PlantsContext';
import { useCreatePlantForm } from '@/src/components/plant/useCreatePlantForm';
import { PlantOptionRow } from '@/src/components/plant/PlantOptionRow';
import { PlantCreateForm } from '@/src/components/plant/PlantCreateForm';
import { DeletePlantModal } from './DeletePlantModal';

// ── PlantIdSelector ────────────────────────────────────────────────────────────
export function PlantIdSelector({ selectedPlantId, onSelect }) {
    const { plants: plantIds, loading, error: fetchError, refresh: fetchPlantIds, removePlant } = usePlants();
    const [isOpen, setIsOpen] = useState(false);
    const [mode, setMode] = useState('select'); // 'select' | 'create'
    const [deletingPlant, setDeletingPlant] = useState(null); // plant object | null

    const containerRef = useRef(null);
    const newInputRef = useRef(null);

    const form = useCreatePlantForm((created) => {
        onSelect(created);
        setIsOpen(false);
        setMode('select');
    });

    useEffect(() => {
        function handleClickOutside(e) {
            if (e.target.closest?.('[data-select-portal]')) return;
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
                setMode('select');
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (mode === 'create' && isOpen) {
            setTimeout(() => newInputRef.current?.focus(), 50);
        }
    }, [mode, isOpen]);

    const handleSelectExisting = (plant) => {
        onSelect(plant);
        setIsOpen(false);
        setMode('select');
    };

    const handleDeletedConfirmed = (deletedId) => {
        removePlant(deletedId);
        // Clear selection if the deleted plant was selected
        if (selectedPlantId?.id === deletedId) onSelect(null);
        setDeletingPlant(null);
    };

    const openDropdown = () => {
        setIsOpen(o => !o);
        setMode('select');
    };

    const enterCreateMode = () => {
        form.reset();
        setMode('create');
    };

    return (
        <>
            <div ref={containerRef} className="relative w-full max-w-xs">
                {/* Trigger */}
                <button
                    type="button"
                    onClick={openDropdown}
                    aria-haspopup="listbox"
                    aria-expanded={isOpen}
                    className={cn(
                        'w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl border transition-all duration-200',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 cursor-pointer text-left',
                        selectedPlantId
                            ? 'bg-surface border-border hover:border-brand/40'
                            : 'bg-surface border-border hover:border-brand/40',
                        isOpen && 'border-brand/50 ring-2 ring-brand/20 shadow-sm',
                    )}
                >
                    <div className="flex items-center gap-2.5 min-w-0">
                        {loading
                            ? <Loader2 size={15} className="text-text-muted shrink-0 animate-spin" />
                            : <Building2 size={15} className={cn('shrink-0 transition-colors', selectedPlantId ? 'text-brand' : 'text-text-muted')} />
                        }
                        <span className={cn(
                            'text-body-sm font-medium truncate',
                            selectedPlantId ? 'text-text-primary' : 'text-text-subtle',
                        )}>
                            {loading
                                ? 'Loading...'
                                : selectedPlantId
                                    ? selectedPlantId.id
                                    : 'Select Plant ID...'
                            }
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                        {selectedPlantId && <Check size={13} className="text-success" />}
                        <ChevronDown
                            size={13}
                            className={cn('text-text-muted transition-transform duration-200', isOpen && 'rotate-180')}
                        />
                    </div>
                </button>

                {/* Dropdown */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            role="listbox"
                            initial={{ opacity: 0, y: -6, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -6, scale: 0.98 }}
                            transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
                            className="absolute top-full left-0 right-0 mt-2 bg-surface border border-border rounded-xl shadow-modal overflow-hidden z-110"
                        >
                            {mode === 'select' ? (
                                <div className="py-1.5">
                                    {/* Error state */}
                                    {fetchError && (
                                        <div className="flex items-center justify-between px-4 py-3">
                                            <div className="flex items-center gap-2 text-caption text-danger">
                                                <AlertCircle size={12} />
                                                <span>{fetchError}</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={fetchPlantIds}
                                                className="flex items-center gap-1 px-2 py-1 text-[11px] font-bold text-brand bg-brand/10 hover:bg-brand/20 rounded-md transition-colors cursor-pointer"
                                            >
                                                <RefreshCw size={10} />
                                                Retry
                                            </button>
                                        </div>
                                    )}

                                    {/* Empty state */}
                                    {!fetchError && plantIds.length === 0 && (
                                        <div className="px-4 py-3 text-caption text-text-subtle text-center">
                                            No plant IDs configured yet
                                        </div>
                                    )}

                                    {/* Plant ID options */}
                                    {!fetchError && plantIds.map(plant => (
                                        <PlantOptionRow
                                            key={plant.id}
                                            plant={plant}
                                            isSelected={selectedPlantId?.id === plant.id}
                                            onClick={() => handleSelectExisting(plant)}
                                            onDelete={(p) => {
                                                setDeletingPlant(p);
                                                setIsOpen(false);
                                            }}
                                        />
                                    ))}

                                    <div className="mx-3 my-1 border-t border-border" />

                                    {/* Create new */}
                                    <button
                                        type="button"
                                        onClick={enterCreateMode}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-brand-muted/60 cursor-pointer"
                                    >
                                        <div className="w-3.5 h-3.5 rounded-full bg-brand/10 flex items-center justify-center shrink-0">
                                            <Plus size={9} className="text-brand" />
                                        </div>
                                        <span className="text-body-sm font-semibold text-brand">Create New Plant ID</span>
                                    </button>
                                </div>
                            ) : (
                                <PlantCreateForm
                                    value={form.value}
                                    onValueChange={form.setValue}
                                    industry={form.industry}
                                    onIndustryChange={form.setIndustry}
                                    error={form.error}
                                    submitting={form.submitting}
                                    onSubmit={form.submit}
                                    onBack={() => setMode('select')}
                                    inputRef={newInputRef}
                                />
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Delete confirmation modal — rendered outside dropdown so z-index is clean */}
            <AnimatePresence>
                {deletingPlant && (
                    <DeletePlantModal
                        plant={deletingPlant}
                        onClose={() => setDeletingPlant(null)}
                        onDeleted={handleDeletedConfirmed}
                    />
                )}
            </AnimatePresence>
        </>
    );
}
