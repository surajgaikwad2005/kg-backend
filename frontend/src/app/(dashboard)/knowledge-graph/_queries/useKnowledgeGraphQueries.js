'use client';

/**
 * useKnowledgeGraphQueries — TanStack Query hooks for the Knowledge Graph
 * (Phase 2).
 *
 * The interesting problem here is node EXPANSION. `exploreKnowledgeGraph` serves
 * two different shapes on one endpoint: the initial view (no node_id) and a
 * node's neighbourhood (node_id set), whose results are merged into the base
 * graph. Modelling each expansion as its own cached query and re-deriving the
 * union on every render would be both slower and far more code.
 *
 * Instead: the base graph is a query, and an expansion is a MUTATION whose
 * onSuccess merges into the base query's cache via setQueryData. The merged
 * graph then IS the cache — no shadow copy in useState to keep in sync.
 *
 * The cache holds the PROCESSED graph, not the raw payload. Normalising inside
 * the queryFn rather than in `select` keeps one single shape in the cache, which
 * is what makes the setQueryData merge below safe: `select` runs on read, so a
 * cache holding raw data would force the merge to reason about two shapes at
 * once and drift the moment either changed.
 *
 * Consequence, accepted deliberately: refetching the base query discards
 * accumulated expansions. That is already the pre-migration behaviour —
 * `loadGraph()` reset `exploredNodeIds` to an empty Set on every load.
 */
import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { queryKeys } from '@/src/lib/query';
import {
    exploreKnowledgeGraph,
    uploadKnowledgeGraphFile,
    convertKnowledgeGraph,
} from '@/src/services/knowledge-graph/knowledgeGraphService';

export const EMPTY_GRAPH = { nodes: [], relationships: [] };

const relKey = (r) => `rel-${String(r.source)}-${r.type}-${String(r.target)}`;

/**
 * Normalises a backend payload: dedupes nodes/relationships and gives each a
 * stable string id while preserving the numeric database id alongside.
 */
export function processBackendData(data) {
    const seenNodes = new Set();
    const nodes = [];
    (data?.nodes || []).forEach((n) => {
        const id = String(n.id);
        if (seenNodes.has(id)) return;
        seenNodes.add(id);
        nodes.push({ ...n, id, dbId: n.id });
    });

    const seenRels = new Set();
    const relationships = [];
    (data?.relationships || []).forEach((r) => {
        const id = relKey(r);
        if (seenRels.has(id)) return;
        seenRels.add(id);
        relationships.push({
            ...r,
            source: String(r.source),
            target: String(r.target),
            id,
            src_db_id: r.source,
            tgt_db_id: r.target,
        });
    });

    return { nodes, relationships };
}

/** Caps to `limit` nodes and drops relationships whose endpoints fell outside. */
function capToLimit({ nodes, relationships }, limit) {
    if (!Number.isFinite(limit)) return { nodes, relationships };
    const capped = nodes.slice(0, limit);
    const ids = new Set(capped.map((n) => n.id));
    return {
        nodes: capped,
        relationships: relationships.filter((r) => ids.has(r.source) && ids.has(r.target)),
    };
}

/**
 * The base graph for a plant at a given node limit.
 *
 * `maxNodes` is part of the key, so GraphLimitControl changing the cap is a
 * natural key change — which is what lets the manual `initialLoadPlantRef`
 * dedupe guard go away entirely.
 *
 * Capping happens here (base load only), never on expansion — matching the
 * pre-migration split where loadGraph() capped and handleNodeExplore() did not.
 */
export function useExploreGraph(plantCode, maxNodes) {
    return useQuery({
        queryKey: queryKeys.knowledgeGraph.explore(plantCode, maxNodes),
        queryFn: async () => {
            try {
                await convertKnowledgeGraph(plantCode);
            } catch (err) {
                console.error("Failed to convert knowledge graph:", err);
            }
            const raw = await exploreKnowledgeGraph(plantCode, undefined, maxNodes);
            return capToLimit(processBackendData(raw), maxNodes);
        },
        enabled: !!plantCode,
        placeholderData: keepPreviousData,
        // Up to 10,000 nodes. The payload is either unchanged or wholly
        // replaced, never partially shared, so walking it for reusable
        // sub-objects is pure cost (CLAUDE.md rule 55).
        structuralSharing: false,
    });
}

/**
 * Expand one node's neighbourhood and merge the result into the base graph.
 *
 * A mutation rather than a query: it is user-triggered, its result accumulates
 * rather than replaces, and the caller needs to know when it settles.
 */
export function useExpandNode(plantCode, maxNodes) {
    const queryClient = useQueryClient();
    return useMutation({
        meta: { errorTitle: 'Could not expand node' },
        mutationFn: (nodeId) => exploreKnowledgeGraph(plantCode, nodeId, maxNodes),
        onSuccess: (raw) => {
            const incoming = processBackendData(raw);
            queryClient.setQueryData(
                queryKeys.knowledgeGraph.explore(plantCode, maxNodes),
                (prev) => {
                    const base = prev ?? EMPTY_GRAPH;
                    const nodeIds = new Set(base.nodes.map((n) => n.id));
                    const relIds = new Set(base.relationships.map((r) => r.id));
                    return {
                        nodes: [...base.nodes, ...incoming.nodes.filter((n) => !nodeIds.has(n.id))],
                        relationships: [
                            ...base.relationships,
                            ...incoming.relationships.filter((r) => !relIds.has(r.id)),
                        ],
                    };
                },
            );
        },
    });
}

/**
 * A `setGraphData(updaterOrValue)` that writes straight into the query cache.
 *
 * useKnowledgeGraphMutations applies OPTIMISTIC updates by calling
 * `setGraphData(prev => next)`. Handing it this keeps its existing signature
 * while making the cache the single owner of the graph — previously the
 * optimistic result lived in component state and the canonical result in a
 * separate fetch, which is how the two could disagree after a failed write.
 */
export function useSetGraphData(plantCode, maxNodes) {
    const queryClient = useQueryClient();
    return useCallback(
        (updater) => {
            queryClient.setQueryData(
                queryKeys.knowledgeGraph.explore(plantCode, maxNodes),
                (prev) => {
                    const base = prev ?? EMPTY_GRAPH;
                    return typeof updater === 'function' ? updater(base) : updater;
                },
            );
        },
        [queryClient, plantCode, maxNodes],
    );
}

/** Bulk-import nodes/relationships from a workbook, then reload the graph. */
export function useUploadGraphFile(plantCode) {
    const queryClient = useQueryClient();
    return useMutation({
        meta: { errorTitle: 'Upload Failed' },
        mutationFn: (file) => uploadKnowledgeGraphFile(plantCode, file),
        // Replaces the manual loadGraph() call that used to follow every upload.
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: queryKeys.knowledgeGraph.all(plantCode),
            });
        },
    });
}
