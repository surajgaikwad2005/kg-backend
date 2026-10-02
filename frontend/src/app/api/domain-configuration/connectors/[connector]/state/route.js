/**
 * /api/domain-configuration/connectors/[connector]/state
 *   →  <DOMAIN_CONFIGURATION>/connectors/{connector}/state
 *
 * ONE connector's lifecycle rollup, plus the optional taxonomy breakdown its
 * card sub-rows render from (`groups[]` — e.g. timeseries splits into
 * "Metadata Upload" / "Values Upload", each with counts and file_ids).
 *
 * The sibling `/connectors/state` route already returns all seven rollups in a
 * single call, so this route exists mainly for `include_groups=true`, which
 * that one does not expose per connector.
 *
 * `connector` is a CONNECTOR name — the SEVEN values pnid | documents |
 * timeseries | sap | aif | gloc | lopc, NOT the eight flow names. This endpoint
 * has always validated it and 422s on anything else. Note `data.status` here is
 * a THIRD vocabulary (UPPERCASE connector states), distinct from both the
 * lifecycle filter and a file row's own `status`.
 *
 * The static `state`, `labels` and `upload` siblings take precedence over this
 * dynamic segment, so `/connectors/state` still resolves to the rollup route.
 *
 * Query params pass straight through: plant_code_id (required, Rule 0) and the
 * optional include_groups (defaults false server-side).
 */
import { createProxy } from "@/src/app/api/_lib/proxy";

export const { GET } = createProxy({
    backend: "DOMAIN_CONFIGURATION",
    path: ({ connector }) => `/connectors/${encodeURIComponent(connector)}/state`,
    methods: ["GET"],
});
