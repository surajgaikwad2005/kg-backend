'use client';
import React from 'react';
import { AdminPanelProvider } from '@/src/components/admin/AdminPanelContext';
import { DataSourceSidebar } from '@/src/components/admin/views/components/DataSourceSidebar';
import { PageFooterSlotProvider } from '@/src/components/admin/views/components/PageFooter';

/**
 * The global chrome (Sidebar + PageHeader) lives one level up in
 * src/app/(admin)/admin/layout.jsx, which shares it across the whole /admin
 * tree instead of remounting it per feature (see CLAUDE.md #45) — that shared
 * layout special-cases this route's header title/subtitle. This layout owns
 * the feature-level AdminPanelProvider plus the fixed DataSourceSidebar and
 * PageFooterSlotProvider, which for the same reason (CLAUDE.md #45) live here
 * rather than inside page.jsx / review/page.jsx, so they persist across
 * navigation between them.
 */
export default function DataSourceIntegrationLayout({ children }) {
    return (
        <AdminPanelProvider initialView="data-config">
            <div className="flex flex-1 min-h-0 min-w-0">
                <DataSourceSidebar />
                <PageFooterSlotProvider>
                    {children}
                </PageFooterSlotProvider>
            </div>
        </AdminPanelProvider>
    );
}
