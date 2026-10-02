'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import {
    useInitialGraph,
    useExpandNode,
    useNodeDetails,
    EMPTY_GRAPH,
} from '@/src/app/(dashboard)/knowledge-graph/_queries/useKgViewerQueries';

/**
 * useKgViewer — state for the read-only Knowledge Graph demo page.
 *
 * Trimmed from the original useKnowledgeGraphPage: no mutations, no upload, no
 * node-limit control, no plant keying. Single-click selects a node (and fetches
 * its full properties); double-click expands / collapses its neighbourhood
 * (handled by the cytoscape instance calling handleNodeExplore).
 */
export function useKgViewer() {
    const [selectedNode, setSelectedNode] = useState(null);
    const [exploredNodeIds, setExploredNodeIds] = useState(new Set());
    const [hiddenGroups, setHiddenGroups] = useState(new Set());
    const [layoutVersion, setLayoutVersion] = useState(0);
    const graphContainerRef = useRef(null);
    const [dimensions, setDimensions] = useState({ width: 1000, height: 700 });

    const graphQuery = useInitialGraph();
    const graphData = graphQuery.data ?? EMPTY_GRAPH;

    const expandNode = useExpandNode();
    const { mutateAsync: expandNodeAsync } = expandNode;

    // Full property bag for the selected node — feeds the side panel.
    const selectedNodeId =
        selectedNode && Array.isArray(selectedNode.labels)
            ? (selectedNode.dbId || selectedNode.id)
            : null;
    const nodeDetailsQuery = useNodeDetails(selectedNodeId);

    // What the side panel renders: the enriched details once loaded, otherwise
    // the lightweight node object from the canvas (or the relationship object).
    const panelNode =
        selectedNode && Array.isArray(selectedNode.labels) && nodeDetailsQuery.data
            ? { ...selectedNode, ...nodeDetailsQuery.data }
            : selectedNode;

    const handleSelect = useCallback((selection) => {
        const isValidNode = Array.isArray(selection?.labels);
        const isValidRelationship =
            typeof selection?.type === 'string' && !!selection?.source && !!selection?.target;
        setSelectedNode(isValidNode || isValidRelationship ? selection : null);
    }, []);

    useEffect(() => {
        let timer;
        const updateDimensions = () => {
            if (!graphContainerRef.current) return;
            const w = graphContainerRef.current.offsetWidth || 1000;
            const h = graphContainerRef.current.offsetHeight || 700;
            setDimensions((prev) => (prev.width === w && prev.height === h ? prev : { width: w, height: h }));
        };
        const onResize = () => { clearTimeout(timer); timer = setTimeout(updateDimensions, 150); };
        updateDimensions();
        window.addEventListener('resize', onResize);
        return () => { clearTimeout(timer); window.removeEventListener('resize', onResize); };
    }, []);

    const toggleGroup = useCallback((group) => {
        setHiddenGroups((prev) => {
            const next = new Set(prev);
            if (next.has(group)) next.delete(group);
            else next.add(group);
            return next;
        });
        setExploredNodeIds(new Set());
    }, []);

    const resetExploredNodeIds = useCallback(() => setExploredNodeIds(new Set()), []);

    const loadGraph = useCallback(() => {
        setSelectedNode(null);
        setExploredNodeIds(new Set());
        setLayoutVersion((v) => v + 1);
        graphQuery.refetch();
    }, [graphQuery]);

    const handleNodeExplore = useCallback(async (node) => {
        const nodeId = node?.dbId || node?.id;
        if (!nodeId) return;
        setExploredNodeIds((prev) => new Set(prev).add(node.id));
        try {
            await expandNodeAsync(nodeId);
        } catch {
            // Surfaced by the global mutation-error toast.
        }
    }, [expandNodeAsync]);

    return {
        graphData,
        isLoading: graphQuery.isLoading,
        isFetching: graphQuery.isFetching,
        isReloading: graphQuery.isFetching && !graphQuery.isLoading,
        loadError: graphQuery.error
            ? (graphQuery.error?.data?.error || graphQuery.error?.message || 'Failed to load the knowledge graph.')
            : null,
        // Raw selection drives the canvas (stable identity → no re-zoom when
        // details arrive); panelNode is the enriched object for the side panel.
        selectedNode,
        panelNode,
        setSelectedNode,
        handleSelect,
        exploredNodeIds,
        hiddenGroups,
        toggleGroup,
        resetExploredNodeIds,
        layoutVersion,
        graphContainerRef,
        dimensions,
        loadGraph,
        handleNodeExplore,
        isExpanding: expandNode.isPending,
    };
}
