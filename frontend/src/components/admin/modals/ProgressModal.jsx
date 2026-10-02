'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';
import { Modal, ModalBody } from '@/src/components/ui/Modal';
import { useAdminNav } from '@/src/components/admin/AdminPanelContext';

export default function ProgressModal() {
  const { isProgressModalOpen, progress, progressModalTitle, progressModalSubtitle, handleDoneProgress } = useAdminNav();

  return (
    // A running progress dialog must not be dismissable — no backdrop close,
    // and Escape/close routes through handleDoneProgress only when finished.
    <Modal
      open={isProgressModalOpen}
      onClose={progress < 100 ? undefined : handleDoneProgress}
      size="md"
      closeOnBackdrop={false}
    >
      <ModalBody className="p-8 text-center" aria-busy={progress < 100}>
        <div className="mb-8">
          <div className="w-20 h-20 rounded-full bg-brand/10 flex items-center justify-center text-brand mx-auto mb-6">
            <Activity size={40} className={progress < 100 ? 'animate-pulse' : ''} />
          </div>
          <h3 className="text-2xl font-bold text-text-primary mb-2">{progressModalTitle}</h3>
          <p className="text-text-muted text-sm">{progressModalSubtitle}</p>
        </div>

        <div className="space-y-4 mb-10">
          <div className="h-2 w-full bg-surface-2 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }} animate={{ width: `${progress}%` }}
              className="h-full bg-brand shadow-[0_0_15px_var(--color-brand)]"
            />
          </div>
          <div className="flex justify-between text-label font-bold uppercase tracking-widest text-text-muted">
            <span>{progress < 100 ? 'Processing...' : 'Complete'}</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>

        <button
          disabled={progress < 100}
          onClick={handleDoneProgress}
          className={`w-full py-4 rounded-2xl font-bold transition-all ${progress < 100 ? 'bg-surface-2 text-text-muted cursor-not-allowed' : 'bg-brand hover:bg-brand-hover text-white shadow-xl shadow-brand/20 cursor-pointer'}`}
        >
          Done
        </button>
      </ModalBody>
    </Modal>
  );
}
