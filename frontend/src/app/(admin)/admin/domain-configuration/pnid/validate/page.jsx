'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/src/context/AppContext';
import { useInvalidateConnectorState } from '@/src/components/admin/_queries/useDsiQueries';
import { PnidUrlModeProvider } from '@/src/app/(admin)/admin/domain-configuration/pnid/_context/PnidRouterContext';
import ValidateResultsPage from '@/src/app/(admin)/admin/domain-configuration/pnid/validate/_components/ValidateResultsPage';

export default function ValidatePage() {
  const router = useRouter();
  const { plantId } = useApp();
  const invalidateConnectorState = useInvalidateConnectorState(plantId?.id || plantId?.code);

  // After "Send to Staging" succeeds, PnidUrlModeProvider dispatches pnid:validated.
  // "Send to Staging" means the P&ID domain-config flow is complete — status = Uploaded
  // (green), NOT Validated (yellow).
  //
  // This used to hand-write a fake P&ID row into `admin_configured_sources::<plant>`
  // so the other screen would render it. That cross-screen localStorage signal is
  // gone: data-source-integration reads GET /connectors/state now, so staging is
  // announced by invalidating that cache and letting the screen re-read the real
  // state. The write would have been dead anyway — nothing reads that key.
  useEffect(() => {
    const handleValidated = () => {
      invalidateConnectorState();
      router.push('/admin/domain-configuration/data-source-integration');
    };

    window.addEventListener('pnid:validated', handleValidated);
    return () => window.removeEventListener('pnid:validated', handleValidated);
  }, [router, invalidateConnectorState]);

  return (
    <PnidUrlModeProvider>
      <ValidateResultsPage />
    </PnidUrlModeProvider>
  );
}
