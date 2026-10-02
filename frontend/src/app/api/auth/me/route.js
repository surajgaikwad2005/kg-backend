import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createProxy } from "@/src/app/api/_lib/proxy";
import { resolveBackend } from "@/src/app/api/_lib/backends";
import { SECURE_COOKIE, signRole, getSetCookieStrings, readSetCookieValue } from "@/src/app/api/_lib/cookies";

/**
 * GET /api/auth/me → plain passthrough to the real backend's GET /p0/login/me,
 * authenticated via the caller's existing access_token cookie (see
 * createProxy/forward()). Response: { success, authenticated, session_id,
 * data: { user: { name, email, role } } }.
 */
export const { GET } = createProxy({ backend: "AUTH", path: "/me", methods: ["GET"] });

const UPSTREAM_TIMEOUT_MS = 15_000;

/**
 * Ask the real backend who this caller is, using an access token that isn't
 * (yet) in our own access_token cookie — e.g. a fresh Azure MSAL token, right
 * after sign-in. Sent as `Cookie: access_token=<token>`, this backend's declared
 * auth scheme for /me (not Bearer). Never throws — a failed/unreachable/
 * unauthenticated call resolves to null so the caller safely degrades to the
 * default "user" role instead of crashing.
 *
 * The backend mints the session in its own `Set-Cookie: session_id=...`
 * response header (see getSetCookieStrings doc in _lib/cookies.js), not only
 * the `session_id` JSON field; the cookie is the source of truth, the JSON
 * field is a fallback for a backend build that hasn't started setting it yet.
 */
async function fetchBackendUser(accessToken) {
    const target = `${resolveBackend("AUTH")}/me`;
    let response;
    try {
        response = await fetch(target, {
            headers: {
                accept: "application/json",
                Cookie: `access_token=${accessToken}`,
            },
            signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
            cache: "no-store",
        });
    } catch (err) {
        console.error("[auth/me POST] /me call failed:", err);
        return null;
    }
    if (!response.ok) {
        console.warn(`[auth/me POST] /me call failed: ${response.status}`);
        return null;
    }
    const setCookieStrings = getSetCookieStrings(response);
    const data = await response.json().catch(() => null);
    if (!data?.authenticated || !data?.data?.user) return null;
    const sessionId = readSetCookieValue(setCookieStrings, "session_id") || data.session_id || null;
    return { user: data.data.user, sessionId };
}

/**
 * POST /api/auth/me → establish (or RENEW) a local session from a successful
 * Azure Entra ID (MSAL) sign-in. Azure Entra ID is the only login method this
 * app supports — this route is called twice in the session lifecycle: once
 * at initial sign-in (src/app/page.jsx), and again by AuthInterceptor with a
 * freshly silent-acquired MSAL access token to regenerate the session before/
 * when it expires (there is no separate refresh-token endpoint). `role` is
 * real — sourced entirely from the real backend's GET /p0/login/me response
 * (see fetchBackendUser above), no local Entra AD group mapping.
 *
 * If the backend confirms the caller (`authenticated: true`), its
 * `data.user.role`/`name`/`email` become the source of truth. The `access_token`
 * cookie is set to the backend's own `session_id` (NOT the raw Azure access
 * token) — subsequent /api/* calls always attach whatever is in `access_token`
 * as both `Authorization: Bearer` and `Cookie: access_token=...` (see
 * src/proxy.js and src/app/api/_lib/proxy.js), and every other backend
 * domain (e.g. CDM configRouter/plants) validates that as a SESSION, not a
 * raw Azure JWT — replaying the Azure token there 401s with
 * `{"detail": "Missing session"}` even though /me itself succeeded, because
 * /me's Cookie:access_token=<azureToken> call is what MINTS the session_id
 * in the first place; it is a one-time exchange, not a reusable credential.
 * If no access token is provided, or the backend does not recognize it (or
 * — defensively — confirms the caller but omits session_id), this falls back
 * to a `azure-dev:` placeholder token and/or the default "user" role — that
 * placeholder is NOT accepted by the real backend, so other /api/* calls
 * will 401 for that session (expected — AuthInterceptor will then attempt a
 * renewal and, failing that, force logout).
 */
export async function POST(req) {
    let name, email, accountId, accessToken;
    try {
        ({ name, email, accountId, accessToken } = await req.json());
    } catch {
        return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
    }

    if (!email) {
        return NextResponse.json({ message: "Missing Azure account email" }, { status: 400 });
    }

    const accessMaxAge = 60 * 60; // 1 hour — matches login/route.js's default fallback

    let role = "user";
    let backendUser = null;
    let sessionId = null;
    if (accessToken) {
        const resolved = await fetchBackendUser(accessToken);
        if (resolved?.user?.role) {
            backendUser = resolved.user;
            sessionId = resolved.sessionId;
            role = backendUser.role;
            if (!sessionId) {
                console.warn("[auth/me POST] Backend confirmed the caller but returned no session_id — other /api/* calls will 401");
            }
        } else {
            console.warn("[auth/me POST] Backend did not recognize this Azure session — defaulting role to 'user'");
        }
    } else {
        console.warn("[auth/me POST] No accessToken provided — defaulting role to 'user'");
    }


    const user = {
        role,
        name: backendUser?.name || name || email,
        email: backendUser?.email || email,
        accountId,
    };
    const nextResponse = NextResponse.json({
        authenticated: true,
        expires_in: accessMaxAge,
        session_id: sessionId,
        user,
    });

    nextResponse.cookies.set("access_token", accessToken, {
        httpOnly: true,
        secure: SECURE_COOKIE,
        sameSite: "lax",
        path: "/",
        maxAge: accessMaxAge,
    });

    if (sessionId) {
        nextResponse.cookies.set("session_id", sessionId, {
            httpOnly: true,
            secure: SECURE_COOKIE,
            sameSite: "lax",
            path: "/",
            maxAge: accessMaxAge,
        });
    }
    nextResponse.cookies.set("user_role", await signRole(user.role), {
        httpOnly: true,
        secure: SECURE_COOKIE,
        sameSite: "lax",
        path: "/",
        maxAge: accessMaxAge,
    });

    return nextResponse;
}
