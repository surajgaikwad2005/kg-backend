/**
 * /api/domain-configuration/flow/state  →  <DOMAIN_CONFIGURATION>/flow/state
 *
 * One row per FILE for a plant's flow — file_name, stage/status, batch and job
 * ids, row counts, labels and lifecycle timestamps. The per-file counterpart of
 * /api/domain-configuration/connectors/state (which is a rollup of this same
 * flow_state table, so the two can never disagree).
 *
 * `flow` is the FLOW name, not the connector name — connector `documents` is
 * flow `docs`, and connector `timeseries` owns TWO flows (`ts` + `ts_values`).
 * connectors/state's own `flow`/`flows` fields are the join key; the frontend
 * mapping lives in src/components/admin/connectorState.js.
 *
 * Query params pass straight through: plant_code_id (required, Rule 0), flow,
 * and the optional status/page/page_size filters. See
 * api-data/cdm-flow-state.json for the full contract and its open questions
 * (notably: whether `flow` is required is still unverified).
 */
import { createProxy } from "@/src/app/api/_lib/proxy";

export const { GET } = createProxy({
    backend: "DOMAIN_CONFIGURATION",
    path: "/flow/state",
    methods: ["GET"],
});
