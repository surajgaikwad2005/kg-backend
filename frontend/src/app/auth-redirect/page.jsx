'use client';

import { useEffect } from 'react';
import { broadcastResponseToMainFrame } from '@azure/msal-browser/redirect-bridge';

/**
 * MSAL popup redirect target. Runs inside the popup window Microsoft
 * redirects back to after sign-in: parses the auth response out of the URL,
 * relays it to the opener via BroadcastChannel (msal-browser v5's "redirect
 * bridge" — replaces the older popup.location.href-polling approach older
 * samples rely on), then closes itself. Without this the popup authenticates
 * successfully but sits open forever with nothing telling the opener it's done.
 */
export default function AuthRedirectPage() {
    useEffect(() => {
        broadcastResponseToMainFrame().catch(() => {
            // Nothing to relay — e.g. this tab was opened directly rather than
            // by MSAL. Leave it open rather than closing a page the user navigated to.
        });
    }, []);

    return null;
}
