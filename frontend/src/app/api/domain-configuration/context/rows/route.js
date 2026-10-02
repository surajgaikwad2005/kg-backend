/**
 * /api/domain-configuration/context/rows  →  <DOMAIN_CONFIGURATION>/context/rows
 *
 * Unified rows PATCH router for all four Data Source Integration connectors
 * (pnid | documents | sap | timeseries) — `connector` in the request body
 * selects which internal connector table is patched/persisted.
 */
import { createProxy } from "@/src/app/api/_lib/proxy";

export const { PATCH } = createProxy({
    backend: "DOMAIN_CONFIGURATION",
    path: "/context/rows",
    methods: ["PATCH"],
});
