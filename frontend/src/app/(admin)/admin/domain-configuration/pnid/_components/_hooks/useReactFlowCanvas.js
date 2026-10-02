'use client';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { applyNodeChanges, applyEdgeChanges, MarkerType, useReactFlow } from '@xyflow/react';
import * as d3 from 'd3';
import { groupOf } from '@/src/components/ui/knowledge-graph/groups';

// Settle node positions with a force simulation. Nodes whose id is present in
// `fixed` are pinned (fx/fy) to their existing position, so only newly-added
// nodes move — this stops the whole graph reshuffling on every data change.
function applyForceLayout(nodes, edges, width, height, fixed) {
    return new Promise((resolve) => {
        const simNodes = nodes.map((n) => {
            const pos = fixed?.get(n.id);
            return pos ? { ...n, x: pos.x, y: pos.y, fx: pos.x, fy: pos.y } : { ...n };
        });
        const simLinks = edges.map(e => ({ source: e.source, target: e.target }));

        const simulation = d3.forceSimulation(simNodes)
            .force('link', d3.forceLink(simLinks).id(d => d.id).distance(160))
            .force('charge', d3.forceManyBody().strength(-800))
            .force('center', d3.forceCenter(width / 2, height / 2))
            // Collision radius scales with orb size so big hub nodes don't overlap
            // (card nodes carry no size → constant 60, unchanged).
            .force('collision', d3.forceCollide().radius(d => (d.data?.size ? d.data.size / 2 + 18 : 60)))
            .stop();

        for (let i = 0; i < 300; ++i) simulation.tick();

        const positionedNodes = nodes.map((n, i) => ({
            ...n,
            position: { x: simNodes[i].x, y: simNodes[i].y }
        }));

        resolve(positionedNodes);
    });
}

