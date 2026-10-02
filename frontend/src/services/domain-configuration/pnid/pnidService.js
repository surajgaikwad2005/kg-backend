/**
 * pnidService.js
 * Every browser-side call to the P&ID Validator backend for the Domain
 * Configuration workspace feature, routed through the local
 * `/api/domain-configuration/pnid-workspace/*` proxy (backend: PNID_WORKSPACE).
 * Components/hooks import these functions — they never call fetch/axios
 * directly and never know the real backend URL.
 *
 * Plant-scoped: every function takes `plantCode` as its first argument,
 * sourced by the caller from useApp().plantCode (never read from context in
 * here — services stay pure). There is no more per-feature "workspace"/
 * "client name" concept — one implicit workspace per globally-selected
 * plant, same model as workflow-diagram's diagramService.js.
 *
 * Grouped by feature area to match the refactored API doc: Core, Clients
 * (files/images/pdf), Analysis (OCR → Extract → Compare), Template Matching,
 * Knowledge Graph, Chatbot, and Validate/highlight/export.
 *
 * Response envelope: almost every endpoint wraps its real payload as
 * { success, message, data }, so every JSON-returning call below unwraps
 * `.data` before resolving (see `unwrap`). Two confirmed exceptions per the
 * doc's own response samples do NOT use this envelope and must stay
 * unwrapped-as-is: saveHighlightOptions (POST .../highlightOptions returns
 * {status, source, message}, no `data`/`success` keys) and validateConnection
 * (returns {valid, source, message, from_tag, ...} flat, no envelope either).
 * URL-builder functions (fileUrl, exportExcelUrl, ...) and getFileArrayBuffer
 * (raw bytes via apiClient.raw) never touch JSON at all, so they're
 * unaffected either way.
 *
 * The workflow-diagram (home/workflow-diagram) and CPCP assessment-matrix
 * (admin/cpcp) features own their own, unrelated backend calls in
 * src/services/cpcp/diagram/diagramService.js and
 * src/services/cpcp/cpcpService.js respectively — see
 * api/cpcp-configuration/pnid and api/cpcp. Neither is touched here.
 */
import { apiClient, ApiError } from '../../apiClient';

const BASE = '/api/domain-configuration/pnid-workspace';
const enc = encodeURIComponent;

/** Unwraps this backend's {success, message, data} envelope down to the real payload. */
const unwrap = (promise) =>
    promise.then((res) => {
        if (res && typeof res === 'object' && res.success === false) {
            throw new ApiError(res.message || 'Request failed', { status: 200, data: res });
        }
        return res?.data !== undefined ? res.data : res;
    });

