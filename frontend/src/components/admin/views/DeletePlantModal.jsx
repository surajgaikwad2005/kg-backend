'use client';
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Trash2, Loader2, X, ShieldAlert, CheckCircle2, Building2 } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { Modal } from '@/src/components/ui/Modal';
import { Skeleton } from '@/src/components/ui/Skeleton';
import { plantCodeIdService } from '@/src/services/plant-id/plantCodeIdService';
import { useToast } from '@/src/components/ui/Toast';

// ── Animation variants ─────────────────────────────────────────────────────────
const SLIDE_DOWN = {
    hidden:  { opacity: 0, height: 0, marginTop: 0 },
    visible: { opacity: 1, height: 'auto', marginTop: 12, transition: { duration: 0.22, ease: [0.4, 0, 0.2, 1] } },
    exit:    { opacity: 0, height: 0, marginTop: 0, transition: { duration: 0.18, ease: 'easeIn' } },
};
const ERROR_BANNER = {
    hidden:  { opacity: 0, y: -6, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.2 } },
    exit:    { opacity: 0, y: -4, transition: { duration: 0.14 } },
};

// ── Progress dots for the stepper ─────────────────────────────────────────────
function StepDot({ active, done }) {
    return (
        <motion.div
            animate={{ scale: active ? 1.15 : 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className={cn(
                'w-2 h-2 rounded-full transition-colors duration-300',
                done  ? 'bg-success' :
                active ? 'bg-danger' : 'bg-border',
            )}
        />
    );
}

// ── Character match indicator ──────────────────────────────────────────────────
function MatchBar({ input, target }) {
    if (!input || !target) return null;
    const matched = [...target].filter((ch, i) => ch === input[i]).length;
    const pct = Math.round((matched / target.length) * 100);
    const isMatch = input === target;
    return (
        <div className="mt-1.5 space-y-1">
            <div className="h-1 w-full rounded-full bg-surface-2 overflow-hidden">
                <motion.div
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.15 }}
                    className={cn(
                        'h-full rounded-full transition-colors duration-300',
                        isMatch ? 'bg-success' : pct > 60 ? 'bg-warning' : 'bg-danger',
                    )}
                />
            </div>
            <motion.p
                key={isMatch ? 'match' : 'no-match'}
                initial={{ opacity: 0, y: 2 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn('text-caption', isMatch ? 'text-success' : 'text-text-muted')}
            >
                {isMatch
                    ? <span className="flex items-center gap-1"><CheckCircle2 size={11} /> Confirmed</span>
                    : `${matched} / ${target.length} characters match`}
            </motion.p>
        </div>
    );
}

// ── Cascade purge impact preview ───────────────────────────────────────────────
// Backend field → display label (GET /plants/{plantCode}/purgePreview counts).
const PREVIEW_LABELS = {
    postgres_rows: 'Postgres rows',
    iotdb_series: 'IoTDB series',
    rustfs_objects: 'RustFS objects',
};
const PREVIEW_SKELETON_KEYS = Object.keys(PREVIEW_LABELS);

const prettifyPreviewKey = (key) =>
    PREVIEW_LABELS[key] ?? key.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase());

function PurgeImpactPreview({ status, data }) {
    if (status === 'idle') return null;

    let body;
    if (status === 'loading') {
        body = (
            <div className="grid grid-cols-3 gap-2">
                {PREVIEW_SKELETON_KEYS.map((k) => (
                    <div key={k} className="p-2 rounded-lg bg-surface border border-border space-y-1.5">
                        <Skeleton className="h-4 w-12" />
                        <Skeleton className="h-2.5 w-full" />
                    </div>
                ))}
            </div>
        );
    } else if (status === 'error') {
        body = (
            <p className="flex items-start gap-1.5 text-caption text-text-muted">
                <AlertTriangle size={11} className="text-warning shrink-0 mt-0.5" />
                Couldn&apos;t load the impact preview — purge itself is unaffected.
            </p>
        );
    } else {
        const entries = Object.entries(data ?? {}).filter(([, v]) => typeof v === 'number');
        if (!entries.length) return null;
        body = (
            <div className="grid grid-cols-3 gap-2">
                {entries.map(([key, value], i) => (
                    <motion.div
                        key={key}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05, duration: 0.2 }}
                        className="p-2 rounded-lg bg-surface border border-border min-w-0"
                    >
                        <p className="text-body-sm font-bold text-danger tabular-nums truncate">
                            {value.toLocaleString()}
                        </p>
                        <p className="text-caption text-text-muted truncate" title={prettifyPreviewKey(key)}>
                            {prettifyPreviewKey(key)}
                        </p>
                    </motion.div>
                ))}
            </div>
        );
    }

    return (
        <div role="status" aria-live="polite" className="space-y-1.5">
            <p className="text-caption font-semibold text-text-muted tracking-wide">
                Purge impact
            </p>
            {body}
        </div>
    );
}

// ── DeletePlantModal ───────────────────────────────────────────────────────────
/**
 * Props:
 *   plant       – { id, name }
 *   onClose()
 *   onDeleted(plantId)
 */
