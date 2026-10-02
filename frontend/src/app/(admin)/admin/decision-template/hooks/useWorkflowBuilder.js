'use client';
import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useNodesState, useEdgesState, addEdge, useReactFlow } from '@xyflow/react';
import { useApp } from '@/src/context/AppContext';
import { getId, buildSavePayload, parseInitialData } from '../utils/workflowUtils';
import { useCreateWorkflow, useUpdateWorkflow } from '../_queries/useDecisionTemplate';

/**
 * Must be used inside a component rendered within <ReactFlowProvider>.
 */
export function useWorkflowBuilder({ templateName, templateClass, templateId, initialData, onSaved, onClose }) {
    const { plantCode } = useApp();
    const router = useRouter();
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const { screenToFlowPosition } = useReactFlow();
    const [selectedNode, setSelectedNode] = useState(null);
    const [saving, setSaving] = useState(false);
    // Both invalidate the workflow list (and update also invalidates this
    // template's cached saved graph) so the list reflects the save without any
    // manual refetch from the caller.
    const { mutateAsync: createWorkflowAsync } = useCreateWorkflow(plantCode);
    const { mutateAsync: updateWorkflowAsync } = useUpdateWorkflow(plantCode);
    const [history, setHistory] = useState([]);
    const [redoStack, setRedoStack] = useState([]);
    const stateRef = useRef({ nodes, edges });

    useEffect(() => {
        stateRef.current = { nodes, edges };
    }, [nodes, edges]);

    const pushToHistory = useCallback(() => {
        setHistory((h) => [...h, stateRef.current]);
        setRedoStack([]);
    }, []);

    const handleUndo = useCallback(() => {
        if (history.length === 0) return;
        const previous = history[history.length - 1];
        setRedoStack((r) => [...r, stateRef.current]);
        setNodes(previous.nodes);
        setEdges(previous.edges);
        setHistory((h) => h.slice(0, h.length - 1));
    }, [history, setNodes, setEdges]);

    const handleRedo = useCallback(() => {
        if (redoStack.length === 0) return;
        const next = redoStack[redoStack.length - 1];
        setHistory((h) => [...h, stateRef.current]);
        setNodes(next.nodes);
        setEdges(next.edges);
        setRedoStack((r) => r.slice(0, r.length - 1));
    }, [redoStack, setNodes, setEdges]);

    const onNodeDelete = useCallback(
        (id) => {
            pushToHistory();
            setNodes((nds) => nds.filter((n) => n.id !== id && n.parentId !== id));
            setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
            setSelectedNode((prev) => (prev?.id === id || prev?.parentId === id ? null : prev));
        },
        [pushToHistory, setNodes, setEdges]
    );

    useEffect(() => {
        parseInitialData(initialData, setNodes, setEdges, setSelectedNode, onNodeDelete);
    }, [initialData, setNodes, setEdges, onNodeDelete]);

    const onConnect = useCallback(
        (params) => {
            pushToHistory();
            setEdges((eds) => addEdge({ ...params, type: 'deletableEdge', zIndex: 1000 }, eds));
        },
        [setEdges, pushToHistory]
    );

    const onDragStart = useCallback(
        (event, nodeType, category, label, configurations = [], featureKey = '', featureDescription = '') => {
            event.dataTransfer.setData('application/reactflow/type', nodeType);
            event.dataTransfer.setData('application/reactflow/category', category);
            event.dataTransfer.setData('application/reactflow/label', label);
            event.dataTransfer.setData('application/reactflow/configurations', JSON.stringify(configurations));
            event.dataTransfer.setData('application/reactflow/featureKey', featureKey);
            event.dataTransfer.setData('application/reactflow/featureDescription', featureDescription);
            event.dataTransfer.effectAllowed = 'move';
        },
        []
    );

    const onDragOver = useCallback((event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event) => {
            event.preventDefault();
            const type = event.dataTransfer.getData('application/reactflow/type');
            if (!type) return;

            const category = event.dataTransfer.getData('application/reactflow/category');
            const label = event.dataTransfer.getData('application/reactflow/label');
            const configStr = event.dataTransfer.getData('application/reactflow/configurations');
            const featureKey = event.dataTransfer.getData('application/reactflow/featureKey');
            const featureDescription = event.dataTransfer.getData('application/reactflow/featureDescription');

            let configurations = [];
            try { if (configStr) configurations = JSON.parse(configStr); } catch {}

            const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
            pushToHistory();

            const containerMap = {
                Observe: 'observe-container',
                Investigate: 'investigate-container',
                Diagnose: 'diagnose-container',
            };
            const parentId = containerMap[category];
            const newNodes = [];
            let finalPosition = position;

            if (parentId) {
                let parentNode = nodes.find((n) => n.id === parentId);
                if (!parentNode) {
                    const groupPositions = {
                        Observe: { x: 50, y: 50 },
                        Investigate: { x: 450, y: 50 },
                        Diagnose: { x: 850, y: 50 },
                    };
                    parentNode = {
                        id: parentId,
                        type: 'group',
                        data: { label: category, onDelete: onNodeDelete },
                        position: groupPositions[category] || { x: 50, y: 50 },
                        style: {
                            width: 300,
                            height: 400,
                            border: '2px dashed #94a3b8',
                            borderRadius: '16px',
                            backgroundColor: 'rgba(248, 250, 252, 0.5)',
                            zIndex: -1,
                            pointerEvents: 'none',
                        },
                    };
                    newNodes.push(parentNode);
                }
                finalPosition = {
                    x: position.x - parentNode.position.x,
                    y: position.y - parentNode.position.y,
                };
            }

            const newNode = {
                id: getId(),
                type,
                position: finalPosition,
                parentId,
                extent: parentId ? 'parent' : undefined,
                data: {
                    label,
                    type: category,
                    onDelete: onNodeDelete,
                    configurations: configurations.map((c) => ({ ...c, userValue: '' })),
                    featureKey,
                    featureDescription,
                },
            };
            newNodes.push(newNode);
            setNodes((nds) => nds.concat(newNodes));
        },
        [screenToFlowPosition, nodes, setNodes, onNodeDelete, pushToHistory]
    );

    const onNodeClick = useCallback((e, node) => {
        if (node.type !== 'group') setSelectedNode(node);
    }, []);

    const onPaneClick = useCallback(() => setSelectedNode(null), []);

    const handleSave = useCallback(async () => {
        if (saving) return;
        const payload = buildSavePayload({ nodes, edges, templateName, templateClass, templateId, plantCode });
        setSaving(true);
        try {
            let savedTemplateId = templateId;
            if (templateId) {
                await updateWorkflowAsync(payload);
            } else {
                // configWorkflow (create) returns { status, template_id } inside the
                // {success, message, data} envelope the service already unwraps.
                const result = await createWorkflowAsync(payload);
                savedTemplateId = result?.template_id;
            }

            if (savedTemplateId) {
                router.push(`/admin/decision-template/${savedTemplateId}?name=${encodeURIComponent(templateName || '')}`);
            } else {
                onSaved?.();
                onClose();
            }
        } catch {
            // Surfaced by the global mutation-error toast (meta.errorTitle:
            // 'Save Failed'). Only the local saving flag needs resetting here so
            // the user can retry.
            setSaving(false);
        }
    }, [saving, nodes, edges, templateName, templateClass, templateId, plantCode, onSaved, onClose, router, createWorkflowAsync, updateWorkflowAsync]);

    return {
        nodes, edges, onNodesChange, onEdgesChange,
        selectedNode, setSelectedNode, setNodes,
        history, redoStack, saving,
        handleUndo, handleRedo,
        onConnect, onDragStart, onDragOver, onDrop,
        onNodeClick, onPaneClick, handleSave,
    };
}
