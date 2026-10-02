import { useState, useCallback } from 'react';
import { deleteFromKnowledgeGraph } from '@/src/services/knowledge-graph/knowledgeGraphService';
import { nodeName, errMessage, toId } from './mutationUtils';

export function useDeleteMutations({ graphData, setGraphData, setSelectedNode, plantCode, success, error }) {
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const openDeleteNode = useCallback((node) => setDeleteTarget(node || null), []);
    const openDeleteConnection = useCallback((rel) => setDeleteTarget(rel || null), []);

    const confirmDelete = useCallback(async () => {
        if (!deleteTarget) return;
        setIsDeleting(true);
        try {
            if (deleteTarget.source && deleteTarget.target) {
                // Delete relationship
                const srcNode = graphData.nodes.find((n) => String(n.dbId ?? n.id) === String(deleteTarget.src_db_id ?? deleteTarget.source));
                const tgtNode = graphData.nodes.find((n) => String(n.dbId ?? n.id) === String(deleteTarget.tgt_db_id ?? deleteTarget.target));

                await deleteFromKnowledgeGraph(plantCode, {
                    type: 'relationship',
                    action: 'delete',
                    node_id: null,
                    label: null,
                    key: null,
                    rel_type: deleteTarget.type,
                    src_id: toId(deleteTarget.src_db_id ?? deleteTarget.source) ?? 0,
                    tgt_id: toId(deleteTarget.tgt_db_id ?? deleteTarget.target) ?? 0,
                    src_label: srcNode?.labels?.[0] || null,
                    src_key: srcNode?.properties?.name || srcNode?.properties?.equipment_id || srcNode?.id || null,
                    tgt_label: tgtNode?.labels?.[0] || null,
                    tgt_key: tgtNode?.properties?.name || tgtNode?.properties?.equipment_id || tgtNode?.id || null,
                });
                setGraphData((prev) => ({
                    ...prev,
                    relationships: prev.relationships.filter((r) => r.id !== deleteTarget.id),
                }));
                setSelectedNode?.(null);
                success('Connection deleted', `${deleteTarget.type} connection removed`);
                setDeleteTarget(null);
            } else {
                // Delete node
                const id = deleteTarget.dbId ?? deleteTarget.id;
                const nodeIdVal = toId(id);
                await deleteFromKnowledgeGraph(plantCode, {
                    type: 'node',
                    action: 'delete',
                    node_id: nodeIdVal ?? 0,
                    label: deleteTarget.labels?.[0],
                    key: deleteTarget.properties?.name || deleteTarget.properties?.equipment_id || deleteTarget.id,
                    rel_type: null,
                    src_id: null,
                    tgt_id: null,
                    src_label: null,
                    src_key: null,
                    tgt_label: null,
                    tgt_key: null,
                });
                setGraphData((prev) => ({
                    nodes: prev.nodes.filter((n) => n.id !== deleteTarget.id),
                    relationships: prev.relationships.filter(
                        (r) => r.source !== deleteTarget.id && r.target !== deleteTarget.id,
                    ),
                }));
                setSelectedNode?.(null);
                success('Entity deleted', nodeName(deleteTarget));
                setDeleteTarget(null);
            }
        } catch (err) {
            error('Delete failed', errMessage(err, 'Could not delete the item.'));
        } finally {
            setIsDeleting(false);
        }
    }, [deleteTarget, graphData.nodes, setGraphData, setSelectedNode, success, error, plantCode]);

    return {
        deleteTarget, setDeleteTarget,
        isDeleting,
        openDeleteNode, openDeleteConnection, confirmDelete
    };
}
