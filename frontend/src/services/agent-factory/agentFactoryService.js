/**
 * agentFactoryService.js
 * Pure async functions for the AI Agent Factory backend (FastAPI).
 * No React state — call these from the AgentContext thunks or components.
 *
 * All calls go through the local /api/agent-factory/* proxy (route handler
 * injects the Bearer token). Uses the shared apiClient wrapper — do NOT
 * re-add auth headers here (AuthInterceptor + the proxy handle that).
 *
 * Graph mappers translate between the React Flow shape used on the canvas
 * ({ id, type, position, data }) and the backend graph shape
 * ({ nodes: [{ id, type, config }], connections: [{ source, target }] }).
 */
import { apiClient } from '../apiClient';

const BASE = '/api/agent-factory';

/** GET /models — registered LLMs with capability flags. Returns UI-ready models. */
export async function listModels(plantCode = null) {
    const data = await logged('GET', `${BASE}/models`, () => 
        apiClient.get(`${BASE}/models`, {
            params: plantCode ? { plant_code_id: plantCode } : {}
        })
    );
    return Array.isArray(data) ? data.map(normalizeModel) : [];
}

/** GET /tools — dynamically registered analytical tools. */
export async function listTools(plantCode = null) {
    const data = await logged('GET', `${BASE}/tools`, () => 
        apiClient.get(`${BASE}/tools`, {
            params: plantCode ? { plant_code_id: plantCode } : {}
        })
    );
    if (!Array.isArray(data)) return [];
    return data.map(t => ({
        name: t.name,
        label: t.name,
        desc: t.description || '',
        domain: t.domain,
        parameters: t.parameters,
        config_schema: t.config_schema,
    }));
}

/** GET /node-catalog — system nodes (llm/memory/prompt/output/datasource) + tools. */
export async function getNodeCatalog(plantCode = null) {
    const data = await logged('GET', `${BASE}/nodeCatalog`, () => 
        apiClient.get(`${BASE}/nodeCatalog`, {
            params: plantCode ? { plant_code_id: plantCode } : {}
        })
    );
    return Array.isArray(data) ? data : [];
}

/** GET /system/datasourceTypes — timeseries datastore types supported. */
export async function listDatasourceTypes(plantCode = null) {
    return logged('GET', `${BASE}/system/datasourceTypes`, () => 
        apiClient.get(`${BASE}/system/datasourceTypes`, {
            params: plantCode ? { plant_code_id: plantCode } : {}
        })
    );
}

/** GET /listAvailableFeatures — configuration panel features & sidebar sorting order. */
export async function listAvailableFeatures(plantCode = null) {
    return logged('GET', `${BASE}/listAvailableFeatures`, () => 
        apiClient.get(`${BASE}/listAvailableFeatures`, {
            params: plantCode ? { plant_code_id: plantCode } : {}
        })
    );
}

/** GET /memoryTypes — conversational history memory strategies supported. */
export async function memoryTypes(plantCode = null) {
    return logged('GET', `${BASE}/memoryTypes`, () => 
        apiClient.get(`${BASE}/memoryTypes`, {
            params: plantCode ? { plant_code_id: plantCode } : {}
        })
    );
}

/** GET /outputTypes — formatting response output schemas supported by agent nodes. */
export async function outputTypes(plantCode = null) {
    return logged('GET', `${BASE}/outputTypes`, () => 
        apiClient.get(`${BASE}/outputTypes`, {
            params: plantCode ? { plant_code_id: plantCode } : {}
        })
    );
}

// ── Graph mappers ────────────────────────────────────────────────────────────

const EDGE_STYLE = { animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } };

/** React Flow node -> backend graph node { id, type, config }. */
function nodeToBackend(n) {
    const { label, ...rest } = n.data || {};
    const config = { ...rest, position: n.position };
    if (n.type === 'llm' && rest.model_registry) config.model_name = rest.model_registry;
    if (n.type === 'tool') config.name = label;
    return { id: n.id, type: n.type, config };
}

/** Backend graph node -> React Flow node. */
function nodeFromBackend(bn) {
    const cfg = bn.config || {};
    const { position, model_name, name, ...rest } = cfg;
    const data = { ...rest };
    if (bn.type === 'llm' && !data.model_registry && model_name) data.model_registry = model_name;
    if (bn.type === 'tool' && !data.label && name) data.label = name;
    if (!data.label) data.label = String(bn.type || 'node').toUpperCase();
    return { id: bn.id, type: bn.type, position: position || { x: 0, y: 0 }, data };
}

