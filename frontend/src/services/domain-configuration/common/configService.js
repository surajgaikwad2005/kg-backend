/**
 * domain-configuration/common/configService.js
 * CDM Configuration APIs — SAP tables, column renames, and user config.
 *
 * The document-type catalog (getDocumentTypes) moved to
 * domain-configuration/documents/documentsService.js — it's docs-exclusive,
 * unlike everything else in this file. The read-only "frozen" CDM catalog
 * endpoints (cdm/entities/schema/relationships/validation/industries) were
 * removed entirely (2026-07-20) — zero consumers anywhere in the app.
 *
 * Spec: Configuration router — real backend paths are /configRouter/* (not
 * /api/config/*), and camelCase for multi-word segments (sapTables,
 * columnRenames, userConfig, documentTypes). Local paths now live under
 * /api/domain-configuration/{sap,config}/* — see
 * src/app/api/domain-configuration/{sap,config}/. Verified live against
 * refactored_apis_data/Domain_Configuration/Configuration/*.md.
 *
 * Plant registry CRUD (list/create/delete/purge-preview a plant itself) lives
 * in src/services/plant-id/plantCodeIdService.js — it moved off the generic
 * next.config.js CDM rewrite onto its own dedicated /api/plant-id proxy
 * (see backends.js PLANT_CODE_ID), since the refactored plants contract needs
 * a gateway prefix the rest of this domain doesn't (yet) carry.
 *
 * Rule 0 (see CLAUDE.md "API & Proxy Architecture"): every function takes an
 * optional trailing `plantCode` and sends it as `plant_code_id` (params/body)
 * whenever the caller has one available. There is no custom header involved;
 * plant_code_id travels only in the request body/query. Confirmed live: this
 * configRouter family renamed `plant_code` → `plant_code_id` (matches
 * documentsService.js's getDocumentTypes on the sibling document-types
 * endpoint, and the live 400 on PATCH user-config naming plant_code_id).
 */
import { apiClient } from '../../apiClient';

/**
 * Register a new SAP table definition (AddSapTableRequest).
 * @param {{ table_name: string, label: string, source_key: string,
 *           columns: Array<{ sap_field: string, canonical_name: string }>,
 *           group?: string, key_fields?: string[] }} payload
 * @param {string} [plantCode]
 */
export const addSapTable = (payload, plantCode) =>
    apiClient.post('/api/domain-configuration/sap/tables', { plant_code_id: plantCode, ...payload });

/**
 * Replace the rename mappings for a source key (UpdateColumnRenamesRequest).
 * @param {string} sourceKey
 * @param {Record<string,string>} mappings  SAP field → canonical name
 * @param {string} [plantCode]
 */
export const updateColumnRenames = (sourceKey, mappings, plantCode) =>
    apiClient.put(`/api/domain-configuration/sap/column-renames/${encodeURIComponent(sourceKey)}`, { plant_code_id: plantCode, mappings });

/** Patch (deep-merge) a slice of the user config. `plant_code_id` is required by the backend. */
export const updateUserConfig = (patch, plantCode) =>
    apiClient.patch('/api/domain-configuration/config/user-config', { plant_code_id: plantCode, ...patch });
