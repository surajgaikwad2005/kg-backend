'use client';
import React, { useState } from 'react';
import { Workflow, FileCheck, Upload, Settings, Loader2 } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { Modal, ModalBody } from '@/src/components/ui/Modal';
import { addEquipmentColumn } from '@/src/services/risk-template/riskTemplateService';
import { useToast } from '@/src/components/ui/Toast';
import { useApp } from '@/src/context/AppContext';

export function UploadRiskTemplateModal({ onClose, onConfig }) {
  const { error: toastError } = useToast();
  const { plantCode } = useApp();
  const [templateName, setTemplateName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const canSubmit = selectedFile && templateName.trim() && !isLoading;

  const handleConfig = async () => {
    if (!canSubmit) return;
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('template_name', templateName.trim());
      formData.append('dashboard_name', templateName.trim());
      const res = await addEquipmentColumn(formData, plantCode);
      onConfig(templateName.trim(), res.data, selectedFile);
    } catch (err) {
      toastError('Upload failed', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal open onClose={onClose} size="lg" closeOnBackdrop={false} title="Upload Risk Template">
      <ModalBody className="relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-muted/40 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-brand-muted/30 rounded-full blur-3xl -ml-24 -mb-24 pointer-events-none" />

        <div className="relative flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-brand-muted rounded-2xl shrink-0">
              <Workflow className="w-6 h-6 text-brand" />
            </div>
            <p className="text-2xs font-bold text-text-muted uppercase tracking-widest leading-none">Configure Risk Template Base</p>
          </div>

          {/* Template name */}
          <div>
            <label htmlFor="upload-template-name" className="text-2xs font-black text-text-muted uppercase tracking-widest mb-2.5 block pl-1">Template Name</label>
            <input
              id="upload-template-name"
              type="text"
              value={templateName}
              onChange={e => setTemplateName(e.target.value)}
              placeholder="e.g. API 581 Risk Assessment"
              className="w-full px-4 py-3.5 bg-surface-2 border-2 border-border rounded-2xl text-body font-bold text-text-primary placeholder:text-text-subtle focus:border-brand focus:bg-surface outline-none transition-all"
            />
          </div>

          {/* File upload */}
          <div>
            <label className="text-2xs font-black text-text-muted uppercase tracking-widest mb-2.5 block pl-1">
              Knowledge Source (Excel / CSV / PDF)
            </label>
            <div className={cn(
              'relative group border-2 border-dashed rounded-3xl p-8 transition-all text-center',
              selectedFile
                ? 'border-success/40 bg-success/5'
                : 'border-border bg-surface-2/50 hover:border-brand',
            )}>
              <input
                type="file"
                accept=".csv,.xlsx,.xls,.pdf"
                aria-label="Upload knowledge source file"
                onChange={e => setSelectedFile(e.target.files?.[0] || null)}
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
              />
              {selectedFile ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="p-4 bg-success/10 rounded-2xl">
                    <FileCheck className="w-8 h-8 text-success" />
                  </div>
                  <p className="text-body-sm font-black text-text-primary truncate max-w-48">{selectedFile.name}</p>
                  <button
                    onClick={e => { e.stopPropagation(); setSelectedFile(null); }}
                    className="text-2xs font-bold text-text-muted hover:text-danger uppercase tracking-widest transition-colors cursor-pointer"
                  >
                    Change File
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="p-4 bg-surface rounded-2xl border border-border group-hover:bg-brand-muted transition-colors">
                    <Upload className="w-8 h-8 text-text-muted group-hover:text-brand transition-colors" />
                  </div>
                  <p className="text-body-sm font-bold text-text-muted">Drag & drop or click to upload</p>
                  <p className="text-2xs font-black text-text-subtle uppercase tracking-widest">Supports XLSX, CSV, XLS, PDF</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer button */}
          <button
            onClick={handleConfig}
            disabled={!canSubmit}
            aria-busy={isLoading}
            className={cn(
              'w-full py-3.5 rounded-2xl flex items-center justify-center gap-3 text-caption font-black uppercase tracking-widest transition-all cursor-pointer',
              canSubmit
                ? 'bg-brand hover:opacity-90 text-white shadow-lg shadow-brand/20 active:scale-[0.98]'
                : 'bg-surface-2 text-text-subtle cursor-not-allowed border-2 border-border',
            )}
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Settings className="w-5 h-5" />}
            {isLoading ? 'Processing…' : 'Config'}
          </button>
        </div>
      </ModalBody>
    </Modal>
  );
}
