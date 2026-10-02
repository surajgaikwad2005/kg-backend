'use client';
import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Modal, ModalBody } from '@/src/components/ui/Modal';
import { useAdminNav } from '@/src/components/admin/AdminPanelContext';

export default function ContextDoneCard() {
  const { showContextDoneCard, setShowContextDoneCard } = useAdminNav();
  const close = () => setShowContextDoneCard(false);

  return (
    <Modal open={showContextDoneCard} onClose={close} size="md">
      <ModalBody className="p-8 text-center">
        <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={32} className="text-success" />
        </div>
        <h3 className="text-2xl font-bold text-text-primary mb-2">Data Contextualization Complete</h3>
        <p className="text-text-muted text-sm mb-8">
          All data sources have been successfully contextualized. The decision context for P&IDs, Documents,
          Timeseries, and SAP data is now configured.
        </p>
        <button onClick={close}
          className="bg-brand hover:bg-brand-hover text-white font-bold py-3 px-10 rounded-xl shadow-lg shadow-brand/20 transition-all cursor-pointer">
          Done
        </button>
      </ModalBody>
    </Modal>
  );
}
