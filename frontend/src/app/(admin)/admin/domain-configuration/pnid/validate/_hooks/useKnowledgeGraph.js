'use client';

/**
 * useKnowledgeGraph — self-contained KG state + CRUD for the Ontology Generator.
 * Builds the graph from verified connections, and manages node/relationship
 * upsert/delete with optimistic local graph updates. Persists via the
 * knowledgeGraphService proxy. Only depends on the verified connection list.
 */
import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { knowledgeGraphService } from '@/src/services/domain-configuration/pnid/knowledgeGraphChatService';
import { useApp } from '@/src/context/AppContext';
import { kgNodeLabel } from '@/src/app/(admin)/admin/domain-configuration/pnid/validate/_lib/utils';

const propsToObject = (list) => {
    const obj = {};
    list.forEach((p) => { if (p.key.trim()) obj[p.key.trim()] = p.value; });
    return obj;
};

export function useKnowledgeGraph({ connections, setErrorMessage }) {
    // plantCode is now an explicit argument to the service (it used to read
    // localStorage internally) — sourced here and threaded down.
    const { plantCode } = useApp();
    const [isKGLoading, setIsKGLoading] = useState(false);
    const [showKG, setShowKG] = useState(false);
    const [showKgAivee, setShowKgAivee] = useState(false);
    const [selectedKGNode, setSelectedKGNode] = useState(null);
    const [kgTotalNodes, setKgTotalNodes] = useState(50);
    const [kgDimensions, setKgDimensions] = useState({ width: 0, height: 0 });
    const [kgLayoutKey, setKgLayoutKey] = useState(0);
    const [kgGraphData, setKgGraphData] = useState({ nodes: [], relationships: [] });
    const kgGraphContainerRef = useRef(null);

    // Node modal
    const [isNodeModalOpen, setIsNodeModalOpen] = useState(false);
    const [nodeModalMode, setNodeModalMode] = useState('create');
    const [nodeKey, setNodeKey] = useState('');
    const [nodeLabel, setNodeLabel] = useState('Equipment');
    const [nodeProperties, setNodeProperties] = useState([]);
    // Relationship modal
    const [isRelModalOpen, setIsRelModalOpen] = useState(false);
    const [relSrcId, setRelSrcId] = useState('');
    const [relTgtId, setRelTgtId] = useState('');
    const [relType, setRelType] = useState('CONNECTED_TO');
    const [relProperties, setRelProperties] = useState([]);
    // Delete confirms + toast
    const [isDeleteNodeConfirmOpen, setIsDeleteNodeConfirmOpen] = useState(false);
    const [nodeToDelete, setNodeToDelete] = useState(null);
    const [isDeleteRelConfirmOpen, setIsDeleteRelConfirmOpen] = useState(false);
    const [relToDelete, setRelToDelete] = useState(null);
    const [kgToast, setKgToast] = useState(null);

    useEffect(() => {
        if (!showKG) return;
        const update = () => {
            if (kgGraphContainerRef.current) {
                setKgDimensions({ width: kgGraphContainerRef.current.offsetWidth, height: kgGraphContainerRef.current.offsetHeight });
            }
        };
        const t = setTimeout(update, 100);
        window.addEventListener('resize', update);
        return () => { clearTimeout(t); window.removeEventListener('resize', update); };
    }, [showKG]);

    const nodeOptions = useMemo(() =>
        kgGraphData.nodes
            .map((n) => ({ dbId: n.dbId ?? n.id, label: n.properties?.name || n.properties?.equipment_id || n.properties?.tag_name || n.properties?.pipe_id || n.properties?.reference_no || n.properties?.notification_id || n.properties?.aif_id || n.properties?.title || n.id, classification: n.labels?.[0] || 'Equipment' }))
            .sort((a, b) => a.label.toString().localeCompare(b.label.toString())),
        [kgGraphData.nodes]);

    const showKgToast = useCallback((type, message) => {
        setKgToast({ type, message });
        setTimeout(() => setKgToast(null), 4000);
    }, []);

    // ── Property field helpers ───────────────────────────────────────────────
    const addPropertyField = (mode) => (mode === 'node' ? setNodeProperties : setRelProperties)((p) => [...p, { id: crypto.randomUUID(), key: '', value: '' }]);
    const removePropertyField = (mode, index) => (mode === 'node' ? setNodeProperties : setRelProperties)((p) => p.filter((_, i) => i !== index));
    const handlePropertyChange = (mode, index, field, val) => {
        const setter = mode === 'node' ? setNodeProperties : setRelProperties;
        setter((prev) => prev.map((p, i) => (i === index ? { ...p, [field]: val } : p)));
    };

    // ── Create graph from verified connections ───────────────────────────────
    const handleCreateKG = useCallback(async () => {
        const verified = connections.filter((c) => c.verified === true);
        if (verified.length === 0) { setErrorMessage('Please verify at least one connection first.'); return; }
        setIsKGLoading(true);
        setErrorMessage(null);
        const uniqueNodes = Array.from(new Set(verified.flatMap((c) => [c.from, c.to]).filter(Boolean)));
        const payload = [
            ...uniqueNodes.map((n) => ({ type: 'node', action: 'upsert', label: kgNodeLabel(n), key: n.trim(), properties: { name: n.trim(), tag_name: n.trim(), status: 'Active' } })),
            ...verified.map((c) => ({ type: 'relationship', action: 'upsert', rel_type: 'CONNECTED_TO', src_id: c.from.trim(), tgt_id: c.to.trim(), properties: { flow_rate: '', medium: 'Process Fluid' } })),
        ];
        try {
            await knowledgeGraphService.update(plantCode, payload);
            setKgGraphData({
                nodes: uniqueNodes.map((n) => ({ id: n.trim(), dbId: n.trim(), labels: [kgNodeLabel(n)], properties: { name: n.trim(), tag_name: n.trim(), status: 'Active' } })),
                relationships: verified.map((c) => ({ id: `rel-${c.from}-CONNECTED_TO-${c.to}`, source: c.from.trim(), target: c.to.trim(), src_db_id: c.from.trim(), tgt_db_id: c.to.trim(), type: 'CONNECTED_TO', properties: { medium: 'Process Fluid' } })),
            });
            setShowKG(true);
        } catch (err) {
            setErrorMessage(err?.data?.error || err?.message || 'Failed to create KG.');
        } finally {
            setIsKGLoading(false);
        }
    }, [connections, setErrorMessage]);

    // ── Node / relationship triggers ─────────────────────────────────────────
    const handleEditNode = (node) => {
        setNodeModalMode('edit');
        setNodeKey(node.properties?.name || node.properties?.equipment_id || node.properties?.tag_name || node.properties?.pipe_id || node.properties?.reference_no || node.properties?.notification_id || node.properties?.aif_id || node.properties?.title || node.id || '');
        setNodeLabel(node.labels?.[0] || 'Equipment');
        const list = Object.entries(node.properties || {})
            .filter(([k]) => !['name', 'equipment_id', 'reference_no', 'tag_name', 'pipe_id', 'notification_id', 'aif_id', 'title'].includes(k))
            .map(([k, v]) => ({ id: crypto.randomUUID(), key: k, value: String(v) }));
        setNodeProperties(list.length > 0 ? list : [{ id: crypto.randomUUID(), key: '', value: '' }]);
        setIsNodeModalOpen(true);
    };

    const handleConnectNodeTrigger = (sourceNode) => {
        const src = sourceNode ? (sourceNode.dbId ?? sourceNode.id) : (selectedKGNode && !selectedKGNode.type ? (selectedKGNode.dbId ?? selectedKGNode.id) : '');
        setRelSrcId(src?.toString() || '');
        setRelTgtId('');
        setRelType('CONNECTED_TO');
        setRelProperties([{ id: crypto.randomUUID(), key: 'flow_rate', value: '' }, { id: crypto.randomUUID(), key: 'medium', value: 'Water' }]);
        setIsRelModalOpen(true);
    };

    const handleDeleteNodeTrigger = (node) => { setNodeToDelete(node); setIsDeleteNodeConfirmOpen(true); };
    const handleDeleteRelationshipTrigger = (rel) => { setRelToDelete(rel); setIsDeleteRelConfirmOpen(true); };

    // ── Submits ──────────────────────────────────────────────────────────────
    const handleUpsertNodeSubmit = async (e) => {
        e.preventDefault();
        if (!nodeKey.trim() || !nodeLabel.trim()) { showKgToast('error', 'Key and Entity Label are required.'); return; }
        const propsObj = propsToObject(nodeProperties);
        try {
            const payload = { type: 'node', action: 'upsert', label: nodeLabel, key: nodeKey.trim(), properties: propsObj };
            if (nodeModalMode === 'edit' && selectedKGNode) {
                const id = selectedKGNode.dbId ?? selectedKGNode.id;
                if (id != null) {
                    payload.node_id = String(id);
                }
            }
            const data = await knowledgeGraphService.update(plantCode, [payload]);
            const newDbId = data?.data?.results?.[0]?.id;
            showKgToast('success', `Entity ${nodeModalMode === 'create' ? 'created' : 'updated'} successfully!`);
            setIsNodeModalOpen(false);
            const nodeProps = { name: nodeKey.trim(), ...propsObj };
            if (nodeModalMode === 'create') {
                const newNode = { id: nodeKey.trim(), dbId: newDbId || nodeKey.trim(), labels: [nodeLabel], properties: nodeProps };
                setKgGraphData((prev) => ({ nodes: [...prev.nodes.filter((n) => n.id !== newNode.id), newNode], relationships: prev.relationships }));
                setSelectedKGNode(newNode);
            } else {
                setKgGraphData((prev) => ({ ...prev, nodes: prev.nodes.map((n) => (n.id === nodeKey.trim() ? { ...n, labels: [nodeLabel], properties: nodeProps } : n)) }));
                setSelectedKGNode({ id: nodeKey.trim(), dbId: selectedKGNode?.dbId || nodeKey.trim(), labels: [nodeLabel], properties: nodeProps });
            }
        } catch (err) { showKgToast('error', err?.data?.error || err?.message || 'An error occurred'); }
    };

    const handleDeleteNodeSubmit = async () => {
        if (!nodeToDelete) return;
        const id = nodeToDelete.dbId ?? nodeToDelete.id;
        if (id === undefined || id === null) { showKgToast('error', 'Internal database ID not found'); return; }
        try {
            await knowledgeGraphService.update(plantCode, [{ type: 'node', action: 'delete', node_id: id.toString() }]);
            showKgToast('success', 'Entity deleted successfully!');
            setIsDeleteNodeConfirmOpen(false);
            setKgGraphData((prev) => ({
                nodes: prev.nodes.filter((n) => (n.dbId ?? n.id).toString() !== id.toString()),
                relationships: prev.relationships.filter((r) => (r.src_db_id ?? r.source).toString() !== id.toString() && (r.tgt_db_id ?? r.target).toString() !== id.toString()),
            }));
            setSelectedKGNode(null);
        } catch (err) { showKgToast('error', err?.data?.error || err?.message || 'An error occurred'); }
    };

    const handleUpsertRelationshipSubmit = async (e) => {
        e.preventDefault();
        if (!relSrcId || !relTgtId || !relType.trim()) { showKgToast('error', 'Source, Target, and Relation Type are required.'); return; }
        const propsObj = propsToObject(relProperties);
        try {
            await knowledgeGraphService.update(plantCode, [{ type: 'relationship', action: 'upsert', rel_type: relType, src_id: relSrcId.toString(), tgt_id: relTgtId.toString(), properties: propsObj }]);
            showKgToast('success', 'Connection created successfully!');
            setIsRelModalOpen(false);
            const srcNode = kgGraphData.nodes.find((n) => (n.dbId ?? n.id).toString() === relSrcId.toString());
            const tgtNode = kgGraphData.nodes.find((n) => (n.dbId ?? n.id).toString() === relTgtId.toString());
            if (srcNode && tgtNode) {
                const sn = srcNode.properties?.name || srcNode.id;
                const tn = tgtNode.properties?.name || tgtNode.id;
                const newRel = { id: `rel-${sn}-${relType}-${tn}`, src_db_id: relSrcId, tgt_db_id: relTgtId, source: sn, target: tn, type: relType, properties: propsObj };
                setKgGraphData((prev) => ({ nodes: prev.nodes, relationships: [...prev.relationships.filter((r) => r.id !== newRel.id), newRel] }));
                setSelectedKGNode(newRel);
            }
        } catch (err) { showKgToast('error', err?.data?.error || err?.message || 'An error occurred'); }
    };

    const handleDeleteRelationshipSubmit = async () => {
        if (!relToDelete) return;
        const { type, src_db_id, tgt_db_id, source, target } = relToDelete;
        const srcId = src_db_id ?? source;
        const tgtId = tgt_db_id ?? target;
        if (!type || srcId === undefined || tgtId === undefined) { showKgToast('error', 'Incomplete relationship details'); return; }
        try {
            await knowledgeGraphService.update(plantCode, [{ type: 'relationship', action: 'delete', rel_type: type, src_id: srcId.toString(), tgt_id: tgtId.toString() }]);
            showKgToast('success', 'Connection deleted successfully!');
            setIsDeleteRelConfirmOpen(false);
            setKgGraphData((prev) => ({
                ...prev,
                relationships: prev.relationships.filter((r) => !(r.type === type && (r.src_db_id ?? r.source).toString() === srcId.toString() && (r.tgt_db_id ?? r.target).toString() === tgtId.toString())),
            }));
            setSelectedKGNode(null);
        } catch (err) { showKgToast('error', err?.data?.error || err?.message || 'An error occurred'); }
    };

    return {
        isKGLoading, showKG, setShowKG, showKgAivee, setShowKgAivee, selectedKGNode, setSelectedKGNode,
        kgTotalNodes, setKgTotalNodes, kgGraphContainerRef, kgDimensions, kgLayoutKey, setKgLayoutKey, kgGraphData, setKgGraphData,
        isNodeModalOpen, setIsNodeModalOpen, nodeModalMode, setNodeModalMode,
        nodeKey, setNodeKey, nodeLabel, setNodeLabel, nodeProperties, setNodeProperties,
        isRelModalOpen, setIsRelModalOpen, relSrcId, setRelSrcId, relTgtId, setRelTgtId, relType, setRelType, relProperties, setRelProperties,
        isDeleteNodeConfirmOpen, setIsDeleteNodeConfirmOpen, nodeToDelete,
        isDeleteRelConfirmOpen, setIsDeleteRelConfirmOpen, relToDelete,
        kgToast, setKgToast, nodeOptions,
        handleCreateKG, addPropertyField, removePropertyField, handlePropertyChange,
        handleEditNode, handleConnectNodeTrigger, handleDeleteNodeTrigger, handleDeleteRelationshipTrigger,
        handleUpsertNodeSubmit, handleDeleteNodeSubmit, handleUpsertRelationshipSubmit, handleDeleteRelationshipSubmit,
    };
}
