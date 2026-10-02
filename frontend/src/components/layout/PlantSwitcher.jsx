'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Building2, ChevronDown, Plus, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { useApp } from '@/src/context/AppContext';
import { usePlants } from '@/src/context/PlantsContext';
import { useCreatePlantForm } from '@/src/components/plant/useCreatePlantForm';
import { PlantOptionRow } from '@/src/components/plant/PlantOptionRow';
import { PlantCreateForm } from '@/src/components/plant/PlantCreateForm';
import { DeletePlantModal } from '@/src/components/admin/views/DeletePlantModal';
import { useMenuMotion } from './menuMotion';

/**
 * PlantSwitcher — compact plant-code dropdown rendered in PageHeader's
 * top-right corner, next to ProfileMenu. Reads/writes the same shared
 * PlantsContext list as the admin PlantIdSelector (used in the "no plant
 * selected" banner), so creating/deleting a plant from either one is
 * instantly visible in both. Delete is admin-role gated (same
 * DeletePlantModal/cascade-purge flow as PlantIdSelector) — non-admins get
 * select + create only.
 */
export function PlantSwitcher() {
    const { user, plantId, setPlantId } = useApp();
    const { plants, loading, error: fetchError, refresh: fetchPlants, removePlant } = usePlants();
    const { motionOff, panelMotion, tapTransition } = useMenuMotion();
    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState('select'); // 'select' | 'create'
    const [deletingPlant, setDeletingPlant] = useState(null); // plant object | null
    const isAdmin = user?.role === 'admin';
    const menuRef = useRef(null);
    const newInputRef = useRef(null);

    const form = useCreatePlantForm((created) => {
        setPlantId(created);
        setOpen(false);
        setMode('select');
    });

    useEffect(() => {
        if (!open) return;
        const onClickOutside = (e) => {
            if (e.target.closest?.('[data-select-portal]')) return;
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setOpen(false);
                setMode('select');
            }
        };
        const onEscape = (e) => { if (e.key === 'Escape') { setOpen(false); setMode('select'); } };
        document.addEventListener('mousedown', onClickOutside);
        document.addEventListener('keydown', onEscape);
        return () => {
            document.removeEventListener('mousedown', onClickOutside);
            document.removeEventListener('keydown', onEscape);
        };
    }, [open]);

    useEffect(() => {
        if (mode === 'create' && open) {
            setTimeout(() => newInputRef.current?.focus(), 50);
        }
    }, [mode, open]);

    const handleSelect = (plant) => {
        setPlantId(plant);
        setOpen(false);
        setMode('select');
    };

    const enterCreateMode = () => {
        form.reset();
        setMode('create');
    };

    const handleDeletedConfirmed = (deletedId) => {
        removePlant(deletedId);
        // Clear selection if the deleted plant was the active one
        if (plantId?.id === deletedId) setPlantId(null);
        setDeletingPlant(null);
    };

    const triggerLabel = plantId?.id ? `Plant: ${plantId.id}` : 'Select plant';

    return (
        <>
        <div className="relative" ref={menuRef}>
            <motion.button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-label={triggerLabel}
                title={triggerLabel}
                whileHover={motionOff ? undefined : { scale: 1.015 }}
                whileTap={motionOff ? undefined : { scale: 0.97 }}
                transition={tapTransition}
                className={cn(
                    // rounded-(--do-radius) — same raw Geometry token every
                    // other control uses (Button.jsx, LivePreview), not a
                    // multiplied tier, so this responds identically to
                    // Settings → Geometry as the rest of the app.
                    'group flex items-center gap-2 pl-3 pr-3 h-10 rounded-(--do-radius) border cursor-pointer',
                    'transition-colors duration-200',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
                    open
                        ? 'bg-brand-muted border-brand/30 shadow-sm shadow-brand/10'
                        : 'bg-canvas border-border hover:bg-surface-2 hover:border-border-strong',
                )}
            >
                {loading
                    ? <Loader2 className="w-4 h-4 text-text-muted shrink-0 animate-spin" />
                    : <Building2 className={cn('w-4 h-4 shrink-0', plantId ? 'text-brand' : 'text-text-muted')} />
                }

                <span className={cn(
                    'hidden sm:inline-block text-body-sm font-semibold truncate max-w-28 text-left',
                    plantId ? 'text-text-primary' : 'text-text-subtle',
                )}>
                    {loading ? 'Loading...' : plantId?.id || 'Select Plant'}
                </span>

                <ChevronDown
                    className={cn(
                        'w-3.5 h-3.5 shrink-0 transition-transform duration-200',
                        open ? 'rotate-180 text-brand' : 'text-text-subtle group-hover:text-text-muted',
                    )}
                />
            </motion.button>

            <AnimatePresence>
            {open && (
                <motion.div
                    role="listbox"
                    aria-label="Select plant"
                    initial={panelMotion.initial}
                    animate={panelMotion.animate}
                    exit={panelMotion.exit}
                    transition={panelMotion.transition}
                    style={{ transformOrigin: 'top right' }}
                    className={cn(
                        // z-100 — the shared header-popover tier (same as ProfileMenu).
                        // PageHeader's root is unpositioned, so this panel competes
                        // directly in the root stacking context against page-level
                        // sticky toolbars, several of which sit at z-50. At z-50 this
                        // panel tied with those and lost on DOM order (the page's
                        // toolbar painted over the plant list); z-100 clears them.
                        'absolute right-0 top-[calc(100%+10px)] z-100 w-[min(16rem,calc(100vw-2rem))] rounded-2xl border border-border',
                        'bg-surface shadow-modal overflow-hidden',
                    )}
                >
                    <div className="h-0.5 bg-linear-to-r from-brand via-brand-hover to-brand" />

                    {mode === 'select' ? (
                        <div className="py-1.5">
                            {fetchError && (
                                <div className="flex items-center justify-between gap-2 px-3.5 py-2.5">
                                    <div className="flex items-center gap-2 text-caption text-danger">
                                        <AlertCircle size={12} className="shrink-0" />
                                        <span>{fetchError}</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={fetchPlants}
                                        className="flex items-center gap-1 px-2 py-1 text-[11px] font-bold text-brand bg-brand/10 hover:bg-brand/20 rounded-md transition-colors cursor-pointer shrink-0"
                                    >
                                        <RefreshCw size={10} />
                                        Retry
                                    </button>
                                </div>
                            )}

                            {!fetchError && !loading && plants.length === 0 && (
                                <div className="px-3.5 py-3 text-caption text-text-subtle text-center">
                                    No plants configured
                                </div>
                            )}

                            <div className="max-h-64 overflow-y-auto">
                                {!fetchError && plants.map((plant) => (
                                    <PlantOptionRow
                                        key={plant.id}
                                        plant={plant}
                                        isSelected={plantId?.id === plant.id}
                                        onClick={() => handleSelect(plant)}
                                        onDelete={isAdmin ? (p) => {
                                            setDeletingPlant(p);
                                            setOpen(false);
                                        } : undefined}
                                    />
                                ))}
                            </div>

                            {!fetchError && (
                                <>
                                    <div className="mx-3 my-1 border-t border-border" />
                                    <button
                                        type="button"
                                        onClick={enterCreateMode}
                                        className="w-full flex items-center gap-3 px-3.5 py-2.5 text-left transition-colors hover:bg-brand-muted/60 cursor-pointer"
                                    >
                                        <div className="w-3.5 h-3.5 rounded-full bg-brand/10 flex items-center justify-center shrink-0">
                                            <Plus size={9} className="text-brand" />
                                        </div>
                                        <span className="text-body-sm font-semibold text-brand">Create New Plant ID</span>
                                    </button>
                                </>
                            )}
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

                    {panelMotion.sheen && <div className="liquid-glass-sheen" />}
                </motion.div>
            )}
            </AnimatePresence>
        </div>

        {/* Delete confirmation modal — rendered outside the dropdown so z-index is clean */}
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
