import { proxyToCDM } from "@/src/app/api/cdm-proxy.js";

export async function PATCH(req) {
    return proxyToCDM(req, "/configRouter/userConfig");
}
