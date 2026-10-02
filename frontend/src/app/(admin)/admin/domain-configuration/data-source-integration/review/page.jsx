'use client';
import React, { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AdminPanelContent } from '@/src/components/admin/AdminPanel';
import { useAdminNav } from '@/src/components/admin/AdminPanelContext';

function ReviewViewSetter() {
    const { setView } = useAdminNav();
    const searchParams = useSearchParams();
    const viewParam = searchParams.get('view') || 'pid-review';

    useEffect(() => {
        setView(viewParam);
    }, [viewParam, setView]);

    return null;
}

export default function DataSourceIntegrationReviewPage() {
    return (
        <Suspense fallback={null}>
            <ReviewViewSetter />
            <AdminPanelContent />
        </Suspense>
    );
}
