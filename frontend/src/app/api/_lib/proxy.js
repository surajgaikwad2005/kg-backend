/**
 * proxy.js
 * The single, reusable proxy core for every /api/* route handler.
 *
 * Generalizes the original cdm-proxy.js pattern into a backend-agnostic
 * forwarder plus two factories:
 *   - createCatchAllProxy(...) for `[...path]` routes
 *   - createProxy(...)         for dedicated single-endpoint routes
 *
 * Responsibilities (so individual routes don't reinvent them):
 *   - Auth: resolve the bearer token (incoming Authorization header →
 *     access_token cookie → dev-token fallback in dev) via getToken(), then
 *     send it upstream as BOTH `Authorization: Bearer <token>` and
 *     `Cookie: access_token=<token>` — the latter because at least one
 *     backend's Swagger declares its auth scheme as a cookie named
 *     access_token, not a header (see CLAUDE.md "API & Proxy Architecture").
 *     src/proxy.js (the real Next.js middleware) does the equivalent merge
 *     for the next.config.js rewrite-routed endpoints, which bypass this
 *     file entirely.
 *   - Body: JSON, multipart/form-data (file uploads), and empty-body GET/HEAD.
 *   - Response: parse + passthrough JSON; STREAM everything else (SSE, markdown, blobs).
 *   - Errors: unified shape + correct status (network → 503/502, handler throw → 500).
 *   - Search params + configurable trailing slash (FastAPI-friendly).
 *   - Hooks: transformBody(body, req) and extraHeaders(req) for the few routes
 *     that need request shaping (e.g. anomaly-summary remap, agent-factory X-User-ID).
 */
import { NextResponse } from "next/server";
import { resolveBackend } from "./backends";

const isProd = process.env.NODE_ENV === "production";
const ALL_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"];

/**
 * Debug headers exposing the resolved upstream URL + logical backend name —
 * DEV ONLY. In production this would leak internal backend hosts/IPs to every
 * browser, defeating the point of the proxy layer (CLAUDE.md rule 17), so
 * both are stripped there.
 */
const debugHeaders = (target, backend) =>
    isProd
        ? {}
        : {
              "X-Target-Url": target,
              "X-Proxy-Name": backend,
              "Access-Control-Expose-Headers": "X-Target-Url, X-Proxy-Name",
          };

/** Throw this from transformBody to short-circuit with a specific status. */
export class ProxyError extends Error {
    constructor(message, status = 400) {
        super(message);
        this.name = "ProxyError";
        this.status = status;
        this.expose = true;
    }
}

/** Resolve the bearer token: incoming header → access_token cookie → dev fallback. */
function getToken(req) {
    const fromHeader = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
    if (fromHeader) return fromHeader;
    const fromCookie = req.cookies.get("access_token")?.value;
    if (fromCookie) return fromCookie;
    return isProd ? null : "dev-token";
}

/**
 * The backend-issued session id (see me/route.js's POST handler, which mints
 * it from an Azure sign-in) — sent as its own `session_id` cookie pair
 * alongside `access_token`, never as a header (this backend's declared
 * scheme is cookie-based). Not every session has one (e.g. password login).
 */
function getSessionId(req) {
    return req.cookies.get("session_id")?.value || null;
}

/** Build the upstream URL: base + path (+ trailing slash) + original query string. */
function buildUrl(base, path, search, trailingSlash) {
    let p = path.startsWith("/") ? path : `/${path}`;
    if (trailingSlash && !p.endsWith("/")) p += "/";
    return `${base}${p}${search || ""}`;
}

/**
 * Core forwarder.
 * @param {Request} req
 * @param {object} opts
 * @param {string} opts.target            fully-resolved upstream URL
 * @param {string} opts.label             log tag, e.g. "[Workspace Proxy POST]"
 * @param {string} opts.backend           logical backend name, e.g. "SYMBOLIC_AI" (sent to the
 *                                        browser as X-Proxy-Name, dev only — see debugHeaders)
 * @param {(body:any, req:Request)=>any} [opts.transformBody]
 * @param {(req:Request)=>Record<string,string>} [opts.extraHeaders]
 */
