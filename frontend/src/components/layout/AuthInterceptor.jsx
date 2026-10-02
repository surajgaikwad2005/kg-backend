'use client';
import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useMsal } from '@azure/msal-react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/src/components/ui/Toast';
import { getSilentRequest } from '@/src/lib/auth/msalConfig';

/**
 * AuthInterceptor — global 401 recovery for every /api/* fetch.
 *
 * Auth transport is 100% cookie-based: the httpOnly `access_token` cookie is
 * injected as Authorization/Cookie headers by the middleware (src/proxy.js)
 * and the proxy factory (src/app/api/_lib/proxy.js). This component therefore
 * attaches NOTHING to outgoing requests — no Bearer header, no localStorage
 * token (the raw session value never touches JS-readable storage; XSS cannot
 * steal it via document.cookie).
 *
 * Azure Entra ID is the only login method — there is no backend refresh_token,
 * so the session is RENEWED (not "refreshed") by silently re-acquiring an
 * Azure access token from MSAL's own cache (acquireTokenSilent) and POSTing
 * it to /api/auth/me — the same route + backend `/login/me` call used at
 * initial sign-in (see authService.establishAzureSession). There is no
 * dedicated /api/auth/refresh endpoint.
 *
 * What it does:
 *  1. On a 401 from any non-auth /api/* call → silently re-acquire an Azure
 *     token + re-establish the session via /api/auth/me → retry the original
 *     request once. Concurrent 401s share one in-flight renewal via a waiter queue.
 *  2. Proactively renews when `token_expires_at` (a non-sensitive timestamp
 *     written at login/renewal) is within 5 minutes of expiry.
 *  3. Forces logout (clear session markers + redirect to login) when renewal
 *     fails — e.g. MSAL requires interactive sign-in again (session revoked,
 *     MFA re-prompt, etc.).
 */

// Dev-only debug loggers — token VALUES are never logged, only lifecycle events.
const __DEV__ = process.env.NODE_ENV !== 'production';

const tag = (label, bg, fg = '#fff') => [
    `%c${label}%c`,
    `background:${bg};color:${fg};font-weight:bold;padding:1px 6px;border-radius:3px`,
    'color:inherit',
];

const dbg = {
    expiry:   (...a) => __DEV__ && console.log(...tag('[TOKEN EXPIRY]',   '#f59e0b', '#000'), ...a),
    refresh:  (...a) => __DEV__ && console.log(...tag('[TOKEN RENEW]',    '#6366f1'),          ...a),
    warn401:  (...a) => __DEV__ && console.warn(...tag('[401 HANDLER]',   '#ef4444'),          ...a),
    redirect: (...a) => __DEV__ && console.warn(...tag('[MIDDLEWARE REDIRECT]', '#dc2626'),    ...a),
    logout:   (...a) => __DEV__ && console.error(...tag('[FORCE LOGOUT]', '#7f1d1d'),          ...a),
};

const hasSession = () => localStorage.getItem('auth') === 'true';

