import { createCatchAllProxy } from "@/src/app/api/_lib/proxy";

/**
 * /api/domain-configuration/context/* -> DOMAIN_CONFIGURATION (/p0/cdm/context/*)
 * Catches dynamic context requests such as /api/domain-configuration/context/pnid/files/[filename]
 */
export const { GET, POST, PUT, PATCH, DELETE } = createCatchAllProxy({
    backend: "DOMAIN_CONFIGURATION",
    prefix: "/context",
    trailingSlash: false,
});
