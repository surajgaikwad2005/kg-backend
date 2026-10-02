'use client';

import React, { Suspense } from 'react';
import { usePathname, useParams } from 'next/navigation';
import { PageHeader } from '@/src/components/layout/PageHeader';
import { useDashboardGroups } from './_hooks/useDashboardGroups';

const LIST_ROUTE = /^\/dashboards\/?$/;
const DETAIL_ROUTE = /^\/dashboards\/(?!create$|monitor$)[^/]+$/;

export default function DashboardsLayout({ children }) {
  return (
    <Suspense fallback={null}>
      <DashboardsShell>{children}</DashboardsShell>
    </Suspense>
  );
}

/**
 * Shared shell for the dashboards list + [id] detail routes (not create/ or
 * monitor/, which render their own chrome and never show PageHeader). Living
 * here — instead of duplicated inside each page.jsx — means PageHeader
 * persists across navigation between list and detail instead of unmounting/
 * remounting (see CLAUDE.md #45).
 */
function DashboardsShell({ children }) {
  const pathname = usePathname();
  const params = useParams();
  const isList = LIST_ROUTE.test(pathname);
  const isDetail = DETAIL_ROUTE.test(pathname);

  const { dashboardGroups } = useDashboardGroups();
  const activeGroup = isDetail ? dashboardGroups.find((g) => g.id === params.id) || null : null;

  return (
    <>
      {isList && (
        <PageHeader title="Dashboards" subtitle="Custom Monitoring Views" showDateRange={true} showBreadcrumb={false} />
      )}
      {isDetail && (
        <PageHeader
          title={activeGroup?.name}
          subtitle={activeGroup?.description || 'Custom Monitoring Views'}
          showDateRange={true}
          showBreadcrumb={false}
        />
      )}
      {children}
    </>
  );
}
