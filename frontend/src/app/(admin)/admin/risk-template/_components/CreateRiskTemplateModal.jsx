'use client';
import React, { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { Modal, ModalBody } from '@/src/components/ui/Modal';

export function CreateRiskTemplateModal({ onClose, onConfirm }) {
  const [templateName, setTemplateName] = useState('');

  return (
    <Modal open onClose={onClose} size="lg" closeOnBackdrop={false} title="Create New Risk Template">
      <ModalBody className="space-y-5">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-brand-muted rounded-2xl shrink-0">
            <PlusCircle className="w-6 h-6 text-brand" />
          </div>
          <p className="text-2xs font-bold text-text-muted uppercase tracking-widest leading-none">Initialization Protocol</p>
        </div>

        <div>
          <label htmlFor="create-template-name" className="text-2xs font-black text-text-muted uppercase tracking-widest mb-2.5 block pl-1">
            Template Name
          </label>
          <input
            id="create-template-name"
            type="text"
            value={templateName}
            onChange={e => setTemplateName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && templateName.trim()) onConfirm(templateName.trim()); }}
            placeholder="e.g. Failure Mode & Effects Analysis"
            className="w-full px-4 py-3.5 bg-surface-2 border-2 border-border rounded-2xl text-body font-bold text-text-primary placeholder:text-text-subtle focus:border-brand focus:bg-surface outline-none transition-all"
            autoFocus
          />
        </div>

        <button
          onClick={() => { if (templateName.trim()) onConfirm(templateName.trim()); }}
          disabled={!templateName.trim()}
          className="w-full py-3.5 bg-text-primary text-surface border-2 border-text-primary rounded-2xl text-caption font-black uppercase tracking-widest hover:opacity-90 shadow-card transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          Confirm &amp; Initialize
        </button>
      </ModalBody>
    </Modal>
  );
}
