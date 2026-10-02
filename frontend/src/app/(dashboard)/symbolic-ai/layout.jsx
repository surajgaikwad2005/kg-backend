'use client';

import React, { Suspense } from 'react';
import { usePathname, useParams } from 'next/navigation';
import { PageHeader } from '@/src/components/layout/PageHeader';
import { BrainCircuit } from 'lucide-react';

const LIST_ROUTE = /^\/symbolic-ai\/?$/;
const DETAIL_ROUTE = /^\/symbolic-ai\/[^/]+$/;

export default function SymbolicAILayout({ children }) {
  return (
    <Suspense fallback={null}>
      <SymbolicAIShell>{children}</SymbolicAIShell>
    </Suspense>
  );
}

/**
 * Shared shell for the symbolic-ai list + [slug] detail routes. Living here
 * — instead of duplicated inside each page.jsx — means PageHeader persists
 * across navigation between list and detail instead of unmounting/
 * remounting (see CLAUDE.md #45).
 *
 * Title comes from the URL slug rather than the detail page's
 * useSymbolicAIPage() hook: that hook fires a real markdown fetch on mount,
 * so calling it again here would double the network request. Known
 * tradeoff: while a user is mid-flow creating a brand-new rule inline from
 * an existing rule's detail page (a same-URL sub-state, not a navigation),
 * the header keeps showing the existing rule's name instead of the new
 * rule's live-typed name until they save and actually navigate.
 */
function SymbolicAIShell({ children }) {
  const pathname = usePathname();
  const params = useParams();
  const isList = LIST_ROUTE.test(pathname);
  const isDetail = DETAIL_ROUTE.test(pathname);
  const ruleName = isDetail && params.slug ? decodeURIComponent(params.slug) : '';

  return (
    <>
      {isList && (
        <PageHeader title="Symbolic AI" subtitle="Rule-Based Intelligence" breadcrumbs={[]} />
      )}
      {isDetail && (
        <PageHeader
          title={ruleName}
          subtitle="Rule-Based Intelligence"
          breadcrumbs={[{ label: ruleName, icon: BrainCircuit }]}
        />
      )}
      {children}
    </>
  );
}