async function forward(req, { target, label, backend, transformBody, extraHeaders }) {
    const method = req.method;
    const hasBody = !["GET", "HEAD"].includes(method);
    const contentType = req.headers.get("content-type") || "";
    const isFormData = contentType.includes("multipart/form-data");
    const token = getToken(req);
    const sessionId = getSessionId(req);

    const cookiePairs = [];
    if (token) cookiePairs.push(`access_token=${token}`);
    if (sessionId) cookiePairs.push(`session_id=${sessionId}`);

    const headers = {
        accept: "application/json",
        // Send both auth schemes — some backends behind this app's gateways
        // authenticate via a cookie literally named access_token, not Bearer.
        // Purely additive: a backend that only checks Bearer ignores the cookie.
        // session_id (when present) rides along in the same Cookie header.
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(cookiePairs.length ? { Cookie: cookiePairs.join("; ") } : {}),
        ...(extraHeaders ? extraHeaders(req) : {}),
    };

    let body;
    if (hasBody) {
        if (isFormData) {
            // Stream the body directly — zero memory allocation regardless of file size.
            // Must forward the original Content-Type header so the upstream server can
            // parse the multipart boundary. Do NOT call req.formData() — that buffers
            // the entire payload in Node.js heap, causing OOM on large files.
            body = req.body;
            headers['content-type'] = contentType;
        } else if (transformBody) {
            const parsed = await req.json().catch(() => null);
            const shaped = transformBody(parsed, req); // may throw ProxyError
            body = JSON.stringify(shaped);
            headers["Content-Type"] = "application/json";
        } else {
            // Raw passthrough preserves whatever the client sent.
            const raw = await req.text();
            if (raw) {
                body = raw;
                headers["Content-Type"] = contentType || "application/json";
            }
        }
    }

    console.log(`${label} --> ${target}`);

    let res;
    try {
        const fetchInit = { method, headers, body, cache: "no-store" };
        // Node.js 18+ (undici) requires duplex: 'half' when body is a ReadableStream.
        // Ignored for strings, Buffers, and FormData objects.
        if (body instanceof ReadableStream) fetchInit.duplex = 'half';
        res = await fetch(target, fetchInit);
    } catch (err) {
        const offline = err.code === "ECONNREFUSED" || err.message?.includes("fetch failed");
        console.error(`${label} NETWORK ERROR: ${err.message}`);
        return NextResponse.json(
            { error: offline ? "Backend Offline" : "Backend unreachable", details: err.message },
            { status: offline ? 503 : 502, headers: debugHeaders(target, backend) }
        );
    }

    const resType = res.headers.get("content-type") || "";
    console.log(`${label} <-- ${res.status} (${resType || "no content-type"})`);

    // JSON: parse and re-emit so callers get a clean body + faithful status.
    if (resType.includes("application/json")) {
        const text = await res.text();
        if (!text) return new NextResponse(null, { status: res.status, headers: debugHeaders(target, backend) });
        try {
            return NextResponse.json(JSON.parse(text), { status: res.status, headers: debugHeaders(target, backend) });
        } catch {
            return new NextResponse(text, { status: res.status, headers: { "content-type": resType, ...debugHeaders(target, backend) } });
        }
    }

    // Everything else (SSE, text/plain markdown, binary): stream the body through.
    return new NextResponse(res.body, {
        status: res.status,
        headers: {
            "content-type": resType || "text/plain; charset=utf-8",
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            ...debugHeaders(target, backend),
        },
    });
}

/** Map a thrown error to a NextResponse. */
function errorResponse(label, err) {
    if (err instanceof ProxyError || (err?.status && err?.expose)) {
        return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error(`${label} HANDLER ERROR:`, err);
    return NextResponse.json({ error: "Internal Proxy Error", details: err.message }, { status: 500 });
}

/**
 * One-shot proxy to a fixed upstream path. Resolves the backend, builds the URL,
 * forwards, and maps errors. Used by both factories and by callers that need a
 * direct forward (e.g. cdm-proxy.js).
 * @param {Request} req
 * @param {object} cfg
 * @param {string} cfg.backend
 * @param {string} cfg.path
 * @param {boolean} [cfg.trailingSlash]
 * @param {Function} [cfg.transformBody]
 * @param {Function} [cfg.extraHeaders]
 */
export async function runProxy(req, { backend, path, trailingSlash = false, transformBody, extraHeaders }) {
    const label = `[Proxy:${backend} ${req.method}]`;
    try {
        const base = resolveBackend(backend);
        const target = buildUrl(base, path, req.nextUrl.search, trailingSlash);
        return await forward(req, { target, label, backend, transformBody, extraHeaders });
    } catch (err) {
        return errorResponse(label, err);
    }
}

/**
 * Catch-all proxy for `[...path]` routes.
 * @param {object} cfg
 * @param {string} cfg.backend            logical backend name (see backends.js)
 * @param {string} cfg.prefix             upstream path prefix, e.g. "/p1_workspace"
 * @param {string[]} [cfg.methods]        defaults to all five
 * @param {boolean} [cfg.trailingSlash]   defaults to true (FastAPI-friendly)
 * @param {(path:string[])=>string[]} [cfg.rewritePath]  optional segment rewriter
 * @param {Function} [cfg.transformBody]
 * @param {Function} [cfg.extraHeaders]
 */
export function createCatchAllProxy(cfg) {
    const {
        backend,
        prefix = "",
        methods = ALL_METHODS,
        trailingSlash = true,
        rewritePath,
        transformBody,
        extraHeaders,
    } = cfg;

    const handler = async (req, ctx) => {
        let segments = [];
        try {
            const resolved = await ctx.params;
            segments = resolved.path || [];
        } catch (err) {
            return errorResponse(`[Proxy:${backend} ${req.method}]`, err);
        }
        if (rewritePath) segments = rewritePath(segments);
        const path = `${prefix}/${segments.join("/")}`;
        return runProxy(req, { backend, path, trailingSlash, transformBody, extraHeaders });
    };

    return Object.fromEntries(methods.map((m) => [m, handler]));
}

/**
 * Dedicated proxy for a single fixed upstream endpoint.
 * @param {object} cfg
 * @param {string} cfg.backend
 * @param {string|((params:Record<string,string>)=>string)} cfg.path  full upstream
 *        path (e.g. "/p1_visuals/get_visuals_data") or a builder that receives the
 *        resolved route params (for dynamic segments like [id]).
 * @param {string[]} [cfg.methods]        defaults to ["POST"]
 * @param {boolean} [cfg.trailingSlash]   defaults to false (use path exactly as given)
 * @param {Function} [cfg.transformBody]
 * @param {Function} [cfg.extraHeaders]
 */
export function createProxy(cfg) {
    const {
        backend,
        path,
        methods = ["POST"],
        trailingSlash = false,
        transformBody,
        extraHeaders,
    } = cfg;

    const handler = async (req, ctx) => {
        let resolvedPath = path;
        if (typeof path === "function") {
            try {
                resolvedPath = path((await ctx?.params) || {});
            } catch (err) {
                return errorResponse(`[Proxy:${backend} ${req.method}]`, err);
            }
        }
        return runProxy(req, { backend, path: resolvedPath, trailingSlash, transformBody, extraHeaders });
    };

    return Object.fromEntries(methods.map((m) => [m, handler]));
}
