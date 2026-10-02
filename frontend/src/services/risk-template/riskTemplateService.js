/**
 * riskTemplateService.js
 * Risk Template rule-base / knowledge APIs + markdown generator.
 * Every response returns a standard JSON envelope: { success, message, data: {...} }.
 *
 * All functions accept an optional `plantCode` string for plant scoping:
 * - body for plain-JSON POST calls
 * - query params for GET/DELETE calls
 * - form field for FormData / multipart calls
 */
import { apiClient } from '../apiClient';

// ── Template CRUD (JSON) ──────────────────────────────────────────────────

/** @returns {Promise<{success: boolean, message: string, data: {templateNames?: string[], dashboardNames?: string[]}}>} */
export const listTemplates = (plantCode) =>
    apiClient.get('/api/risk-template/list-templates', {
        params: { plant_code_id: plantCode },
    });

/**
 * Delete a risk template
 * @param {string} templateName
 * @param {string} plantCode
 * @returns {Promise<{success: boolean, message: string, data: {templateName?: string, dashboardName?: string, rowsDeleted?: number}}>}
 */
export const deleteTemplate = (templateName, plantCode) =>
    apiClient.del('/api/risk-template/delete-template', {
        params: { plant_code_id: plantCode },
        body: { template_name: templateName, dashboard_name: templateName },
    });

/**
 * Set columns for a template
 * @param {{ template_name: string, columns: string[] }} body
 * @param {string} plantCode
 * @returns {Promise<{success: boolean, message: string, data: {addedColumns: string[], totalAdded: number}}>}
 */
export const setColumns = ({ template_name, columns }, plantCode) =>
    apiClient.post('/api/risk-template/set-columns', {
        template_name,
        dashboard_name: template_name,
        columns,
        plant_code_id: plantCode,
    });

/**
 * Remove columns from a template
 * @param {{ template_name: string, columns: string[] }} body
 * @param {string} plantCode
 * @returns {Promise<{success: boolean, message: string, data: {removedColumns: string[], notFoundColumns: string[]}}>}
 */
export const removeColumns = ({ template_name, columns }, plantCode) =>
    apiClient.post('/api/risk-template/remove-columns', {
        template_name,
        dashboard_name: template_name,
        columns,
        plant_code_id: plantCode,
    });

/**
 * Add rows to a template
 * @param {{ template_name: string, rows: Array<Record<string, string>> }} body
 * @param {string} plantCode
 * @returns {Promise<{success: boolean, message: string, data: {rowsAdded: number}}>}
 */
export const addData = ({ template_name, rows }, plantCode) =>
    apiClient.post('/api/risk-template/add-data', {
        template_name,
        dashboard_name: template_name,
        rows,
        plant_code_id: plantCode,
    });

/**
 * Delete rows matching filters
 * @param {{ template_name: string, filters: Record<string, string> }} body
 * @param {string} plantCode
 * @returns {Promise<{success: boolean, message: string, data: {rowsDeleted: number}}>}
 */
export const deleteData = ({ template_name, filters }, plantCode) =>
    apiClient.post('/api/risk-template/delete-data', {
        template_name,
        dashboard_name: template_name,
        filters,
        plant_code_id: plantCode,
    });

/**
 * Update rows dynamically
 * @param {{ template_name: string, filters: Record<string, string>, update_column: string, update_value: string }} body
 * @param {string} plantCode
 * @returns {Promise<{success: boolean, message: string, data: {templateName?: string, dashboardName?: string, rowsUpdated?: number}}>}
 */
export const updateDynamic = ({ template_name, filters, update_column, update_value }, plantCode) =>
    apiClient.post('/api/risk-template/update-dynamic', {
        template_name,
        dashboard_name: template_name,
        filters,
        update_column,
        update_value,
        plant_code_id: plantCode,
    });

// ── Risk Template AI Chat (JSON envelope) ──────────────────────────────────

/**
 * Natural language search / chatbot query for Risk Template
 * @param {{ user_query: string, template_name: string }} body
 * @param {string} plantCode
 * @returns {Promise<{success: boolean, message: string, data: {templateName?: string, tableName?: string, query: string, markdown: string}}>}
 */
export const sendChat = ({ user_query, template_name }, plantCode) =>
    apiClient.post('/api/risk-template/chat', {
        user_query,
        template_name,
        dashboard_name: template_name,
        plant_code_id: plantCode,
    });

// ── Markdown generation ────────────────────────────────────────────────────

/**
 * Generate markdown from an uploaded file (Excel/CSV/PDF)
 * @param {FormData} formData
 * @param {string} plantCode
 * @returns {Promise<{success: boolean, message: string, data: {templateName?: string, tableName?: string, markdown: string}}>}
 */
export const generateMarkdown = (formData, plantCode) => {
    if (plantCode) formData.append('plant_code_id', plantCode);
    return apiClient.post('/api/risk-template/generate-markdown', formData);
};

/**
 * Fetch existing template's markdown from DB
 * @param {string} templateName
 * @param {string} plantCode
 * @returns {Promise<{success: boolean, message: string, data: {templateName?: string, tableName?: string, markdown: string}}>}
 */
export const fetchMarkdown = (templateName, plantCode) =>
    apiClient.post('/api/risk-template/generate-markdown', {
        template_name: templateName,
        dashboard_name: templateName,
        plant_code_id: plantCode,
    });

// ── Equipment column processing (multipart → JSON envelope) ────────────────

/**
 * Ingest file to inspect and configure equipment columns
 * @param {FormData} formData
 * @param {string} plantCode
 * @returns {Promise<{success: boolean, message: string, data: {tableName?: string, columns: string[], rows: object[], dropdowns: Record<string, string[]>}}>}
 */
export const addEquipmentColumn = (formData, plantCode) => {
    if (plantCode) formData.append('plant_code_id', plantCode);
    return apiClient.post('/api/risk-template/add-equipment-column', formData);
};
