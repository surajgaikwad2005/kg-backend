/**
 * diagramService.js
 * Workflow-diagram (home/workflow-diagram) APIs — CPCP_CONFIGURATION backend via
 * /api/cpcp/configuration/pnid proxy (exports prefixed with `pnid*` / `getPnid*` /
 * `generatePnid*` / `listPnid*` for historical reasons) — component/folder catalog,
 * AI diagram persistence, batch generation jobs, and Detailed Equipment Summary for
 * the diagram builder. Refactored contract (2026-07-23): every endpoint is
 * plant-scoped — callers must pass `plantCode` (from useApp().plantCode) as the
 * first argument.
 *
 * The former DOMAIN_CONFIGURATION/VISUALS diagram group (listDiagrams, loadDiagram,
 * saveDiagram, deleteDiagram, pinDiagram, listEquipments) and its routes under
 * src/app/api/cpcp/configuration/diagram/ were removed (2026-07-24) — out of the
 * refactored CPCP Configuration contract (api-data/cpcp-configuration.json) and
 * unused by any remaining consumer (home dashboard's "Saved Workflow" widget,
 * SavedWorkflowFlow.jsx, already falls back to its mock diagram).
 *
 * The backend wraps every response in {success, message, data}; unwrap() strips
 * that envelope so callers keep working with the flat payload (same pattern as
 * timeseriesService.js/logsService.js/documentsService.js) — it's a no-op if a
 * response isn't actually wrapped. This file was missing that unwrap entirely
 * until 2026-07-31: every consumer (WorkflowContext's listPnidComponents catalog
 * build, useWorkflowCanvas's loadDiagram/confirmSave, useSidebarState's
 * fetchSidebarData/handleGenerate/handleBatchGenerate) was reading flat fields
 * (data.id, data.nodes, Array.isArray(data), ...) off the still-wrapped envelope,
 * so they always saw undefined/non-array and silently no-op'd — root cause of the
 * equipment palette never populating, loadDiagram always yielding an empty canvas,
 * and confirmSave never registering a successful save (diagramId never got set,
 * which also meant the auto-save effect's `if (!diagramId) return;` gate never
 * opened). Fixed by piping every real API call below through unwrap().
 *
 * ── Path params are REAL path segments (corrected 2026-07-31) ────────────────
 * Verified against the live backend's own OpenAPI schema (GET /openapi.json,
 * title "P&ID Validator API — Unified Storage") plus live request probes. An
 * earlier revision encoded diagram/job/component identifiers as QUERY params on
 * the strength of a doc's "path params" wording; the schema declares them
 * `"in": "path"`, and the query-param forms do not route at all:
 *     GET    /loadDiagram?diagramId=..     -> 404 {"detail":"Not Found"}
 *     GET    /loadDiagram/{diagramId}      -> 200 (route matches)
 *     DELETE /diagrams?diagram_id=..       -> 405 Method Not Allowed
 *     DELETE /diagrams/{diagramId}         -> 404 app-level "Diagram not found"
 *     GET    /generateJob?jobId=..         -> 404 {"detail":"Not Found"}
 *     GET    /generateJob/{jobId}          -> 404 app-level "Job not found"
 *     GET    /component?component_name=..  -> 404  /component/{name} -> 200
 *     POST   /diagram/pin                  -> 404  /diagrams/{id}/pin -> matches
 * A `{success:false,...}` body proves the route matched and the app rejected the
 * ID; a bare `{"detail":"Not Found"}` proves the route itself does not exist.
 *
 * Corrected in the same pass: the plant identifier is `plant_code_id` (snake_case)
 * on EVERY endpoint here. The camelCase `plantCodeId` previously sent on
 * deleteDiagram / componentsFromFolder / pin is not in the schema at all.
 */
import { apiClient } from '../../apiClient';

const CPCP_CONFIG = '/api/cpcp/configuration/pnid';

const unwrap = (res) => (res && typeof res === 'object' && 'data' in res && 'success' in res) ? res.data : res;

// ── CPCP_CONFIGURATION backend — Component & folder catalog ──────────────────

/**
 * GET /sidebarData — component list (no `code`) + saved-diagram list in one
 * round trip. No current UI consumer (2026-07-31): WorkflowContext was moved
 * to listPnidComponents() below per explicit user direction, so both the
 * equipment palette and canvas node visuals render real drawings immediately
 * instead of a placeholder-then-hydrate step. Kept for future use.
 * Unwrapped: `{ components: [{ name, description }], diagrams: [{ id, name }] }`.
 */
