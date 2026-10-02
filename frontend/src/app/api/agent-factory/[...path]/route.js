import { createCatchAllProxy } from "@/src/app/api/_lib/proxy";
import { agentFactoryPrefix } from "@/src/app/api/_lib/backends";

/**
 * Agent Factory proxy (catch-all).
 * Forwards /api/agent-factory/* → <AGENT_FACTORY><PREFIX>/* (e.g. /p1_agent_factory).
 * Template endpoints need user identity (X-User-ID); we derive it from the JWT
 * in the access_token cookie / Authorization header. /models, /node-catalog and
 * /tools are public and simply ignore it.
 */

/** Decode a JWT payload (no verification — just to read identity claims). */
function decodeJwt(token) {
    try {
        const payload = token?.split(".")[1];
        if (!payload) return null;
        const json = Buffer.from(payload.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");
        return JSON.parse(json);
    } catch {
        return null;
    }
}

/** Resolve the user id the agent-factory backend expects as X-User-ID. */
function getUserId(req) {
    const direct = req.headers.get("X-User-ID") || req.cookies.get("user_id")?.value;
    if (direct) return direct;
    const token = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "") || req.cookies.get("access_token")?.value;
    const claims = decodeJwt(token || "");
    return claims?.user_id || claims?.sub || claims?.id || claims?.email || claims?.username || null;
}

export const { GET, POST, PUT, DELETE } = createCatchAllProxy({
    backend: "AGENT_FACTORY",
    methods: ["GET", "POST", "PUT", "DELETE"],
    trailingSlash: false,
    extraHeaders: (req) => {
        const userId = getUserId(req);
        return userId ? { "X-User-ID": String(userId) } : {};
    },
});
