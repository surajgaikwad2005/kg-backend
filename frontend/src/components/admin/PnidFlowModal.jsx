'use client';

/**
 * PnidFlowModal — navigation bridge for the P&ID / Domain Configuration feature.
 *
 * Previously rendered pages in-modal. Now it redirects to the real Next.js URL
 * routes under /admin/domain-configuration/pnid/* so the feature has proper URL-based
 * state persistence, browser history, and deep-linking.
 *
 * Callback bridge: the new URL pages dispatch window CustomEvents
 * ('pnid:processed', 'pnid:validated') so AdminPanel's onProcessed / onValidated
 * callbacks keep working even though this modal no longer renders the pages.
 */
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PNID_ROUTES } from '@/src/app/(admin)/admin/domain-configuration/pnid/_lib/routes';

export function PnidFlowModal({ isOpen, onClose, onComplete, onProcessed, onValidated }) {
  const router = useRouter();

  // When opened: navigate to real URL + close the modal overlay.
  useEffect(() => {
    if (!isOpen) return;
    router.push(PNID_ROUTES.homeUrl());
    onClose?.();
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // Bridge window events from URL pages back to AdminPanel callbacks.
  // Listeners stay mounted as long as this component is in the tree.
  useEffect(() => {
    const handleProcessed = (e) => onProcessed?.(e.detail);
    const handleValidated = (e) => onValidated?.(e.detail);
    const handleComplete = () => onComplete?.();

    window.addEventListener('pnid:processed', handleProcessed);
    window.addEventListener('pnid:validated', handleValidated);
    window.addEventListener('pnid:complete', handleComplete);
    return () => {
      window.removeEventListener('pnid:processed', handleProcessed);
      window.removeEventListener('pnid:validated', handleValidated);
      window.removeEventListener('pnid:complete', handleComplete);
    };
  }, [onProcessed, onValidated, onComplete]);

  // No visual output — this component is a navigation + event bridge only.
  return null;
}
