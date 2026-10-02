/**
 * authService.js
 * Pure async functions for authentication API.
 * Calls the local /api/auth/* proxy routes (token injection / 401 handling
 * are managed globally by AuthInterceptor).
 */
import { apiClient } from '../apiClient';

/**
 * Health check (public)
 */
export async function getHealth() {
    return apiClient.get('/api/auth/health');
}

/**
 * API root (public)
 */
export async function getRoot() {
    return apiClient.get('/api/auth');
}

/**
 * Debug — raw Keycloak login test
 */
export async function getDebugLoginTest() {
    return apiClient.get('/api/auth/debug/login-test');
}

/**
 * Establish (or RENEW) a local session from an Azure Entra ID (MSAL) access
 * token. Azure Entra ID is the only login method this app supports — POSTs
 * to the same /api/auth/me route as getMe() below, i.e. the backend's own
 * `/login/me` endpoint — `role` is real, resolved server-side by asking that
 * endpoint who the caller is (see me/route.js's POST handler), not by a
 * local Entra AD group mapping. If the backend recognizes the Azure access
 * token, its session id is stored as `access_token` so subsequent /api/* calls
 * keep authenticating; otherwise a DEV-ONLY placeholder is used and
 * protected-data calls will 401 (expected).
 *
 * Called twice in the session lifecycle with the same shape: once at initial
 * sign-in (src/app/page.jsx), and again by AuthInterceptor with a freshly
 * silent-acquired MSAL access token to REGENERATE the session before/when the
 * previous one expires — there is no separate refresh-token endpoint.
 * Returns { authenticated, user, expires_in, session_id }.
 */
export async function establishAzureSession({ name, email, accountId, accessToken }) {
    return apiClient.post('/api/auth/me', { name, email, accountId, accessToken });
}

/**
 * Get the current authenticated user's profile from the real backend
 * (GET /p0/login/me), using the existing access_token cookie. Response shape:
 * { success, authenticated, session_id, data: { user } } where `user` is
 * `{ name, email, role }`.
 */
export async function getMe() {
    return apiClient.get('/api/auth/me');
}

/**
 * Admin-only route — requires 'admin' role
 */
export async function getAdminPanel() {
    return apiClient.get('/api/auth/admin');
}

/** Log out the current session. Best-effort; never throws. */
export async function logout(data = {}) {
    try {
        await apiClient.post('/api/auth/logout', data);
    } catch (_) {
        /* ignore — logout is best-effort */
    }
}
