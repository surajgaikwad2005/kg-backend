'use client';

/**
 * useKgViewerQueries — TanStack Query hooks for the read-only SAP PM Knowledge
 * Graph demo.
 *
 *   - useInitialGraph : the seed graph (query)
 *   - useExpandNode   : merge a node's neighbourhood into the seed graph (mutation)
 *   - useNodeDetails  : a node's full property bag for the side panel (query)
 *
 * The merge model mirrors the original: the seed graph IS the cache, and an
 * expansion writes through to it via setQueryData so accumulated expansions and
 * the canonical seed live in one place.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    fetchInitialGraph,
    expandGraphNode,
    fetchNodeDetails,
} from '@/src/services/knowledge-graph/kgViewerService';

export const EMPTY_GRAPH = { nodes: [], relationships: [] };

const KG_KEYS = {
    graph: ['kg', 'graph'],
    node: (id) => ['kg', 'node', id],
};

const relKey = (r) => `rel-${String(r.source)}-${r.type}-${String(r.target)}`;

/**
 * Normalises a backend payload: dedupes nodes/relationships and gives each a
 * stable string id while preserving the numeric database id alongside.
 * (Ported verbatim from the original useKnowledgeGraphQueries.processBackendData.)
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

/** The seed graph. */
export function useInitialGraph() {
    return useQuery({
        queryKey: KG_KEYS.graph,
        queryFn: async () => processBackendData(await fetchInitialGraph()),
        staleTime: Infinity,
        structuralSharing: false,
    });
}

/** Expand one node's neighbourhood and merge the result into the seed graph. */
export function useExpandNode() {
    const queryClient = useQueryClient();
    return useMutation({
        meta: { errorTitle: 'Could not expand node' },
        mutationFn: (nodeId) => expandGraphNode(nodeId),
        onSuccess: (raw) => {
            const incoming = processBackendData(raw);
            queryClient.setQueryData(KG_KEYS.graph, (prev) => {
                const base = prev ?? EMPTY_GRAPH;
                const nodeIds = new Set(base.nodes.map((n) => n.id));
                const relIds = new Set(base.relationships.map((r) => r.id));
                return {
                    nodes: [
                        ...base.nodes,
                        ...incoming.nodes.filter((n) => !nodeIds.has(n.id)),
                    ],
                    relationships: [
                        ...base.relationships,
                        ...incoming.relationships.filter((r) => !relIds.has(r.id)),
                    ],
                };
            });
        },
    });
}

/**
 * A node's full property bag, adapted to the shape NodeProperties expects
 * ({ labels: [...], properties: {...} }).
 */
export function useNodeDetails(nodeId) {
    return useQuery({
        queryKey: KG_KEYS.node(nodeId),
        enabled: !!nodeId,
        staleTime: 5 * 60 * 1000,
        queryFn: async () => {
            const d = await fetchNodeDetails(nodeId);
            if (!d || d.message === 'Node not found') return null;
            return {
                id: String(d.node_id),
                dbId: d.node_id,
                labels: d.node_type ? [d.node_type] : [],
                properties: {
                    ...(d.natural_key ? { name: d.natural_key } : {}),
                    ...(d.properties || {}),
                },
            };
        },
    });
}
