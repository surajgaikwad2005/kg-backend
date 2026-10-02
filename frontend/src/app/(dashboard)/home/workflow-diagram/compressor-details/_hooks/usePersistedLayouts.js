'use client';
import { useCallback, useEffect, useState } from 'react';

/**
 * usePersistedLayouts
 * Keeps a react-grid-layout arrangement in localStorage so a rearranged board
 * survives a refresh, and gives the toolbar a Reset action that actually
 * restores the default layout.
 *
 * (The previous implementation kept layouts in component state only and wired
 * "Reset Layout" to `window.location.reload()` — which reloaded the page without
 * resetting anything, since nothing was persisted in the first place.)
 *
 * @param {string} storageKey  — unique per board (train-scoped here)
 * @param {object} defaultLayouts — the `{ lg: [...], md: [...] }` fallback
 */
export function usePersistedLayouts(storageKey, defaultLayouts) {
    const [layouts, setLayouts] = useState(defaultLayouts);
    const [isDirty, setIsDirty] = useState(false);

    // Hydrate from storage after mount — localStorage is not available during SSR,
    // and reading it in the initial state would desync server/client markup.
    useEffect(() => {
        setIsDirty(false);
        try {
            const raw = localStorage.getItem(storageKey);
            const parsed = raw ? JSON.parse(raw) : null;
            if (parsed && typeof parsed === 'object' && Array.isArray(parsed.lg)) {
                setLayouts(parsed);
                setIsDirty(true);
                return;
            }
        } catch { /* corrupt entry — fall through to defaults */ }
        setLayouts(defaultLayouts);
    }, [storageKey, defaultLayouts]);

    const handleLayoutChange = useCallback((_current, allLayouts) => {
        if (!allLayouts) return;
        setLayouts(allLayouts);
        setIsDirty(true);
        try {
            localStorage.setItem(storageKey, JSON.stringify(allLayouts));
        } catch { /* quota or private mode — the board still works in-session */ }
    }, [storageKey]);

    const resetLayouts = useCallback(() => {
        setLayouts(defaultLayouts);
        setIsDirty(false);
        try {
            localStorage.removeItem(storageKey);
        } catch { /* nothing to clean up */ }
    }, [storageKey, defaultLayouts]);

    return { layouts, handleLayoutChange, resetLayouts, isDirty };
}
