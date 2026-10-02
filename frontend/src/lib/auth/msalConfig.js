/**
 * MSAL configuration using environment variables.
 * Values are set in .env.local as NEXT_PUBLIC_AZURE_* variables.
 */
export const msalConfig = {
    auth: {
        clientId: process.env.NEXT_PUBLIC_AZURE_CLIENT_ID || '',
        authority:
            process.env.NEXT_PUBLIC_AZURE_AUTHORITY ||
            `https://login.microsoftonline.com/${process.env.NEXT_PUBLIC_AZURE_TENANT_ID}`,
        // For popups, MSAL redirects to /auth-redirect (src/app/auth-redirect/page.jsx),
        // which relays the auth response back to this window via msal-browser's
        // redirect-bridge (BroadcastChannel) and closes itself.
        redirectUri: typeof window !== 'undefined'
            ? `${window.location.origin}/auth-redirect`
            : '/auth-redirect',
        postLogoutRedirectUri:
            typeof window !== 'undefined' ? window.location.origin : '/',
    },
    cache: {
        cacheLocation: 'localStorage',
    },
};

const rawScopes = process.env.NEXT_PUBLIC_MSAL_SCOPES || 'openid profile email User.Read';
const scopes = rawScopes.split(' ').filter(Boolean);

/** Base login request (scopes only) */
export const loginRequest = { scopes };

/**
 * Returns a popup login request.
 * Optionally accepts a loginHint (user's email) to pre-fill the Microsoft sign-in form.
 */
export function getPopupRequest(loginHint) {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    return {
        scopes,
        redirectUri: `${origin}/auth-redirect`,
        ...(loginHint ? { loginHint } : {}),
    };
}

/**
 * Returns a silent SSO request.
 * Used to try authenticating without showing a popup (succeeds if the user
 * already has an active Azure session in the browser).
 */
export function getSilentRequest(loginHint) {
    return {
        scopes,
        ...(loginHint ? { loginHint } : {}),
    };
}
