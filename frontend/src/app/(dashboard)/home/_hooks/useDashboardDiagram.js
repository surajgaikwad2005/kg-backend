'use client';

import { useMemo } from 'react';
import { usePnidDiagrams, usePnidDiagram } from '@/src/app/(dashboard)/home/workflow-diagram/_queries/useCpcpConfigQueries';
import {
    normalizeLoadedNodes,
    normalizeLoadedEdges,
} from '@/src/app/(dashboard)/home/workflow-diagram/_utils/diagramNormalize';

const EMPTY_NODES = [];
const EMPTY_EDGES = [];

/**
 * The home dashboard shows the diagram flagged via the editor's pin action.
 * `is_dashboard` is the authoritative flag; `pinned` is accepted as a fallback
 * for diagrams saved before both flags were written together.
 */
const pickDashboardDiagram = (diagrams) =>
    diagrams.find((d) => d?.is_dashboard === true) ||
    diagrams.find((d) => d?.pinned === true) ||
    null;

/**
 * useDashboardDiagram — single owner of the home dashboard's flow-diagram data.
 *
 * Phase 12 TanStack Query migration: two chained queries replace the manual
 * useState/useEffect/useCallback/useRef pattern. The requestRef stale-response
 * guard is no longer needed — plantCode in the key handles it structurally.
 *
 * 1. usePnidDiagrams() → diagram list (shared cache with sidebar).
 * 2. usePnidDiagram(dashboardDiagramId) → full diagram data (nodes, edges).
 */
export function useDashboardDiagram() {
    const diagramsQuery = usePnidDiagrams();

    // Derive the dashboard-pinned diagram from the list.
    const dashboardDiagram = useMemo(() => {
        const raw = diagramsQuery.data;
        const list = Array.isArray(raw) ? raw : (raw?.diagrams ?? []);
        return pickDashboardDiagram(list);
    }, [diagramsQuery.data]);

    const diagramQuery = usePnidDiagram(dashboardDiagram?.id);

    // Normalize nodes/edges from the loaded diagram data.
    const nodes = useMemo(
        () => (diagramQuery.data ? normalizeLoadedNodes(diagramQuery.data.nodes) : EMPTY_NODES),
        [diagramQuery.data],
    );

    const edges = useMemo(
        () => (diagramQuery.data ? normalizeLoadedEdges(diagramQuery.data.edges) : EMPTY_EDGES),
        [diagramQuery.data],
    );

    const diagram = useMemo(() => {
        if (!diagramQuery.data) return null;
        return {
            id: diagramQuery.data.id || dashboardDiagram?.id,
            name: diagramQuery.data.name || dashboardDiagram?.name || '',
            updatedAt: diagramQuery.data.updated_at || diagramQuery.data.saved_at || null,
        };
    }, [diagramQuery.data, dashboardDiagram]);

    // Compose loading/error from both queries.
    const isLoading = diagramsQuery.isLoading || diagramQuery.isLoading;

    const error = useMemo(() => {
        if (diagramsQuery.error) return 'Industrial monitoring service is currently offline.';
        if (diagramQuery.error) return 'Industrial monitoring service is currently offline.';
        if (diagramsQuery.data && !dashboardDiagram) return 'No diagram pinned to dashboard.';
        return null;
    }, [diagramsQuery.data, diagramsQuery.error, diagramQuery.error, dashboardDiagram]);

    const refetch = useMemo(
        () => () => {
            void diagramsQuery.refetch();
            if (dashboardDiagram?.id) void diagramQuery.refetch();
        },
        [diagramsQuery, diagramQuery, dashboardDiagram?.id],
    );

    return { diagram, nodes, edges, isLoading, error, refetch };
}
