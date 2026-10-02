import { useEffect, useCallback } from 'react';
import cytoscape from 'cytoscape';
import fcose from 'cytoscape-fcose';
import { getGraphStyles } from './graphStyles';
import { registerDragWaveAnimation } from './dragWaveAnimation';
import { resolveOverlaps } from '@/src/hooks/knowledge-graph/resolveOverlaps';
import { expandGraphNode, fetchNodeDetails } from '@/src/services/knowledge-graph/kgViewerService';

if (typeof window !== 'undefined') {
    try {
        cytoscape.use(fcose);
    } catch {
        // already registered
    }
}

export function useCytoscapeInstance({
    containerRef,
    cyRef,
    isDark,
    callbacksRef,
    setSelectedId,
    setMapTick,
    positionsRef,
    focusRequestId
}) {
    useEffect(() => {
        if (!containerRef.current) return;

        const cy = cytoscape({
            container: containerRef.current,
            elements: [],
            style: getGraphStyles(isDark),
            maxZoom: 5.0,
            minZoom: 0.15,
            userZoomingEnabled: true,
            userPanningEnabled: true,
            boxSelectionEnabled: false,
            textureOnViewport: false,
            motionBlur: false,
            pixelRatio: (typeof window !== 'undefined' && window.devicePixelRatio) ? Math.max(window.devicePixelRatio, 2) : 2,
        });

        cyRef.current = cy;

        cy.on('mouseover', 'node, edge', () => {
            if (cy.container()) cy.container().style.cursor = 'pointer';
        });
        cy.on('mouseout', 'node, edge', () => {
            if (cy.container()) cy.container().style.cursor = 'default';
        });

        let hoverPrefetchTimer = null;
        cy.on('mouseover', 'node', (evt) => {
            const targetNode = evt.target;
            const nodeId = targetNode.data('originalData')?.dbId || targetNode.data('originalData')?.id || targetNode.id();
            clearTimeout(hoverPrefetchTimer);
            if (nodeId) {
                hoverPrefetchTimer = setTimeout(() => {
                    expandGraphNode(nodeId).catch(() => {});
                    fetchNodeDetails(nodeId).catch(() => {});
                }, 100);
            }
        });
        cy.on('mouseout', 'node', () => {
            clearTimeout(hoverPrefetchTimer);
        });

        cy.on('tap', 'node', (evt) => {
            const node = evt.target;
            callbacksRef.current.setSelectedNode(node.data('originalData'));
            setSelectedId(node.id());
        });

        cy.on('tap', 'edge', (evt) => {
            const edge = evt.target;
            callbacksRef.current.setSelectedNode(edge.data('originalData'));
            setSelectedId(edge.id());
        });

        cy.on('tap', (evt) => {
            if (evt.target === cy) {
                callbacksRef.current.setSelectedNode(null);
                setSelectedId(null);
            }
        });

        cy.on('dbltap', 'node', (evt) => {
            const node = evt.target;
            const id = node.id();
            const originalData = node.data('originalData');
            const exploredIds = callbacksRef.current.exploredNodeIds;
            const lastExplore = window.__lastExploreTime?.get(id) || 0;
            const timeSinceExplore = Date.now() - lastExplore;

            if (exploredIds?.has(id) && timeSinceExplore > 500) {
                callbacksRef.current.onToggleCollapse(id);
            } else {
                if (!window.__lastExploreTime) window.__lastExploreTime = new Map();
                window.__lastExploreTime.set(id, Date.now());
                focusRequestId.current = id;
                callbacksRef.current.onNodeExplore?.(originalData);
            }
        });

        // Register drag/wave animation and overlap adjustments
        const cleanupDrag = registerDragWaveAnimation(cy, positionsRef, setMapTick, (draggedId) => {
            resolveOverlaps(cy, positionsRef, draggedId, setMapTick);
        });

        const triggerUpdate = () => setMapTick(t => t + 1);
        cy.on('pan zoom resize drag select unselect', triggerUpdate);
        setTimeout(triggerUpdate, 100);

        cy.on('layoutstop', () => {
            cy.nodes().forEach(node => positionsRef.current.set(node.id(), node.position()));
            setMapTick(t => t + 1);
        });

        window.__kgZoomIn = () => cy.zoom(cy.zoom() * 1.2);
        window.__kgZoomOut = () => cy.zoom(cy.zoom() / 1.2);
        window.__kgFitView = () => cy.fit(undefined, 120);

        window.__kgFocusNode = (rawId) => {
            const id = String(rawId);
            const el = cy.getElementById(id);
            if (el.length === 0) return false;
            cy.elements().unselect();
            el.select();
            setSelectedId(id);
            const zoom = 1.8;
            cy.animate({
                pan: { x: cy.width() / 2 - el.position().x * zoom, y: cy.height() / 2 - el.position().y * zoom },
                zoom: zoom,
                duration: 300,
            });
            return true;
        };

        window.__kgFocusEdge = (rawId) => {
            const id = String(rawId);
            const el = cy.getElementById(id);
            if (el.length === 0) return false;
            cy.elements().unselect();
            el.select();
            setSelectedId(id);
            cy.animate({ fit: { eles: el, padding: 120 }, duration: 300 });
            return true;
        };

        return () => {
            cleanupDrag();
            clearTimeout(hoverPrefetchTimer);
            cy.destroy();
            delete window.__kgZoomIn;
            delete window.__kgZoomOut;
            delete window.__kgFitView;
            delete window.__kgFocusNode;
            delete window.__kgFocusEdge;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const runCytoscapeLayout = useCallback((name) => {
        const cy = cyRef.current;
        if (!cy) return;

        let options = { name, animate: true, animationDuration: 300, fit: true, padding: 120, easing: 'ease-out' };

        if (name === 'fcose') {
            options = { ...options, nodeDimensionsIncludeLabels: true, uniformNodeDimensions: false, packComponents: true, idealEdgeLength: 140, nodeRepulsion: 5500 };
        } else if (name === 'cose') {
            options = { ...options, nodeOverlap: 10, idealEdgeLength: 140, componentSpacing: 60 };
        }

        cy.layout(options).run();
    }, [cyRef]);

    return { runCytoscapeLayout };
}
