/**
 * apiClient.js
 * Thin fetch wrapper: JSON parse + throw-on-error + query-string building.
 *
 * Auth (Bearer token), request/response logging, and 401 logout are already
 * handled GLOBALLY by AuthInterceptor (it patches window.fetch + axios). This
 * client deliberately does NOT re-implement any of that — it only removes the
 * repetitive "fetch → check ok → parse json → throw" boilerplate from service
 * files. Keep all calls pointed at the local /api/* proxy routes.
 */

import { toast } from '@/src/components/ui/toast/toastApi';

function logFullApiDetails({ method, url, targetUrl, proxyName, body, params, headers, status, data }) {
    if (typeof window === 'undefined' || process.env.NODE_ENV === 'production') return;
    const ok = status !== undefined && status > 0 && status < 400;
    const badgeColor = ok ? '#16a34a' : '#dc2626';
    const statusText = status === 0 ? 'NETWORK_ERROR' : status;

    const groupTitle = `%c[API ${method}] %c${url} %c(${statusText})`;
    const styleBadge = `background: ${badgeColor}; color: #ffffff; padding: 2px 6px; border-radius: 3px; font-weight: bold; font-size: 11px;`;
    const styleUrl = `font-weight: bold; color: inherit;`;
    const styleStatus = `color: ${badgeColor}; font-weight: bold;`;

    if (!ok) {
        console.group(groupTitle, styleBadge, styleUrl, styleStatus);
    } else {
        console.groupCollapsed(groupTitle, styleBadge, styleUrl, styleStatus);
    }

    console.log('%c[PROXY ROUTE]', 'color: #8b5cf6; font-weight: bold;', url);
    console.log('%c[PROXY NAME]', 'color: #a855f7; font-weight: bold;', proxyName || 'N/A');
    console.log('%c[TARGET BACKEND URL]', 'color: #ec4899; font-weight: bold;', targetUrl || '(Resolved on Server Proxy)');
    console.log('%c[METHOD & PATH]', 'color: #06b6d4; font-weight: bold;', `${method} ${url}`);
    if (params) console.log('%c[PARAMS]', 'color: #3b82f6; font-weight: bold;', params);
    if (headers) console.log('%c[HEADERS]', 'color: #3b82f6; font-weight: bold;', headers);
    if (body) console.log('%c[BODY]', 'color: #3b82f6; font-weight: bold;', previewBody(body));
    console.log('%c[STATUS]', `color: ${badgeColor}; font-weight: bold;`, statusText);
    console.log('%c[DATA]', `color: ${badgeColor}; font-weight: bold;`, data);
    console.groupEnd();
}

// Every plant-scoped service call sends one of these keys in its body/query
// (Rule 0 — see CLAUDE.md). If the key is present but empty, the caller
// resolved plantCode to null (no plant selected yet) — block the network
// call instead of letting the backend 422 it. `plantCodeId` covers the CPCP
// Configuration domain, whose refactored contract uses that camelCase field
// name on a handful of endpoints instead of `plant_code_id`.
const PLANT_CODE_KEYS = ['plant_code', 'plant_code_id', 'plantCodeId'];

function isMissingPlantCode(obj) {
    if (!obj || typeof obj !== 'object') return false;
    return PLANT_CODE_KEYS.some((key) => key in obj && (obj[key] === null || obj[key] === undefined || obj[key] === ''));
}

/**
 * Safely extracts a human-readable string from a FastAPI `detail` field.
 * FastAPI validation errors return detail as [{type, loc, msg, input}] — never
 * pass that array directly into JSX or state; always run it through here first.
 */
export function extractErrorDetail(detail) {
    if (!detail) return null;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail)) return detail.map(e => e.msg || JSON.stringify(e)).join('; ');
    if (detail?.message) return String(detail.message);
    return null;
}

class ApiError extends Error {
    constructor(message, { status, data } = {}) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.data = data;
    }
}

function buildUrl(path, params) {
    if (!params) return path;
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) qs.append(key, value);
    });
    const query = qs.toString();
    return query ? `${path}${path.includes('?') ? '&' : '?'}${query}` : path;
}

