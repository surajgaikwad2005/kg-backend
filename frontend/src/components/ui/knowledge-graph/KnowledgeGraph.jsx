import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { ReactFlow, ReactFlowProvider, Background, applyNodeChanges, applyEdgeChanges, MarkerType, useReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import * as d3 from 'd3';
import CustomNode from './CustomNode';
import GraphToolbar from './GraphToolbar';
import GraphSidebar from './GraphSidebar';
import GraphNavigator from './GraphNavigator';

const nodeTypes = {
    custom: CustomNode,
};

function applyForceLayout(nodes, edges, width = 800, height = 600) {
    return new Promise((resolve) => {
        const simNodes = nodes.map(n => ({ ...n }));
        const simLinks = edges.map(e => ({ source: e.source, target: e.target }));

        const simulation = d3.forceSimulation(simNodes)
            .force('link', d3.forceLink(simLinks).id(d => d.id).distance(150))
            .force('charge', d3.forceManyBody().strength(-800))
            .force('center', d3.forceCenter(width / 2, height / 2))
            .force('collision', d3.forceCollide().radius(60))
            .stop();

        // Run simulation synchronously
        for (let i = 0; i < 300; ++i) simulation.tick();

        const positionedNodes = nodes.map((n, i) => ({
            ...n,
            position: { x: simNodes[i].x, y: simNodes[i].y }
        }));

        resolve(positionedNodes);
    });
}

function KnowledgeGraphCanvas({ initialNodes, initialEdges, onExport, onClose }) {
    const { fitView } = useReactFlow();
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);
    const [selectedNode, setSelectedNode] = useState(null); // standard click
    const [collapsedNodeIds, setCollapsedNodeIds] = useState(new Set());

    const onToggleCollapse = useCallback((nodeId) => {
        setCollapsedNodeIds(prev => {
            const next = new Set(prev);
            if (next.has(nodeId)) next.delete(nodeId);
            else next.add(nodeId);
            return next;
        });
    }, []);

    const initializeLayout = useCallback(async () => {
        const positionedNodes = await applyForceLayout(initialNodes, initialEdges);
        setNodes(positionedNodes);
        setEdges(initialEdges);
        setTimeout(() => fitView({ padding: 0.2, duration: 800 }), 50);
    }, [initialNodes, initialEdges, fitView]);

    useEffect(() => {
        if (initialNodes.length > 0) {
            initializeLayout();
        }
    }, [initialNodes, initializeLayout]);

    // Apply visibility logic when collapsedNodeIds change
    useEffect(() => {
        if (initialNodes.length === 0) return;

        const hiddenEdgeIds = new Set();
        const hiddenNodeIds = new Set();

        const incomingEdgesMap = new Map();
        initialEdges.forEach(e => {
            if (!incomingEdgesMap.has(e.target)) incomingEdgesMap.set(e.target, []);
            incomingEdgesMap.get(e.target).push(e);
        });

        let changed = true;
        while(changed) {
            changed = false;
            initialEdges.forEach(edge => {
                if (collapsedNodeIds.has(edge.source) || hiddenNodeIds.has(edge.source)) {
                    if (!hiddenEdgeIds.has(edge.id)) {
                        hiddenEdgeIds.add(edge.id);
                        changed = true;
                    }
                }
            });
            
            initialNodes.forEach(node => {
                const incomingEdges = incomingEdgesMap.get(node.id) || [];
                if (incomingEdges.length > 0 && incomingEdges.every(e => hiddenEdgeIds.has(e.id))) {
                    if (!hiddenNodeIds.has(node.id)) {
                        hiddenNodeIds.add(node.id);
                        changed = true;
                    }
                }
            });
        }

        setNodes(nds => nds.map(n => {
            const hasChildren = initialEdges.some(e => e.source === n.id);

            return {
                ...n,
                hidden: hiddenNodeIds.has(n.id),
                data: {
                    ...n.data,
                    isCollapsed: collapsedNodeIds.has(n.id),
                    hasChildren,
                    onToggleCollapse,
                }
            };
        }));

        setEdges(eds => eds.map(e => ({
            ...e,
            hidden: hiddenEdgeIds.has(e.id)
        })));

    }, [collapsedNodeIds, initialNodes, initialEdges, onToggleCollapse]); // re-run only when states change

    const onNodesChange = useCallback((changes) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
    const onEdgesChange = useCallback((changes) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);

    const onNodeClick = useCallback((_, node) => {
        setSelectedNode(node);
    }, []);

    // Double-click frames the node and its immediate neighbourhood.
    const onNodeDoubleClick = useCallback((_, node) => {
        const childIds = initialEdges
            .filter((e) => e.source === node.id || e.target === node.id)
            .flatMap((e) => [e.source, e.target]);
        const frame = Array.from(new Set([node.id, ...childIds])).map((id) => ({ id }));
        fitView({ nodes: frame, padding: 0.6, maxZoom: 1.4, duration: 600 });
    }, [initialEdges, fitView]);

    const onPaneClick = useCallback(() => {
        setSelectedNode(null);
        setNodes(nds => nds.map(n => ({ ...n, selected: false })));
    }, []);

    return (
        <div className="w-full h-full relative bg-canvas overflow-hidden flex">
            <GraphToolbar 
                onExport={onExport} 
                onReset={initializeLayout} 
                onClose={onClose} 
            />

            <div className="flex-1 relative">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    nodeTypes={nodeTypes}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onNodeClick={onNodeClick}
                    onNodeDoubleClick={onNodeDoubleClick}
                    onPaneClick={onPaneClick}
                    fitView
                    minZoom={0.1}
                    maxZoom={4}
                    proOptions={{ hideAttribution: true }}
                    className=""
                >
                    <Background color="#94a3b8" gap={20} size={1} />
                    <GraphNavigator />
                </ReactFlow>
            </div>

            <GraphSidebar 
                selectedNode={selectedNode} 
                onClose={() => {
                    setSelectedNode(null);
                    setNodes(nds => nds.map(n => ({ ...n, selected: false })));
                }} 
            />
        </div>
    );
}

export default function KnowledgeGraph({ data, onClose }) {
    const { initialNodes, initialEdges } = useMemo(() => {
        if (!data || !data.nodes) return { initialNodes: [], initialEdges: [] };

        const MAX_NODES = 120;
        const rawNodes = data.nodes || [];
        const rawRels = data.relationships || [];

        // Priority sampling logic (same as original D3 logic to cap nodes)
        const priorityNodes = rawNodes.filter(n => n.labels?.includes('Equipment') || n.labels?.includes('WorkOrder'));
        const otherNodes = rawNodes
            .filter(n => !n.labels?.includes('Equipment') && !n.labels?.includes('WorkOrder'))
            .slice(0, Math.max(0, MAX_NODES - priorityNodes.length));
            
        const visibleNodes = [...priorityNodes, ...otherNodes];
        const visibleIds = new Set(visibleNodes.map(n => n.id));

        const nodes = visibleNodes.map((n) => {
            const label = n.labels?.[0] || 'Document';
            const props = n.properties || {};
            const groupMap = {
                Equipment: 1, SOP: 2, OperatingManual: 2, MaintenanceManual: 3, DesignSheet: 3,
                RCA: 4, WorkOrder: 4, Tag: 5, Document: 6
            };
            return {
                id: n.id,
                type: 'custom',
                data: {
                    label,
                    name: props.equipment_no || props.work_order_no || props.tag_id || props.title || props.source_file || String(n.id),
                    group: groupMap[label] ?? 6,
                    props
                },
                position: { x: 0, y: 0 } // Computed later by force layout
            };
        });

        const edges = rawRels
            .filter(r => visibleIds.has(r.source) && visibleIds.has(r.target))
            .map(r => ({
                id: `${r.source}-${r.target}-${r.type}`,
                source: r.source,
                target: r.target,
                label: r.type,
                animated: true,
                style: { strokeWidth: 2, stroke: '#94a3b8' },
                markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' },
                labelStyle: { fill: '#64748b', fontSize: 10, fontWeight: 700 },
                labelBgStyle: { fill: 'transparent' }
            }));

        return { initialNodes: nodes, initialEdges: edges };
    }, [data]);

    const handleExport = useCallback(() => {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'knowledge_graph_data.json';
        a.click();
        URL.revokeObjectURL(url);
    }, [data]);

    return (
        <ReactFlowProvider>
            <KnowledgeGraphCanvas 
                initialNodes={initialNodes} 
                initialEdges={initialEdges} 
                onExport={handleExport}
                onClose={onClose}
            />
        </ReactFlowProvider>
    );
}
