'use client';

import { PnidUrlModeProvider } from '@/src/app/(admin)/admin/domain-configuration/pnid/_context/PnidRouterContext';
import TemplateMatchingPage from '@/src/app/(admin)/admin/domain-configuration/pnid/template-matching/_components/TemplateMatchingPage';

export default function TemplateMatchingRoutePage() {
  return (
    <PnidUrlModeProvider>
      <TemplateMatchingPage />
    </PnidUrlModeProvider>
  );
}
