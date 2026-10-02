'use client';
import React from 'react';
import { X, GitBranch, ChevronRight } from 'lucide-react';
import { Modal } from '@/src/components/ui/Modal';

// Mini SVG previews for each methodology
const CausalMapPreview = () => (
  <svg viewBox="0 0 80 54" className="w-full h-10">
    <rect x="28" y="2" width="24" height="12" rx="3" fill="#fecaca" stroke="#ef4444" strokeWidth="1" />
    <rect x="2" y="18" width="20" height="10" rx="2" fill="#ede9fe" stroke="#8b5cf6" strokeWidth="1" />
    <rect x="2" y="33" width="20" height="10" rx="2" fill="#dbeafe" stroke="#3b82f6" strokeWidth="1" />
    <rect x="2" y="48" width="20" height="10" rx="2" fill="#d1fae5" stroke="#10b981" strokeWidth="1" />
    <rect x="58" y="18" width="20" height="10" rx="2" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1" />
    <rect x="58" y="33" width="20" height="10" rx="2" fill="#cffafe" stroke="#06b6d4" strokeWidth="1" />
    <rect x="58" y="48" width="20" height="10" rx="2" fill="#ffe4e6" stroke="#f43f5e" strokeWidth="1" />
    <line x1="28" y1="8" x2="22" y2="23" stroke="#8b5cf6" strokeWidth="1" strokeDasharray="2" />
    <line x1="28" y1="8" x2="22" y2="38" stroke="#3b82f6" strokeWidth="1" strokeDasharray="2" />
    <line x1="28" y1="8" x2="22" y2="53" stroke="#10b981" strokeWidth="1" strokeDasharray="2" />
    <line x1="52" y1="8" x2="58" y2="23" stroke="#f59e0b" strokeWidth="1" strokeDasharray="2" />
    <line x1="52" y1="8" x2="58" y2="38" stroke="#06b6d4" strokeWidth="1" strokeDasharray="2" />
    <line x1="52" y1="8" x2="58" y2="53" stroke="#f43f5e" strokeWidth="1" strokeDasharray="2" />
  </svg>
);

const FishbonePreview = () => (
  <svg viewBox="0 0 80 54" className="w-full h-10">
    <line x1="4" y1="27" x2="72" y2="27" stroke="#94a3b8" strokeWidth="2" />
    <polygon points="72,22 80,27 72,32" fill="#94a3b8" />
    <line x1="18" y1="27" x2="10" y2="10" stroke="#8b5cf6" strokeWidth="1.5" />
    <line x1="36" y1="27" x2="28" y2="10" stroke="#3b82f6" strokeWidth="1.5" />
    <line x1="54" y1="27" x2="46" y2="10" stroke="#10b981" strokeWidth="1.5" />
    <line x1="18" y1="27" x2="10" y2="44" stroke="#f59e0b" strokeWidth="1.5" />
    <line x1="36" y1="27" x2="28" y2="44" stroke="#06b6d4" strokeWidth="1.5" />
    <line x1="54" y1="27" x2="46" y2="44" stroke="#f43f5e" strokeWidth="1.5" />
    <rect x="7" y="5" width="14" height="8" rx="2" fill="#ede9fe" stroke="#8b5cf6" strokeWidth="1" />
    <rect x="25" y="5" width="14" height="8" rx="2" fill="#dbeafe" stroke="#3b82f6" strokeWidth="1" />
    <rect x="43" y="5" width="14" height="8" rx="2" fill="#d1fae5" stroke="#10b981" strokeWidth="1" />
    <rect x="7" y="42" width="14" height="8" rx="2" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1" />
    <rect x="25" y="42" width="14" height="8" rx="2" fill="#cffafe" stroke="#06b6d4" strokeWidth="1" />
    <rect x="43" y="42" width="14" height="8" rx="2" fill="#ffe4e6" stroke="#f43f5e" strokeWidth="1" />
  </svg>
);

