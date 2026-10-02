'use client';

import React, { useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { InteractionStatus } from '@azure/msal-browser';
import { Loader2, ArrowRight } from 'lucide-react';
import { Card } from '@/src/components/ui/Card';
import { getPopupRequest } from '@/src/lib/auth/msalConfig';

function MicrosoftLogo({ className }) {
    return (
        <svg className={className} viewBox="0 0 21 21" aria-hidden="true">
            <rect x="1" y="1" width="9" height="9" fill="#f25022" />
            <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
            <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
            <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
        </svg>
    );
}

/**
 * "Sign in with Microsoft" tile — same Card variant="command" shell as
 * AuthenticateCard's existing "Login" tile, so both read as one system.
 *
 * Purely click-driven (no automatic silent-SSO attempt on mount): browsers
 * increasingly block the hidden iframe ssoSilent relies on (third-party
 * cookie/storage partitioning, on by default in Edge/Chrome/Safari), so it
 * can take 6-10s to time out with no active session — reading as a
 * permanently "stuck loading" button on every page visit. loginPopup must
 * also be called synchronously inside the click handler (no leading await)
 * or the browser blocks window.open() as an unsolicited popup — see
 * https://aka.ms/msal.js.errors#popup_window_error.
 */
export function AzureLoginButton({ onSuccess, onError }) {
    const { instance, inProgress } = useMsal();
    const [isPending, setIsPending] = useState(false);

    const isBusy = isPending || inProgress !== InteractionStatus.None;

    const handleClick = () => {
        if (isBusy) return;
        setIsPending(true);
        // Must be called synchronously here (no leading await) — see comment above.
        instance.loginPopup(getPopupRequest())
            .then((result) => {
                const account = result?.account;
                if (!account) throw new Error('Microsoft sign-in did not return an account');
                onSuccess?.({
                    name: account.name || account.username,
                    email: account.username,
                    accountId: account.homeAccountId,
                    accessToken: result.accessToken,
                });
            })
            .catch((err) => {
                onError?.(err?.message || 'Microsoft sign-in was cancelled or failed');
            })
            .finally(() => setIsPending(false));
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            disabled={isBusy}
            aria-busy={isBusy}
            className="w-full text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface rounded-(--do-radius) disabled:opacity-60 disabled:cursor-not-allowed transition-transform duration-200 active:scale-[0.99]"
        >
            <Card variant="command">
                <div className="absolute top-0 right-0 w-36 h-36 bg-brand/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-brand/20 transition-all duration-500 pointer-events-none" />

                <div className="w-13 h-13 flex items-center justify-center rounded-xl bg-surface border border-border shadow-xs group-hover:scale-105 group-hover:border-brand/40 group-hover:shadow-md transition-all duration-300 shrink-0">
                    {isBusy ? (
                        <Loader2 className="w-6 h-6 text-brand animate-spin" />
                    ) : (
                        <MicrosoftLogo className="w-7 h-7" />
                    )}
                </div>

                <div className="flex-1 relative z-10">
                    <h3 className="font-bold text-text-primary text-lg lg:text-xl group-hover:text-brand transition-colors duration-200">
                        {isBusy ? 'Signing in…' : 'Sign in with Microsoft'}
                    </h3>
                    <p className="text-[11px] uppercase tracking-[0.15em] text-text-muted font-bold mt-1 group-hover:text-text-secondary transition-colors">
                        Azure Entra ID
                    </p>
                </div>

                <div className="w-9 h-9 rounded-full flex items-center justify-center bg-surface border border-border text-text-muted group-hover:text-brand group-hover:border-brand/50 group-hover:translate-x-1 group-hover:bg-brand/10 transition-all duration-300 shrink-0">
                    <ArrowRight className="w-4 h-4" />
                </div>
            </Card>
        </button>
    );
}
