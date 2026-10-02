/**
 * function/functionService.js
 * Pure async functions for Model Studio's Custom Functions contract:
 * list, detail, run/test, save, update, delete.
 */
import { apiClient, ApiError } from '../../apiClient';

const P = '/api/model-studio/function';

/** List custom functions for a plant. */
export async function listFunctions(plant_code) {
    try {
        const json = await apiClient.get(`${P}/list-functions`, { params: { plant_code_id: plant_code } });
        if ((json.success || json.statusCode === 200) && Array.isArray(json.data)) return json.data;
        if (Array.isArray(json)) return json;
    } catch { /* fall through */ }
    return [];
}

/** Get custom function detail by ID. */
export async function getFunction(plant_code, functionId) {
    const json = await apiClient.get(`${P}/get-function/${functionId}`, { params: { plant_code_id: plant_code } });
    if (json.success || json.statusCode === 200) return json.data;
    throw new Error(json.message || 'Failed to load function detail');
}

/** Run/test custom function code. */
export async function runFunction(plant_code, { name, code, testInputs = {} }) {
    try {
        const json = await apiClient.post(`${P}/run-function`, {
            plant_code_id: plant_code,
            name,
            code,
            test_inputs: testInputs,
        });
        // Normalize the response: backend may return { success, data, message }
        // or the data directly. Ensure a consistent shape for the UI.
        if (json && typeof json === 'object') {
            return {
                success: json.success ?? json.data?.success ?? true,
                message: json.message || json.data?.message || 'Function executed successfully',
                data: json.data || json,
                output: json.output ?? json.data?.output,
            };
        }
        return json;
    } catch (err) {
        if (err instanceof ApiError && err.data) {
            // Backend returned an error response with structured data
            const errData = err.data;
            return {
                success: errData.success ?? false,
                message: errData.message || errData.detail || err.message || 'Execution error',
                data: errData.data || errData,
                output: errData.output ?? errData.data?.output,
            };
        }
        throw err;
    }
}

/** Save new custom function. */
export async function saveFunction(plant_code, { name, code, description = '', createdBy = 'User' }) {
    const json = await apiClient.post(`${P}/save-function`, {
        plant_code_id: plant_code,
        name,
        code,
        description,
        created_by: createdBy,
    });
    if (json.statusCode !== 200 && !json.success) throw new Error(json.message || 'Failed to save custom function');
    return json.data;
}

/** Update custom function by ID. */
export async function updateFunction(plant_code, functionId, { name, description, code }) {
    const json = await apiClient.put(`${P}/update-function`, {
        function_id: functionId,
        plant_code_id: plant_code,
        name,
        description,
        code,
    });
    if (json.statusCode !== 200 && !json.success) throw new Error(json.message || 'Failed to update custom function');
    return json.data;
}

/** Delete custom function by ID. */
export async function deleteFunction(plant_code, functionId) {
    const json = await apiClient.del(`${P}/delete-function`, {
        params: { 
            plant_code_id: plant_code,
            function_id: functionId
        }
    });
    if (json.statusCode !== 200 && !json.success) throw new Error(json.message || 'Failed to delete custom function');
    return json;
}

/** Update custom function deployment. */
export async function updateFunctionDeployment(plant_code, deploymentId, { cronSchedule, environment }) {
    const json = await apiClient.put(`${P}/update_deployment/${deploymentId}`, {
        deployment_id: Number(deploymentId),
        plant_code_id: plant_code,
        cron_schedule: cronSchedule,
        environment,
    });
    if (json.statusCode !== 200 && !json.success) {
        throw new Error(json.message || 'Failed to update custom function deployment');
    }
    return json;
}
