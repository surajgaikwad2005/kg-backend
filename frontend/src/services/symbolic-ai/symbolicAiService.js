/**
 * symbolicAiService.js
 * Symbolic-AI rule-base APIs (gateway /p1/symbolicAi/*) + the markdown generator
 * used to display rule tables. Every response is a JSON envelope:
 * { success, message, data: {...} }.
 *
 * The table identifier field is `dashboard_name` everywhere — sent as-is, no
 * client-side renaming. Response payloads are NOT uniform though:
 * listTables/deleteTable/updateDynamic return `dashboardName(s)`;
 * setColumns/removeColumns/addData/deleteData return no name field at all;
 * generateMarkdown/findSymboliAi return `tableName` — consume each response
 * key literally as documented per endpoint, don't assume one convention
 * app-wide.
 *
 * All functions accept an optional `plantCode` string, the plant scoping field —
 * body for plain-JSON POST calls, query param for GET/DELETE.
 */
import { apiClient } from '../apiClient';

// ── Table CRUD (JSON) ───────────────────────────────────────────────────────

/** @returns {Promise<{success: boolean, message: string, data: {dashboardNames: string[]}}>} */
export const listTables = (plantCode) =>
    apiClient.get('/api/symbolic-ai/list-tables', {
        params: { plant_code_id: plantCode },
    });

/**
 * `plant_code_id` is sent as a query param on this endpoint (not the body,
 * unlike every other symbolic-ai endpoint's plant code placement).
 * @returns {Promise<{success: boolean, message: string, data: {dashboardName: string, rowsDeleted: number}}>}
 */
export const deleteTable = (dashboardName, plantCode) =>
    apiClient.del('/api/symbolic-ai/delete-table', {
        params: { plant_code_id: plantCode },
        body: { dashboard_name: dashboardName },
    });

/**
 * @param {{ dashboard_name: string, columns: string[] }} body
 * @returns {Promise<{success: boolean, message: string, data: {addedColumns: string[], totalAdded: number}}>}
 */
export const setColumns = ({ dashboard_name, columns }, plantCode) =>
    apiClient.post('/api/symbolic-ai/set-columns', { dashboard_name, columns, plant_code_id: plantCode });

/**
 * @param {{ dashboard_name: string, columns: string[] }} body
 * @returns {Promise<{success: boolean, message: string, data: {removedColumns: string[], notFoundColumns: string[]}}>}
 */
export const removeColumns = ({ dashboard_name, columns }, plantCode) =>
    apiClient.post('/api/symbolic-ai/remove-columns', { dashboard_name, columns, plant_code_id: plantCode });

/**
 * @param {{ dashboard_name: string, rows: Array<Record<string, string>> }} body
 * @returns {Promise<{success: boolean, message: string, data: {rowsAdded: number}}>}
 */
export const addData = ({ dashboard_name, rows }, plantCode) =>
    apiClient.post('/api/symbolic-ai/add-data', { dashboard_name, rows, plant_code_id: plantCode });

/**
 * @param {{ dashboard_name: string, filters: Record<string, string> }} body
 * filters example: { col1: "val1", col2: "val2" }
 * @returns {Promise<{success: boolean, message: string, data: {rowsDeleted: number}}>}
 */
export const deleteData = ({ dashboard_name, filters }, plantCode) =>
    apiClient.post('/api/symbolic-ai/delete-data', { dashboard_name, filters, plant_code_id: plantCode });

/**
 * @param {{ dashboard_name: string, filters: Record<string, string>,
 *           update_column: string, update_value: string }} body
 * @returns {Promise<{success: boolean, message: string, data: {dashboardName: string,
 *   rowsUpdated: number, updatedColumns: string[]}}>}
 */
export const updateDynamic = ({ dashboard_name, filters, update_column, update_value }, plantCode) =>
    apiClient.post('/api/symbolic-ai/update-dynamic', {
        dashboard_name, filters, update_column, update_value, plant_code_id: plantCode,
    });

// ── Symbolic AI semantic search (JSON envelope) ──────────────────────────────

/**
 * @param {{ user_query: string, dashboard_name: string }} body
 * @returns {Promise<{success: boolean, message: string, data: {tableName: string,
 *   query: string, searchQuery: string, total: number, markdown: string}}>}
 */
export const sendChat = ({ user_query, dashboard_name }, plantCode) =>
    apiClient.post('/api/symbolic-ai/chat', { user_query, dashboard_name, plant_code_id: plantCode });

// ── Markdown generation (two flows on the same backend endpoint) ─────────────

/**
 * POST /generateMarkdown — INSERT flow: uploads a file (Excel/CSV/PDF) and
 * generates the hierarchical markdown/markmap for it. Multipart, file
 * required. For the file-less "regenerate an existing table's current view"
 * flow, use fetchMarkdown() instead (plain JSON, no multipart, no file part) —
 * this backend rejects an empty/placeholder file part rather than falling
 * back to DB data.
 * `dashboard_name` and `plant_code_id` are both sent in the multipart request
 * body (form fields on `formData`) — no query params.
 * @param {FormData} formData  fields: dashboard_name (string), file (File, required)
 * @returns {Promise<{success: boolean, message: string, data: {tableName: string, markdown: string}}>}
 */
export const generateMarkdown = (formData, plantCode) => {
    if (plantCode) formData.append('plant_code_id', plantCode);
    return apiClient.post('/api/symbolic-ai/generate-markdown', formData);
};

/**
 * POST /generateMarkdown — FETCH flow: no file, asks the backend to
 * (re)generate markdown from an EXISTING table's current DB data. Plain JSON:
 * { plant_code_id, dashboard_name }.
 * @returns {Promise<{success: boolean, message: string, data: {tableName: string, markdown: string}}>}
 */
export const fetchMarkdown = (dashboardName, plantCode) =>
    apiClient.post('/api/symbolic-ai/generate-markdown', { dashboard_name: dashboardName, plant_code_id: plantCode });

// ── Equipment column processing (multipart → JSON envelope) ─────────────────

/**
 * `plant_code_id` is sent in the multipart request body (a form field on
 * `formData`), alongside `dashboard_name` and `file`.
 * @param {FormData} formData  fields: dashboard_name (string), file (File)
 * @returns {Promise<{success: boolean, message: string, data: {tableName: string,
 *   columns: string[], rows: object[], dropdowns: Record<string, string[]>}}>}
 */
export const addEquipmentColumn = (formData, plantCode) => {
    if (plantCode) formData.append('plant_code_id', plantCode);
    return apiClient.post('/api/symbolic-ai/add-equipment-column', formData);
};
