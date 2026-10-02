'use client';
import { useCallback, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { useApp } from '@/src/context/AppContext';
import { PlantIdSelector } from '@/src/components/admin/views/PlantIdSelector';

const DISMISS_KEY = 'plant_code_banner_dismissed';

/**
 * Global, app-wide reminder shown whenever no plant code is selected yet.
 * Dismissable per tab session — but re-appears automatically the next time
 * plantCode goes back to null (e.g. after a delete), since apiClient blocks
 * every plant-scoped call in that state regardless of this banner.
 */
export default function PlantCodeBanner() {
    const { user, plantId, plantCode, setPlantId } = useApp();
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);
    const [dismissed, setDismissed] = useState(true);

    useEffect(() => {
        setMounted(true);
        try {
            setDismissed(sessionStorage.getItem(DISMISS_KEY) === 'true');
        } catch {
            setDismissed(false);
        }
    }, []);

    useEffect(() => {
        if (!plantCode) return;
        setDismissed(false);
        try { sessionStorage.removeItem(DISMISS_KEY); } catch { /* ignore */ }
    }, [plantCode]);

    const handleDismiss = useCallback(() => {
        setDismissed(true);
        try { sessionStorage.setItem(DISMISS_KEY, 'true'); } catch { /* ignore */ }
    }, []);

    const visible = mounted && Boolean(user) && !plantCode && !dismissed && pathname !== '/';

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ y: -64, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -64, opacity: 0 }}
                    transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                    role="alert"
                    className="fixed top-0 left-0 right-0 z-40 flex flex-wrap items-center gap-3 px-4 py-2.5 bg-warning/10 border-b border-warning/30 backdrop-blur-sm shadow-sm"
                >
                    <div className="flex items-center gap-2 shrink-0">
                        <AlertTriangle size={16} className="text-warning shrink-0" />
                        <span className="text-body-sm font-semibold text-text-primary whitespace-nowrap">
                            No plant selected
                        </span>
                    </div>

                    <p className="text-caption text-text-muted flex-1 min-w-50">
                        Select a plant code to load data for it — actions that need one are blocked until you do.
                    </p>

                    <div className="shrink-0 w-full sm:w-56">
                        <PlantIdSelector selectedPlantId={plantId} onSelect={setPlantId} />
                    </div>

                    <button
                        type="button"
                        onClick={handleDismiss}
                        aria-label="Dismiss plant code reminder"
                        className="shrink-0 p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-2 transition-colors cursor-pointer"
                    >
                        <X size={14} />
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
