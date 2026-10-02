"use client";
/**
 * knowledgeGraphService.js
 * Knowledge-graph exploration + mutation API (gateway /p1_knowledgegraph).
 *
 *   - exploreKnowledgeGraph : GET  /graph/kg_explore   (initial view + node expand)
 *   - updateKnowledgeGraph  : POST /graph/update_graph  (batch node/rel upsert+delete)
 *
 * NOTE: GET /graph/fullGraph is intentionally NOT used here — exploration is
 * always scoped via kg_explore so the canvas never pulls the entire graph.
 */
import { apiClient } from '../apiClient';

/**
 * `plantCode` is now REQUIRED from the caller — there is no localStorage
 * fallback any more.
 *
 * The removed `getStoredPlantCode()` read `localStorage.admin_plant_id` whenever
 * the argument was falsy. That violated the rule that services stay pure (they
 * never read context or ambient state), but more importantly it is incompatible
 * with caching: a hidden, non-reactive input means two calls with different
 * cache keys could hit the same plant's data, or one key could silently serve
 * another plant's. Every call site already passes plantCode explicitly
 * (verified across useKnowledgeGraphPage and useKnowledgeGraphMutations), so
 * this removes dead ambiguity rather than behaviour.
 */

/**
 * Explore the graph.
 * @param {string} plantCode     plant code ID.
 * @param {string|number} [node_id]  node id to expand around.
 *                               Omit for the initial view.
 * @param {number} [totalNodes]  max nodes to load (backend default 50, max 10000).
 */
export const exploreKnowledgeGraph = async (plantCode, node_id, totalNodes) => {
    const activePlantCode = plantCode;
    const params = { plant_code_id: activePlantCode };
    if (node_id) params.node = node_id;
    if (totalNodes != null) params.total_nodes = totalNodes;
    
    const response = await apiClient.get('/api/knowledge-graph/explore', {
        params,
    });

    return response?.data || response;
};

/**
 * Apply a batch of node/relationship operations.
 * Each op is one of:
 *   { type: 'node',         action: 'upsert'|'delete', label, key, node_id, properties }
 *   { type: 'relationship', action: 'upsert'|'delete', rel_type, src_id, tgt_id, properties }
 * @param {string} plantCode
 * @param {Array<object>} operations
 */
export const updateKnowledgeGraph = async (plantCode, operations) => {
    const activePlantCode = plantCode;
    const activeOperations = Array.isArray(operations)
        ? operations.map(op => ({
              ...op,
              plant_code_id: activePlantCode,
              ...(op.properties ? { properties: { ...op.properties } } : {})
          }))
        : {
              ...operations,
              plant_code_id: activePlantCode,
              ...(operations.properties ? { properties: { ...operations.properties } } : {})
          };

    const response = await apiClient.post('/api/knowledge-graph/update', activeOperations);
    return response?.data || response;
};

/**
 * Create a single new node in the Knowledge Graph.
 * @param {string} plantCode
 * @param {object} nodeData { label, key, properties }
 */
export const addKnowledgeGraphNode = async (plantCode, nodeData) => {
    const activePlantCode = plantCode;
    const body = {
        plant_code_id: activePlantCode,
        ...nodeData,
    };

    const response = await apiClient.post('/api/knowledge-graph/add-node', body);
    return response?.data || response;
};

/**
 * Create a single new relationship in the Knowledge Graph.
 * @param {string} plantCode
 * @param {object} relData { rel_type, src_id, tgt_id, properties }
 */
export const addKnowledgeGraphRelationship = async (plantCode, relData) => {
    const activePlantCode = plantCode;
    const body = {
        plant_code_id: activePlantCode,
        ...relData,
    };

    const response = await apiClient.post('/api/knowledge-graph/add-relationship', body);
    return response?.data || response;
};

/**
 * Delete nodes/relationships from the Knowledge Graph.
 * @param {string} plantCode
 * @param {Array<object>} operations
 */
export const deleteFromKnowledgeGraph = async (plantCode, operations) => {
    const activePlantCode = plantCode;
    const activeOperations = Array.isArray(operations)
        ? operations.map(op => ({
              ...op,
          }))
        : {
              ...operations,
          };

    const response = await apiClient.del('/api/knowledge-graph/update', {
        body: activeOperations,
        params: { plant_code_id: activePlantCode },
    });
    return response?.data || response;
};

/**
 * Upload an Excel file to populate the Knowledge Graph.
 * @param {string} plantCode
 * @param {File} file The excel file to upload
 */
export const uploadKnowledgeGraphFile = async (plantCode, file) => {
    const activePlantCode = plantCode;
    const formData = new FormData();

    formData.append("file", file);
    if (activePlantCode) {
        formData.append("plant_code_id", activePlantCode);
    }
    const response = await apiClient.post('/api/knowledge-graph/upload', formData);
    return response?.data || response;
};

/**
 * Trigger the graphConverter API for the specified plant.
 * @param {string} plantCode - The plant code ID.
 */
export const convertKnowledgeGraph = async (plantCode) => {
    const response = await apiClient.post('/api/knowledge-graph/convert', null, {
        params: { plant_code: plantCode },
    });
    return response?.data || response;
};
