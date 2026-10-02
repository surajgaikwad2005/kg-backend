/**
 * cookies.js
 * Single source of truth for the `Secure` flag on every auth cookie the
 * hand-rolled auth routes set (me / logout).
 *
 * A `Secure` cookie is NEVER sent by the browser over plain HTTP, even after it
 * is stored — so on an HTTP-only deployment (e.g. an internal EC2 reached via
 * http://<ip>:3000) the access_token cookie would never reach the proxy/middleware
 * and every protected route would bounce back to login.
 *
 * Default: secure in production (matches an HTTPS deployment like Amplify).
 * Override with COOKIE_SECURE=false in .env for HTTP-only hosts (re-enable once
 * HTTPS is in front of the app).
 */
export const SECURE_COOKIE = process.env.COOKIE_SECURE
    ? process.env.COOKIE_SECURE === "true"
    : process.env.NODE_ENV === "production";

/**
 * Signed user_role cookie.
 *
 * httpOnly alone does NOT protect a cookie from forgery — JS can always CREATE
 * a new cookie with the same name via document.cookie, and the server cannot
 * tell it apart from the one it set. Since the middleware (src/proxy.js) trusts
 * user_role for the /admin route guard, the value must be HMAC-signed with a
 * server-side secret and verified on every read. A forged/unsigned cookie fails
 * verification and downgrades to 'user'.
 *
 * Uses Web Crypto only (crypto.subtle) so the same helpers run in BOTH the
 * Node.js route handlers (login) and the Edge middleware (proxy.js).
 *
 * Secret: AUTH_COOKIE_SECRET in .env. In development a fixed fallback is used
 * so local login keeps working; production fails loud rather than shipping an
 * unauthenticated-forgeable guard.
 */
const encoder = new TextEncoder();

function getRoleSecret() {
    const secret = process.env.AUTH_COOKIE_SECRET?.trim();
    if (secret) return secret;
    if (process.env.NODE_ENV === "production") {
        throw new Error("[cookies] AUTH_COOKIE_SECRET is not set — required in production to sign the user_role cookie.");
    }
    return "dev-only-role-signing-secret";
}

async function getRoleKey() {
    return crypto.subtle.importKey(
        "raw",
        encoder.encode(getRoleSecret()),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign", "verify"],
    );
}

function toBase64Url(buf) {
    let binary = "";
    const bytes = new Uint8Array(buf);
    for (const b of bytes) binary += String.fromCharCode(b);
    // btoa is available in both Edge and Node 18+ runtimes.
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(str) {
    const b64 = str.replace(/-/g, "+").replace(/_/g, "/");
    const binary = atob(b64 + "=".repeat((4 - (b64.length % 4)) % 4));
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
}

/** `admin` → `admin.<base64url HMAC>` — the value stored in the user_role cookie. */
export async function signRole(role) {
    const key = await getRoleKey();
    const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(role));
    return `${role}.${toBase64Url(sig)}`;
}

/** Verify a user_role cookie value; returns the role string or null if missing/forged. */
export async function verifyRole(cookieValue) {
    if (!cookieValue) return null;
    const dot = cookieValue.lastIndexOf(".");
    if (dot === -1) return null;
    const role = cookieValue.slice(0, dot);
    const sig = cookieValue.slice(dot + 1);
    try {
        const key = await getRoleKey();
        const ok = await crypto.subtle.verify("HMAC", key, fromBase64Url(sig), encoder.encode(role));
        return ok ? role : null;
    } catch {
        return null;
    }
}

/**
 * The AUTH backend's /me endpoint (our POST /api/auth/me → "/login/me") puts
 * the caller's session id in its own Set-Cookie response header instead of
 * the JSON body — see me/route.js's fetchBackendUser. Extract Set-Cookie
 * header(s) from a fetch Response as an array of raw pair strings.
 */
export function getSetCookieStrings(res) {
    if (typeof res.headers.getSetCookie === "function") return res.headers.getSetCookie();
    const raw = res.headers.get("set-cookie");
    return raw ? raw.split(/,(?=\s*[^;=\s]+=)/).map((s) => s.trim()) : [];
}

/** Read a single cookie's value out of an array of raw Set-Cookie strings. */
export function readSetCookieValue(setCookieStrings, name) {
    for (const raw of setCookieStrings) {
        const [pair] = raw.split(";");
        const eq = pair.indexOf("=");
        if (eq === -1) continue;
        if (pair.slice(0, eq).trim() === name) return pair.slice(eq + 1).trim();
    }
    return null;
}
