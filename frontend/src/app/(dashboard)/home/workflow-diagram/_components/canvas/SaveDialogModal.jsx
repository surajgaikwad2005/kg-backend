'use client';
import React from 'react';
import { Save } from 'lucide-react';
import { Modal, ModalBody } from '@/src/components/ui/Modal';

export function SaveDialogModal({
  showSaveDialog,
  setShowSaveDialog,
  saveName,
  setSaveName,
  confirmSave,
  isSaving
}) {
  const close = () => setShowSaveDialog(false);

  return (
    <Modal open={showSaveDialog} onClose={close} size="sm" title="Save Diagram">
      <ModalBody>
        <div className="flex items-center gap-2 mb-3">
          <Save className="w-4 h-4 text-success" />
          <span className="text-caption font-bold text-text-muted uppercase tracking-widest">Workflow Diagram</span>
        </div>
        <input
          autoFocus
          value={saveName}
          onChange={(e) => setSaveName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') confirmSave(); }}
          placeholder="Diagram name..."
          aria-label="Diagram name"
          className="w-full bg-surface-2 border-2 border-border focus:border-success rounded-xl px-3 py-2 text-body-sm font-bold outline-none transition-all mb-4 text-text-primary placeholder:text-text-subtle"
        />
        <div className="flex gap-2">
          <button
            onClick={close}
            className="flex-1 py-2.5 bg-surface-2 hover:bg-surface text-text-secondary rounded-xl font-bold text-caption transition-colors cursor-pointer border border-border"
          >
            Cancel
          </button>
          <button
            onClick={confirmSave}
            disabled={!saveName.trim() || isSaving}
            aria-busy={isSaving}
            className="flex-1 py-2.5 bg-success hover:bg-success-hover disabled:opacity-50 text-white rounded-xl font-black text-caption transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </ModalBody>
    </Modal>
  );
}
