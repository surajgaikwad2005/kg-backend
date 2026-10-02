'use client';

import React, { useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';

export default function AddVisualDrawer({
  isOpen,
  onClose,
  onSave,
  editingVisualId,
  isSubmitting = false,
  children,
}) {
  // Inline drawer doesn't need to lock the whole body scroll

  if (!isOpen) return null;

  return (
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-visual-title"
        className="h-full w-[320px] 2xl:w-[360px] bg-surface border-l border-border flex flex-col shrink-0 transition-all animate-slideIn overflow-hidden"
      >
        {/* Drawer Header */}
        <div className="bg-surface-2 p-4 flex items-center justify-between border-b border-border shrink-0 relative z-20">
          <div className="flex items-center gap-2">
            <span
              id="drawer-visual-title"
              className="text-sm font-bold text-text-primary"
            >
              {editingVisualId ? 'Edit Visual' : 'Create Visual'}
            </span>
            {isSubmitting && (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-brand ml-2">
                <Loader2 size={13} className="animate-spin" />
                <span>Processing...</span>
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-text-muted hover:text-text-primary p-1.5 rounded-lg hover:bg-surface disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Top Loading Progress Bar */}
        {isSubmitting && (
          <div className="h-0.5 w-full bg-brand/20 overflow-hidden relative shrink-0 z-20">
            <div className="h-full bg-brand animate-pulse w-full" />
          </div>
        )}

        {/* Drawer Scrollable Content */}
        <div
          className={`flex-1 min-h-0 overflow-y-auto p-4 custom-scrollbar relative z-0 transition-opacity ${
            isSubmitting ? 'opacity-65 pointer-events-none select-none' : ''
          }`}
        >
          {children}
        </div>

        {/* Drawer Actions Footer */}
        <div className="p-4 border-t border-border bg-surface-2 shrink-0 relative z-20 flex items-center gap-3 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)]">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 h-8 bg-surface border border-border hover:bg-border/40 text-text-muted hover:text-text-primary rounded-md font-bold text-[11.5px] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          
          <button
            onClick={onSave}
            disabled={isSubmitting}
            className="flex-1 h-8 bg-brand hover:bg-brand-hover text-white rounded-md font-bold text-[11.5px] tracking-wide shadow-sm shadow-brand/25 active:scale-[0.98] disabled:opacity-75 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={13} className="animate-spin opacity-80" />
                <span>{editingVisualId ? 'Updating...' : 'Saving...'}</span>
              </>
            ) : (
              <>
                <span>{editingVisualId ? 'Update' : 'Create'}</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3.5 h-3.5 opacity-80"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </>
            )}
          </button>
        </div>
      </aside>
  );
}