async function parse(res) {
    // Some endpoints return empty bodies (204, DELETE) — guard against that.
    const text = await res.text();
    if (!text) return null;
    try {
        return JSON.parse(text);
    } catch {
        return text;
    }
}

/** FormData isn't readable in a console.log as-is — flatten it to a plain object (Files shown as "[File: name]"). */
function previewBody(body) {
    if (typeof FormData !== 'undefined' && body instanceof FormData) {
        return Object.fromEntries(
            Array.from(body.entries()).map(([k, v]) => [
                k,
                typeof File !== 'undefined' && v instanceof File ? `[File: ${v.name} (${v.size}b, ${v.type || 'unknown type'})]` : v,
            ])
        );
    }
    return body;
}

function emitBackendOffline(details) {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(new CustomEvent('backend-offline', { detail: details }));
}

async function request(method, path, { params, body, headers, signal } = {}) {
    if (isMissingPlantCode(params) || isMissingPlantCode(body)) {
        if (typeof window !== 'undefined') {
            toast.warning(
                'Plant code required',
                'Select a plant code to continue — this action needs one.',
                { toastId: 'plant-code-required' },
            );
        }
        throw new ApiError('Plant code is required for this request', {
            status: 0,
            data: { error: 'PLANT_CODE_REQUIRED' },
        });
    }

    const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
    const init = { method, signal, headers: { ...headers } };

    if (body !== undefined && body !== null) {
        if (isFormData) {
            init.body = body; // let the browser set the multipart boundary
        } else {
            init.body = JSON.stringify(body);
            init.headers['Content-Type'] = init.headers['Content-Type'] || 'application/json';
        }
    }

    const url = buildUrl(path, params);
    let res;
    let targetUrl;
    let proxyName;
    let data;

    try {
        res = await fetch(url, init);
        targetUrl = res.headers.get('x-target-url') || res.headers.get('X-Target-Url');
        proxyName = res.headers.get('x-proxy-name') || res.headers.get('X-Proxy-Name');
        data = await parse(res);
    } catch (err) {
        logFullApiDetails({
            method,
            url,
            targetUrl: '(Failed to connect / Network error)',
            proxyName: 'N/A',
            body,
            params,
            headers: init.headers,
            status: 0,
            data: err?.message || err,
        });
        throw err;
    }

    // Log full proxy name, actual original full URL, request details, and response details
    logFullApiDetails({
        method,
        url,
        targetUrl,
        proxyName,
        body,
        params,
        headers: init.headers,
        status: res.status,
        data,
    });

    // Proxy returns {"error":"Backend Offline","details":"fetch failed"} when the
    // real backend is unreachable — surface it as a global modal, not just a toast.
    if (data && data.error === 'Backend Offline') {
        emitBackendOffline({ details: data.details, path: url, method });
    }

    if (!res.ok) {
        const message =
            (data && (data.message || data.error || extractErrorDetail(data.detail))) ||
            `Request failed: ${res.status} ${res.statusText}`;
        throw new ApiError(message, { status: res.status, data });
    }

    return data;
}

export const apiClient = {
    get:   (path, opts) => request('GET', path, opts),
    post:  (path, body, opts) => request('POST', path, { ...opts, body }),
    put:   (path, body, opts) => request('PUT', path, { ...opts, body }),
    patch: (path, body, opts) => request('PATCH', path, { ...opts, body }),
    del:   (path, opts) => request('DELETE', path, opts),
    /** Escape hatch for callers that need the raw Response (streaming, blobs). */
    raw: async (path, init = {}) => {
        const method = (init.method || 'GET').toUpperCase();
        const res = await fetch(path, init);

        const targetUrl = res.headers.get('x-target-url');
        const proxyName = res.headers.get('x-proxy-name');

        logFullApiDetails({
            method,
            url: path,
            targetUrl,
            proxyName,
            body: init.body,
            headers: init.headers,
            status: res.status,
            data: '[RAW STREAM / BLOB RESPONSE]',
        });

        return res;
    },
};

export { ApiError };
