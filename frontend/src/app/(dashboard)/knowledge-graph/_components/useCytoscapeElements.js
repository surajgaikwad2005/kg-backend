import { useEffect, useRef } from 'react';
import { groupColor } from '@/src/components/ui/knowledge-graph/GraphMiniMap';
import { applyForceLayout } from '@/src/hooks/knowledge-graph/applyForceLayout';

export function darkenHexColor(hex, percent = 30) {
    if (!hex || hex[0] !== '#') return '#000000';
    let num = parseInt(hex.slice(1), 16);
    let amt = Math.round(2.55 * percent);
    let R = (num >> 16) - amt;
    let G = (num >> 8 & 0x00FF) - amt;
    let B = (num & 0x0000FF) - amt;
    R = Math.max(0, Math.min(255, R));
    G = Math.max(0, Math.min(255, G));
    B = Math.max(0, Math.min(255, B));
    return "#" + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}

export function useCytoscapeElements({
    cyRef,
    visibleNodes,
    visibleEdges,
    width,
    height,
    layoutVersion,
    layoutName,
    runCytoscapeLayout,
    exploredNodeIds,
    collapsedNodeIds,
    focusRequestId,
    selectedId,
    setMapTick,
    positionsRef
}) {
    const isInitialLoad = useRef(true);
    const mountTime = useRef(Date.now());
    const latestLayoutVersionRef = useRef(layoutVersion);

    useEffect(() => {
        latestLayoutVersionRef.current = layoutVersion;
    }, [layoutVersion]);

    const isInitialLoadPhase = () => Date.now() - mountTime.current < 1500;

    useEffect(() => {
        if (!cyRef.current || visibleNodes.length === 0) return;

        const currentLayout = layoutVersion;
        const saved = positionsRef.current;
        const hasNew = visibleNodes.some(n => !saved.has(String(n.id)) && !saved.has(`pending-${n.id}`));
        const isPending = visibleNodes.some(n => saved.has(`pending-${n.id}`));

        const finalize = (nodesWithPositions, runFit = false) => {
            nodesWithPositions.forEach(n => {
                saved.delete(`pending-${n.id}`);
                saved.set(String(n.id), n.position);
            });

            const presentIds = new Set(nodesWithPositions.map(n => String(n.id)));
            for (const id of [...saved.keys()]) {
                if (!id.startsWith('pending-') && !presentIds.has(String(id))) {
                    saved.delete(id);
                }
            }
            const cyElements = [];
            const nodeDegrees = {};
            visibleEdges.forEach(e => {
                const s = String(e.source);
                const t = String(e.target);
                nodeDegrees[s] = (nodeDegrees[s] || 0) + 1;
                nodeDegrees[t] = (nodeDegrees[t] || 0) + 1;
            });

            nodesWithPositions.forEach(n => {
                const isExpandable = exploredNodeIds ? !exploredNodeIds.has(n.id) : true;
                const hasChildren = n.data.hasChildren;
                const isCollapsed = collapsedNodeIds.has(n.id);
                const classes = (isExpandable || (hasChildren && isCollapsed)) ? 'expandable' : '';
                let nodeSize = 30; // default size for rest
                if (n.data.group === 7 || n.data.label === 'Plant') {
                    nodeSize = 40; // Plant
                } else if (n.data.group === 1 || n.data.label === 'Equipment') {
                    nodeSize = 34; // Equipment
                }

                const nodeColor = n.data.color || groupColor(n.data.group, n.data.label);

                cyElements.push({
                    group: 'nodes',
                    data: {
                        id: n.id,
                        name: n.data.name,
                        color: nodeColor,
                        customBorderColor: darkenHexColor(nodeColor, 25),
                        size: nodeSize,
                        isExpandable,
                        hasChildren,
                        isCollapsed,
                        originalData: n.originalData,
                    },
                    position: n.position,
                    classes,
                });
            });

            visibleEdges.forEach(e => {
                const formattedLabel = (e.label || '').toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                const sourceNode = nodesWithPositions.find(n => String(n.id) === String(e.source));
                const edgeColor = sourceNode ? (sourceNode.data.color || groupColor(sourceNode.data.group, sourceNode.data.label)) : '#94a3b8';

                cyElements.push({
                    group: 'edges',
                    data: {
                        id: e.id,
                        source: e.source,
                        target: e.target,
                        label: formattedLabel,
                        color: edgeColor,
                        originalData: e.originalData,
                    }
                });
            });

            const cy = cyRef.current;
            cy.batch(() => {
                const newIds = new Set(cyElements.map(el => el.data.id));
                cy.elements().forEach(el => {
                    if (!newIds.has(el.id())) cy.remove(el);
                });

                cyElements.forEach(el => {
                    const existing = cy.getElementById(el.data.id);
                    if (existing.length > 0) {
                        existing.data(el.data);
                        existing.classes(el.classes || '');
                        if (runFit && layoutName === 'force') existing.position(el.position);
                    } else {
                        cy.add(el);
                    }
                });
            });

            if (layoutName === 'force') {
                if (runFit) {
                    const focusId = focusRequestId.current || (selectedId ? String(selectedId) : null);
                    if (focusId) {
                        const targetNode = cy.getElementById(focusId);
                        if (targetNode.length > 0) {
                            const zoom = 2.2;
                            const panX = cy.width() / 2 - targetNode.position().x * zoom;
                            const panY = cy.height() / 2 - targetNode.position().y * zoom;
                            if (isInitialLoad.current || isInitialLoadPhase()) {
                                cy.resize();
                                cy.zoom(zoom);
                                cy.pan({ x: panX, y: panY });
                            } else {
                                cy.animate({ pan: { x: panX, y: panY }, zoom, duration: 300, easing: 'ease-out-cubic' });
                            }
                        }
                        focusRequestId.current = null;
                        isInitialLoad.current = false;
                    } else {
                        if (isInitialLoad.current || isInitialLoadPhase()) {
                            cy.resize();
                            cy.fit(cy.elements(), 120);
                        } else {
                            cy.animate({ fit: { eles: cy.elements(), padding: 120 }, duration: 300, easing: 'ease-out' });
                        }
                        isInitialLoad.current = false;
                    }
                }
            } else {
                runCytoscapeLayout(layoutName);
                isInitialLoad.current = false;
            }

            setTimeout(() => setMapTick(t => t + 1), 100);
            setTimeout(() => setMapTick(t => t + 1), 350);
        };

        if (layoutName === 'force') {
            if (hasNew) {
                visibleNodes.forEach(n => {
                    if (!saved.has(String(n.id))) saved.set(`pending-${n.id}`, true);
                });

                applyForceLayout(visibleNodes, visibleEdges, width || 800, height || 600, saved, focusRequestId.current)
                    .then(positioned => {
                        if (currentLayout === latestLayoutVersionRef.current) finalize(positioned, true);
                    });
            } else if (!isPending) {
                const positioned = visibleNodes.map(n => ({
                    ...n,
                    position: saved.get(String(n.id)) || { x: (width || 800) / 2, y: (height || 600) / 2 }
                }));
                finalize(positioned, false);
            }
        } else {
            const positioned = visibleNodes.map(n => ({
                ...n,
                position: saved.get(String(n.id)) || { x: (width || 800) / 2, y: (height || 600) / 2 }
            }));
            finalize(positioned, true);
        }
    }, [visibleNodes, visibleEdges, width, height, layoutVersion, layoutName, runCytoscapeLayout]);

    return { isInitialLoad };
}
