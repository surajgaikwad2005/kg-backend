'use client';
import React from 'react';
import AdminPanel from '@/src/components/admin/AdminPanel';

export default function GroupsPage() {
    const [isMounted, setIsMounted] = React.useState(false);
    React.useEffect(() => { setIsMounted(true); }, []);
    if (!isMounted) return null;
    return <AdminPanel initialView="groups" />;
}
