import { useState, useCallback, useRef, useEffect } from 'react';
import { addEdge, useNodesState, useEdgesState, useReactFlow, MarkerType } from '@xyflow/react';
import { useQueryClient } from '@tanstack/react-query';
import { v4 as uuidv4 } from 'uuid';
import { savePnidDiagram as apiSaveDiagram, loadPnidDiagram } from '@/src/services/cpcp/diagram/diagramService';
import { useApp } from '@/src/context/AppContext';
import { queryKeys } from '@/src/lib/query';
import { useSaveDiagram } from '../_queries/useCpcpConfigMutations';
import { useDiagramHistory } from './useDiagramHistory';
import { normalizeLoadedNodes, normalizeLoadedEdges } from '../_utils/diagramNormalize';
import { maybePinFirstDiagram } from '../_utils/autoPinFirstDiagram';

const AUTO_SAVE_DEBOUNCE_MS = 1200;

export function useWorkflowCanvas(initialNodes = [], initialEdges = []) {
    const { plantCode } = useApp();
    const queryClient = useQueryClient();
    const saveDiagramMutation = useSaveDiagram();

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [connectingNodeId, setConnectingNodeId] = useState(null);
    const { screenToFlowPosition, toObject, setNodes: setReactFlowNodes, setEdges: setReactFlowEdges, zoomIn, zoomOut, fitView, getNodes, getEdges } = useReactFlow();
    const { canUndo, canRedo, reset: resetHistory, push: pushHistory, undo: popUndo, redo: popRedo } = useDiagramHistory();

    const [tooltip, setTooltip] = useState('');
    const [diagramId, setDiagramId] = useState(null);
    const [diagramName, setDiagramName] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const lastLoadTime = useRef(0);

    const [showSaveDialog, setShowSaveDialog] = useState(false);
    const [saveName, setSaveName] = useState('');

    const clearConnecting = useCallback(() => {
        setConnectingNodeId(null);
        setNodes(nds => nds.map(n => ({ ...n, data: { ...n.data, isConnecting: false } })));
    }, [setNodes]);

    const onConnect = useCallback((params) => {
        const edge = {
            ...params,
            id: `pipe-${uuidv4()}`,
            type: 'pipe',
            data: { label: 'flow', direction: 'forward', animated: true, flowColor: '#64748b' },
            markerEnd: { type: MarkerType.ArrowClosed, color: '#64748b', width: 18, height: 18 },
        };
        setEdges(eds => addEdge(edge, eds));
        clearConnecting();
    }, [setEdges, clearConnecting]);

    const onNodeClick = useCallback((_, node) => {
        if (!connectingNodeId) {
            setConnectingNodeId(node.id);
            setNodes(nds => nds.map(n => ({ ...n, data: { ...n.data, isConnecting: n.id === node.id } })));
            setTooltip(`Source locked: ${node.data.label} · now click a target node`);
            setTimeout(() => setTooltip(''), 4000);
        } else if (connectingNodeId === node.id) {
            clearConnecting();
            setTooltip('Connection cancelled');
            setTimeout(() => setTooltip(''), 2000);
        } else {
            const edge = {
                id: `pipe-${uuidv4()}`,
                source: connectingNodeId,
                target: node.id,
                type: 'pipe',
                data: { label: 'flow', direction: 'forward', animated: true, flowColor: '#64748b' },
                markerEnd: { type: MarkerType.ArrowClosed, color: '#64748b', width: 18, height: 18 },
            };
            setEdges(eds => addEdge(edge, eds));
            clearConnecting();
            setTooltip('Pipe connection added ✓');
            setTimeout(() => setTooltip(''), 2000);
        }
    }, [connectingNodeId, setEdges, setNodes, clearConnecting]);

    const onNodeDoubleClick = useCallback((_, node) => {
        const assetLabel = node.data?.label || '';
        const componentType = node.data?.componentType || 'equipment';
        if (assetLabel && !connectingNodeId) {
            setTooltip(`Navigating to ${assetLabel} details...`);
            setTimeout(() => {
                let targetUrl = `/home/workflow-diagram/compressor-details/${componentType}?label=${encodeURIComponent(assetLabel)}`;
                if (componentType === 'train_a') targetUrl = `/home/workflow-diagram/compressor-details?train=A`;
                if (componentType === 'train_b') targetUrl = `/home/workflow-diagram/compressor-details?train=B`;
                if (componentType === 'reinjection_compressor_train_a') targetUrl = `/home/workflow-diagram/compressor-details?train=RA`;
                if (componentType === 'reinjection_compressor_train_b') targetUrl = `/home/workflow-diagram/compressor-details?train=RB`;
                window.location.href = targetUrl;
            }, 800);
        }
    }, [connectingNodeId]);

    const onPaneClick = useCallback(() => {
        if (connectingNodeId) {
            clearConnecting();
            setTooltip('');
        }
    }, [connectingNodeId, clearConnecting]);

    const onDragOver = useCallback((e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback((e) => {
        e.preventDefault();
        const nodeType = e.dataTransfer.getData('application/reactflow/type');
        const componentType = e.dataTransfer.getData('application/reactflow/componentType');
        const defaultLabel = e.dataTransfer.getData('application/reactflow/label');
        if (!nodeType) return;

        const position = screenToFlowPosition({ x: e.clientX, y: e.clientY });
        const newNode = {
            id: `node-${uuidv4()}`,
            type: nodeType,
            position,
            data: { label: defaultLabel, componentType, status: 'normal', isConnecting: false },
        };
        setNodes(nds => nds.concat(newNode));
    }, [screenToFlowPosition, setNodes]);

    const loadDiagram = useCallback(async (id) => {
        setTooltip('Loading diagram...');
        try {
            const data = await queryClient.fetchQuery({
                queryKey: queryKeys.cpcpConfig.diagram(plantCode, id),
                queryFn: () => loadPnidDiagram(plantCode, id),
            });
            lastLoadTime.current = Date.now();
            const loadedNodes = normalizeLoadedNodes(data.nodes);
            const loadedEdges = normalizeLoadedEdges(data.edges);
            setDiagramId(data.id);
            setDiagramName(data.name || '');
            setReactFlowNodes(loadedNodes);
            setReactFlowEdges(loadedEdges);
            // A freshly loaded diagram is its own history baseline — undo must
            // never reach back into whatever was on the canvas before it loaded.
            resetHistory(loadedNodes, loadedEdges);
            setTooltip(`Loaded: ${data.name} ✓`);
            setTimeout(() => setTooltip(''), 3000);
            setTimeout(() => fitView({ duration: 800 }), 100);
        } catch {
            setTooltip('Error loading diagram');
        }
    }, [plantCode, queryClient, setReactFlowNodes, setReactFlowEdges, fitView, resetHistory]);

    const handleExport = useCallback(() => {
        const flowData = toObject();
        const schema = {
            version: '1.0',
            diagram_type: 'industrial_pid',
            exported_at: new Date().toISOString(),
            nodes: flowData.nodes.map(n => ({
                id: n.id,
                component_type: n.data?.componentType || 'unknown',
                label: n.data?.label || '',
                status: n.data?.status || 'normal',
                position: n.position,
            })),
            pipes: flowData.edges.map(e => ({
                id: e.id,
                from: e.source,
                to: e.target,
                label: e.data?.label || 'flow',
                direction: e.data?.direction || 'forward',
                color: e.data?.flowColor || '#64748b',
            })),
        };
        const blob = new Blob([JSON.stringify(schema, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'workflow_diagram.json'; a.click();
        URL.revokeObjectURL(url);
    }, [toObject]);

    const handleSaveInit = useCallback(() => {
        setSaveName(diagramName || (diagramId ? 'Updated Diagram' : 'My Industrial Workflow'));
        setShowSaveDialog(true);
    }, [diagramName, diagramId]);

    const confirmSave = useCallback(async () => {
        if (!saveName.trim()) return;
        setShowSaveDialog(false);
        setIsSaving(true);
        const flowData = toObject();
        const isFirstSave = !diagramId;
        try {
            const result = await saveDiagramMutation.mutateAsync({
                id: diagramId,
                name: saveName.trim(),
                nodes: flowData.nodes,
                edges: flowData.edges,
            });
            if (result?.id) {
                setDiagramId(result.id);
                setDiagramName(saveName.trim());
                lastLoadTime.current = Date.now();
                if (isFirstSave) maybePinFirstDiagram(plantCode, result.id);
                setTooltip('Diagram saved successfully ✓');
                setTimeout(() => setTooltip(''), 3000);
            } else {
                setTooltip('Error saving to backend');
            }
        } catch {
            setTooltip('Error saving to backend');
        } finally {
            setIsSaving(false);
        }
    }, [saveName, diagramId, toObject, saveDiagramMutation, plantCode]);

    // Always-on autosave: debounced on every nodes/edges change, from the very
    // first node dropped on a blank canvas — no manual Save click required to
    // start persisting. A brand-new diagram is silently created (untitled) on
    // its first change; every change after that updates the same diagramId.
    // Every settle also pushes an undo/redo snapshot (local, independent of
    // whether the network save succeeds).
    useEffect(() => {
        if (!plantCode) return;
        if (Date.now() - lastLoadTime.current < 500) return;
        if (!diagramId && nodes.length === 0 && edges.length === 0) return;

        const timer = setTimeout(async () => {
            const activeNodes = getNodes();
            const activeEdges = getEdges();
            const isFirstSave = !diagramId;
            pushHistory(activeNodes, activeEdges);
            try {
                const result = await apiSaveDiagram(plantCode, {
                    id: diagramId,
                    name: diagramName || 'Untitled Diagram',
                    nodes: activeNodes,
                    edges: activeEdges,
                });
                if (result?.id && result.id !== diagramId) setDiagramId(result.id);
                if (!diagramName && result?.name) setDiagramName(result.name);
                if (isFirstSave && result?.id) maybePinFirstDiagram(plantCode, result.id);
                setTooltip('Saved ✓');
                setTimeout(() => setTooltip(''), 1500);
            } catch {
                // Auto-save errors are silent — the change is still on the canvas
                // and recorded in local undo/redo history either way.
            }
        }, AUTO_SAVE_DEBOUNCE_MS);

        return () => clearTimeout(timer);
    }, [nodes, edges, diagramId, diagramName, plantCode, getNodes, getEdges, pushHistory]);

    const handleUndo = useCallback(() => {
        const snapshot = popUndo();
        if (!snapshot) return;
        setReactFlowNodes(snapshot.nodes);
        setReactFlowEdges(snapshot.edges);
        setTooltip('Undo ✓');
        setTimeout(() => setTooltip(''), 1200);
    }, [popUndo, setReactFlowNodes, setReactFlowEdges]);

    const handleRedo = useCallback(() => {
        const snapshot = popRedo();
        if (!snapshot) return;
        setReactFlowNodes(snapshot.nodes);
        setReactFlowEdges(snapshot.edges);
        setTooltip('Redo ✓');
        setTimeout(() => setTooltip(''), 1200);
    }, [popRedo, setReactFlowNodes, setReactFlowEdges]);

    return {
        nodes, onNodesChange, setNodes,
        edges, onEdgesChange, setEdges,
        connectingNodeId, tooltip, isSaving,
        showSaveDialog, setShowSaveDialog, saveName, setSaveName,
        onConnect, onNodeClick, onNodeDoubleClick, onPaneClick, onDragOver, onDrop,
        loadDiagram, handleExport, handleSaveInit, confirmSave, zoomIn, zoomOut, fitView,
        diagramId, setDiagramId,
        canUndo, canRedo, handleUndo, handleRedo, resetHistory,
    };
}
