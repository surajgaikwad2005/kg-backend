/**
 * /api/domain-configuration/flow/state/[flowUid]  →  <DOMAIN_CONFIGURATION>/flow/state/{flowUid}
 *
 * ONE file's full row — the same 47 fields a list row carries, but `data` IS
 * the row object directly rather than being wrapped in `files[]`. Used to
 * refresh a single grid row after a reset or a commit without re-reading the
 * whole list.
 *
 * Sits under the STATIC `state` segment, so it can never shadow the sibling
 * `/flow/[flowUid]` (DELETE) route: `/flow/state` resolves to the static list
 * handler, `/flow/state/51` here, and `/flow/51` to the delete handler.
 *
 * Query params pass straight through: plant_code_id (required, Rule 0). The
 * backend answers 400 (not 422) for flowUid <= 0 and 404 for an unknown one —
 * both shapes are documented in api-data/cdm-flow-state.json.
 */
import { createProxy } from "@/src/app/api/_lib/proxy";

export const { GET } = createProxy({
    backend: "DOMAIN_CONFIGURATION",
    path: ({ flowUid }) => `/flow/state/${encodeURIComponent(flowUid)}`,
    methods: ["GET"],
});
