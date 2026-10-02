import { createCatchAllProxy } from "@/src/app/api/_lib/proxy";

/**
 * /api/context/* -> DOMAIN_CONFIGURATION (/p0/cdm/context/*)
 * Catches context file streams such as /api/context/pnid/files/[filename]
 */
export const { GET, POST, PUT, PATCH, DELETE } = createCatchAllProxy({
    backend: "DOMAIN_CONFIGURATION",
    prefix: "/context",
    trailingSlash: false,
});
