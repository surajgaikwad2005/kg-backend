'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { ArrowRight, Crop, Save, Loader2, Maximize2 } from 'lucide-react';
import { WizardStepHeader } from './WizardStepHeader';
import { useDashboardDiagram } from '@/src/app/(dashboard)/home/_hooks/useDashboardDiagram';
import { useApp } from '@/src/context/AppContext';
import { extractSubDiagram, saveCpcpDiagram, agentTracePath } from '@/src/services/cpcp/template/templateService';
import { getEquipmentFlow } from '@/src/services/cpcp/cpcpService';
import {
    ReactFlow,
    ReactFlowProvider,
    Background,
    BackgroundVariant,
    useNodesState,
    useEdgesState,
    addEdge,
    useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { IndustrialNode } from '@/src/app/(dashboard)/home/workflow-diagram/_nodes/EquipmentNode';
import PipeEdge from '@/src/app/(dashboard)/home/workflow-diagram/_edges/EditableEdge';
import { useToast } from '@/src/components/ui/Toast';
import { WorkflowDataProvider } from '@/src/context/workflow-management/WorkflowContext';
import { pnidService } from '@/src/services/domain-configuration/pnid/pnidService';

import { ReferenceDiagramSelection } from './ReferenceDiagramContent';
import { EditableSubDiagram } from './EditableSubDiagram';

export function PidDrawingStep({ setAssetMappings, onBack, onNext }) {
    const { plantCode } = useApp();
    const { diagram, nodes: refNodes, edges: refEdges, isLoading, error } = useDashboardDiagram();
    const [phase, setPhase] = useState('select');
    const [extractedNodes, setExtractedNodes] = useState([]);
    const [extractedEdges, setExtractedEdges] = useState([]);
    const [excelDownloadUrl, setExcelDownloadUrl] = useState(null);
    const [intermediateItems, setIntermediateItems] = useState([]);
    const [isExtracting, setIsExtracting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const toast = useToast();

    const handleExtract = async (selectedIds) => {
        setIsExtracting(true);
        try {
            const selectedLabels = refNodes
                .filter(n => selectedIds.includes(n.id))
                .map(n => n.data?.label || n.data?.name || n.id);
            const start_component_name = selectedLabels[0] || '';
            const end_component_name = selectedLabels[selectedLabels.length - 1] || selectedLabels[0] || '';
            const start_page = diagram?.name || 'default';
            const end_page = diagram?.name || 'default';

            let res = null;
            try {
                res = await agentTracePath(plantCode, {
                    start_component_name,
                    start_page,
                    end_component_name,
                    end_page,
                    provider: 'google-gemini',
                    diagramId: diagram?.id || 'default',
                    selectedNodeIds: selectedIds,
                });
            } catch (agentErr) {
                console.warn('agentTracePath API call warning, falling back to BFS:', agentErr);
            }

            let extractedN = res?.nodes || [];
            let extractedE = res?.edges || [];

            if (res?.excel_file) {
                setExcelDownloadUrl(pnidService.fileUrl(plantCode, res.excel_file));
            } else if (res?.excel_download_url) {
                const formattedUrl = res.excel_download_url.startsWith('/api')
                    ? res.excel_download_url
                    : `/api/pnid${res.excel_download_url}`;
                setExcelDownloadUrl(formattedUrl);
            }
            if (res?.intermediate_components && Array.isArray(res.intermediate_components)) {
                setIntermediateItems(res.intermediate_components);
            }

            if (extractedN.length === 0) {
                const adj = {};
                refEdges.forEach(e => {
                    if (!adj[e.source]) adj[e.source] = [];
                    adj[e.source].push({ next: e.target, edgeId: e.id });
                    if (!adj[e.target]) adj[e.target] = [];
                    adj[e.target].push({ next: e.source, edgeId: e.id });
                });

                const startId = selectedIds[0];
                const endId = selectedIds[selectedIds.length - 1];

                const queue = [[startId]];
                const visited = new Set();
                let foundPath = [];

                while (queue.length > 0) {
                    const path = queue.shift();
                    const node = path[path.length - 1];

                    if (node === endId) {
                        foundPath = path;
                        break;
                    }
                    if (!visited.has(node)) {
                        visited.add(node);
                        const neighbors = adj[node] || [];
                        for (const neighbor of neighbors) {
                            queue.push([...path, neighbor.next]);
                        }
                    }
                }

                if (foundPath.length > 0) {
                    const pathSet = new Set(foundPath);
                    extractedN = refNodes.filter(n => pathSet.has(n.id));
                    extractedE = refEdges.filter(e => pathSet.has(e.source) && pathSet.has(e.target));
                }
            }

            setExtractedNodes(extractedN);
            setExtractedEdges(extractedE.map(e => ({
                ...e,
                type: 'pipe',
                data: { ...e.data, readOnly: false }
            })));
            setPhase('edit');
            toast.success('AI Agent path trace completed');
        } catch (err) {
            toast.error(err?.message || 'Failed to extract path');
        } finally {
            setIsExtracting(false);
        }
    };

    const handleSave = async (payload) => {
        setIsSaving(true);
        try {
            // 1. Save CPCP diagram
            await saveCpcpDiagram(plantCode, {
                name: 'Extracted CPCP Template',
                nodes: payload.nodes,
                edges: payload.edges,
            });

            // 2. Identify start equipment and end equipment from nodes
            const nodeLabels = (payload.nodes || [])
                .map(n => n.data?.label || n.data?.name || n.id || '')
                .filter(Boolean);

            const fromEquipment = nodeLabels[0] || '';
            const toEquipment = nodeLabels[nodeLabels.length - 1] || nodeLabels[0] || '';

            // 3. Hit /equipmentFlow GET API as specified
            let flowData = null;
            if (fromEquipment && toEquipment) {
                try {
                    const flowRes = await getEquipmentFlow(plantCode, fromEquipment, toEquipment);
                    flowData = flowRes?.relationships ? flowRes : flowRes?.data;
                } catch (flowErr) {
                    console.warn('getEquipmentFlow API call note:', flowErr);
                }
            }

            // 4. Map relationships to assetMappings format
            let newMappings = [];
            if (flowData?.relationships && Array.isArray(flowData.relationships) && flowData.relationships.length > 0) {
                newMappings = flowData.relationships.map((rel) => ({
                    id: Math.random().toString(36).substring(2, 9),
                    from_equipment: rel.From || rel.from || '',
                    relationship: rel.Type || rel.relationship || rel.Relationship || 'FLOWS_TO',
                    to_equipment: rel.To || rel.to || '',
                    membership_type: 'Fixed',
                    mandatory: 'Yes',
                    activation_condition: '',
                    parallel_group: '',
                    capacity_mmscfd: '',
                    capacity_basis: 'Design Capacity',
                    running: '1',
                    available: '1',
                    capacity_now_mmscfd: '',
                    capacity_post_switchover_mmscfd: '',
                    running_tag: '',
                    post_switchover_tag: '',
                    routed_rate_mmscfd: 0,
                    is_active_path: 'Yes',
                    failure_location: 'Active Path',
                    risk_type: 'Mechanical',
                    alternate_path: 'Stand-By',
                    work_order_active: 'No',
                    notification_active: 'No',
                    capacity_comparison: 'Similar',
                    time_to_failure: 0,
                    time_for_switchover: 0,
                    production_risk: 'Contingent',
                }));
            }

            // 5. Augment or fallback with canvas edges & user-selected relationship dropdowns
            if (payload.edges && payload.edges.length > 0) {
                const nodeMap = {};
                (payload.nodes || []).forEach(n => {
                    nodeMap[n.id] = n.data?.label || n.data?.name || n.id;
                });

                const canvasMappings = (payload.edges || []).map(edge => {
                    const srcLabel = nodeMap[edge.source] || edge.source;
                    const tgtLabel = nodeMap[edge.target] || edge.target;
                    const relType = edge.data?.relationshipType || edge.data?.label || 'FLOWS_TO';

                    return {
                        id: Math.random().toString(36).substring(2, 9),
                        from_equipment: srcLabel,
                        relationship: relType,
                        to_equipment: tgtLabel,
                        membership_type: 'Fixed',
                        mandatory: 'Yes',
                        activation_condition: '',
                        parallel_group: '',
                        capacity_mmscfd: '',
                        capacity_basis: 'Design Capacity',
                        running: '1',
                        available: '1',
                        capacity_now_mmscfd: '',
                        capacity_post_switchover_mmscfd: '',
                        running_tag: '',
                        post_switchover_tag: '',
                        routed_rate_mmscfd: 0,
                        is_active_path: 'Yes',
                        failure_location: 'Active Path',
                        risk_type: 'Mechanical',
                        alternate_path: 'Stand-By',
                        work_order_active: 'No',
                        notification_active: 'No',
                        capacity_comparison: 'Similar',
                        time_to_failure: 0,
                        time_for_switchover: 0,
                        production_risk: 'Contingent',
                    };
                });

                if (newMappings.length === 0) {
                    newMappings = canvasMappings;
                } else {
                    canvasMappings.forEach(canvasMap => {
                        const existing = newMappings.find(
                            m => m.from_equipment === canvasMap.from_equipment && m.to_equipment === canvasMap.to_equipment
                        );
                        if (existing) {
                            existing.relationship = canvasMap.relationship;
                        } else {
                            newMappings.push(canvasMap);
                        }
                    });
                }
            }

            if (newMappings.length > 0 && setAssetMappings) {
                setAssetMappings(newMappings);
            }

            toast.success('Diagram saved and equipment flow configuration loaded');
            onNext();
        } catch (err) {
            toast.error(err?.message || 'Failed to save diagram');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="w-full h-full flex flex-col bg-canvas">
            <div className="px-6 py-4 border-b border-border flex-shrink-0 bg-surface z-10">
                <WizardStepHeader
                    onBack={onBack}
                    backLabel="Back to Path Selection"
                    title="P&ID Path Setup"
                    subtitle="Extract a path and map relationships."
                    actions={
                        <button
                            onClick={onNext}
                            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-surface-2 hover:bg-surface-3 text-text-primary text-sm font-semibold rounded-xl transition-all shadow-sm border border-border focus:outline-none focus:ring-4 focus:ring-brand/20 active:scale-95 cursor-pointer"
                        >
                            Skip Extraction
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    }
                />
            </div>

            <div className="p-6 flex flex-col w-full relative">
                <div className="w-full h-[650px] min-h-[550px] bg-surface rounded-2xl border border-border shadow-sm flex flex-col overflow-hidden relative">
                    <WorkflowDataProvider>
                        <ReactFlowProvider>
                            {phase === 'select' ? (
                                <div className="w-full h-full relative flex flex-col">
                                    {isLoading ? (
                                        <div className="w-full h-full flex items-center justify-center bg-surface-2">
                                            <Loader2 className="w-8 h-8 animate-spin text-brand" />
                                        </div>
                                    ) : error ? (
                                        <div className="w-full h-full flex items-center justify-center bg-surface-2 text-danger">
                                            {error}
                                        </div>
                                    ) : (
                                        <ReferenceDiagramSelection
                                            nodes={refNodes}
                                            edges={refEdges}
                                            onExtract={handleExtract}
                                            isExtracting={isExtracting}
                                        />
                                    )}
                                </div>
                            ) : (
                                <div className="w-full h-full relative flex flex-col">
                                    <EditableSubDiagram
                                        initialNodes={extractedNodes}
                                        initialEdges={extractedEdges}
                                        excelDownloadUrl={excelDownloadUrl}
                                        intermediateItems={intermediateItems}
                                        onSave={handleSave}
                                        isSaving={isSaving}
                                    />
                                </div>
                            )}
                        </ReactFlowProvider>
                    </WorkflowDataProvider>
                </div>
            </div>
        </div>
    );
}
