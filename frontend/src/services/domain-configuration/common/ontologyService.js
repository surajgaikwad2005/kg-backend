/**
 * domain-configuration/common/ontologyService.js
 * Knowledge-graph ontology — populate the KG from the CDM PostgreSQL.
 * export/schema/use-cases were removed entirely (2026-07-20) — zero
 * consumers anywhere in the app.
 *
 * Spec: Ontology router — real backend path /ontology/*. Local path is
 * /api/domain-configuration/ontology/populate — see
 * src/app/api/domain-configuration/ontology/. Verified against
 * docs/api/cdm-openapi.json.
 */
import { apiClient } from '../../apiClient';

/**
 * Populate the knowledge graph from the CDM tables.
 * @param {{ use_case?: string, plant_code?: string }} [body]  OntologyExportRequest
 */
export const populateOntology = (body = {}) =>
    apiClient.post('/api/domain-configuration/ontology/populate', body);