export function AuthInterceptor() {
    const router = useRouter();
    const pathname = usePathname();
    const { error } = useToast();
    const { instance: msalInstance } = useMsal();
    const queryClient = useQueryClient();

    const isLoggingOutRef = useRef(false);
    const isRefreshingRef = useRef(false);
    const pendingQueueRef = useRef([]);

    // Detect middleware redirect on the login page (/?redirect=...)
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const redirectParam = new URLSearchParams(window.location.search).get('redirect');
        if (!redirectParam) return;
        dbg.redirect(
            `Redirected from "${redirectParam}" — the access_token cookie is MISSING or expired.`,
            '\nThe Next.js middleware (src/proxy.js) rejected the request. Local session marker:',
            hasSession() ? 'present' : '(not set)',
        );
    }, []);

    useEffect(() => {
        const originalFetch = window.fetch;

        // ── Helpers ─────────────────────────────────────────────────────────

        const clearLocalAuth = () => {
            localStorage.removeItem('auth');
            localStorage.removeItem('access_token'); // legacy key — tokens are no longer stored client-side
            localStorage.removeItem('role');
            localStorage.removeItem('username');
            localStorage.removeItem('token_expires_at');
            localStorage.removeItem('auth_provider');
        };

        const handleLogout = async () => {
            if (isLoggingOutRef.current) return;
            isLoggingOutRef.current = true;
            dbg.logout('handleLogout called — clearing session and redirecting to /');
            try { await originalFetch('/api/auth/logout', { method: 'POST' }); } catch (_) {}
            try { await msalInstance.clearCache(); } catch (_) {}
            clearLocalAuth();
            // Wipe every cached server response. Without this the next user to
            // sign in on this tab briefly sees the previous user's plant data
            // before the first refetch lands — the cache outlives localStorage.
            queryClient.clear();
            error('Session Expired', 'Your session has expired. Please login again.', 5000);
            router.push('/');
            setTimeout(() => { isLoggingOutRef.current = false; }, 2000);
        };

        // Silently re-acquire an Azure access token from MSAL's own cache (no
        // popup — throws InteractionRequiredAuthError if that isn't possible,
        // e.g. the session was revoked or needs a fresh MFA prompt) and POST it
        // to /api/auth/me (backend `/login/me`) to re-establish the session
        // cookies. Resolves `true` on success so queued 401 callers can retry.
        const tryRefresh = () => {
            if (isRefreshingRef.current) {
                dbg.refresh('renewal already in-flight — queuing caller (queue size:', pendingQueueRef.current.length + 1, ')');
                return new Promise((resolve, reject) => {
                    pendingQueueRef.current.push({ resolve, reject });
                });
            }

            isRefreshingRef.current = true;
            dbg.refresh('starting → MSAL acquireTokenSilent + POST /api/auth/me');

            const account = msalInstance.getActiveAccount() || msalInstance.getAllAccounts()[0];
            if (!account) {
                dbg.refresh('no MSAL account in cache — cannot renew silently');
                pendingQueueRef.current.forEach(({ reject }) => reject());
                pendingQueueRef.current = [];
                isRefreshingRef.current = false;
                return Promise.resolve(false);
            }

            return msalInstance.acquireTokenSilent({ ...getSilentRequest(), account })
                .then((result) => originalFetch('/api/auth/me', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: account.name || account.username,
                        email: account.username,
                        accountId: account.homeAccountId,
                        accessToken: result.accessToken,
                    }),
                }))
                .then(res => {
                    dbg.refresh('response status:', res.status, res.statusText);
                    return res.ok ? res.json().catch(() => null) : null;
                })
                .then(data => {
                    if (data?.authenticated) {
                        dbg.refresh('SUCCESS — session re-established; expires_in:', data.expires_in ?? '(not returned)',
                            '| resolving', pendingQueueRef.current.length, 'queued callers');
                        if (data.expires_in) {
                            localStorage.setItem('token_expires_at', String(Date.now() + data.expires_in * 1000));
                        }
                        if (data.user?.role) localStorage.setItem('role', data.user.role);
                        pendingQueueRef.current.forEach(({ resolve }) => resolve(true));
                        pendingQueueRef.current = [];
                        return true;
                    }
                    dbg.refresh('FAILED — renewal rejected | rejecting', pendingQueueRef.current.length, 'queued callers');
                    pendingQueueRef.current.forEach(({ reject }) => reject());
                    pendingQueueRef.current = [];
                    return false;
                })
                .catch((err) => {
                    dbg.refresh('ERROR:', err?.message ?? err,
                        '| rejecting', pendingQueueRef.current.length, 'queued callers');
                    pendingQueueRef.current.forEach(({ reject }) => reject());
                    pendingQueueRef.current = [];
                    return false;
                })
                .finally(() => { isRefreshingRef.current = false; });
        };

        const shouldHandle401 = (url) => {
            if (!url) return false;
            if (!hasSession()) return false;
            if (pathname === '/') return false;
            const isAuthRoute = url.includes('/api/auth/logout') || url.includes('/api/auth/me');
            return !isAuthRoute;
        };

        // ── Proactive expiry check on every route change ─────────────────────
        const expiresAt = parseInt(localStorage.getItem('token_expires_at') || '0', 10);
        if (expiresAt) {
            const minsLeft = Math.round((expiresAt - Date.now()) / 1000 / 60);
            dbg.expiry(`pathname changed to "${pathname}" — token expires at`,
                new Date(expiresAt).toLocaleTimeString(),
                `(${minsLeft >= 0 ? `${minsLeft} min left` : `EXPIRED ${Math.abs(minsLeft)} min ago`})`);
            if (hasSession() && Date.now() > expiresAt - 5 * 60 * 1000) {
                dbg.expiry('within 5-min renewal window — triggering proactive renewal');
                tryRefresh().catch(() => {});
            }
        } else {
            dbg.expiry(`pathname changed to "${pathname}" — token_expires_at not set (backend did not return expires_in)`);
        }

        // ── Fetch interceptor: 401 → renew → retry ────────────────────────
        window.fetch = async function (...args) {
            const [input] = args;
            const url = typeof input === 'string' ? input
                : input instanceof URL ? input.href
                : input?.url;
            const method = (args[1]?.method || 'GET').toUpperCase();

            const response = await originalFetch.apply(this, args);

            if (response.status === 401 && shouldHandle401(url)) {
                dbg.warn401(`fetch 401 on ${method} ${url} — trying renewal`);
                const renewed = await tryRefresh().catch(() => false);
                if (renewed) {
                    // The rotated access_token cookie is attached automatically by
                    // the middleware — retry the original request unchanged.
                    dbg.warn401('renewal succeeded — retrying fetch request');
                    return originalFetch.apply(this, args);
                }
                dbg.warn401('renewal failed — forcing logout');
                await handleLogout();
            }

            return response;
        };

        return () => {
            window.fetch = originalFetch;
        };
    }, [router, pathname, error, queryClient, msalInstance]);

    return null;
}
