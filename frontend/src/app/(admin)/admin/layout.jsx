'use client';
import React, { Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Sidebar from '@/src/components/layout/Sidebar';
import { PageHeader } from '@/src/components/layout/PageHeader';

import { ShieldAlert } from 'lucide-react';

// domain-configuration's pnid/ and data-source-integration/ subtrees keep the
// custom header copy their own (now chrome-free) nested layouts used to set.
const PNID_ROUTE = /^\/admin\/domain-configuration\/pnid(\/|$)/;
const DSI_ROUTE = /^\/admin\/domain-configuration\/data-source-integration(\/|$)/;
// decision-template's [templateId] designer route needs a dynamic title/breadcrumb.
const DECISION_DESIGNER_ROUTE = /^\/admin\/decision-template\/[^/]+$/;
// risk-template's [slug] detail route needs a dynamic title/breadcrumb.
const RISK_TEMPLATE_SLUG_ROUTE = /^\/admin\/risk-template\/([^/]+)$/;
// Only these exact admin routes show the shared date-range picker in the header.
const DATE_RANGE_ROUTES = new Set([
  '/admin/data-activity',
  '/admin/domain-configuration',
  '/admin/group-management',
  '/admin/user-registry',
  '/admin/log-management',
]);

export default function AdminSectionLayout({ children }) {
  return (
    <Suspense fallback={null}>
      <AdminSectionShell>{children}</AdminSectionShell>
    </Suspense>
  );
}

/**
 * Shared shell for the whole /admin/* route tree. Living here — instead of
 * duplicated inside every page.jsx (and, for domain-configuration, its own
 * nested layout.jsx files) — means Sidebar/PageHeader persist across
 * navigation between admin pages instead of unmounting and remounting on
 * every click (see CLAUDE.md #45).
 */
function AdminSectionShell({ children }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isDecisionDesigner = DECISION_DESIGNER_ROUTE.test(pathname);
  const templateName = searchParams.get('name');

  const riskSlugMatch = pathname.match(RISK_TEMPLATE_SLUG_ROUTE);
  const isRiskTemplateSlug = Boolean(riskSlugMatch);
  const riskTemplateName = riskSlugMatch ? decodeURIComponent(riskSlugMatch[1]) : '';

  let headerProps;
  if (PNID_ROUTE.test(pathname)) {
    headerProps = { title: 'Domain Configuration', subtitle: 'P&ID Configuration' };
  } else if (DSI_ROUTE.test(pathname)) {
    headerProps = { title: 'Domain Configuration', subtitle: 'Data Source Integration' };
  } else if (isDecisionDesigner) {
    headerProps = {
      title: 'Decision Workflow Designer',
      subtitle: 'Category-based layout builder',
      breadcrumbs: [{ label: templateName || 'Template' }],
    };
  } else if (isRiskTemplateSlug) {
    headerProps = {
      title: riskTemplateName,
      subtitle: 'Domain Ontology',
      breadcrumbs: [{ label: riskTemplateName, icon: ShieldAlert }],
    };
  } else {
    headerProps = { showDateRange: DATE_RANGE_ROUTES.has(pathname) };
  }

  return (
    <div className="flex h-screen w-full bg-canvas text-text-secondary overflow-hidden font-sans selection:bg-brand/30">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 min-h-0 relative">
        <PageHeader {...headerProps} />
        {children}
      </main>
    </div>
  );
}
