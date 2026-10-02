'use client';
import React from 'react';
import { FileSearch, GitBranch, CheckSquare, MessageSquare, Save } from 'lucide-react';
import { useReactFlow } from '@xyflow/react';

export const RCAFindingsNode = React.memo(({ id, data }) => {
  const { setNodes } = useReactFlow();

  const updateField = (field, value) =>
    setNodes(nds => nds.map(node => node.id === id ? { ...node, data: { ...node.data, [field]: value } } : node));

  return (
    <div className="bg-surface border-2 border-success/40 rounded-2xl shadow-xl min-w-[360px] overflow-hidden">
      <div className="bg-gradient-to-r from-success to-success/80 px-5 py-3 flex items-center justify-between border-b border-success/60">
        <div className="flex items-center gap-3">
          <FileSearch className="w-5 h-5 text-white" />
          <span className="text-[14px] font-black text-white tracking-tight uppercase">FINDINGS & ACTIONS</span>
        </div>
        <div className="bg-white/20 px-2 py-0.5 rounded text-[10px] text-white font-bold">DRAFT</div>
      </div>

      <div className="p-4 space-y-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <GitBranch className="w-3.5 h-3.5 text-success" />
            <label className="text-[10px] font-black text-text-subtle uppercase tracking-wider">Root Cause Determination</label>
          </div>
          <textarea value={data.rootCause || ''} onChange={e => updateField('rootCause', e.target.value)} placeholder="State the confirmed primary root cause..." className="w-full bg-surface-2 border border-border rounded-lg p-2.5 text-[12px] text-text-secondary min-h-[60px] outline-none focus:border-success/50 transition-all resize-none" />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <CheckSquare className="w-3.5 h-3.5 text-success" />
            <label className="text-[10px] font-black text-text-subtle uppercase tracking-wider">Corrective Actions</label>
          </div>
          <textarea value={data.actions || ''} onChange={e => updateField('actions', e.target.value)} placeholder="List short-term and long-term actions..." className="w-full bg-surface-2 border border-border rounded-lg p-2.5 text-[12px] text-text-secondary min-h-[60px] outline-none focus:border-success/50 transition-all resize-none" />
        </div>

        <div className="space-y-1.5 border-t border-border pt-3">
          <div className="flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-info" />
            <label className="text-[10px] font-black text-text-subtle uppercase tracking-wider">Analysis Insights</label>
          </div>
          <textarea value={data.insights || ''} onChange={e => updateField('insights', e.target.value)} placeholder="Add engineering notes, observations..." className="w-full bg-info/5 border border-info/20 rounded-lg p-2.5 text-[12px] text-info min-h-[80px] outline-none focus:border-info/40 transition-all resize-none italic" />
        </div>
      </div>

      <div className="px-4 py-2 bg-success/10 text-[10px] text-success font-bold flex items-center justify-between italic">
        <span>Last updated by NM</span>
        <span className="flex items-center gap-1"><Save className="w-3 h-3" /> Autosaved</span>
      </div>
    </div>
  );
});
RCAFindingsNode.displayName = 'RCAFindingsNode';
