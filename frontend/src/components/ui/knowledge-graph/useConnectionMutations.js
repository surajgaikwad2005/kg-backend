import { useState, useCallback } from 'react';
import { updateKnowledgeGraph } from '@/src/services/knowledge-graph/knowledgeGraphService';
import { nodeName, propsToObject, errMessage, toId } from './mutationUtils';

export function useConnectionMutations({ graphData, setGraphData, setSelectedNode, plantCode, success, error }) {
    const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
    const [connectSrcId, setConnectSrcId] = useState('');
    const [connectTgtId, setConnectTgtId] = useState('');
    const [connectType, setConnectType] = useState('CONNECTED_TO');
    const [connectProperties, setConnectProperties] = useState([]);
    const [editingRelId, setEditingRelId] = useState(null);
    const [isSavingConnection, setIsSavingConnection] = useState(false);
    const [connectModalMode, setConnectModalMode] = useState('create');

    const openConnectFromNode = useCallback((node) => {
        setConnectModalMode('create');
        setConnectSrcId(node ? String(node.dbId ?? node.id) : '');
        setConnectTgtId('');
        setConnectType('CONNECTED_TO');
        setConnectProperties([]);
        setIsConnectModalOpen(true);
    }, []);

    const openEditConnection = useCallback((rel) => {
        if (!rel) return;
        setConnectModalMode('edit');
        setEditingRelId(rel.id);
        setConnectSrcId(String(rel.src_db_id ?? rel.source));
        setConnectTgtId(String(rel.tgt_db_id ?? rel.target));
        setConnectType(rel.type || 'CONNECTED_TO');
        setConnectProperties(
            Object.entries(rel.properties || {})
                .map(([k, v]) => ({ key: k, value: String(v) }))
        );
        setIsConnectModalOpen(true);
    }, []);

    const submitConnection = useCallback(async (e) => {
        e?.preventDefault?.();
        if (!connectSrcId || !connectTgtId || !connectType.trim()) {
            error('Validation', 'Source, target and relationship type are required.');
            return;
        }
        if (String(connectSrcId) === String(connectTgtId)) {
            error('Validation', 'Source and target must be different nodes.');
            return;
        }

        const properties = propsToObject(connectProperties);
        setIsSavingConnection(true);
        try {
            const src = graphData.nodes.find((n) => String(n.dbId ?? n.id) === String(connectSrcId));
            const tgt = graphData.nodes.find((n) => String(n.dbId ?? n.id) === String(connectTgtId));
            if (!src || !tgt) {
                error('Validation', 'Source or target node not found.');
                return;
            }

            const srcIdVal = toId(connectSrcId);
            const tgtIdVal = toId(connectTgtId);

            await updateKnowledgeGraph(plantCode, {
                type: 'relationship',
                action: 'upsert',
                node_id: null,
                label: null,
                key: null,
                rel_type: connectType,
                src_id: srcIdVal ?? 0,
                tgt_id: tgtIdVal ?? 0,
                src_label: src.labels?.[0] || 'Entity',
                src_key: src.properties?.name || src.properties?.equipment_id || src.id,
                tgt_label: tgt.labels?.[0] || 'Entity',
                tgt_key: tgt.properties?.name || tgt.properties?.equipment_id || tgt.id,
                properties,
            });

            if (src && tgt) {
                const rel = {
                    id: `rel-${connectSrcId}-${connectType}-${connectTgtId}`,
                    source: String(connectSrcId), target: String(connectTgtId),
                    src_db_id: connectSrcId, tgt_db_id: connectTgtId,
                    type: connectType, properties,
                };
                setGraphData((prev) => {
                    const oldId = editingRelId;
                    return {
                        ...prev,
                        relationships: [...prev.relationships.filter((r) => r.id !== rel.id && r.id !== oldId), rel],
                    };
                });
                setSelectedNode?.((current) => (current && current.id === rel.id ? rel : current));
            }
            success(connectModalMode === 'edit' ? 'Connection updated' : 'Connection created', `${nodeName(src)} → ${nodeName(tgt)}`);
            setIsConnectModalOpen(false);
        } catch (err) {
            error('Connection failed', errMessage(err, 'Could not create the connection.'));
        } finally {
            setIsSavingConnection(false);
        }
    }, [connectSrcId, connectTgtId, connectType, connectProperties, connectModalMode, editingRelId, graphData.nodes, setGraphData, setSelectedNode, success, error, plantCode]);

    return {
        isConnectModalOpen, setIsConnectModalOpen,
        connectSrcId, setConnectSrcId,
        connectTgtId, setConnectTgtId,
        connectType, setConnectType,
        connectProperties, setConnectProperties,
        isSavingConnection, connectModalMode,
        openConnectFromNode, openEditConnection, submitConnection
    };
}
