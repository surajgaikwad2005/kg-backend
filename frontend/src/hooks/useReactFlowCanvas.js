'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { applyNodeChanges, applyEdgeChanges, useReactFlow } from '@xyflow/react';
import { applyForceLayout } from './knowledge-graph/applyForceLayout';
import { useGraphDataMapper } from './knowledge-graph/useGraphDataMapper';
import { useGraphWindowHandlers } from './knowledge-graph/useGraphWindowHandlers';

/**
 * useReactFlowCanvas - Reusable React Flow canvas state management hook.
 * Manages force layout simulation, group filtering, collapsed nodes, and 
 * window event integrations.
 */
export function useReactFlowCanvas({
    data, setSelectedNode, width, height, totalNodes,
    nodeVariant, isMagnifyMode, exploredNodeIds, layoutVersion, onNodeExplore, onResetExplored,
}) {
    const { fitView, zoomIn, zoomOut } = useReactFlow();
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);
    const [collapsedNodeIds, setCollapsedNodeIds] = useState(new Set());
    const focusRequestId = useRef(null);
    const [hiddenGroups, setHiddenGroups] = useState(new Set());

    // Toggle hidden node groups.
    // Smart behaviour: if the filter is already ON for this group and there are
    // explored expansions that are bypassing it (making some filtered nodes visible),
    // clicking the filter button again should ONLY clear the expansion bypass so
    // those nodes re-hide — it does NOT toggle the filter off.
    // Normal toggle (hide ↔ show) only happens when no bypass is active.
    //
    // NOTE: we read hiddenGroups and exploredNodeIds from refs (not the closure)
    // to avoid stale-closure bugs. The refs are kept in sync every render.
    const toggleGroup = useCallback((group) => {
        const filterAlreadyOn = hiddenGroupsRef.current.has(group);
        const bypassActive    = (exploredNodeIdsRef.current?.size ?? 0) > 0;

        if (filterAlreadyOn && bypassActive) {
            // Re-apply the filter: clear the explored bypass so filtered nodes hide again.
            onResetExplored?.();
            return;
        }

        // Normal toggle
        setHiddenGroups(prev => {
            const next = new Set(prev);
            if (next.has(group)) next.delete(group);
            else                 next.add(group);
            return next;
        });
        // Clear explored state on any normal filter change so expanded neighbours
        // start fresh under the new filter rules.
        onResetExplored?.();
    }, [onResetExplored]);

    // Persisted node positions (id → {x, y}). Existing nodes are pinned to these
    // during layout so only newly-added nodes settle.
    const positionsRef = useRef(new Map());

    // Latest values mirrored into refs so effects stay stable instead of re-binding.
    const nodesRef = useRef(nodes);
    const edgesRef = useRef(edges);
    const setSelectedNodeRef = useRef(setSelectedNode);
    const widthRef = useRef(width);
    const heightRef = useRef(height);
    const exploredNodeIdsRef = useRef(exploredNodeIds);
    const collapsedNodeIdsRef = useRef(collapsedNodeIds);
    const hiddenGroupsRef = useRef(hiddenGroups);   // used by toggleGroup to avoid stale closures
    const hiddenNodesRef = useRef(null);
    const hiddenEdgesRef = useRef(null);

    const onToggleCollapse = useCallback((nodeId) => {
        setCollapsedNodeIds(prev => {
            const next = new Set(prev);
            if (next.has(nodeId)) {
                next.delete(nodeId);
                focusRequestId.current = nodeId;
            } else {
                next.add(nodeId);
            }
            return next;
        });
    }, []);

    // Custom hook to map raw data to React Flow nodes/edges and hidden visibility arrays
    const { groupCounts, initialNodes, initialEdges, hiddenNodes, hiddenEdges } = useGraphDataMapper({
        data, totalNodes, nodeVariant, hiddenGroups, collapsedNodeIds, exploredNodeIds
    });

    // Keep refs in sync with the latest values every render
    useEffect(() => {
        nodesRef.current = nodes;
        edgesRef.current = edges;
        setSelectedNodeRef.current = setSelectedNode;
        widthRef.current = width;
        heightRef.current = height;
        exploredNodeIdsRef.current = exploredNodeIds;
        collapsedNodeIdsRef.current = collapsedNodeIds;
        hiddenGroupsRef.current = hiddenGroups;     // keep toggleGroup always up-to-date
        hiddenNodesRef.current = hiddenNodes;
        hiddenEdgesRef.current = hiddenEdges;
        window.__kgNodes = nodes;
    });

    // Per-node visual decoration (hidden / collapsed / expandable)
    const decorate = useCallback((list) => list.map((n) => {
        const isExpandable = !exploredNodeIdsRef.current?.has(n.id);
        return {
            ...n,
            hidden: !!hiddenNodesRef.current?.has(n.id),
            data: {
                ...n.data,
                isCollapsed: !!collapsedNodeIdsRef.current?.has(n.id),
                isExpandable,
                onToggleCollapse,
            },
        };
    }), [onToggleCollapse]);

    // A fresh layout is requested → drop pinned positions
    useEffect(() => {
        positionsRef.current = new Map();
    }, [layoutVersion, hiddenGroups]);

    // Lay out the graph. Pinned nodes stay; new nodes run D3 simulation.
    useEffect(() => {
        if (initialNodes.length === 0) {
            positionsRef.current = new Map();
            setNodes([]);
            setEdges([]);
            return;
        }

        const saved = positionsRef.current;
        const hasNew = initialNodes.some((n) => !saved.has(n.id));

        const finalize = (positioned, refit) => {
            const present = new Set(positioned.map((n) => n.id));
            positioned.forEach((n) => saved.set(n.id, n.position));
            for (const id of [...saved.keys()]) if (!present.has(id)) saved.delete(id);

            setNodes(decorate(positioned.map((n) => ({
                ...n,
                style: { transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)' },
            }))));
            setEdges(initialEdges.map((e) => ({ ...e, hidden: !!hiddenEdgesRef.current?.has(e.id) })));

            if (!refit) return;
            const focusId = focusRequestId.current;
            if (focusId) {
                const childIds = initialEdges.filter((e) => e.source === focusId).map((e) => e.target);
                const fit = [{ id: focusId }, ...childIds.map((id) => ({ id }))];
                setTimeout(() => fitView({ nodes: fit, padding: 0.5, maxZoom: 1.2, duration: 800 }), 50);
                focusRequestId.current = null;
            } else {
                setTimeout(() => fitView({ padding: 0.2, duration: 800 }), 50);
            }
        };

        if (hasNew) {
            const anchorId = focusRequestId.current;
            applyForceLayout(initialNodes, initialEdges, widthRef.current || 800, heightRef.current || 600, saved, anchorId)
                .then((positioned) => finalize(positioned, true));
        } else {
            finalize(initialNodes.map((n) => ({ ...n, position: saved.get(n.id) || n.position })), false);
        }
    }, [initialNodes, initialEdges, fitView, decorate]);

    // Collapse/explore visibility flips
    useEffect(() => {
        setNodes((nds) => decorate(nds));
        setEdges((eds) => eds.map((e) => ({ ...e, hidden: !!hiddenEdges.has(e.id) })));
    }, [hiddenNodes, hiddenEdges, collapsedNodeIds, exploredNodeIds, decorate]);

    // Re-frame around a node that was just expanded
    useEffect(() => {
        const focusId = focusRequestId.current;
        if (!focusId) return;
        const childIds = edgesRef.current
            .filter((e) => e.source === focusId && !hiddenEdgesRef.current?.has(e.id))
            .map((e) => e.target);
        const fit = [{ id: focusId }, ...childIds.map((id) => ({ id }))];
        focusRequestId.current = null;
        const t = setTimeout(() => fitView({ nodes: fit, padding: 0.5, maxZoom: 1.2, duration: 800 }), 80);
        return () => clearTimeout(t);
    }, [collapsedNodeIds, fitView]);

    // Re-fit when canvas is resized
    const didMountRef = useRef(false);
    useEffect(() => {
        if (!didMountRef.current) { didMountRef.current = true; return; }
        if (nodesRef.current.length === 0) return;
        const t = setTimeout(() => fitView({ padding: 0.2, duration: 400 }), 120);
        return () => clearTimeout(t);
    }, [width, height, fitView]);

    // Pending style-cleanup timeouts per node (clear CSS transitions after drag settles)
    const styleCleanupRef = useRef(new Map());

    /**
     * BFS over edges to collect all descendants of parentId.
     * Returns a Map<nodeId, depth> so we can stagger animation delays.
     */
    const getDescendantsWithDepth = (parentId) => {
        const result = new Map();
        const queue = [{ id: parentId, depth: 0 }];
        while (queue.length > 0) {
            const { id: current, depth } = queue.shift();
            edgesRef.current.forEach((edge) => {
                if (edge.source === current && !result.has(edge.target)) {
                    result.set(edge.target, depth + 1);
                    queue.push({ id: edge.target, depth: depth + 1 });
                }
            });
        }
        return result;
    };

    const onNodesChange = useCallback((changes) => {
        const extraChanges = [];     // position changes for descendant nodes
        const styleChanges = new Map(); // nodeId → style override during drag
        const seenDescendants = new Set();

        const isDragging = changes.some(c => c.type === 'position' && c.dragging === true);
        const isDragEnd  = changes.some(c => c.type === 'position' && c.dragging === false);

        changes.forEach((c) => {
            if (c.type !== 'position' || !c.position) return;

            const prevNode = nodesRef.current.find(n => n.id === c.id);
            if (!prevNode?.position) {
                positionsRef.current.set(c.id, c.position);
                return;
            }

            const dx = c.position.x - prevNode.position.x;
            const dy = c.position.y - prevNode.position.y;

            if (Math.abs(dx) > 0.01 || Math.abs(dy) > 0.01) {
                const descendants = getDescendantsWithDepth(c.id);

                descendants.forEach((depth, descId) => {
                    // Skip if this descendant is already being dragged directly
                    if (changes.some(ch => ch.id === descId && ch.type === 'position')) return;
                    if (seenDescendants.has(descId)) return;
                    seenDescendants.add(descId);

                    const descNode = nodesRef.current.find(n => n.id === descId);
                    if (!descNode?.position) return;

                    const nextPos = {
                        x: descNode.position.x + dx,
                        y: descNode.position.y + dy,
                    };

                    // Synchronous position update — always moves the child
                    extraChanges.push({ id: descId, type: 'position', position: nextPos });
                    positionsRef.current.set(descId, nextPos);

                    // CSS transition gives the smooth feel during dragging.
                    // Depth-based delay creates the wave / ripple propagation.
                    // depth 1 → 0 ms delay, stiffer (snap quickly)
                    // depth 2 → 30 ms delay, slightly springier
                    // depth 3+ → 60+ ms delay, most elastic
                    const delayMs   = (depth - 1) * 30;
                    const durationMs = 60 + depth * 15; // 75ms at depth 1, 90ms at depth 2 …
                    const easing = depth === 1
                        ? 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'   // ease-out-quad  — snappy
                        : depth === 2
                            ? 'cubic-bezier(0.34, 1.20, 0.64, 1)'  // subtle overshoot
                            : 'cubic-bezier(0.34, 1.56, 0.64, 1)'; // springy bounce

                    styleChanges.set(descId, {
                        transition: `transform ${durationMs}ms ${easing} ${delayMs}ms`,
                        willChange: 'transform',
                    });

                    // Clear transition after the animation finishes so it doesn't
                    // block future layout passes.
                    const existing = styleCleanupRef.current.get(descId);
                    if (existing) clearTimeout(existing);
                    const tid = setTimeout(() => {
                        setNodes(nds => nds.map(n =>
                            n.id === descId
                                ? { ...n, style: { ...n.style, transition: undefined, willChange: undefined } }
                                : n
                        ));
                        styleCleanupRef.current.delete(descId);
                    }, delayMs + durationMs + 50);
                    styleCleanupRef.current.set(descId, tid);
                });
            }

            positionsRef.current.set(c.id, c.position);
        });

        // Build the combined change + style update in one setNodes call
        const allPositionChanges = [...changes, ...extraChanges];
        setNodes((nds) => {
            const updated = applyNodeChanges(allPositionChanges, nds);
            if (styleChanges.size === 0) return updated;
            return updated.map(n => {
                const s = styleChanges.get(n.id);
                return s ? { ...n, style: { ...n.style, ...s } } : n;
            });
        });
    }, []);
    const onEdgesChange = useCallback((changes) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);

    const onNodeClick = useCallback((_, node) => {
        setSelectedNode(node.originalData);
        setNodes(nds => nds.map(n => ({ ...n, selected: n.id === node.id })));
        setEdges(eds => eds.map(e => ({ ...e, selected: false })));
        focusRequestId.current = node.id;
    }, [setSelectedNode]);

    const onEdgeClick = useCallback((_, edge) => {
        setSelectedNode(edge.originalData);
        setEdges(eds => eds.map(e => ({ ...e, selected: e.id === edge.id })));
        setNodes(nds => nds.map(n => ({ ...n, selected: false })));
    }, [setSelectedNode]);

    const onNodeDoubleClick = useCallback((_, node) => {
        const id = node.id;
        const lastExplore = window.__lastExploreTime?.get(id) || 0;
        const timeSinceExplore = Date.now() - lastExplore;

        if (exploredNodeIdsRef.current?.has(id) && timeSinceExplore > 500) {
            onToggleCollapse(id);
        } else {
            if (!window.__lastExploreTime) window.__lastExploreTime = new Map();
            window.__lastExploreTime.set(id, Date.now());
            onNodeExplore?.(node.originalData);
        }
    }, [onNodeExplore, onToggleCollapse]);

    const onPaneClick = useCallback(() => {
        setSelectedNode(null);
        setNodes(nds => nds.map(n => ({ ...n, selected: false })));
        setEdges(eds => eds.map(e => ({ ...e, selected: false })));
    }, [setSelectedNode]);

    // Bind browser global hooks
    useGraphWindowHandlers({
        zoomIn, zoomOut, fitView,
        setEdges, setNodes, setSelectedNode,
        nodesRef, edgesRef, setSelectedNodeRef
    });

    return {
        nodes,
        edges,
        hiddenGroups,
        groupCounts,
        toggleGroup,
        onNodesChange,
        onEdgesChange,
        onNodeClick,
        onEdgeClick,
        onNodeDoubleClick,
        onPaneClick
    };
}