export const getPnidSidebarData = (plantCode) =>
    apiClient.get(`${CPCP_CONFIG}/sidebarData`, { params: { plant_code_id: plantCode } }).then(unwrap);

/**
 * GET /components — every component in the equipment database, each WITH its
 * `code` (SVG/TSX source). Ships every component's full source in one call —
 * the primary source for both the equipment palette (PaletteTab) and canvas
 * node visuals (EquipmentNode), per explicit user direction (2026-07-31).
 * Unwrapped: `[{ name, description, code }]`.
 */
export const listPnidComponents = (plantCode) =>
    apiClient.get(`${CPCP_CONFIG}/components`, { params: { plant_code_id: plantCode } }).then(unwrap);

/**
 * GET /component/{componentName} — a single component's generated code by
 * name. Still used by useSidebarState.js's handleGenerate to fetch a
 * just-generated component's drawing when POST /generate doesn't return it
 * inline.
 * Unwrapped: `{ name, description, code }`.
 */
export const getPnidComponent = (plantCode, componentName) =>
    apiClient.get(`${CPCP_CONFIG}/component/${encodeURIComponent(componentName)}`, {
        params: { plant_code_id: plantCode },
    }).then(unwrap);

/** GET /componentsFromFolder/{folder_name} — components extracted from a named storage folder. */
export const getPnidComponentsFromFolder = (plantCode, folderName) =>
    apiClient.get(`${CPCP_CONFIG}/componentsFromFolder/${encodeURIComponent(folderName)}`, {
        params: { plant_code_id: plantCode },
    }).then(unwrap);

/** GET /folders — list available component storage folders. Unwrapped: `{ folders: string[] }`. */
export const listPnidFolders = (plantCode) =>
    apiClient.get(`${CPCP_CONFIG}/folders`, { params: { plant_code_id: plantCode } }).then(unwrap);

/** GET /equipments — list all equipments known to the CPCP Configuration backend. */
export const listPnidEquipments = (plantCode) =>
    apiClient.get(`${CPCP_CONFIG}/equipments`, { params: { plant_code_id: plantCode } }).then(unwrap);

// ── CPCP_CONFIGURATION backend — Diagram persistence ──────────────────────────

/** GET /diagrams — saved diagrams with component summaries. Unwrapped: `{ diagrams: [...] }`. */
export const listPnidDiagrams = (plantCode) =>
    apiClient.get(`${CPCP_CONFIG}/diagrams`, { params: { plant_code_id: plantCode } }).then(unwrap);

/**
 * GET /loadDiagram/{diagramId} — load a saved diagram by ID.
 * Unwrapped: `{ id, name, nodes, edges }`.
 */
export const loadPnidDiagram = (plantCode, diagramId) =>
    apiClient.get(`${CPCP_CONFIG}/loadDiagram/${encodeURIComponent(diagramId)}`, {
        params: { plant_code_id: plantCode },
    }).then(unwrap);

/**
 * POST /saveDiagram — create or update a saved diagram (schema DiagramSaveRequest:
 * plant_code_id, name, nodes, edges required; an optional `id` turns it into an update).
 * @param {string|null} plantCode
 * @param {{ id?: string | null, name: string, nodes: any[], edges: any[] }} body
 */
export const savePnidDiagram = (plantCode, body) =>
    apiClient.post(`${CPCP_CONFIG}/saveDiagram`, { plant_code_id: plantCode, ...body }).then(unwrap);

/** DELETE /diagrams/{diagramId} — remove a saved diagram. */
export const deletePnidDiagram = (plantCode, diagramId) =>
    apiClient.del(`${CPCP_CONFIG}/diagrams/${encodeURIComponent(diagramId)}`, {
        params: { plant_code_id: plantCode },
    }).then(unwrap);

/**
 * POST /diagrams/{diagramId}/pin — set or clear a diagram's pinned (home dashboard) flag.
 *
 * `pin` is a query param; `plant_code_id` must travel as a FORM field, not JSON.
 * The schema declares the body as Body_pin_diagram_diagrams__diagramId__pin_post
 * (form-encoded), and a JSON body is rejected with
 * 400 `{"field":"plant_code_id","message":"Field required"}`. FormData is used
 * because apiClient streams it through untouched; the backend accepts multipart
 * and urlencoded interchangeably here (both live-verified).
 *
 * @param {string|null} plantCode
 * @param {string} diagramId
 * @param {boolean} pin — default true
 */
