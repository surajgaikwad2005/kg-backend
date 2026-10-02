'use client';
import { Building2, X } from 'lucide-react';
import { Modal, ModalBody } from '@/src/components/ui/Modal';

/**
 * Gate modal — when `onClose` is omitted the dialog is intentionally
 * non-dismissable (no close button, backdrop/Escape inert): the user must take
 * the primary action.
 */
export default function IndustryGateModal({
  open,
  title,
  description,
  actionLabel,
  onAction,
  onClose,
}) {
  return (
    <Modal open={open} onClose={onClose} size="md" closeOnBackdrop={Boolean(onClose)}>
      {onClose && (
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-2 transition-all cursor-pointer"
        >
          <X size={16} />
        </button>
      )}

      <ModalBody className="p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-brand-muted flex items-center justify-center mx-auto mb-5">
          <Building2 size={28} className="text-brand" />
        </div>

        <h3 className="text-xl font-black text-text-primary mb-2">
          {title}
        </h3>
        <p className="text-sm text-text-muted leading-relaxed mb-8">
          {description}
        </p>

        <button
          onClick={onAction}
          className="w-full py-3.5 px-6 bg-brand hover:bg-brand-hover text-white font-bold rounded-xl transition-all duration-200 hover:-translate-y-0.5 active:scale-95 shadow-md shadow-brand/20 cursor-pointer"
        >
          {actionLabel}
        </button>
      </ModalBody>
    </Modal>
  );
}
