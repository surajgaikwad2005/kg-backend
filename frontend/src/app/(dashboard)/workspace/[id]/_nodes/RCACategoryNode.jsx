'use client';
import React, { useState } from 'react';
import { ImageIcon, FileText, PlusCircle, Trash2, X } from 'lucide-react';
import { useReactFlow, Handle, Position } from '@xyflow/react';

// Category → chart token mapping. Only 5 chart tokens exist (chart-1..chart-5) for
// 6 fishbone categories, so the cycle wraps: Measurement reuses chart-1 (same as
// Man/People). Keep this mapping identical to FISHBONE_CATEGORIES in
// FishboneCanvasNode.jsx so the same category always renders the same color.
const CATEGORY_COLORS = {
  'Man/People':   { bg: 'bg-chart-1/10', border: 'border-chart-1/40', text: 'text-chart-1', icon: '👤', accent: 'bg-chart-1' },
  'Machine':      { bg: 'bg-chart-2/10', border: 'border-chart-2/40', text: 'text-chart-2', icon: '⚙️', accent: 'bg-chart-2' },
  'Method':       { bg: 'bg-chart-3/10', border: 'border-chart-3/40', text: 'text-chart-3', icon: '📋', accent: 'bg-chart-3' },
  'Material':     { bg: 'bg-chart-4/10', border: 'border-chart-4/40', text: 'text-chart-4', icon: '🧱', accent: 'bg-chart-4' },
  'Environment':  { bg: 'bg-chart-5/10', border: 'border-chart-5/40', text: 'text-chart-5', icon: '🌡️', accent: 'bg-chart-5' },
  'Measurement':  { bg: 'bg-chart-1/10', border: 'border-chart-1/40', text: 'text-chart-1', icon: '📏', accent: 'bg-chart-1' },
};

export const RCACategoryNode = React.memo(({ id, data }) => {
  const { setNodes } = useReactFlow();
  const [newCause, setNewCause] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const c = CATEGORY_COLORS[data.category] || { bg: 'bg-surface-2', border: 'border-border-strong', text: 'text-text-secondary', icon: '❓', accent: 'bg-overlay' };

  const updateNodeData = (updater) =>
    setNodes(nds => nds.map(node => node.id === id ? { ...node, data: updater(node.data) } : node));

  const addCause = () => {
    if (!newCause.trim()) return;
    updateNodeData(d => ({ ...d, causes: [...(d.causes || []), newCause] }));
    setNewCause('');
    setIsAdding(false);
  };

  const attachItem = (type) => {
    const name = type === 'image' ? `Screenshot_${Math.floor(Math.random() * 1000)}.png` : `Document_${Math.floor(Math.random() * 1000)}.pdf`;
    updateNodeData(d => ({ ...d, attachments: [...(d.attachments || []), { type, name }] }));
  };

  const removeCause = (index) => updateNodeData(d => ({ ...d, causes: (d.causes || []).filter((_, i) => i !== index) }));
  const removeAttachment = (index) => updateNodeData(d => ({ ...d, attachments: (d.attachments || []).filter((_, i) => i !== index) }));

  return (
    <div className={`${c.bg} border-2 ${c.border} rounded-xl shadow-lg min-w-[280px] overflow-hidden`}>
      <div className={`px-4 py-2.5 ${c.text} flex items-center justify-between border-b ${c.border}`}>
        <div className="flex items-center gap-2">
          <span className="text-base">{c.icon}</span>
          <span className="text-[13px] font-black tracking-tight uppercase">{data.category}</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => attachItem('image')} className="p-1 hover:bg-black/5 rounded" title="Attach Image"><ImageIcon className="w-3.5 h-3.5" /></button>
          <button onClick={() => attachItem('doc')} className="p-1 hover:bg-black/5 rounded" title="Attach Document"><FileText className="w-3.5 h-3.5" /></button>
          <button onClick={() => setIsAdding(!isAdding)} className="p-1 hover:bg-black/5 rounded"><PlusCircle className="w-3.5 h-3.5" /></button>
        </div>
      </div>

      <div className="p-3 space-y-3">
        <div className="space-y-1.5">
          {(data.causes || []).map((cause, i) => (
            <div key={i} className="flex items-start gap-2 text-[12px] text-text-secondary bg-surface/50 p-1.5 rounded-lg border border-transparent hover:border-border group/item">
              <span className="text-text-subtle mt-0.5">•</span>
              <span className="flex-1 leading-tight">{cause}</span>
              <button onClick={() => removeCause(i)} className="opacity-0 group-hover/item:opacity-100 text-text-subtle hover:text-danger transition-opacity"><Trash2 className="w-3 h-3" /></button>
            </div>
          ))}

          {isAdding && (
            <div className="flex items-center gap-1 mt-2">
              <input autoFocus value={newCause} onChange={e => setNewCause(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCause()} placeholder="State a potential cause..." className="flex-1 px-2 py-1 text-[12px] border-2 border-border rounded-md outline-none focus:border-border-strong" />
              <button onClick={addCause} className={`p-1 rounded-md text-white ${c.accent}`}><PlusCircle className="w-4 h-4" /></button>
            </div>
          )}

          {!isAdding && (data.causes || []).length === 0 && (
            <div onClick={() => setIsAdding(true)} className="text-[11px] text-text-subtle italic cursor-pointer hover:text-text-secondary transition-colors">Click to add potential causes...</div>
          )}
        </div>

        {(data.attachments || []).length > 0 && (
          <div className="pt-2 border-t border-border space-y-1.5">
            <div className="text-[9px] font-bold text-text-subtle uppercase tracking-widest">Attachments</div>
            <div className="grid grid-cols-1 gap-1.5">
              {(data.attachments || []).map((att, i) => (
                <div key={i} className="flex items-center gap-2 bg-surface border border-border p-1.5 rounded-lg group/att">
                  {att.type === 'image' ? <ImageIcon className="w-3.5 h-3.5 text-info" /> : <FileText className="w-3.5 h-3.5 text-warning" />}
                  <span className="text-[11px] text-text-secondary truncate flex-1">{att.name}</span>
                  <button onClick={() => removeAttachment(i)} className="opacity-0 group-hover/att:opacity-100 text-text-subtle hover:text-danger transition-opacity"><Trash2 className="w-3 h-3" /></button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Handle type="target" position={Position.Top} className="w-2 h-2 opacity-0 group-hover:opacity-100" />
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 opacity-0 group-hover:opacity-100" />
    </div>
  );
});
RCACategoryNode.displayName = 'RCACategoryNode';
