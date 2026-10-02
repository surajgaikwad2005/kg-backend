/**
 * globalVariableService.js
 * Model Studio Global Variable Service with Mock Fallback Data support.
 * - listGlobalVariables  (GET    /api/model-studio/global-variable/list-variables)
 * - viewGlobalVariable   (POST   /api/model-studio/global-variable/view-variable)
 * - saveGlobalVariable   (POST   /api/model-studio/global-variable/save-variable)
 * - updateGlobalVariable (PUT    /api/model-studio/global-variable/update-variable)
 * - deleteGlobalVariable (DELETE /api/model-studio/global-variable/delete-variable)
 */
import { apiClient } from '../../apiClient';

const BASE_PATH = '/api/model-studio/global-variable';



const parseId = (id) => {
    if (id === undefined || id === null) return '';
    const num = Number(id);
    return Number.isNaN(num) ? id : num;
};

/** List all global variables */
export async function listGlobalVariables(params = {}) {
    const defaultParams = { page_no: 1, page_size: 1000, ...params };
    const response = await apiClient.get(`${BASE_PATH}/list-variables`, { params: defaultParams });
    const list = response?.data?.workspaces ?? response?.data ?? response;
    return Array.isArray(list) ? list : [];
}

/** View single global variable details */
export async function viewGlobalVariable({ globalvar_id, var: varName, plant_code_id }) {
    const response = await apiClient.get(`${BASE_PATH}/view-variable`, {
        params: {
            globalvar_id: parseId(globalvar_id),
            plant_code_id,
        }
    });
    return response?.data ?? response;
}

/** Create a new global variable */
export async function saveGlobalVariable({ var: varName, value, description = '', created_by = 'User', plant_code_id }) {
    const payload = {
        var: String(varName || '').trim(),
        value: String(value ?? '').trim(),
        description: String(description || '').trim(),
        created_by: String(created_by || 'User').trim(),
        plant_code_id,
    };
    const response = await apiClient.post(`${BASE_PATH}/save-variable`, payload);
    return response?.data ? { ...payload, ...response.data } : response;
}

/** Modify an existing global variable record */
export async function updateGlobalVariable({ globalvar_id, var: varName, value, description = '', plant_code_id }) {
    const payload = {
        globalvar_id: parseId(globalvar_id),
        var: String(varName || '').trim(),
        value: String(value ?? '').trim(),
        description: String(description || '').trim(),
        plant_code_id,
    };
    const response = await apiClient.put(`${BASE_PATH}/update-variable`, payload);
    return response?.data ? { ...payload, ...response.data } : response;
}

/** Delete a global variable record */
export async function deleteGlobalVariable({ globalvar_id, var: varName, plant_code_id }) {
    const parsedId = parseId(globalvar_id);
    const targetParams = {
        globalvar_id: parsedId,
        plant_code_id,
        ...(varName ? { var: varName } : {}),
    };
    const response = await apiClient.del(`${BASE_PATH}/delete-variable`, {
        params: targetParams,
        data: targetParams,
    });
    return response;
}