export function useReactFlowCanvas({
    data, setSelectedNode, width, height, totalNodes,
    nodeVariant, isMagnifyMode, exploredNodeIds, layoutVersion, onNodeExplore,
}) {
    const { fitView, zoomIn, zoomOut } = useReactFlow();
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);
    const [collapsedNodeIds, setCollapsedNodeIds] = useState(new Set());
    const focusRequestId = useRef(null);

    // Persisted node positions (id → {x, y}). Existing nodes are pinned to these
    // during layout so only newly-added nodes settle — the graph no longer
    // reshuffles on explore/edit. Cleared whenever the host bumps layoutVersion.
    const positionsRef = useRef(new Map());

    // Latest values mirrored into refs so the effects below stay stable instead
    // of re-binding on every change.
    const nodesRef = useRef(nodes);
    const edgesRef = useRef(edges);
    const setSelectedNodeRef = useRef(setSelectedNode);
    const widthRef = useRef(width);
    const heightRef = useRef(height);
    const exploredNodeIdsRef = useRef(exploredNodeIds);
    const collapsedNodeIdsRef = useRef(collapsedNodeIds);
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

    const { initialNodes, initialEdges } = useMemo(() => {
        if (!data || !data.nodes) return { initialNodes: [], initialEdges: [] };

        const rawNodes = data.nodes || [];
        const rawRels = data.relationships || [];

        // Cap to totalNodes and drop duplicate ids — the backend can return the
        // same business key more than once, and ReactFlow keys by id.
        const cap = totalNodes || rawNodes.length;
        const visibleIds = new Set();
        const visibleNodes = [];
        for (const n of rawNodes) {
            if (visibleNodes.length >= cap) break;
            const id = String(n.id);
            if (visibleIds.has(id)) continue;
            visibleIds.add(id);
            visibleNodes.push(n);
        }

        const isOrb = nodeVariant === 'orb';

        // Connection degree per visible node → drives orb sizing (hub nodes large,
        // leaves small), mirroring a classic knowledge-graph layout.
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
            return Math.round(30 + 64 * Math.sqrt(d / maxDegree)); // 30px leaf → 94px hub
        };

        // Ids that are the source of at least one visible edge → have children
        // (drives the collapse toggle).
        const childSourceIds = new Set();
        for (const r of rawRels) {
            const s = String(r.source);
            const t = String(r.target);
            if (visibleIds.has(s) && visibleIds.has(t)) childSourceIds.add(s);
        }

        const mappedNodes = visibleNodes.map(n => {
            const label = n.labels?.[0] || 'Document';
            const props = n.properties || {};
            const id = String(n.id);
            return {
                id,
                type: isOrb ? 'orb' : 'custom',
                data: {
                    label,
                    name: props.name || props.equipment_id || props.title || id,
                    group: groupOf(label),
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
                    type: 'straight',
                    animated: true,
                    label: r.type,
                    style: { strokeWidth: 1.5, stroke: 'var(--color-border-strong)' },
                    labelStyle: { fill: 'var(--color-text-muted)', fontSize: 9, fontWeight: 800, letterSpacing: '0.04em' },
                    labelShowBg: true,
                    labelBgStyle: { fill: 'var(--color-surface)', fillOpacity: 0.9 },
                    labelBgPadding: [6, 3],
                    labelBgBorderRadius: 6,
                    originalData: r,
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
    }, [data, totalNodes, nodeVariant]);

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
                    if (!hEdges.has(edge.id)) { hEdges.add(edge.id); changed = true; }
                }
            });
            initialNodes.forEach(node => {
                const incomingEdges = incomingEdgesMap.get(node.id) || [];
                if (incomingEdges.length > 0 && incomingEdges.every(e => hEdges.has(e.id))) {
                    if (!hNodes.has(node.id)) { hNodes.add(node.id); changed = true; }
                }
            });
        }
        return { hiddenNodes: hNodes, hiddenEdges: hEdges };
    }, [initialNodes, initialEdges, collapsedNodeIds]);

    // Keep refs in sync with the latest values every render so effects can read
    // them without listing them as deps (avoids re-running physics).
    useEffect(() => {
        nodesRef.current = nodes;
        edgesRef.current = edges;
        setSelectedNodeRef.current = setSelectedNode;
        widthRef.current = width;
        heightRef.current = height;
        exploredNodeIdsRef.current = exploredNodeIds;
        collapsedNodeIdsRef.current = collapsedNodeIds;
        hiddenNodesRef.current = hiddenNodes;
        hiddenEdgesRef.current = hiddenEdges;
    });

    // Per-node visual flags (hidden / collapsed / expandable). Pure decoration —
    // reads the latest refs and never touches positions.
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

    // A fresh layout is requested → drop pinned positions so every node is re-placed.
    useEffect(() => {
        positionsRef.current = new Map();
    }, [layoutVersion]);

    // Lay out the graph. Existing nodes keep their saved positions (pinned); only
    // newly-added nodes run the force sim.
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
            applyForceLayout(initialNodes, initialEdges, widthRef.current || 800, heightRef.current || 600, saved)
                .then((positioned) => finalize(positioned, true));
        } else {
            finalize(initialNodes.map((n) => ({ ...n, position: saved.get(n.id) || n.position })), false);
        }
    }, [initialNodes, initialEdges, fitView, decorate]);

    // Collapse/explore visibility — flips flags only, no physics, no reshuffle.
    useEffect(() => {
        setNodes((nds) => decorate(nds));
        setEdges((eds) => eds.map((e) => ({ ...e, hidden: !!hiddenEdges.has(e.id) })));
    }, [hiddenNodes, hiddenEdges, collapsedNodeIds, exploredNodeIds, decorate]);

    // Re-frame around a node that was just expanded.
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

    // Re-fit (not re-layout) when the canvas is resized.
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

    // Persist user drags so manual positions survive the next decoration pass.
    const onNodesChange = useCallback((changes) => {
        const extraChanges = [];
        const styleChanges = new Map();
        const seenDescendants = new Set();

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

                    // CSS transition + depth-based delay = wave ripple animation
                    const delayMs    = (depth - 1) * 30;
                    const durationMs = 60 + depth * 15;
                    const easing = depth === 1
                        ? 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                        : depth === 2
                            ? 'cubic-bezier(0.34, 1.20, 0.64, 1)'
                            : 'cubic-bezier(0.34, 1.56, 0.64, 1)';

                    styleChanges.set(descId, {
                        transition: `transform ${durationMs}ms ${easing} ${delayMs}ms`,
                        willChange: 'transform',
                    });

                    // Schedule transition cleanup after animation finishes
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

        if (isMagnifyMode) {
            onNodeExplore?.(node.originalData);
            focusRequestId.current = node.id;
        }
    }, [setSelectedNode, isMagnifyMode, onNodeExplore]);

    const onEdgeClick = useCallback((_, edge) => {
        setSelectedNode(edge.originalData);
        setEdges(eds => eds.map(e => ({ ...e, selected: e.id === edge.id })));
        setNodes(nds => nds.map(n => ({ ...n, selected: false })));
    }, [setSelectedNode]);

    const onNodeDoubleClick = useCallback((_, node) => {
        setNodes(nds => nds.map(n => ({ ...n, selected: n.id === node.id })));
        setEdges(eds => eds.map(e => ({ ...e, selected: false })));
        setSelectedNode(node.originalData);
        if (!isMagnifyMode) {
            onNodeExplore?.(node.originalData);
            focusRequestId.current = node.id;
        }
    }, [setSelectedNode, onNodeExplore, isMagnifyMode]);

    const onPaneClick = useCallback(() => {
        setSelectedNode(null);
        setNodes(nds => nds.map(n => ({ ...n, selected: false })));
        setEdges(eds => eds.map(e => ({ ...e, selected: false })));
    }, [setSelectedNode]);

    // Export internal zoom + focus controls to window so the KGOverlay toolbar
    // and Aivee assistant (both rendered outside this ReactFlowProvider) can
    // drive the canvas. Latest nodes/edges are read via refs so the bridge stays
    // stable instead of re-binding on every graph change.
    useEffect(() => {
        window.__kgZoomIn = zoomIn;
        window.__kgZoomOut = zoomOut;
        window.__kgFitView = () => fitView({ padding: 0.2, duration: 800 });

        window.__kgFocusNode = (rawId) => {
            const id = String(rawId);
            const node = nodesRef.current.find((n) => n.id === id);
            if (!node) return false;
            setNodes((nds) => nds.map((n) => ({ ...n, selected: n.id === id })));
            setEdges((eds) => eds.map((e) => ({ ...e, selected: false })));
            setSelectedNodeRef.current?.(node.originalData);
            fitView({ nodes: [{ id }], padding: 1.5, maxZoom: 1.6, duration: 800 });
            return true;
        };

        window.__kgFocusEdge = (rawId) => {
            const id = String(rawId);
            const edge = edgesRef.current.find((e) => e.id === id);
            if (!edge) return false;
            setEdges((eds) => eds.map((e) => ({ ...e, selected: e.id === id })));
            setNodes((nds) => nds.map((n) => ({ ...n, selected: false })));
            setSelectedNodeRef.current?.(edge.originalData);
            fitView({ nodes: [{ id: edge.source }, { id: edge.target }], padding: 1.2, maxZoom: 1.4, duration: 800 });
            return true;
        };

        return () => {
            delete window.__kgZoomIn;
            delete window.__kgZoomOut;
            delete window.__kgFitView;
            delete window.__kgFocusNode;
            delete window.__kgFocusEdge;
        };
    }, [zoomIn, zoomOut, fitView]);

    return { nodes, edges, onNodesChange, onEdgesChange, onNodeClick, onEdgeClick, onNodeDoubleClick, onPaneClick };
}
