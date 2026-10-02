import { useState, useCallback } from 'react';
import { updateKnowledgeGraph, addKnowledgeGraphNode } from '@/src/services/knowledge-graph/knowledgeGraphService';
import { nodeName, propsToObject, errMessage, toId } from './mutationUtils';

export function useNodeMutations({ graphData, setGraphData, setSelectedNode, plantCode, success, error }) {
    const [isNodeModalOpen, setIsNodeModalOpen] = useState(false);
    const [nodeModalMode, setNodeModalMode] = useState('create');
    const [nodeKey, setNodeKey] = useState('');
    const [nodeLabel, setNodeLabel] = useState('Equipment');
    const [nodeProperties, setNodeProperties] = useState([]);
    const [editingDbId, setEditingDbId] = useState(null);
    const [isSavingNode, setIsSavingNode] = useState(false);

    const openCreateNode = useCallback(() => {
        setNodeModalMode('create');
        setNodeKey('');
        setNodeLabel('Equipment');
        setNodeProperties([]);
        setEditingDbId(null);
        setIsNodeModalOpen(true);
    }, []);

    const openEditNode = useCallback((node) => {
        if (!node) return;
        setNodeModalMode('edit');
        setNodeKey(nodeName(node));
        setNodeLabel(node.labels?.[0] || 'Equipment');
        setEditingDbId(node.dbId ?? node.id);
        setNodeProperties(
            Object.entries(node.properties || {})
                .filter(([k]) => !['name', 'equipment_id', 'reference_no', 'tag_name', 'pipe_id', 'notification_id', 'aif_id', 'title'].includes(k))
                .map(([k, v]) => ({ key: k, value: String(v) }))
        );
        setIsNodeModalOpen(true);
    }, []);

    const submitNode = useCallback(async (e) => {
        e?.preventDefault?.();
        const key = nodeKey.trim();
        if (!key || !nodeLabel.trim()) { error('Validation', 'Key and entity label are required.'); return; }

        const properties = { name: key, ...propsToObject(nodeProperties) };
        setIsSavingNode(true);
        try {
            let res;
            if (nodeModalMode === 'edit' && editingDbId) {
                const dbIdVal = toId(editingDbId);
                const payload = {
                    type: 'node',
                    action: 'upsert',
                    node_id: dbIdVal ?? 0,
                    label: nodeLabel,
                    key,
                    rel_type: null,
                    src_id: null,
                    tgt_id: null,
                    src_label: null,
                    src_key: null,
                    tgt_label: null,
                    tgt_key: null,
                    properties,
                };
                res = await updateKnowledgeGraph(plantCode, payload);
            } else {
                const payload = {
                    label: nodeLabel,
                    key,
                    properties,
                };
                res = await addKnowledgeGraphNode(plantCode, payload);
            }
            const newDbId = res?.data?.results?.[0]?.id ?? res?.results?.[0]?.id ?? res?.id ?? editingDbId ?? key;
            const nextNode = { id: String(newDbId), dbId: newDbId, labels: [nodeLabel], properties };

            setGraphData((prev) => {
                const exists = prev.nodes.some((n) => String(n.id) === String(nextNode.id));
                return {
                    ...prev,
                    nodes: exists
                        ? prev.nodes.map((n) => (String(n.id) === String(nextNode.id) ? { ...n, ...nextNode } : n))
                        : [...prev.nodes, nextNode],
                };
            });
            setSelectedNode?.(nextNode);
            success(nodeModalMode === 'edit' ? 'Entity updated' : 'Entity created', key);
            setIsNodeModalOpen(false);
        } catch (err) {
            error('Save failed', errMessage(err, 'Could not save the entity.'));
        } finally {
            setIsSavingNode(false);
        }
    }, [nodeKey, nodeLabel, nodeProperties, nodeModalMode, editingDbId, setGraphData, setSelectedNode, success, error, plantCode]);

    return {
        isNodeModalOpen, setIsNodeModalOpen,
        nodeModalMode, setNodeModalMode,
        nodeKey, setNodeKey,
        nodeLabel, setNodeLabel,
        nodeProperties, setNodeProperties,
        isSavingNode,
        openCreateNode, openEditNode, submitNode
    };
}