export function DeletePlantModal({ plant, onClose, onDeleted }) {
    const { error: toastError } = useToast();

    const [cascade, setCascade] = useState(false);
    const [confirmInput, setConfirmInput] = useState('');
    const [deleting, setDeleting] = useState(false);
    const [apiError, setApiError] = useState('');

    // Step 1 = choose mode, Step 2 = type confirm (cascade only)
    const step = cascade ? 2 : 1;
    const canSubmit = cascade ? confirmInput.trim() === plant?.id : true;

    // Shake animation trigger
    const [shake, setShake] = useState(false);
    useEffect(() => {
        if (shake) { const t = setTimeout(() => setShake(false), 400); return () => clearTimeout(t); }
    }, [shake]);

    // Cascade purge impact preview — fetched when the purge toggle is enabled.
    // previewReqId invalidates in-flight requests when the toggle flips off/on
    // so a late response can never overwrite a newer state.
    const [previewStatus, setPreviewStatus] = useState('idle'); // idle | loading | ready | error
    const [previewData, setPreviewData] = useState(null);
    const previewReqId = useRef(0);
    const fetchPurgePreview = useCallback(async (id) => {
        const req = ++previewReqId.current;
        setPreviewStatus('loading');
        try {
            const data = await plantCodeIdService.getPurgePreview(id);
            if (previewReqId.current !== req) return;
            setPreviewData(data);
            setPreviewStatus('ready');
        } catch {
            if (previewReqId.current === req) setPreviewStatus('error');
        }
    }, []);
    const resetPurgePreview = useCallback(() => {
        previewReqId.current++;
        setPreviewStatus('idle');
        setPreviewData(null);
    }, []);

    const handleDelete = useCallback(async () => {
        if (!canSubmit) { setShake(true); return; }
        if (deleting) return;
        setDeleting(true);
        setApiError('');
        try {
            await plantCodeIdService.deletePlantId(plant.id, {
                cascade,
                confirm: cascade ? plant.id : null,
            });
            plantCodeIdService.clearPlantLocalStorage(plant.id);
            onDeleted(plant.id);
        } catch (e) {
            const msg = e.message || 'Failed to delete plant';
            if (e.status === 409) {
                setApiError('CDM data still references this plant. Enable "Purge all data" to force delete.');
            } else {
                setApiError(msg);
                toastError?.(msg);
            }
            setShake(true);
        } finally {
            setDeleting(false);
        }
    }, [canSubmit, deleting, plant, cascade, onDeleted, toastError]);

    if (!plant) return null;

    return (
        <Modal open onClose={onClose} size="md" className="max-w-105 border border-border overflow-hidden">
                <motion.div
                    key="dp-modal"
                    animate={shake ? { x: [-6, 6, -5, 5, -3, 3, 0] } : { x: 0 }}
                    transition={shake ? { duration: 0.35, ease: 'easeInOut' } : undefined}
                >
                    {/* ── Danger stripe ──────────────────────────────────────── */}
                    <div className="h-1 w-full bg-linear-to-r from-danger/80 via-danger to-warning/70" />

                    {/* ── Header ─────────────────────────────────────────────── */}
                    <div className="flex items-start justify-between gap-4 px-5 pt-5 pb-4">
                        <div className="flex items-center gap-3">
                            {/* Animated icon */}
                            <motion.div
                                initial={{ scale: 0.6, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.08, type: 'spring', stiffness: 420, damping: 22 }}
                                className="relative w-10 h-10 rounded-xl bg-danger/10 flex items-center justify-center shrink-0"
                            >
                                <Trash2 size={17} className="text-danger" />
                                <motion.div
                                    animate={{ scale: [1, 1.35, 1], opacity: [0.4, 0, 0.4] }}
                                    transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
                                    className="absolute inset-0 rounded-xl bg-danger/20"
                                />
                            </motion.div>

                            <div>
                                <h2 className="text-body-sm font-bold text-text-primary leading-tight">
                                    Delete Plant
                                </h2>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <Building2 size={11} className="text-text-muted" />
                                    <span className="text-caption text-text-muted font-mono">{plant.id}</span>
                                    {plant.name && plant.name !== plant.id && (
                                        <span className="text-caption text-text-subtle">· {plant.name}</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <button
                            type="button"
                            aria-label="Close"
                            onClick={onClose}
                            className="p-1.5 rounded-lg hover:bg-surface-2 text-text-muted hover:text-text-primary transition-all cursor-pointer shrink-0 hover:rotate-90 duration-200"
                        >
                            <X size={15} />
                        </button>
                    </div>

                    {/* ── Step dots ──────────────────────────────────────────── */}
                    <div className="flex items-center gap-1.5 px-5 pb-3">
                        <StepDot active={step === 1} done={step > 1} />
                        <div className={cn('flex-1 h-px transition-colors duration-300', step > 1 ? 'bg-success' : 'bg-border')} />
                        <StepDot active={step === 2} done={false} />
                    </div>

                    {/* ── Body ───────────────────────────────────────────────── */}
                    <div className="px-5 pb-5 space-y-3">
                        {/* Context copy */}
                        <p className="text-body-sm text-text-muted">
                            By default this removes the plant from the registry.
                            The backend refuses if CDM data still references it.
                        </p>

                        {/* Cascade toggle card */}
                        <motion.label
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            className={cn(
                                'flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all duration-200',
                                cascade
                                    ? 'border-danger/40 bg-danger/5 shadow-sm shadow-danger/10'
                                    : 'border-border bg-surface-2 hover:border-border-strong',
                            )}
                        >
                            <input
                                type="checkbox"
                                checked={cascade}
                                onChange={(e) => {
                                    const on = e.target.checked;
                                    setCascade(on);
                                    setConfirmInput('');
                                    setApiError('');
                                    if (on) fetchPurgePreview(plant.id);
                                    else resetPurgePreview();
                                }}
                                className="mt-0.5 accent-danger cursor-pointer"
                                id="cascade-toggle"
                            />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                    <motion.div
                                        animate={{ rotate: cascade ? [0, -10, 10, -5, 5, 0] : 0 }}
                                        transition={{ duration: 0.4 }}
                                    >
                                        <ShieldAlert size={13} className={cn('transition-colors', cascade ? 'text-danger' : 'text-warning')} />
                                    </motion.div>
                                    <span className="text-body-sm font-semibold text-text-primary">
                                        Purge all data
                                    </span>
                                    {cascade && (
                                        <motion.span
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="text-caption font-bold text-white bg-danger px-1.5 py-0.5 rounded-md"
                                        >
                                            IRREVERSIBLE
                                        </motion.span>
                                    )}
                                </div>
                                <p className="text-caption text-text-muted mt-1 leading-relaxed">
                                    Deletes ALL plant data across Postgres, IoTDB, and RustFS.
                                    Cannot be undone.
                                </p>
                            </div>
                        </motion.label>

                        {/* Type-to-confirm (cascade only) */}
                        <AnimatePresence>
                            {cascade && (
                                <motion.div
                                    key="confirm-block"
                                    variants={SLIDE_DOWN}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    className="overflow-hidden"
                                >
                                    <div className="p-3.5 rounded-xl border border-danger/20 bg-danger/5 space-y-2.5">
                                        {/* Impact counts per storage layer (purgePreview endpoint) */}
                                        <PurgeImpactPreview status={previewStatus} data={previewData} />

                                        {/* Instruction — no uppercase CSS so plant.id displays as-is */}
                                        <p className="text-caption font-semibold text-text-muted tracking-wide">
                                            Type{' '}
                                            <span className="font-bold font-mono text-danger bg-danger/10 px-1 py-0.5 rounded">
                                                {plant.id}
                                            </span>
                                            {' '}to confirm purge
                                        </p>
                                        <input
                                            id="confirm-plant-input"
                                            type="text"
                                            value={confirmInput}
                                            onChange={(e) => { setConfirmInput(e.target.value); setApiError(''); }}
                                            placeholder={plant.id}
                                            autoComplete="off"
                                            aria-label={`Type ${plant.id} to confirm`}
                                            className={cn(
                                                'w-full px-3 py-2 text-body-sm bg-surface border rounded-lg font-mono',
                                                'focus:outline-none focus:ring-2 focus:ring-danger/25 focus:border-danger/40 transition-all',
                                                confirmInput && confirmInput !== plant.id
                                                    ? 'border-danger/50'
                                                    : 'border-border',
                                            )}
                                        />
                                        <MatchBar input={confirmInput} target={plant.id} />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* API error banner */}
                        <AnimatePresence>
                            {apiError && (
                                <motion.div
                                    key="api-error"
                                    variants={ERROR_BANNER}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    className="flex items-start gap-2 p-3 rounded-xl bg-danger/8 border border-danger/20"
                                >
                                    <AlertTriangle size={13} className="text-danger shrink-0 mt-0.5" />
                                    <p className="text-caption text-danger leading-relaxed">{apiError}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* ── Footer ─────────────────────────────────────────────── */}
                    <div className="flex items-center justify-end gap-2 px-5 pb-5">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={deleting}
                            className="px-4 py-2 text-body-sm font-semibold rounded-lg border border-border bg-surface hover:bg-surface-2 text-text-primary transition-colors cursor-pointer disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <motion.button
                            type="button"
                            onClick={handleDelete}
                            disabled={!canSubmit || deleting}
                            aria-busy={deleting}
                            whileHover={canSubmit && !deleting ? { scale: 1.03 } : {}}
                            whileTap={canSubmit && !deleting ? { scale: 0.97 } : {}}
                            className={cn(
                                'flex items-center gap-2 px-4 py-2 text-body-sm font-bold rounded-lg transition-all cursor-pointer',
                                'bg-danger text-white hover:bg-danger/90 shadow-sm',
                                (!canSubmit || deleting) && 'opacity-50 cursor-not-allowed',
                            )}
                        >
                            {deleting ? (
                                <><Loader2 size={13} className="animate-spin" /> Deleting...</>
                            ) : (
                                <><Trash2 size={13} /> {cascade ? 'Purge Plant' : 'Delete Plant'}</>
                            )}
                        </motion.button>
                    </div>
                </motion.div>
        </Modal>
    );
}
