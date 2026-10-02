'use client';

import { useEffect, useState } from 'react';
import { PublicClientApplication } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';
import { msalConfig } from '@/src/lib/auth/msalConfig';

let msalInstance = null;
let msalInitPromise = null;

function getMsalInstance() {
    if (!msalInstance) {
        msalInstance = new PublicClientApplication(msalConfig);
        msalInitPromise = msalInstance.initialize();
    }
    return msalInitPromise ? msalInitPromise.then(() => msalInstance) : Promise.resolve(msalInstance);
}

// Azure Entra ID (MSAL) is the only login method this app supports.
//
// The instance is created and initialized client-side before setting state so
// MsalProvider only receives a fully initialized PublicClientApplication instance.
export function MsalClientProvider({ children }) {
    const [instance, setInstance] = useState(null);

    useEffect(() => {
        let isMounted = true;
        getMsalInstance()
            .then((pca) => {
                if (isMounted) {
                    setInstance(pca);
                }
            })
            .catch((err) => {
                console.error('[MSAL] Failed to initialize PublicClientApplication:', err);
            });

        return () => {
            isMounted = false;
        };
    }, []);

    if (!instance) {
        return children;
    }

    return <MsalProvider instance={instance}>{children}</MsalProvider>;
}

