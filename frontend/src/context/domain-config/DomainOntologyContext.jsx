'use client';

/**
 * DomainOntologyContext — the single source of truth for "domain ontology" data
 * that the Data / Domain Configuration flow produces and that other features
 * (knowledge-graph, symbolic-ai, dashboards) need to read.
 *
 * Why a dedicated provider (not AppContext):
 *  - AppContext is auth/session scoped; ontology data is a different, larger
 *    concern. Keeping it separate means an ontology write doesn't re-render
 *    every useApp() consumer.
 *  - Any feature can read ontology without coupling to admin internals.
 *
 * Shape: one `ontology` object made of named slices. Slices map to the data
 * sources in Data Configuration, but arbitrary keys are allowed so new features
 * can stash their own important data without a schema change.
 */
import React, {
    createContext, useContext, useCallback, useEffect, useMemo, useState,
} from 'react';

const STORAGE_KEY = 'domain_ontology';

const EMPTY_ONTOLOGY = {
    plant: null,          // selected plant id / metadata
    equipment: [],        // equipment_pid rows
    connectivity: [],     // equipment_connectivity rows
    documents: {},        // doc data grouped by category
    timeseries: [],       // historian / timeseries rows
    sap: {},              // sap tables / mappings
    sources: [],          // configured source summaries [{ type, status }]
};

const DomainOntologyContext = createContext(null);

function loadPersisted() {
    if (typeof window === 'undefined') return EMPTY_ONTOLOGY;
    try {
        const saved = sessionStorage.getItem(STORAGE_KEY);
        if (saved) return { ...EMPTY_ONTOLOGY, ...JSON.parse(saved) };
    } catch { /* ignore */ }
    return EMPTY_ONTOLOGY;
}

export function DomainOntologyProvider({ children }) {
    // Lazy initializer hydrates from sessionStorage on first render (matches the
    // AdminPanelContext pattern; loadPersisted is SSR-safe).
    const [ontology, setOntology] = useState(loadPersisted);

    // Persist on every change.
    useEffect(() => {
        try {
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(ontology));
        } catch { /* ignore */ }
    }, [ontology]);

    /** Replace a single slice (e.g. setSlice('equipment', rows)). */
    const setSlice = useCallback((key, value) => {
        setOntology(prev => (prev[key] === value ? prev : { ...prev, [key]: value }));
    }, []);

    /** Shallow-merge several slices at once (e.g. mergeOntology({ equipment, connectivity })). */
    const mergeOntology = useCallback((partial) => {
        if (!partial || typeof partial !== 'object') return;
        setOntology(prev => ({ ...prev, ...partial }));
    }, []);

    /** Read a slice with an optional fallback. */
    const getSlice = useCallback((key, fallback = undefined) => {
        const v = ontology[key];
        return v === undefined ? fallback : v;
    }, [ontology]);

    /** Reset everything (e.g. on plant switch or logout). */
    const clearOntology = useCallback(() => {
        setOntology(EMPTY_ONTOLOGY);
        try { sessionStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    }, []);

    const value = useMemo(() => ({
        ontology, setSlice, mergeOntology, getSlice, clearOntology,
    }), [ontology, setSlice, mergeOntology, getSlice, clearOntology]);

    return (
        <DomainOntologyContext.Provider value={value}>
            {children}
        </DomainOntologyContext.Provider>
    );
}

export function useDomainOntology() {
    const ctx = useContext(DomainOntologyContext);
    if (!ctx) throw new Error('useDomainOntology must be used within a DomainOntologyProvider');
    return ctx;
}