export const pinPnidDiagram = (plantCode, diagramId, pin = true) => {
    const form = new FormData();
    form.append('plant_code_id', plantCode ?? '');
    return apiClient
        .post(`${CPCP_CONFIG}/diagrams/${encodeURIComponent(diagramId)}/pin`, form, { params: { pin } })
        .then(unwrap);
};

// ── CPCP_CONFIGURATION backend — Generation ───────────────────────────────────

/**
 * POST /generate — AI-generate one or more components (schema EquipmentBatchRequest:
 * plant_code_id + items required, provider defaults to "google-gemini").
 * @param {string|null} plantCode
 * @param {{ items: {equipment:string, equipment_desc:string}[], provider?: string, model_name?: string }} body
 */
export const generateEquipment = (plantCode, body) =>
    apiClient.post(`${CPCP_CONFIG}/generate`, { plant_code_id: plantCode, ...body }).then(unwrap);

/**
 * POST /generateFromFile — batch-generate components from an uploaded sheet (multipart).
 * `plant_code_id` is a FORM field here (confirmed in the schema's
 * Body_generate_from_file_generateFromFile_post model), not a query param.
 */
export const generateFile = (plantCode, formData) => {
    formData.append('plant_code_id', plantCode ?? '');
    return apiClient.post(`${CPCP_CONFIG}/generateFromFile`, formData).then(unwrap);
};

/** GET /generateJob/{jobId} — status/progress of one batch-generation job. */
export const getGenerateJobStatus = (plantCode, jobId) =>
    apiClient.get(`${CPCP_CONFIG}/generateJob/${encodeURIComponent(jobId)}`, {
        params: { plant_code_id: plantCode },
    }).then(unwrap);

/** GET /generateJobs — list all batch-generation jobs. */
export const listGenerateJobs = (plantCode) =>
    apiClient.get(`${CPCP_CONFIG}/generateJobs`, { params: { plant_code_id: plantCode } }).then(unwrap);

// ── CPCP_CONFIGURATION backend — Detailed Equipment Summary ───────────────────

/**
 * GET /clients/detailedEquipmentSummary/status
 * Unwrapped: `{ generated, total_records?, last_modified? }`.
 */
export const getPnidDetailedEquipmentSummaryStatus = (plantCode) =>
    apiClient.get(`${CPCP_CONFIG}/clients/detailedEquipmentSummary/status`, {
        params: { plant_code_id: plantCode },
    }).then(unwrap);

/**
 * GET /clients/detailedEquipmentSummary/preview
 * Unwrapped: `[{ "equipment name", "equipment details" }]`.
 */
export const getPnidDetailedEquipmentSummaryPreview = (plantCode, page) =>
    apiClient.get(`${CPCP_CONFIG}/clients/detailedEquipmentSummary/preview`, {
        params: { page, plant_code_id: plantCode },
    }).then(unwrap);

/**
 * POST /clients/detailedEquipmentSummary/generate
 * Triggers generation and caching; streams keepalive characters, then a final
 * JSON line in the standard {success, message, data} envelope. Returns the raw
 * Response (for streaming consumers) — unwrap() can't apply to a stream, so the
 * caller parses the tail line itself and reads `.success` off it.
 * Body is EquipmentBatchRequest, identical in shape to POST /generate.
 * @param {string|null} plantCode
 * @param {{ items?: {equipment:string, equipment_desc:string}[], provider?: string }} opts
 */
export const generatePnidDetailedEquipmentSummaryRaw = (plantCode, { items = [], provider = 'google-gemini' } = {}) =>
    apiClient.raw(`${CPCP_CONFIG}/clients/detailedEquipmentSummary/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plant_code_id: plantCode, items, provider }),
    });

/** URL builder for embedding the summary file (download <a href> / <iframe> src). response_type=excel triggers the Excel export. */
export const getPnidDetailedEquipmentSummaryUrl = (plantCode, page) => {
    const params = new URLSearchParams({ plant_code_id: plantCode ?? '', response_type: 'excel' });
    if (page != null) params.set('page', page);
    return `${CPCP_CONFIG}/clients/detailedEquipmentSummary?${params.toString()}`;
};