const FiveWhysPreview = () => (
  <svg viewBox="0 0 80 54" className="w-full h-10">
    {[0, 1, 2, 3, 4].map(i => (
      <g key={i}>
        <rect
          x="15" y={i * 10 + 2} width="50" height="8" rx="2"
          fill={['#eef2ff', '#ede9fe', '#faf5ff', '#fdf4ff', '#fef9ff'][i]}
          stroke={['#6366f1', '#8b5cf6', '#a855f7', '#c084fc', '#e879f9'][i]}
          strokeWidth="1"
        />
        <text
          x="40" y={i * 10 + 8} textAnchor="middle" fontSize="4"
          fill={['#6366f1', '#8b5cf6', '#a855f7', '#c084fc', '#e879f9'][i]}
          fontWeight="bold"
        >
          WHY {i + 1}?
        </text>
        {i < 4 && (
          <line
            x1="40" y1={i * 10 + 10} x2="40" y2={i * 10 + 12}
            stroke={['#6366f1', '#8b5cf6', '#a855f7', '#c084fc', '#e879f9'][i]}
            strokeWidth="1"
          />
        )}
      </g>
    ))}
    <rect x="15" y={52} width="50" height="8" rx="2" fill="#dcfce7" stroke="#10b981" strokeWidth="1" />
  </svg>
);

const TEMPLATES = [
  {
    id: 'causal',
    label: 'Causal Map',
    badge: 'SYMMETRIC',
    desc: 'Cards arranged symmetrically around the problem statement',
    preview: <CausalMapPreview />,
  },
  {
    id: 'fishbone',
    label: 'Fishbone',
    badge: 'ISHIKAWA',
    desc: 'Traditional Ishikawa — causes converge to problem on right',
    preview: <FishbonePreview />,
  },
  {
    id: '5whys',
    label: '5 Whys',
    badge: 'SEQUENTIAL',
    desc: 'Vertical inquiry chain drilling down to the root cause',
    preview: <FiveWhysPreview />,
  },
];

const SEVERITIES = ['Low', 'Medium', 'High', 'Critical'];

const SEVERITY_ACTIVE_CLASS = {
  Critical: 'bg-danger text-white border-danger',
  High: 'bg-[#f97316] text-white border-[#f97316]',
  Medium: 'bg-warning text-white border-warning',
  Low: 'bg-brand text-white border-brand',
};

/**
 * RCAModal — 3-step RCA setup modal.
 *
 * @param {{
 *   form: { eventName: string, eventDate: string, equipment: string, description: string, severity: string },
 *   selectedTemplate: string,
 *   onFormChange: (patch: object) => void,
 *   onTemplateChange: (id: string) => void,
 *   onClose: () => void,
 *   onSubmit: () => void,
 * }} props
 */
