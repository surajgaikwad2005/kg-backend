'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/src/components/layout/PageHeader';
import { DeveloperOptionsTabs } from './_components/DeveloperOptionsTabs';
import { useDeveloperAccess } from '@/src/context/DeveloperAccessContext';

// No Sidebar/outer flex wrapper here on purpose — (dashboard)/layout.jsx
// already mounts Sidebar once for every route in this group. Duplicating it
// here would put Developer Options in its own top-level layout segment,
// forcing Sidebar to unmount/remount (and its in-memory unlock state to
// reset) on every navigation into or out of this section.
export default function DeveloperOptionsLayout({ children }) {
    const { hasAccess } = useDeveloperAccess();
    const router = useRouter();

    // UX-only guard, same convention as (admin)/layout.jsx — silent
    // router.replace, no toast/message. hasAccess is only ever true right
    // after "taitaitai" is typed and the hidden sidebar entry is clicked; it's
    // revoked the moment the user navigates elsewhere (DeveloperAccessContext).
    // So Back button and a direct/refreshed URL both land here with hasAccess
    // already false and get bounced — the secret has to be retyped every time.
    useEffect(() => {
        if (!hasAccess) {
            router.replace('/home');
        }
    }, [hasAccess, router]);

    if (!hasAccess) {
        return null;
    }

    return (
        <>
            <PageHeader showBreadcrumb={false} />
            <div className="shrink-0 px-6 border-b border-border bg-surface">
                <DeveloperOptionsTabs />
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto">
                {children}
            </div>
        </>
    );
}
