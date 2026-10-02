import { apiClient } from '@/src/services/apiClient';

const TEMPLATE_API = '/api/cpcp/v1/template';

const unwrap = (res) => (res && typeof res === 'object' && 'data' in res && 'success' in res) ? res.data : res;

/**
 * POST /cpcpv1/template/extractSubDiagram?plant_code_id={id}
 * Extracts a sub-diagram between two selected nodes.
 * @param {string} plantCode
 * @param {string} diagramId
 * @param {string[]} selectedNodeIds
 */
export const extractSubDiagram = (plantCode, diagramId, selectedNodeIds) =>
    apiClient.post(`${TEMPLATE_API}/extractSubDiagram`, {
        diagramId,
        selectedNodeIds,
    }, {
        params: { plant_code_id: plantCode },
    }).then(unwrap);

/**
 * POST /cpcpv1/template/saveDiagram
 * Saves the extracted sub-diagram (including edge relationships).
 * @param {string} plantCode
 * @param {object} diagramPayload
 */
export const saveCpcpDiagram = (plantCode, diagramPayload) =>
    apiClient.post(`${TEMPLATE_API}/saveDiagram`, {
        plant_code_id: plantCode,
        ...diagramPayload,
    }).then(unwrap);

/**
 * POST /cpcpv1/template/agentTracePath?plant_code_id={id}
 * Calls AI Agent to trace process line & extract intermediate components between start and end components.
 * @param {string} plantCode
 * @param {object} payload
 */
export const agentTracePath = (plantCode, payload) =>
    apiClient.post(`${TEMPLATE_API}/agentTracePath`, payload, {
        params: { plant_code_id: plantCode },
    }).then(unwrap);