export const pnidService = {
    // ── Core ───────────────────────────────────────────────────────────────────
    health(plantCode) {
        return unwrap(apiClient.get(`${BASE}/health`, { params: { plantCodeId: plantCode } }));
    },
    /** List every client/plant known to the backend, with pipeline status flags. No required filter — used for admin cross-plant listings, not for scoping the current plant's own data. */
    listClients(plantCode) {
        return unwrap(apiClient.get(`${BASE}/clients`, { params: plantCode ? { plant_code_id: plantCode } : undefined }));
    },
    /** Permanently clears this plant's P&ID workspace (files + processing state) on the backend. */
    deleteClient(plantCode) {
        return unwrap(apiClient.del(`${BASE}/clients`, { params: { plant_code_id: plantCode } }));
    },
    /** `extractedOnly` is opt-in — omitted by default so existing callers (manage-files pipeline) keep seeing every status, not just fully-extracted files. */
    checkExtractionFiles(plantCode, { extractedOnly, signal } = {}) {
        return unwrap(apiClient.get(`${BASE}/clients/checkExtractionFiles`, {
            params: { plant_code_id: plantCode, extracted_only: extractedOnly },
            signal,
        }));
    },
    /** Raw storage folder names (no status). `plantCode` optional — kept param-less by default for admin/cpcp's cross-plant switcher dropdown. */
    getDataFolders(plantCode) {
        return unwrap(apiClient.get(`${BASE}/dataFolders`, { params: plantCode ? { plant_code_id: plantCode } : undefined }));
    },
    /** Lower-level raw-folder delete (distinct from deleteClient — see migration notes in api-data/domain-configuration-pnid-workspace.json). */
    deleteDataFolder(plantCode, folderName) {
        return unwrap(apiClient.del(`${BASE}/dataFolders/${enc(folderName)}`, { params: { plantCodeId: plantCode } }));
    },

    // ── Clients: files, images, pdf ──────────────────────────────────────────────
    getEquipmentList(plantCode, { page = 1, limit = 100 } = {}) {
        return unwrap(apiClient.get(`${BASE}/clients/equipment`, { params: { plant_code_id: plantCode, page, limit } }));
    },
    getExtractionData(plantCode) {
        return unwrap(apiClient.get(`${BASE}/clients/extractionData`, { params: { plant_code_id: plantCode } }));
    },
    getExtractionFileInfo(plantCode) {
        return unwrap(apiClient.get(`${BASE}/clients/extractionFile`, { params: { plant_code_id: plantCode } }));
    },
    /** `signal` lets TanStack Query abort this in flight (e.g. the user switched plant mid-request). */
    getClientFiles(plantCode, { signal } = {}) {
        return unwrap(apiClient.get(`${BASE}/clients/files`, { params: { plant_code_id: plantCode }, signal }));
    },
    deleteClientFile(plantCode, category, filename) {
        return unwrap(apiClient.del(`${BASE}/clients/${enc(plantCode)}/files/${enc(category)}/${enc(filename)}`, {
            params: { plantCodeId: plantCode },
        }));
    },
    /**
     * Proxy URL for a single preprocessed page image (for <img src>).
     * Live-confirmed 2026-07-28: page_name+doc_type+plantCodeId alone 400'd —
     * fixed by adding plant_code_id (snake_case, confirmed required on every
     * other endpoint in this domain; plantCodeId kept alongside defensively,
     * same pattern as uploadWorkspaceFiles). Also tried adding pdf_name (per
     * the user's own backend route mapping) but that 404'd with "File not
     * found", even though the identical pdf_name value/encoding succeeds on
     * getHighlightOptions — see api-data notes (likely: '&' in the PDF name
     * isn't filesystem-safe, so image lookup's real folder path differs from
     * the raw filename, while highlightOptions' lookup doesn't hit disk the
     * same way). Reverted to the original tested combo — no pdf_name.
     */
    clientImageUrl(plantCode, { pageName, docType, path, pdfName }) {
        let url = `${BASE}/clients/image?page_name=${enc(pageName || '')}&doc_type=${enc(docType || 'pnid')}&plant_code_id=${enc(plantCode)}&plantCodeId=${enc(plantCode)}`;
        if (path) url += `&path=${enc(path)}`;
        if (pdfName) url += `&pdf_name=${enc(pdfName)}`;
        return url;
    },
    /**
     * Raw bytes for a single preprocessed page image (canvas rendering) — same
     * params as clientImageUrl. apiClient.raw() never checks res.ok (callers
     * that need the raw Response decide for themselves) — an error response
     * body would otherwise silently get treated as image bytes and fail as an
     * opaque "can't decode" error instead of surfacing the real cause.
     */
    async getClientImageArrayBuffer(plantCode, { pageName, docType, path, pdfName }) {
        const res = await apiClient.raw(this.clientImageUrl(plantCode, { pageName, docType, path, pdfName }));
        if (!res.ok) {
            let data = null;
            try { data = await res.json(); } catch { /* not JSON */ }
            throw new ApiError(data?.message || data?.error || `Failed to load image: ${res.status} ${res.statusText}`, { status: res.status, data });
        }
        return res.arrayBuffer();
    },
    getImagesList(plantCode, docType) {
        return unwrap(apiClient.get(`${BASE}/clients/imagesList`, { params: { doc_type: docType, plant_code_id: plantCode } }));
    },
    /** Proxy URL for streaming the uploaded PDF (for <iframe>/<a href>). */
    clientPdfUrl(plantCode, docType) {
        return `${BASE}/clients/pdf?doc_type=${enc(docType)}&plant_code_id=${enc(plantCode)}`;
    },
    /** Generic file delete by backend-relative path (distinct from the category/filename-scoped deleteClientFile above). */
    deleteFile(plantCode, path) {
        return unwrap(apiClient.del(`${BASE}/deleteFile`, { params: { path, plant_code_id: plantCode } }));
    },
    /** Proxy URL for streaming any backend file by its relative path (raw bytes, never JSON — unaffected by the envelope). */
    fileUrl(plantCode, path, { bust = false } = {}) {
        const v = bust ? `&v=${Date.now()}` : '';
        return `${BASE}/getFile?path=${enc(path)}&plant_code_id=${enc(plantCode)}${v}`;
    },
    /**
     * Raw file bytes (used for client-side xlsx parsing + PDF page counting).
     *
     * apiClient.raw() never checks res.ok — callers that need the raw Response
     * decide for themselves — so this must check it explicitly, exactly as
     * getClientImageArrayBuffer above does. Without it a 404/500 JSON body is
     * handed back as "file bytes": countPdfPages finds no /Type /Page and
     * returns its fallback of 1, so a failed download becomes a confident
     * "1 page" badge that is indistinguishable from a real one-page PDF, and
     * (being a resolved value, not a rejection) gets cached rather than retried.
     */
    async getFileArrayBuffer(plantCode, path, { bust = false, signal } = {}) {
        const res = await apiClient.raw(this.fileUrl(plantCode, path, { bust }), { signal });
        if (!res.ok) {
            let data = null;
            try { data = await res.json(); } catch { /* not JSON */ }
            throw new ApiError(data?.message || data?.error || `Failed to load file: ${res.status} ${res.statusText}`, { status: res.status, data });
        }
        return res.arrayBuffer();
    },
    getPdfInfo(plantCode, path) {
        return unwrap(apiClient.get(`${BASE}/pdf/info`, { params: { path, plant_code_id: plantCode } }));
    },
    deletePdfPage(plantCode, path, page) {
        console.log('[pnidService] deletePdfPage calling DELETE /pdf/page. plantCode:', plantCode, 'path:', path, 'page (0-indexed):', page);
        return unwrap(apiClient.del(`${BASE}/pdf/page`, { params: { path, page, plant_code_id: plantCode } }));
    },
    /** Multi-page delete variant: sends 0-indexed comma-separated page list under query key `pages` (e.g. pages=0,1,2,3,4) */
    deletePdfPages(plantCode, path, pages) {
        const pageList = Array.isArray(pages) ? pages.join(',') : pages;
        console.log('[pnidService] deletePdfPages calling DELETE /pdf/pages. plantCode:', plantCode, 'path:', path, 'raw pages:', pages, 'formatted pageList:', pageList);
        return unwrap(apiClient.del(`${BASE}/pdf/pages`, {
            params: { path, pages: pageList, page: pageList, plant_code_id: plantCode },
        }));
    },
    /**
     * `formData` must already contain the pnid_files/pfd_files/linelist_files/other_files fields — this only injects the plant identity fields.
     * Live backend rejects the doc's documented `plantCodeId` field name with
     * "plant_code_id: Field required" (confirmed 2026-07-24) — sending
     * `plant_code_id` as the real field, `plantCodeId` kept alongside in case
     * some deployments still read it.
     */
    uploadWorkspaceFiles(plantCode, formData) {
        formData.append('plant_code_id', plantCode);
        formData.append('plantCodeId', plantCode);
        formData.append('client_name', plantCode);
        return unwrap(apiClient.post(`${BASE}/upload`, formData));
    },
    viewExcel(plantCode, path) {
        return unwrap(apiClient.get(`${BASE}/viewExcel`, { params: { path, plant_code_id: plantCode } }));
    },

    // ── Analysis: OCR → Extract → Compare pipeline ───────────────────────────────
    compareAndClean(plantCode, { ocrExcelFilename, linelistFilename, documentPath } = {}) {
        return unwrap(apiClient.post(`${BASE}/compareAndClean`, {
            plant_code_id: plantCode,
            plantCodeId: plantCode,
            client_name: plantCode,
            ocr_excel_filename: ocrExcelFilename,
            linelist_filename: linelistFilename,
            document_path: documentPath,
        }));
    },
    /** Doc's sample nests the job_id under `data.results.job_id`, not `data.job_id` — resolves to `{workspaceName, results: {message, job_id, poll_url}}` after the envelope unwrap. Callers must read `.results.job_id`. */
    startExtract(plantCode, provider) {
        return unwrap(apiClient.post(`${BASE}/extract`, { plant_code_id: plantCode, provider }));
    },
    getExtractStatus(plantCode, jobId) {
        return unwrap(apiClient.get(`${BASE}/extractStatus/${enc(jobId)}`, {
            params: { plant_code_id: plantCode },
        }));
    },
    /**
     * `pfdSelectedFiles`/`usableArea` (crop box) kept for parity with the pre-refactor contract — the new doc omits them, unconfirmed whether the backend still honors them. See api-data notes.
     * `usableArea` is taken as a plain [x1, y1, x2, y2] array and serialized here:
     * the backend validates `usable_area` as a STRING (live 400: "Input should be a
     * valid string"), matching the pre-refactor FormData contract which appended
     * JSON.stringify([x1,y1,x2,y2]). Omitted entirely when no crop box was drawn.
     * Same `data.results.job_id` nesting as startExtract — callers must read `.results.job_id`.
     */
    startOcr(plantCode, { pnidSelectedFiles, pfdSelectedFiles, usableArea } = {}) {
        return unwrap(apiClient.post(`${BASE}/ocrProcess`, {
            plant_code_id: plantCode,
            pnid_selected_files: pnidSelectedFiles,
            pfd_selected_files: pfdSelectedFiles,
            ...(usableArea ? { usable_area: JSON.stringify(usableArea) } : {}),
        }));
    },
    getOcrStatus(plantCode, jobId) {
        return unwrap(apiClient.get(`${BASE}/ocrStatus/${enc(jobId)}`, {
            params: { plant_code_id: plantCode },
        }));
    },
    /** Doc's sample nests images/images_folder under `data.results`, not `data` directly — callers must read `.results.images`/`.results.images_folder`. */
    convertPdfPreview(plantCode, { docType, filename }) {
        return unwrap(apiClient.post(`${BASE}/pdf/convertPreview`, { plant_code_id: plantCode, doc_type: docType, filename }));
    },

    // ── Template Matching (Ontology Generator) ───────────────────────────────────
    getTemplateMatchLibrary(plantCode) {
        return unwrap(apiClient.get(`${BASE}/clients/templateMatchLibrary`, { params: { plant_code_id: plantCode } }));
    },
    saveTemplateMatchLibrary(plantCode, library) {
        return unwrap(apiClient.post(`${BASE}/clients/templateMatchLibrary`, { plant_code_id: plantCode, ...library }));
    },
    /** `formData` must already contain the match-mode fields (threshold, crop fields, template_file, saved_template_category, symbol_category, ...) — this only injects the plant identity fields. */
    runTemplateMatch(plantCode, formData) {
        formData.append('plant_code_id', plantCode);
        formData.append('plantCodeId', plantCode);
        formData.append('client_name', plantCode);
        return unwrap(apiClient.post(`${BASE}/templateMatch`, formData));
    },
    extractTextByBox(plantCode, { pdfFilename, pageNo, bboxJson }) {
        return unwrap(apiClient.get(`${BASE}/clients/extractTextByBox`, {
            params: { plant_code_id: plantCode, client_name: plantCode, pdf_filename: pdfFilename, page_no: pageNo, bbox_json: bboxJson, plantCodeId: plantCode },
        }));
    },
    /** Download URL for the template-match Excel report. */
    exportTemplateMatchesUrl(plantCode) {
        return `${BASE}/clients/exportTemplateMatches?plant_code_id=${enc(plantCode)}&client_name=${enc(plantCode)}&plantCodeId=${enc(plantCode)}`;
    },

    // ── Knowledge Graph (new — no current UI consumer) ───────────────────────────
    getKgData(plantCode, pdfName) {
        return unwrap(apiClient.get(`${BASE}/kg_data`, { params: { plant_code_id: plantCode, pdf_name: pdfName } }));
    },
    updateKgData(plantCode, { action, sheet, tag, properties } = {}) {
        return unwrap(apiClient.post(`${BASE}/kg_data/${enc(plantCode)}/update`, {
            plant_code_id: plantCode,
            action,
            sheet,
            tag,
            properties,
        }));
    },

    // ── Chatbot (new — no current UI consumer) ───────────────────────────────────
    /** Doc's GET example body-shape looks copy-pasted from the POST row — implemented as a status poll by task_id, unconfirmed. See api-data notes. */
    checkChatbotStatus(plantCode, taskId) {
        return unwrap(apiClient.get(`${BASE}/chatbot/chat`, { params: { plant_code_id: plantCode, task_id: taskId } }));
    },
    askChatbot(plantCode, { question, pdfName }) {
        return unwrap(apiClient.post(`${BASE}/chatbot/chat`, { plant_code_id: plantCode, question, pdf_name: pdfName }));
    },

    // ── Validate connections (Ontology Generator) ────────────────────────────────
    checkExcelExists(plantCode) {
        return unwrap(apiClient.get(`${BASE}/clients/${enc(plantCode)}/excelExists`, { params: { plant_code_id: plantCode } }));
    },
    /** Download URL for the final validated Excel workbook. */
    exportExcelUrl(plantCode) {
        return `${BASE}/clients/${enc(plantCode)}/exportExcel?plantCodeId=${enc(plantCode)}`;
    },
    getFinalCsvUrl(plantCode, type = 'combined') {
        return `${BASE}/clients/${enc(plantCode)}/finalCsv?type=${enc(type)}&plant_code_id=${enc(plantCode)}`;
    },
    /** Flat path, no client_name segment — confirmed 2026-07-28 by user-supplied backend route mapping (diagrams.py). */
    getHighlightOptions(plantCode, pdfName) {
        return unwrap(apiClient.get(`${BASE}/clients/highlightOptions`, {
            params: { plant_code_id: plantCode, pdf_name: pdfName },
        }));
    },
    /**
     * Flat path, no client_name segment — confirmed 2026-07-28 by user-supplied
     * backend route mapping (diagrams.py). CONFIRMED (per doc sample) this
     * endpoint does NOT use the {success,message,data} envelope — it returns
     * {status, source, message} flat. Do not unwrap.
     */
    saveHighlightOptions(plantCode, connections, pdfName) {
        return apiClient.post(`${BASE}/clients/highlightOptions`, {
            plant_code_id: plantCode,
            connections,
            pdf_name: pdfName,
        });
    },
    /** Draws FROM/TO boxes on the P&ID image server-side and returns the rendered PNG's path (distinct from the JSON bbox variant below). */
    highlightComponentsImage(plantCode, payload) {
        return unwrap(apiClient.post(`${BASE}/highlight-components`, { plant_code_id: plantCode, ...payload }));
    },
    /** JSON bbox/path fallback — used to draw highlights client-side on canvas. */
    highlightComponents(plantCode, payload) {
        return unwrap(apiClient.post(`${BASE}/highlightComponents/json`, { plant_code_id: plantCode, ...payload }));
    },
    highlightTag(plantCode, payload) {
        return unwrap(apiClient.post(`${BASE}/highlightTagsCpcp`, { plant_code_id: plantCode, ...payload }));
    },
    /** CONFIRMED (per doc sample) this endpoint does NOT use the {success,message,data} envelope either — it returns {valid, source, message, from_tag, to_tag, page_no, from_bbox, to_bbox} flat. Do not unwrap. */
    validateConnection(plantCode, payload) {
        return apiClient.post(`${BASE}/validateConnection`, { plant_code_id: plantCode, ...payload });
    },
};