export function RCAModal({ form, selectedTemplate, onFormChange, onTemplateChange, onClose, onSubmit }) {
  return (
    <Modal open onClose={onClose} size="xl" className="max-w-145 max-h-[90vh] overflow-hidden border border-border">
        {/* Header */}
        <div className="bg-gradient-to-r from-danger to-danger/80 px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-surface/20 rounded-xl flex items-center justify-center">
                <GitBranch className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 id="rca-modal-title" className="text-[18px] font-black text-white">Root Cause Analysis</h2>
                <p className="text-[12px] text-white/60mt-0.5">Define the event to begin your investigation</p>
              </div>
            </div>
            <button onClick={onClose} aria-label="Close" className="p-1.5 hover:bg-surface/20 rounded-lg transition-colors cursor-pointer">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="px-6 py-3 bg-canvas border-b border-border flex items-center gap-2">
          {[
            { n: 1, label: 'Choose Template', active: true },
            { n: 2, label: 'Define Problem', active: false },
            { n: 3, label: 'Generate Canvas', active: false },
          ].map((step, i, arr) => (
            <React.Fragment key={step.n}>
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full text-[11px] font-bold flex items-center justify-center ${step.active ? 'bg-danger text-white' : 'bg-surface-2 text-text-muted'}`}>
                  {step.n}
                </div>
                <span className={`text-[12px] font-${step.active ? 'bold text-text-secondary' : 'semibold text-text-subtle'}`}>{step.label}</span>
              </div>
              {i < arr.length - 1 && <ChevronRight className="w-4 h-4 text-border-strong" />}
            </React.Fragment>
          ))}
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-230px)]">

          {/* Template picker */}
          <div>
            <p className="text-[11px] font-black text-text-subtle uppercase tracking-[0.15em] mb-3">Select Methodology</p>
            <div className="grid grid-cols-3 gap-3">
              {TEMPLATES.map(tmpl => (
                <button
                  key={tmpl.id}
                  onClick={() => onTemplateChange(tmpl.id)}
                  className={`flex flex-col gap-3 p-4 rounded-2xl border-2 transition-all text-left group ${selectedTemplate === tmpl.id ? 'border-danger bg-danger/10 shadow-lg shadow-danger/20' : 'border-border/40 hover:border-border bg-surface hover:shadow-md'}`}
                >
                  <div className={`w-full rounded-xl p-2 transition-colors ${selectedTemplate === tmpl.id ? 'bg-surface/80' : 'bg-canvas'}`}>
                    {tmpl.preview}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[13px] font-black tracking-tight ${selectedTemplate === tmpl.id ? 'text-danger' : 'text-text-secondary'}`}>{tmpl.label}</span>
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full tracking-wider ${selectedTemplate === tmpl.id ? 'bg-danger/20 text-danger' : 'bg-surface-2 text-text-subtle'}`}>{tmpl.badge}</span>
                    </div>
                    <p className="text-[10px] text-text-subtle leading-tight">{tmpl.desc}</p>
                  </div>
                  {selectedTemplate === tmpl.id && (
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-danger">
                      <div className="w-3 h-3 rounded-full bg-danger flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-surface" />
                      </div>
                      Selected
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-borderto-transparent" />

          {/* Event name */}
          <div>
            <label className="block text-[11px] font-black text-text-muted uppercase tracking-wider mb-2">Event / Failure Name *</label>
            <input
              value={form.eventName}
              onChange={e => onFormChange({ eventName: e.target.value })}
              placeholder="e.g. Gas Turbine Trip"
              className="w-full px-4 py-3 border-2 border-border rounded-xl text-[14px] font-bold text-text-primary outline-none focus:border-danger transition-colors bg-surface placeholder:text-border-strong"
            />
          </div>

          {/* Date + Severity */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-black text-text-muted uppercase tracking-wider mb-2">Event Date</label>
              <input
                type="datetime-local"
                value={form.eventDate}
                onChange={e => onFormChange({ eventDate: e.target.value })}
                className="w-full px-4 py-3 border-2 border-border rounded-xl text-[13px] font-bold text-text-secondary outline-none focus:border-danger transition-colors bg-surface"
              />
            </div>
            <div>
              <label className="block text-[11px] font-black text-text-muted uppercase tracking-wider mb-2">Severity Level</label>
              <div className="flex gap-2">
                {SEVERITIES.map(sev => (
                  <button
                    key={sev}
                    onClick={() => onFormChange({ severity: sev })}
                    className={`flex-1 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-wide transition-all border-2 ${form.severity === sev ? SEVERITY_ACTIVE_CLASS[sev] : 'bg-surface text-text-muted border-border hover:border-border-strong'}`}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Equipment */}
          <div>
            <label className="block text-[11px] font-black text-text-muted uppercase tracking-wider mb-2">Equipment / Asset</label>
            <input
              value={form.equipment}
              onChange={e => onFormChange({ equipment: e.target.value })}
              placeholder="e.g. GE Frame 6B Gas Turbine"
              className="w-full px-4 py-3 border-2 border-border rounded-xl text-[14px] font-bold text-text-primary outline-none focus:border-danger transition-colors bg-surface placeholder:text-border-strong"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-black text-text-muted uppercase tracking-wider mb-2">Event Description</label>
            <textarea
              value={form.description}
              onChange={e => onFormChange({ description: e.target.value })}
              placeholder="Describe what happened..."
              rows={3}
              className="w-full px-4 py-3 border-2 border-border rounded-xl text-[13px] text-text-secondary outline-none focus:border-danger transition-colors bg-surface placeholder:text-border-strong resize-none leading-relaxed"
            />
          </div>

          {/* Will generate summary */}
          <div className="bg-canvas rounded-xl p-4 border border-border">
            <div className="text-[11px] font-black text-text-muted uppercase tracking-wider mb-3">This will generate:</div>
            <div className="grid grid-cols-2 gap-2 text-[12px] text-text-secondary">
              {[
                ['🔴', 'Problem Statement Card'],
                ['🐟', '6M Fishbone Categories'],
                ['📊', 'Signal Evidence Zone'],
                ['✅', 'Findings and Actions Card'],
              ].map(([icon, label]) => (
                <div key={label} className="flex items-center gap-2">
                  <span>{icon}</span>
                  <span className="font-semibold">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border flex items-center justify-between bg-surface">
          <button onClick={onClose} className="px-5 py-2.5 text-[13px] font-bold text-text-muted hover:text-text-secondarytransition-colors">
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={!form.eventName.trim()}
            className={`px-6 py-2.5 rounded-xl text-[13px] font-black flex items-center gap-2 transition-all ${form.eventName.trim() ? 'bg-danger hover:bg-danger/80 text-white shadow-lg shadow-danger/25' : 'bg-surface-2 text-text-subtle cursor-not-allowed'}`}
          >
            <GitBranch className="w-4 h-4" />
            Start RCA Investigation
          </button>
        </div>
    </Modal>
  );
}
