'use client';
import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Modal, ModalBody, ModalFooter } from '@/src/components/ui/Modal';
import { Button } from '@/src/components/ui/Button';
import { usePnidForm } from '@/src/components/admin/AdminPanelContext';

export function DuplicateFilesDialog() {
  const { pnidDuplicateDialog, setPnidDuplicateDialog } = usePnidForm();
  const dismiss = () => setPnidDuplicateDialog(prev => ({ ...prev, open: false }));

  return (
    <Modal open={pnidDuplicateDialog.open} onClose={dismiss} size="md">
      <ModalBody className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
            <AlertTriangle size={20} className="text-warning" />
          </div>
          <h3 className="text-lg font-bold text-text-primary">Duplicate Files Detected</h3>
        </div>
        <p className="text-sm text-text-muted leading-relaxed">
          The following files have already been uploaded and processed. Would you like to reprocess them?
        </p>
        <div className="max-h-40 overflow-y-auto bg-surface-2 rounded-lg p-3 space-y-1 scrollbar-thin scrollbar-thumb-border-strong">
          {pnidDuplicateDialog.duplicates.map(name => (
            <div key={name} className="flex items-center gap-2 text-sm text-text-secondary">
              <RefreshCw size={14} className="text-warning shrink-0" />
              <span className="truncate">{name}</span>
            </div>
          ))}
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="ghost" onClick={pnidDuplicateDialog.onSkip}>Skip Duplicates</Button>
        <button onClick={pnidDuplicateDialog.onReprocess}
          className="bg-warning hover:bg-warning/80 text-white font-bold py-2 px-6 rounded-lg shadow-lg shadow-warning/20 transition-all active:scale-95 text-sm cursor-pointer">
          Reprocess All
        </button>
      </ModalFooter>
    </Modal>
  );
}
export default DuplicateFilesDialog;
