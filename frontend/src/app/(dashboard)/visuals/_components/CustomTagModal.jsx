'use client';
import React, { useState } from 'react';
import { X, Search, Check, Brain, AlertTriangle, Loader2 } from 'lucide-react';
import { Modal } from '@/src/components/ui/Modal';
import { createCustomTag } from '@/src/services/visuals/visualsService';
import { fmtLocalStr } from '@/src/lib/dashboards.utils';

/**
 * Custom Tag formula builder modal.
 */
export function CustomTagModal({
  isOpen,
  allTags,
  customTagName,
  customTagFormula,
  customTagSearchQuery,
  customTagComputeResult,
  customTagComputeError,
  formulaInputRef,
  workspace,
  localStart,
  localEnd,
  onClose,
  onNameChange,
  onFormulaChange,
  onSearchChange,
  onAppendToFormula,
  onSave,
  onSetError,
}) {
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveAndCompute = async () => {
    if (!customTagName.trim()) { onSetError('Please provide a valid Tag Name'); return; }
    if (!customTagFormula.trim()) { onSetError('Please provide a formula'); return; }
    const cleanName = customTagName.trim().replace(/\s+/g, '_');
    setIsSaving(true);
    try {
      const username = typeof window !== 'undefined' ? (localStorage.getItem('username') || 'admin') : 'admin';
      const dashboardName = workspace.isBackend ? (workspace.backendName || workspace.name) : workspace.name;
      const startTimeStr = localStart ? fmtLocalStr(localStart) : (workspace.start || '2025-01-01 00:00:00');
      const endTimeStr = localEnd ? fmtLocalStr(localEnd) : (workspace.end || '2025-01-01 23:59:59');

      await createCustomTag({
        tag_name: cleanName,
        formula: customTagFormula,
        username,
        dashboard_name: dashboardName,
        start_time: startTimeStr,
        end_time: endTimeStr,
      });
    } catch (e) {
    } finally {
      setIsSaving(false);
    }
    const cleanName2 = customTagName.trim().replace(/\s+/g, '_');
    const updatedCustomTags = [...(workspace.customTags || []), { name: cleanName2, formula: customTagFormula }];
    const updatedTags = [...workspace.tags, cleanName2];
    onSave({ ...workspace, customTags: updatedCustomTags, tags: updatedTags, updatedAt: new Date().toISOString() });
    onClose();
  };

  return (
    <Modal open={isOpen} onClose={onClose} size="xl" className="max-w-145 overflow-hidden flex flex-col max-h-[90vh]">
      {/* Header */}
      <div className="p-6 border-b border-surface-2 flex justify-between items-center bg-canvas">
        <div>
          <h3 id="custom-tag-modal-title" className="m-0 text-xl font-black text-text-primary tracking-tight">Custom Tag</h3>
          <p className="mt-1 mb-0 text-[11px] font-bold text-text-subtle tracking-wider uppercase">CONFIGURE DATA &amp; AESTHETICS</p>
        </div>
        <button onClick={onClose} aria-label="Close" className="bg-surface-2 border-none rounded-full p-2 cursor-pointer flex transition-colors text-text-secondary hover:bg-surface-3">
          <X size={18} />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
        {/* Tag Name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-label font-black text-text-subtle tracking-wider uppercase">TAG NAME</label>
          <input
            type="text"
            placeholder="Enter tag name..."
            value={customTagName}
            onChange={e => onNameChange(e.target.value)}
            className="w-full box-border bg-canvas border-[1.5px] border-border rounded-xl px-4 py-3 text-[13px] font-bold text-text-primary outline-none focus:border-brand"
          />
        </div>

        {/* Data Sources */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center">
            <label className="text-label font-black text-text-subtle tracking-wider uppercase">DATA SOURCE (SENSOR TAG)</label>
            <span className="text-2xs font-extrabold text-brand bg-brand-muted px-2 py-0.5 rounded-md border border-brand/20 uppercase">Select component tags</span>
          </div>

          {/* Search */}
          <div className="relative flex items-center">
            <Search size={14} className="text-text-subtle absolute left-3.5" />
            <input
              type="text"
              placeholder="Search tags..."
              value={customTagSearchQuery}
              onChange={e => onSearchChange(e.target.value)}
              className="w-full box-border bg-surface border-[1.5px] border-border rounded-xl py-2.5 pr-4 pl-[38px] text-xs font-semibold text-text-primary outline-none focus:border-brand"
            />
          </div>

          {/* Tag pills */}
          <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-2 max-h-[110px] overflow-y-auto p-2 border border-surface-2 rounded-xl bg-canvas">
            {Array.from(new Set(allTags || []))
              .filter(tag => tag.toLowerCase().includes(customTagSearchQuery.toLowerCase()))
              .map((tag, idx) => {
                const isUsed = customTagFormula.includes(tag);
                return (
                  <button
                    key={`${tag}_${idx}`}
                    onClick={() => onAppendToFormula(tag)}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-label font-bold cursor-pointer transition-all ${
                      isUsed ? 'border-[1.5px] border-brand/40 bg-brand-muted text-brand' : 'border border-border bg-surface text-text-secondary hover:bg-surface-2'
                    }`}
                  >
                    <span className="overflow-hidden text-ellipsis whitespace-nowrap">{tag}</span>
                    {isUsed && <Check size={11} className="text-brand" />}
                  </button>
                );
              })}
          </div>
        </div>

        {/* Operators */}
        <div className="flex flex-col gap-1.5">
          <label className="text-label font-black text-text-subtle tracking-wider uppercase">MATH OPERATORS</label>
          <div className="grid grid-cols-6 gap-2">
            {['+', '-', '*', '/', '(', ')'].map(op => (
              <button key={op} onClick={() => onAppendToFormula(` ${op} `)} className="py-2 border border-border-strong rounded-lg bg-surface hover:bg-surface-2 text-[13px] font-black text-text-primary cursor-pointer transition-all">
                {op}
              </button>
            ))}
          </div>
        </div>

        {/* Logic Configuration */}
        <div className="flex flex-col gap-1.5 p-[18px] bg-canvas rounded-[20px] border-[1.5px] border-border shadow-card">
          <div className="flex items-center gap-1.5 mb-1">
            <Brain size={14} className="text-brand" />
            <label className="text-2xs font-black text-text-secondary tracking-wider uppercase">LOGIC CONFIGURATION</label>
          </div>
          <textarea
            ref={formulaInputRef}
            value={customTagFormula}
            onChange={e => onFormulaChange(e.target.value)}
            placeholder="e.g., (GG_START * 1.5) + CDP"
            className="w-full box-border bg-surface border-[1.5px] border-border rounded-xl px-4 py-3 text-xs font-mono text-brand font-bold outline-none min-h-[72px] resize-y shadow-[inset_0_1px_3px_rgba(0,0,0,0.02)] transition-colors focus:border-brand"
          />
          <p className="mt-1 mb-0 text-2xs text-text-muted italic leading-[1.4]">Combine physical sensor tags with arithmetic symbols to create calculated custom indicators.</p>
        </div>

        {/* Compute result / error */}
        {(customTagComputeResult !== null || customTagComputeError !== null) && (
          <div className={`px-3.5 py-2.5 rounded-[10px] border-[1.5px] text-[11px] font-bold flex items-center gap-2 ${customTagComputeError ? 'border-danger/20 bg-danger/10 text-danger' : 'border-success/20 bg-success/10 text-success'}`}>
            {customTagComputeError ? (
              <>
                <AlertTriangle size={14} className="text-danger" />
                <span>Error: {customTagComputeError}</span>
              </>
            ) : (
              <>
                <Check size={14} className="text-success" />
                <span>Calculation Test Passed! Output value: <strong className="text-xs font-mono">{typeof customTagComputeResult === 'number' ? customTagComputeResult.toFixed(4) : customTagComputeResult}</strong></span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-5 bg-canvas border-t border-surface-2 flex gap-3">
        <button onClick={onClose} className="flex-1 py-3 bg-surface border border-border rounded-xl text-[11px] font-black text-text-secondary cursor-pointer uppercase tracking-wider hover:bg-surface-2">
          Cancel
        </button>
        <button
          onClick={handleSaveAndCompute}
          disabled={isSaving}
          aria-busy={isSaving}
          className={`flex-2 py-3 border-none rounded-xl text-caption font-black text-white uppercase tracking-wider shadow-card flex items-center justify-center gap-2 ${
            isSaving ? 'bg-brand opacity-80 cursor-wait' : 'bg-brand hover:bg-brand-hover cursor-pointer'
          }`}
        >
          {isSaving && <Loader2 size={14} className="animate-spin" />}
          {isSaving ? 'SAVING...' : '+ SAVE & COMPUTE'}
        </button>
      </div>
    </Modal>
  );
}
