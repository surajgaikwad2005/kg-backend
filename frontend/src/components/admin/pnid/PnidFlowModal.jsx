'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PNID_ROUTES } from '@/src/app/(admin)/admin/domain-configuration/pnid/_lib/routes';

export function PnidFlowModal({ isOpen, onClose, onComplete, onProcessed, onValidated }) {
  const router = useRouter();

  useEffect(() => {
    if (!isOpen) return;
    router.push(PNID_ROUTES.homeUrl());
    onClose?.();
  }, [isOpen]);

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

  return null;
}
