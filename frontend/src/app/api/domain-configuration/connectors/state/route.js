/**
 * /api/domain-configuration/connectors/state  →  <DOMAIN_CONFIGURATION>/connectors/state
 *
 * Lifecycle rollup for every connector of a plant (seven as of 2026-08-17:
 * pnid, documents, timeseries, sap, aif, gloc, lopc) — status, the seven
 * standard file counts, unprocessed-file accounting and lifecycle timestamps,
 * derived server-side from flow_state.
 *
 * This is the read that replaces the six localStorage keys the Data Source
 * Integration screen used to rebuild its tab strip from on reload
 * (admin_processed/validated/committed_sources, admin_processed_at,
 * admin_committed_at, and the type-level part of admin_configured_sources).
 * Its per-FILE counterpart is /api/domain-configuration/flow/state.
 *
 * Query params pass straight through: plant_code_id (required, Rule 0) and the
 * optional include_groups (defaults to false server-side — confirmed live).
 * See api-data/cdm-connectors-state.json for the full contract.
 */
import { createProxy } from "@/src/app/api/_lib/proxy";

export const { GET } = createProxy({
    backend: "DOMAIN_CONFIGURATION",
    path: "/connectors/state",
    methods: ["GET"],
});
