/**
 * cdm-proxy.js
 * Thin compatibility wrapper over the shared proxy core (_lib/proxy.js).
 * CDM uses absolute upstream paths (/configRouter/..., /context/...) with NO
 * trailing-slash normalization, so proxyToCDM pins trailingSlash: false.
 *
 * Only proxyToCDM survives here — every CDM route now lives under
 * src/app/api/domain-configuration/ using createProxy/createCatchAllProxy
 * from _lib/proxy.js directly. proxyToCDM is kept solely for
 * domain-configuration/config/user-config/route.js, which predates (and still
 * matches) that pattern.
 */
import { runProxy } from "./_lib/proxy";

/** Forward a request to a fixed CDM path (used by config/user-config). */
export function proxyToCDM(req, cdmPath) {
    return runProxy(req, { backend: "DOMAIN_CONFIGURATION", path: cdmPath, trailingSlash: false });
}
