'use client';

import React from 'react';
import { X, Check } from 'lucide-react';
import { Modal } from '@/src/components/ui/Modal';

export default function CreateGroupModal({
  isOpen,
  onClose,
  name,
  setName,
  desc,
  setDesc,
  theme,
  setTheme,
  onCreate,
}) {
  const themes = ['blue', 'red', 'green', 'orange', 'purple'];

  const colorCircles = {
    blue: 'bg-blue-500 hover:opacity-90',
    red: 'bg-red-500 hover:opacity-90',
    green: 'bg-emerald-500 hover:opacity-90',
    orange: 'bg-amber-500 hover:opacity-90',
    purple: 'bg-purple-500 hover:opacity-90',
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      size="md"
      className="rounded-2xl overflow-hidden"
    >
      {/* Modal Wrapper for A11y */}
      <div role="dialog" aria-modal="true" aria-labelledby="modal-create-dashboard-title">
        <div className="bg-surface-2 px-6 py-4 flex items-center justify-between border-b border-border">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-text-primary" id="modal-create-dashboard-title">
              Create New Dashboard
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary p-1 rounded-lg hover:bg-surface transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6 bg-surface flex flex-col gap-4 text-xs">
          {/* Dashboard Name */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="dashboard-name" className="font-bold text-text-primary">
              Dashboard Name <span className="text-red-500">*</span>
            </label>
            <input
              id="dashboard-name"
              type="text"
              className="w-full px-3 py-2 border border-border rounded-lg bg-surface-2 text-text-primary outline-none focus:border-brand focus:bg-surface focus:ring-2 focus:ring-brand/10 transition-all font-medium"
              placeholder="e.g. Operations Monitor"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="dashboard-desc" className="font-bold text-text-primary">
              Description
            </label>
            <textarea
              id="dashboard-desc"
              rows={3}
              className="w-full px-3 py-2 border border-border rounded-lg bg-surface-2 text-text-primary outline-none focus:border-brand focus:bg-surface focus:ring-2 focus:ring-brand/10 transition-all font-medium resize-none"
              placeholder="Brief summary of widgets inside this dashboard..."
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
          </div>

          {/* Theme Selector */}
          <div className="flex flex-col gap-2">
            <span className="font-bold text-text-primary">Dashboard Color</span>
            <div className="flex items-center gap-3">
              {themes.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTheme(t)}
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-white font-bold transition-transform cursor-pointer hover:scale-105 active:scale-95 ${colorCircles[t]}`}
                  aria-label={`Select ${t} theme`}
                >
                  {theme === t && <Check size={14} className="stroke-[3]" />}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2.5 mt-2 border-t border-border pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-border rounded-lg font-bold text-text-primary hover:bg-surface-2 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={onCreate}
              className="px-4 py-2 bg-brand hover:bg-brand-hover text-white rounded-lg font-bold shadow-md shadow-brand/20 active:scale-95 transition-all cursor-pointer"
            >
              Create Dashboard
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export const CreateDashboardModal = CreateGroupModal;