function edgesToBackend(edges = []) {
    return edges.map(e => ({ id: e.id, source: e.source, target: e.target }));
}

function edgesFromBackend(connections = []) {
    return connections.map((c, i) => ({
        id: c.id || `e_${c.source}_${c.target}_${i}`,
        source: c.source,
        target: c.target,
        ...EDGE_STYLE,
    }));
}

/** Build the POST /agent-templates payload from canvas state. */
export function buildTemplatePayload({ templateId, name, description, nodes, edges }) {
    return {
        template_id: templateId,
        name,
        description,
        graph: {
            nodes: (nodes || []).map(nodeToBackend),
            connections: edgesToBackend(edges),
        },
    };
}

/** Parse a template's graph into React Flow { nodes, edges }. */
export function parseTemplateGraph(template) {
    const graph = template?.graph || {};
    return {
        nodes: (graph.nodes || []).map(nodeFromBackend),
        edges: edgesFromBackend(graph.connections),
    };
}

// ── Templates CRUD + deploy ───────────────────────────────────────────────────

/** GET /agentTemplates — list of saved visual templates. */
export async function listTemplates(params = {}, plantCode = null) {
    const queryParams = {
        ...params,
        ...(params?.plant_code_id || plantCode ? { plant_code_id: params?.plant_code_id || plantCode } : {}),
    };
    const data = await logged('GET', `${BASE}/agentTemplates`, () => 
        apiClient.get(`${BASE}/agentTemplates`, { params: queryParams })
    );
    return Array.isArray(data) ? data : [];
}

/** GET /agentTemplates/{id} — full node-link graph for one template. */
export async function getTemplate(id, params = {}, plantCode = null) {
    const queryParams = {
        ...params,
        ...(params?.plant_code_id || plantCode ? { plant_code_id: params?.plant_code_id || plantCode } : {}),
    };
    const ep = `${BASE}/agentTemplates/${encodeURIComponent(id)}`;
    return logged('GET', ep, () => apiClient.get(ep, { params: queryParams }));
}

/** POST /agentTemplates — create draft (validated server-side). */
export async function saveTemplate(payload, plantCode = null) {
    const body = {
        ...payload,
        ...(payload?.plant_code_id || plantCode ? { plant_code_id: payload?.plant_code_id || plantCode } : {}),
    };
    return logged('POST', `${BASE}/agentTemplates`, () => apiClient.post(`${BASE}/agentTemplates`, body));
}

/** PUT /agentTemplates/{id} — update draft template version for an existing ID. */
export async function updateTemplate(id, payload, plantCode = null) {
    const body = {
        ...payload,
        ...(payload?.plant_code_id || plantCode ? { plant_code_id: payload?.plant_code_id || plantCode } : {}),
    };
    const ep = `${BASE}/agentTemplates/${encodeURIComponent(id)}`;
    return logged('PUT', ep, () => apiClient.put(ep, body));
}

/** DELETE /agentTemplates/{id}. */
export async function deleteTemplate(id, params = {}, plantCode = null) {
    const queryParams = {
        ...params,
        ...(params?.plant_code_id || plantCode ? { plant_code_id: params?.plant_code_id || plantCode } : {}),
    };
    const ep = `${BASE}/agentTemplates/${encodeURIComponent(id)}`;
    return logged('DELETE', ep, () => apiClient.del(ep, { params: queryParams }));
}

/** POST /agentTemplates/{id}/deploy — compile graph into a runtime agent. Returns { agent_id }. */
export async function deployTemplate(id, payload = {}, plantCode = null) {
    const body = {
        ...(payload?.plant_code_id || plantCode ? { plant_code_id: payload?.plant_code_id || plantCode } : {}),
        status: 'draft',
        agent_id: id,
        ...payload
    };
    const ep = `${BASE}/agentTemplates/${encodeURIComponent(id)}/deploy`;
    return logged('POST', ep, () => apiClient.post(ep, body));
}

/** POST /agents/{id}/chat — send a query to a deployed agent. */
export async function chatWithAgent(agentId, query) {
    const ep = `${BASE}/agents/${encodeURIComponent(agentId)}/chat`;
    return logged('POST', ep, () => apiClient.post(ep, { query }));
}
