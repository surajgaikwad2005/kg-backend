import { useEffect } from 'react';

/**
 * useGraphWindowHandlers - Custom hook to bind global helper functions to the window object.
 * Enables zoom, fitView and focusing nodes/edges from external contexts.
 */
export function useGraphWindowHandlers({
    zoomIn, zoomOut, fitView,
    setEdges, setNodes, setSelectedNode,
    nodesRef, edgesRef, setSelectedNodeRef
}) {
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
            setEdges((eds) => eds.map((e) => ({ ...e, selected: e.id === edge.id })));
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
            delete window.__kgNodes;
        };
    }, [zoomIn, zoomOut, fitView, setEdges, setNodes, nodesRef, edgesRef, setSelectedNodeRef]);
}
