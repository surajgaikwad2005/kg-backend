/**
 * domain-configuration/documents/documentsService.js
 * Docs-domain CDM service layer — the document-type catalog and knowledge
 * graph. Document review/context (getDocsContext) and commit
 * (commitDocsContext) were removed (2026-08-13) — both now go through the
 * unified context router in domain-configuration/common/contextService.js
 * (getContext('documents', ...) / commitContext('documents', body)). Doc
 * upload/connect and pipeline run/job-status live in domain-configuration/
 * common instead (shared across sap/pnid/ts too, not docs-exclusive).
 * Row-level PATCH edits (patchDocsRows) were removed entirely (2026-07-20) —
 * zero consumers anywhere in the app.
 *
 * The refactored backend wraps every response in {success, message, data};
 * unwrap() strips that envelope so callers keep working with the flat
 * payload — it's a no-op if a given response isn't wrapped.
 *
 * Rule 0 (see CLAUDE.md "API & Proxy Architecture"): plant_code_id travels
 * only in the request body/query, never as a header.
 */
import { apiClient } from '../../apiClient';

const unwrap = (res) => (res && typeof res === 'object' && 'data' in res && 'success' in res) ? res.data : res;

/**
 * Knowledge graph extracted from the committed documents.
 * NOTE: verified live as taking no query parameters at all today (not even
 * plant_code).
 */
/**
 * Documents knowledge graph for a plant.
 *
 * fix: this accepted `plantCode` and then dropped it — the request went out with
 * no plant scoping at all, so every plant rendered whatever the backend returns
 * by default. Rule 0 requires the plant identifier on every plant-scoped call,
 * and without it this endpoint cannot be cached per plant either (the key would
 * claim a scoping the request does not have).
 */
export const getDocsKnowledgeGraph = (plantCode) =>
    apiClient.get('/api/domain-configuration/documents/knowledge-graph', {
        params: { plant_code_id: plantCode },
    });

/** Standard document-type catalog + default extraction fields for the upload modal. */
export const getDocumentTypes = (plantCode) =>
    apiClient.get('/api/domain-configuration/documents/document-types', { params: { plant_code_id: plantCode } }).then(unwrap);
