'use client';
import { useId } from 'react';
import { motion } from 'framer-motion';
import { Modal, ModalFooter } from './Modal';
import { Button } from './Button';

const icons = {
  danger: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    </svg>
  ),
  warning: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path strokeLinecap="round" d="M12 8v4m0 4h.01" />
    </svg>
  ),
  info: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path strokeLinecap="round" d="M12 16v-4m0-4h.01" />
    </svg>
  ),
  success: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
    </svg>
  ),
};

const intentTokens = {
  danger:  { text: 'text-danger',  bg: 'bg-danger/10',  ring: 'border-danger/25',  wash: 'bg-danger/20',  bar: 'via-danger',  halo: 'bg-danger/25' },
  warning: { text: 'text-warning', bg: 'bg-warning/10', ring: 'border-warning/25', wash: 'bg-warning/20', bar: 'via-warning', halo: 'bg-warning/25' },
  info:    { text: 'text-info',    bg: 'bg-info/10',    ring: 'border-info/25',    wash: 'bg-info/20',    bar: 'via-info',    halo: 'bg-info/25' },
  success: { text: 'text-success', bg: 'bg-success/10', ring: 'border-success/25', wash: 'bg-success/20', bar: 'via-success', halo: 'bg-success/25' },
};

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  description,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  intent = 'danger',
  isPending = false,
  children,
}) {
  const titleId = useId();
  const descId = useId();
  const confirmVariant = ['danger', 'warning', 'success'].includes(intent) ? intent : 'primary';
  const tokens = intentTokens[intent] ?? intentTokens.danger;

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      closeOnBackdrop={!isPending}
      ariaLabelledBy={titleId}
      ariaDescribedBy={description ? descId : undefined}
      className="overflow-hidden"
    >
      {/* Intent accent line */}
      <div className={`absolute top-0 inset-x-0 h-0.75 bg-linear-to-r from-transparent ${tokens.bar} to-transparent`} />

      {/* Hero zone */}
      <div className="relative px-6 pt-10 pb-4 text-center">
        <div
          className={`absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full ${tokens.wash} blur-3xl pointer-events-none`}
          aria-hidden="true"
        />

        <div className="relative flex flex-col items-center">
          <div className="relative w-16 h-16 mb-4 shrink-0">
            <span className={`absolute inset-0 rounded-full ${tokens.halo} animate-confirm-halo`} aria-hidden="true" />
            <span className={`absolute -inset-1.5 rounded-full border ${tokens.ring}`} aria-hidden="true" />
            <motion.div
              initial={{ scale: 0.5, opacity: 0, rotate: -8 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 18 }}
              className={`relative w-16 h-16 rounded-full border ${tokens.ring} ${tokens.bg} ${tokens.text} flex items-center justify-center shadow-lg`}
              aria-hidden="true"
            >
              {icons[intent] ?? icons.danger}
            </motion.div>
          </div>

          <h3 id={titleId} className="text-xl font-extrabold tracking-tight text-text-primary leading-snug">
            {title}
          </h3>
          {description && (
            <p id={descId} className="mt-2 text-sm font-medium text-text-secondary leading-relaxed max-w-76">
              {description}
            </p>
          )}
        </div>
      </div>

      {children && <div className="px-6 pb-4 -mt-1">{children}</div>}

      <ModalFooter className="gap-2.5">
        <Button variant="outline" size="md" onClick={onClose} disabled={isPending} className="flex-1">
          {cancelLabel}
        </Button>
        <Button
          variant={confirmVariant}
          size="md"
          isPending={isPending}
          onClick={() => { onConfirm?.(); }}
          className="flex-1"
        >
          {confirmLabel}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
