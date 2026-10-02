import { createCatchAllProxy } from "@/src/app/api/_lib/proxy";

/**
 * /api/domain-configuration/integrated/* -> DOMAIN_CONFIGURATION (/p0/cdm/integrated/*)
 * Catches dynamic integrated requests (e.g. column, columns, labels, view, recompute)
 */
export const { GET, POST, PUT, PATCH, DELETE } = createCatchAllProxy({
    backend: "DOMAIN_CONFIGURATION",
    prefix: "/integrated",
    trailingSlash: false,
});
