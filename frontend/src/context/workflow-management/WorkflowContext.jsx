'use client';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { COMPONENT_CATALOG, NODE_SIZES } from '@/src/app/(dashboard)/home/workflow-diagram/_components/IndustrialSvgs';
import { parseGeneratedSvg } from '@/src/app/(dashboard)/home/workflow-diagram/_utils/SvgParser';
import { useConfirm } from '@/src/components/ui/ConfirmModal';
import { useApp } from '@/src/context/AppContext';
import { usePnidComponents } from '@/src/app/(dashboard)/home/workflow-diagram/_queries/useCpcpConfigQueries';
import { queryKeys } from '@/src/lib/query';

// Shared parse cache across all catalog render() calls — keyed by `<catalogId>|<status>|<label>`
const SVG_RENDER_CACHE = new Map();

/** Stable catalog id for a backend component name (must match onDragStartPnid in useSidebarState). */
const catalogKeyFor = (name) => `pnid_${String(name).toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

const HYDRATED_SIZE = { w: 200, h: 160 };

/** Catalog entry backed by real generated SVG source. */
const buildHydratedEntry = (id, item, parsed) => {
    const vb = parsed.defaultViewBox;
    return {
        viewBox: vb,
        label: item.name,
        desc: item.description || 'Industrial Component',
        color: 'border-success',
        render: (status, label) => {
            const cacheKey = `${id}|${status}|${label}`;
            if (!SVG_RENDER_CACHE.has(cacheKey)) {
                const res = parseGeneratedSvg(item.code, { status, label });
                SVG_RENDER_CACHE.set(cacheKey, res ? res.svgMarkup : null);
            }
            const markup = SVG_RENDER_CACHE.get(cacheKey);
            if (!markup) return null;
            return (
                <svg viewBox={vb} width="100%" height="100%">
                    <g dangerouslySetInnerHTML={{ __html: markup }} />
                </svg>
            );
        },
    };
};

const WorkflowContext = createContext(undefined);
export const useWorkflowData = () => {
    const context = useContext(WorkflowContext);
    if (!context) {
        throw new Error('useWorkflowData must be used within a WorkflowDataProvider');
    }
    return context;
};

export const WorkflowDataProvider = ({ children }) => {
    const { openConfirm } = useConfirm();
    const { plantCode } = useApp();
    const queryClient = useQueryClient();
    const [dynamicCatalog, setDynamicCatalog] = useState({});
    const [dynamicSizes, setDynamicSizes] = useState({});

    // ── TanStack Query: component catalog (replaces fetchComponents) ─────
    const {
        data: pnidComponentsRaw,
        isLoading: pnidLoading,
    } = usePnidComponents();

    const pnidComponents = useMemo(
        () => (Array.isArray(pnidComponentsRaw) ? pnidComponentsRaw : []),
        [pnidComponentsRaw],
    );

    // Hydrate dynamic catalog + sizes from backend components whenever data changes.
    useEffect(() => {
        if (!pnidComponents.length) return;

        const catalog = {};
        const sizes = {};
        pnidComponents.forEach((item) => {
            if (!item?.name) return;
            const id = catalogKeyFor(item.name);
            if (!item.code) return;
            const parsed = parseGeneratedSvg(item.code);
            if (!parsed) return;
            catalog[id] = buildHydratedEntry(id, item, parsed);
            sizes[id] = HYDRATED_SIZE;
        });
        setDynamicCatalog((prev) => ({ ...prev, ...catalog }));
        setDynamicSizes((prev) => ({ ...prev, ...sizes }));
    }, [pnidComponents]);

    // refreshSidebarData → invalidates the query so consumers re-fetch automatically.
    const refreshSidebarData = useCallback(() => {
        void queryClient.invalidateQueries({
            queryKey: queryKeys.cpcpConfig.components(plantCode),
        });
    }, [queryClient, plantCode]);

    // 1. Load from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('ai_equipment_catalog');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                const reconstructed = {};
                const sizes = {};
                Object.entries(parsed).forEach(([id, item]) => {
                    const vb = item.viewBox || '0 0 150 150';
                    const src = item.code || item.markup;
                    reconstructed[id] = {
                        viewBox: vb,
                        label: item.label,
                        desc: item.desc || item.description || 'AI Generated Component',
                        color: 'border-brand',
                        render: (status, label) => {
                            const cacheKey = `${id}|${status}|${label}`;
                            if (!SVG_RENDER_CACHE.has(cacheKey)) {
                                const res = parseGeneratedSvg(src, { status, label });
                                SVG_RENDER_CACHE.set(cacheKey, res ? res.svgMarkup : null);
                            }
                            const markup = SVG_RENDER_CACHE.get(cacheKey);
                            if (!markup) return null;
                            return (
                                <svg viewBox={vb} width="100%" height="100%">
                                    <g dangerouslySetInnerHTML={{ __html: markup }} />
                                </svg>
                            );
                        }
                    };
                    sizes[id] = { w: 150, h: 150 };
                });
                setDynamicCatalog(reconstructed);
                setDynamicSizes(sizes);
            }
            catch (e) {
            }
        }
    }, []);

    // 2. Save to localStorage when catalog changes
    const saveToStore = (id, name, code, viewBox, description) => {
        const saved = localStorage.getItem('ai_equipment_catalog');
        let current = saved ? JSON.parse(saved) : {};
        current[id] = { label: name, code, viewBox, desc: description || 'AI Generated' };
        localStorage.setItem('ai_equipment_catalog', JSON.stringify(current));
    };

    const addAiComponent = useCallback((name, code, description) => {
        const parsed = parseGeneratedSvg(code); // Pre-check if valid
        if (!parsed)
            return;
        const id = `ai_${name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`;
        const vb = parsed.defaultViewBox;
        const newComponent = {
            viewBox: vb,
            label: name,
            desc: description || 'AI Generated Component',
            color: 'border-brand',
            render: (status, label) => {
                const cacheKey = `${id}|${status}|${label}`;
                if (!SVG_RENDER_CACHE.has(cacheKey)) {
                    const res = parseGeneratedSvg(code, { status, label });
                    SVG_RENDER_CACHE.set(cacheKey, res ? res.svgMarkup : null);
                }
                const markup = SVG_RENDER_CACHE.get(cacheKey);
                if (!markup) return null;
                return (
                    <svg viewBox={vb} width="100%" height="100%">
                        <g dangerouslySetInnerHTML={{ __html: markup }} />
                    </svg>
                );
            }
        };
        setDynamicCatalog(prev => ({ ...prev, [id]: newComponent }));
        setDynamicSizes(prev => ({ ...prev, [id]: { w: 150, h: 150 } }));
        saveToStore(id, name, code, parsed.defaultViewBox, description);
    }, []);

    const removeAiComponent = useCallback((id) => {
        setDynamicCatalog(prev => {
            const next = { ...prev };
            delete next[id];
            return next;
        });
        // Update localStorage
        const saved = localStorage.getItem('ai_equipment_catalog');
        if (saved) {
            const current = JSON.parse(saved);
            delete current[id];
            localStorage.setItem('ai_equipment_catalog', JSON.stringify(current));
        }
    }, []);

    const clearAiComponents = useCallback(async () => {
        const ok = await openConfirm('All AI-generated components will be removed from the palette.', { title: 'Clear AI palette?', confirmLabel: 'Clear', variant: 'warning' });
        if (!ok) return;
        setDynamicCatalog(prev => {
            const next = { ...prev };
            Object.keys(next).forEach(k => { if (k.startsWith('ai_')) delete next[k]; });
            return next;
        });
        setDynamicSizes(prev => {
            const next = { ...prev };
            Object.keys(next).forEach(k => { if (k.startsWith('ai_')) delete next[k]; });
            return next;
        });
        localStorage.removeItem('ai_equipment_catalog');
    }, [openConfirm]);

    const catalog = useMemo(() => ({ ...COMPONENT_CATALOG, ...dynamicCatalog }), [dynamicCatalog]);
    const nodeSizes = useMemo(() => ({ ...NODE_SIZES, ...dynamicSizes }), [dynamicSizes]);

    const value = useMemo(() => ({
        catalog,
        nodeSizes,
        addAiComponent,
        removeAiComponent,
        clearAiComponents,
        pnidComponents,
        pnidLoading,
        refreshSidebarData,
    }), [
        catalog, nodeSizes, addAiComponent, removeAiComponent, clearAiComponents,
        pnidComponents, pnidLoading, refreshSidebarData,
    ]);

    return <WorkflowContext.Provider value={value}>{children}</WorkflowContext.Provider>;
};
