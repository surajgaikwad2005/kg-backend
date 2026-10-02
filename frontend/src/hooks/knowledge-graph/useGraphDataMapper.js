import { useMemo } from 'react';
import { MarkerType } from '@xyflow/react';
import { groupOf, getNodeType, getTypeConfig, GROUP_CONFIG } from '@/src/components/ui/knowledge-graph/groups';

/**
 * useGraphDataMapper - Custom hook for layout mapping and calculations.
 * Processes nodes and edges limits, filters, sizes (orbs) and collapses.
 */
export function useGraphDataMapper({ data, totalNodes, nodeVariant, hiddenGroups, collapsedNodeIds, exploredNodeIds }) {
    const groupCounts = useMemo(() => {
        const counts = {};
        Object.keys(GROUP_CONFIG).forEach(g => { counts[g] = 0; });
        if (data && data.nodes) {
            data.nodes.forEach(n => {
                const label = getNodeType(n);
                const group = groupOf(label);
                counts[group] = (counts[group] || 0) + 1;
                // Also store under string key for type-level matching
                counts[label] = (counts[label] || 0) + 1;
            });
        }
        return counts;
    }, [data]);

    const { initialNodes, initialEdges } = useMemo(() => {
        if (!data || !data.nodes) return { initialNodes: [], initialEdges: [] };

        const rawNodes = data.nodes || [];
        const rawRels = data.relationships || [];

        const visibleIds = new Set();
        const visibleNodes = [];
        for (const n of rawNodes) {
            const label = getNodeType(n);
            const group = groupOf(label);

            const id = String(n.id);
            const isExplored = exploredNodeIds?.has(id);
            const isNeighborOfExplored = Array.isArray(rawRels) && rawRels.some(r => 
                (String(r.source) === id && exploredNodeIds?.has(String(r.target))) ||
                (String(r.target) === id && exploredNodeIds?.has(String(r.source)))
            );

            if ((hiddenGroups.has(group) || hiddenGroups.has(label)) && !isExplored && !isNeighborOfExplored) continue;

            if (visibleIds.has(id)) continue;
            visibleIds.add(id);
            visibleNodes.push(n);
        }

        const isOrb = nodeVariant === 'orb';

        // Connection degree per visible node → drives orb sizing
        const degree = {};
        if (isOrb) {
            for (const r of rawRels) {
                const s = String(r.source);
                const t = String(r.target);
                if (!visibleIds.has(s) || !visibleIds.has(t)) continue;
                degree[s] = (degree[s] || 0) + 1;
                degree[t] = (degree[t] || 0) + 1;
            }
        }
        const maxDegree = Math.max(1, ...Object.values(degree), 1);
        const orbSize = (id) => {
            const d = degree[id] || 0;
            return Math.round(45 + 40 * Math.sqrt(d / maxDegree)); // 45px leaf → 85px hub
        };

        // Ids that are the source of at least one visible edge → have children
        const childSourceIds = new Set();
        for (const r of rawRels) {
            const s = String(r.source);
            const t = String(r.target);
            if (visibleIds.has(s) && visibleIds.has(t)) childSourceIds.add(s);
        }

        const mappedNodes = visibleNodes.map(n => {
            const label = getNodeType(n);
            const props = n.properties || {};
            const id = String(n.id);
            const typeConfig = getTypeConfig(label);
            return {
                id,
                type: isOrb ? 'orb' : 'custom',
                data: {
                    label,
                    name: props.name || props.equipment_id || props.title || id,
                    group: groupOf(label),
                    color: typeConfig.color,
                    props,
                    hasChildren: childSourceIds.has(id),
                    ...(isOrb ? { size: orbSize(id) } : {}),
                },
                position: { x: 0, y: 0 },
                originalData: n
            };
        });

        const seenEdgeIds = new Set();
        const mappedEdges = [];
        for (const r of rawRels) {
            const source = String(r.source);
            const target = String(r.target);
            if (!visibleIds.has(source) || !visibleIds.has(target)) continue;
            const id = String(r.id || `${source}-${target}-${r.type}`);
            if (seenEdgeIds.has(id)) continue;
            seenEdgeIds.add(id);
            mappedEdges.push(isOrb
                ? {
                    id, source, target,
                    type: 'orbEdge',
                    animated: false,
                    label: r.type,
                    style: { strokeWidth: 1.5, stroke: 'var(--color-border-strong)' },
                    labelStyle: { fill: 'var(--color-text-muted)', fontSize: 9, fontWeight: 800, letterSpacing: '0.04em' },
                    labelShowBg: true,
                    labelBgStyle: { fill: 'var(--color-surface)', fillOpacity: 0.9 },
                    labelBgPadding: [6, 3],
                    labelBgBorderRadius: 6,
                    originalData: r,
                    markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--color-text-subtle)', width: 18, height: 18 },
                }
                : {
                    id, source, target,
                    type: 'smoothstep',
                    label: r.type,
                    animated: true,
                    style: { strokeWidth: 1.75, stroke: 'var(--color-border-strong)' },
                    markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--color-text-subtle)', width: 18, height: 18 },
                    labelStyle: { fill: 'var(--color-text-muted)', fontSize: 9, fontWeight: 800, letterSpacing: '0.04em' },
                    labelShowBg: true,
                    labelBgStyle: { fill: 'var(--color-surface)', fillOpacity: 0.85 },
                    labelBgPadding: [6, 3],
                    labelBgBorderRadius: 6,
                    originalData: r,
                });
        }

        return { initialNodes: mappedNodes, initialEdges: mappedEdges };
    }, [data, totalNodes, nodeVariant, hiddenGroups, exploredNodeIds]);

    // Compute hidden nodes/edges based on collapsed state
    const { hiddenNodes, hiddenEdges } = useMemo(() => {
        const hEdges = new Set();
        const hNodes = new Set();

        const incomingEdgesMap = new Map();
        initialEdges.forEach(e => {
            if (!incomingEdgesMap.has(e.target)) incomingEdgesMap.set(e.target, []);
            incomingEdgesMap.get(e.target).push(e);
        });

        let changed = true;
        while (changed) {
            changed = false;
            initialEdges.forEach(edge => {
                if (collapsedNodeIds.has(edge.source) || hNodes.has(edge.source)) {
                    if (!hEdges.has(edge.id)) {
                        hEdges.add(edge.id);
                        changed = true;
                    }
                }
            });
            initialNodes.forEach(node => {
                const incomingEdges = incomingEdgesMap.get(node.id) || [];
                if (incomingEdges.length > 0 && incomingEdges.every(e => hEdges.has(e.id))) {
                    if (!hNodes.has(node.id)) {
                        hNodes.add(node.id);
                        changed = true;
                    }
                }
            });
        }
        return { hiddenNodes: hNodes, hiddenEdges: hEdges };
    }, [initialNodes, initialEdges, collapsedNodeIds]);

    return { groupCounts, initialNodes, initialEdges, hiddenNodes, hiddenEdges };
}
