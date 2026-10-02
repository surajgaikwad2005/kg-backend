'use client';
import { useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';

import { AnimatePresence, motion } from 'framer-motion';

const widths = {
  sm:   'max-w-sm',
  md:   'max-w-md',
  lg:   'max-w-lg',
  xl:   'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  full: 'max-w-full',
};

export function Modal({
  open,
  onClose,
  title,
  children,
  size = 'md',
  className = '',
  closeOnBackdrop = true,
  ariaLabelledBy,
  ariaDescribedBy,
}) {
  const titleId = useId();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!open) return;
    // Gated by closeOnBackdrop too: a caller that disables backdrop-dismiss
    // (mid-upload, isPending, etc.) means "don't let this close early" —
    // Escape bypassing that guard while the backdrop click respects it was
    // an inconsistent escape hatch out of an in-flight action.
    const handler = (e) => e.key === 'Escape' && closeOnBackdrop && onClose?.();
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose, closeOnBackdrop]);

  // Portal to document.body so this modal's stacking order is independent of
  // any ancestor's z-index/stacking context — a nested "fixed z-50" element
  // only ranks against its own ancestor's stacking slot, so a sibling
  // elsewhere in the tree with an equal-or-higher z-index (and later in DOM
  // order) can paint on top of the whole modal otherwise.
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closeOnBackdrop ? onClose : undefined}
            aria-hidden="true"
          />

          {/* Panel.
              Capped and made a flex column so a tall modal scrolls INSIDE
              itself. Without the cap the panel grew past the viewport and the
              wrapper's `items-center` then clipped it at BOTH ends — title and
              close button off the top, content off the bottom, and nothing
              scrollable anywhere. ModalBody takes the overflow; the title row
              and ModalFooter stay pinned. */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", bounce: 0, duration: 0.3 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby={ariaLabelledBy ?? (title ? titleId : undefined)}
            aria-describedby={ariaDescribedBy}
            className={`relative bg-surface rounded-(--do-radius) shadow-modal w-full flex flex-col max-h-[calc(100dvh-2rem)] overflow-hidden ${widths[size] ?? widths.md} ${className}`}
          >
            {title && (
              <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
                <h2 id={titleId} className="text-sm font-semibold text-text-primary">{title}</h2>
                <button
                  onClick={onClose}
                  className="text-text-muted hover:text-text-primary transition-colors rounded-lg p-1 cursor-pointer"
                  aria-label="Close"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            )}
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

/**
 * `min-h-0` is what actually lets this shrink inside the panel's flex column —
 * a flex child's default `min-height: auto` refuses to go below its content, so
 * without it the panel would still be pushed past its max-height and nothing
 * would scroll.
 */
export function ModalBody({ children, className = '' }) {
  return (
    <div className={`px-6 py-5 min-h-0 overflow-y-auto ${className}`}>
      {children}
    </div>
  );
}

export function ModalFooter({ children, className = '' }) {
  return (
    <div className={`flex items-center justify-end gap-3 px-6 py-4 border-t border-border shrink-0 ${className}`}>
      {children}
    </div>
  );
}
