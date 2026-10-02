'use client';
import React, { useEffect } from 'react';
import { AdminPanelContent } from '@/src/components/admin/AdminPanel';
import { useAdminNav } from '@/src/components/admin/AdminPanelContext';

function ViewSetter({ view }) {
    const { setView } = useAdminNav();
    useEffect(() => {
        setView(view);
    }, [view, setView]);
    return null;
}

export default function DataSourceIntegrationPage() {
    return (
        <>
            <ViewSetter view="data-config" />
            <AdminPanelContent />
        </>
    );
}
