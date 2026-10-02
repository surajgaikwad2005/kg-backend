'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useKnowledgeGraphMutations } from '@/src/components/ui/knowledge-graph/useKnowledgeGraphMutations';
import { useApp } from '@/src/context/AppContext';
import {
    useExploreGraph,
    useExpandNode,
    useUploadGraphFile,
    useSetGraphData,
    EMPTY_GRAPH,
} from '@/src/app/(dashboard)/knowledge-graph/_queries/useKnowledgeGraphQueries';

const DEFAULT_NODE_LIMIT = 50;

export function useKnowledgeGraphPage() {
    const { plantCode } = useApp();
    const [selectedNode, setSelectedNode] = useState(null);
    const [maxNodes, setMaxNodes] = useState(DEFAULT_NODE_LIMIT);
    const [isMagnifyMode, setIsMagnifyMode] = useState(false);
    const [exploredNodeIds, setExploredNodeIds] = useState(new Set());
    const [hiddenGroups, setHiddenGroups] = useState(new Set());
    const [layoutVersion, setLayoutVersion] = useState(0);
    const graphContainerRef = useRef(null);
    const [dimensions, setDimensions] = useState({ width: 1000, height: 700 });
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    // The graph IS the cache — there is no useState mirror. `maxNodes` is part
    // of the key, so changing the limit is a key change rather than a manual
    // refetch, and the old `initialLoadPlantRef` dedupe guard is gone: switching
    // plants switches cache entries, so a late response for the previous plant
    // structurally cannot render.
    const graphQuery = useExploreGraph(plantCode, maxNodes);
    const graphData = graphQuery.data ?? EMPTY_GRAPH;

    const expandNode = useExpandNode(plantCode, maxNodes);
    const uploadGraphFile = useUploadGraphFile(plantCode);

    const { mutateAsync: expandNodeAsync } = expandNode;
    const { mutateAsync: uploadGraphFileAsync } = uploadGraphFile;

    // setGraphData is still handed to the CRUD controller, which applies
    // optimistic updates. It now writes through to the query cache instead of
    // to local state, so the optimistic result and the canonical result live in
    // one place rather than two that can disagree.
    const setGraphData = useSetGraphData(plantCode, maxNodes);

    const mutations = useKnowledgeGraphMutations({ graphData, setGraphData, setSelectedNode });

    const handleSelect = useCallback((selection) => {
        const isValidNode = Array.isArray(selection?.labels);
        const isValidRelationship = typeof selection?.type === 'string' && !!selection?.source && !!selection?.target;
        setSelectedNode(isValidNode || isValidRelationship ? selection : null);
        
        // Close inline edit/connect forms when a new node is selected
        mutations.setIsNodeModalOpen(false);
        mutations.setIsConnectModalOpen(false);
    }, [mutations]);

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

    // A fresh base graph replaces everything, so previously-expanded neighbours
    // are no longer present — reset the explored set and re-run layout. Keyed on
    // explicit parameters (plantCode, maxNodes) to avoid background refetch resets.
    /* eslint-disable react-hooks/set-state-in-effect */
    useEffect(() => {
        setSelectedNode(null);
        setExploredNodeIds(new Set());
        setHiddenGroups(new Set());
        setLayoutVersion((v) => v + 1);
    }, [plantCode, maxNodes]);
    /* eslint-enable react-hooks/set-state-in-effect */

    const toggleGroup = useCallback((group) => {
        setHiddenGroups((prev) => {
            const next = new Set(prev);
            if (next.has(group)) {
                next.delete(group);
            } else {
                next.add(group);
            }
            return next;
        });
        setExploredNodeIds(new Set());
    }, []);

    const loadGraph = useCallback((limit) => {
        if (limit != null && limit !== maxNodes) {
            // A different limit is a different cache entry — no manual refetch.
            setMaxNodes(limit);
            return;
        }
        setSelectedNode(null);
        setExploredNodeIds(new Set());
        setLayoutVersion((v) => v + 1);
        graphQuery.refetch();
    }, [maxNodes, graphQuery]);

    const handleNodeExplore = useCallback(async (node) => {
        const nodeId = node?.dbId || node?.id;
        if (!nodeId) return;
        setExploredNodeIds((prev) => new Set(prev).add(node.id));
        try {
            await expandNodeAsync(nodeId);
        } catch {
            // Surfaced by the global mutation-error toast. The node stays marked
            // explored so the canvas does not re-trigger on every re-render.
        }
    }, [expandNodeAsync]);

    const handleUpload = useCallback(async (file) => {
        // Invalidation happens in the mutation's onSuccess, so there is no
        // manual reload here any more.
        await uploadGraphFileAsync(file);
        setIsUploadModalOpen(false);
        setSelectedNode(null);
        setExploredNodeIds(new Set());
        setLayoutVersion((v) => v + 1);
    }, [uploadGraphFileAsync]);

    // Reset explored nodes — called whenever the user toggles a filter so that
    // previously-expanded neighbours go back to obeying the active filter.
    const resetExploredNodeIds = useCallback(() => {
        setExploredNodeIds(new Set());
    }, []);

    return {
        selectedNode, setSelectedNode, graphData,
        isLoading: graphQuery.isLoading,
        isFetching: graphQuery.isFetching,
        // isFetching (not isLoading) so a background reload after upload or a
        // limit change still shows the reloading affordance.
        isReloading: graphQuery.isFetching && !graphQuery.isLoading,
        maxNodes, setMaxNodes, isMagnifyMode, setIsMagnifyMode, exploredNodeIds,
        hiddenGroups, setHiddenGroups, toggleGroup,
        loadError: graphQuery.error
            ? (graphQuery.error?.data?.error || graphQuery.error?.message || 'Failed to load the knowledge graph.')
            : null,
        layoutVersion, graphContainerRef, dimensions,
        isUploadModalOpen, setIsUploadModalOpen,
        isUploading: uploadGraphFile.isPending,
        mutations, handleSelect, loadGraph, handleNodeExplore, handleUpload,
        resetExploredNodeIds,
    };
}
