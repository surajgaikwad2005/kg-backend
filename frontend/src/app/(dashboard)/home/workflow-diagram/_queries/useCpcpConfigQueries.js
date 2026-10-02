'use client';

/**
 * useCpcpConfigQueries — TanStack Query read hooks for the CPCP Configuration
 * (Home / Workflow Diagram) domain (Phase 12).
 *
 * Every plant-scoped query carries `plantCode` in the key and gates on
 * `enabled: !!plantCode` to prevent apiClient's PLANT_CODE_REQUIRED preflight
 * toast from firing on a blank plant.
 *
 * The component catalog (`usePnidComponents`) has a long staleTime because it's
 * reference data that changes only on an AI-generate action. Diagram lists have
 * a shorter staleTime — the user may create/delete/pin diagrams frequently.
 */
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/src/lib/query';
import { useApp } from '@/src/context/AppContext';
import {
    listPnidComponents,
    getPnidSidebarData,
    getPnidComponent,
    getPnidComponentsFromFolder,
    listPnidFolders,
    listPnidEquipments,
    listPnidDiagrams,
    loadPnidDiagram,
    listGenerateJobs,
    getPnidDetailedEquipmentSummaryStatus,
    getPnidDetailedEquipmentSummaryPreview,
} from '@/src/services/cpcp/diagram/diagramService';

// ── Component & folder catalog ────────────────────────────────────────────

/**
 * Every component in the equipment database, each WITH its `code` (SVG/TSX
 * source). Primary source for PaletteTab + EquipmentNode visuals.
 * Replaces WorkflowContext.fetchComponents.
 * staleTime 5 min — component catalog is reference data, changes only on AI generate.
 */
export function usePnidComponents() {
    const { plantCode } = useApp();
    return useQuery({
        queryKey: queryKeys.cpcpConfig.components(plantCode),
        queryFn: () => listPnidComponents(plantCode),
        enabled: !!plantCode,
        staleTime: 5 * 60_000,
    });
}

/** Combined sidebar data (component list + diagram list). Currently unused by UI. */
export function usePnidSidebarData() {
    const { plantCode } = useApp();
    return useQuery({
        queryKey: queryKeys.cpcpConfig.sidebarData(plantCode),
        queryFn: () => getPnidSidebarData(plantCode),
        enabled: !!plantCode,
    });
}

/** A single component's generated code by name. `enabled` gates on name. */
export function usePnidComponent(componentName) {
    const { plantCode } = useApp();
    return useQuery({
        queryKey: queryKeys.cpcpConfig.component(plantCode, componentName),
        queryFn: () => getPnidComponent(plantCode, componentName),
        enabled: !!plantCode && !!componentName,
    });
}

/** Components extracted from a named storage folder. */
export function usePnidComponentsFromFolder(folderName) {
    const { plantCode } = useApp();
    return useQuery({
        queryKey: queryKeys.cpcpConfig.componentsFromFolder(plantCode, folderName),
        queryFn: () => getPnidComponentsFromFolder(plantCode, folderName),
        enabled: !!plantCode && !!folderName,
    });
}

/** Available component storage folders. */
export function usePnidFolders() {
    const { plantCode } = useApp();
    return useQuery({
        queryKey: queryKeys.cpcpConfig.folders(plantCode),
        queryFn: () => listPnidFolders(plantCode),
        enabled: !!plantCode,
    });
}

/** All equipments known to CPCP Configuration. */
export function usePnidEquipments() {
    const { plantCode } = useApp();
    return useQuery({
        queryKey: queryKeys.cpcpConfig.equipments(plantCode),
        queryFn: () => listPnidEquipments(plantCode),
        enabled: !!plantCode,
    });
}

// ── Diagram persistence ──────────────────────────────────────────────────

/**
 * Saved diagrams list. Shared between useSidebarState (editor sidebar) and
 * useDashboardDiagram (home dashboard) — one request, one cache entry.
 */
export function usePnidDiagrams() {
    const { plantCode } = useApp();
    return useQuery({
        queryKey: queryKeys.cpcpConfig.diagrams(plantCode),
        queryFn: () => listPnidDiagrams(plantCode),
        enabled: !!plantCode,
    });
}

/** Load a single diagram's full data (nodes, edges) by ID. */
export function usePnidDiagram(diagramId) {
    const { plantCode } = useApp();
    return useQuery({
        queryKey: queryKeys.cpcpConfig.diagram(plantCode, diagramId),
        queryFn: () => loadPnidDiagram(plantCode, diagramId),
        enabled: !!plantCode && !!diagramId,
    });
}

// ── Batch generation jobs ────────────────────────────────────────────────

/** List all batch-generation jobs. */
export function useGenerateJobs() {
    const { plantCode } = useApp();
    return useQuery({
        queryKey: queryKeys.cpcpConfig.generateJobs(plantCode),
        queryFn: () => listGenerateJobs(plantCode),
        enabled: !!plantCode,
    });
}

// ── Detailed Equipment Summary ───────────────────────────────────────────

/**
 * Plant-level summary status ({ generated, total_records, last_modified }).
 * Replaces useEquipmentSummaryStatus hook entirely.
 * staleTime 30s — the hover-intent timer in the consuming component gates
 * refetches, and 30s caching prevents network spam on repeated hovers.
 */
export function useSummaryStatus({ enabled = true } = {}) {
    const { plantCode } = useApp();
    return useQuery({
        queryKey: queryKeys.cpcpConfig.summaryStatus(plantCode),
        queryFn: () => getPnidDetailedEquipmentSummaryStatus(plantCode),
        enabled: !!plantCode && enabled,
        staleTime: 30_000,
    });
}

/** Preview data for the Detailed Equipment Summary. */
export function useSummaryPreview(page) {
    const { plantCode } = useApp();
    return useQuery({
        queryKey: queryKeys.cpcpConfig.summaryPreview(plantCode, page),
        queryFn: () => getPnidDetailedEquipmentSummaryPreview(plantCode, page),
        enabled: !!plantCode && page != null,
    });
}
