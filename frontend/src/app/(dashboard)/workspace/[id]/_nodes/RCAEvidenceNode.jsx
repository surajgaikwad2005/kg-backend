'use client';
import React from 'react';
import { Activity, PlusCircle, Trash2, TrendingUp, ExternalLink } from 'lucide-react';
import { useReactFlow, Handle, Position } from '@xyflow/react';

export const RCAEvidenceNode = React.memo(({ id, data }) => {
  const { setNodes } = useReactFlow();

  const addSignalEvidence = () => {
    const name = `Signal_${Math.floor(Math.random() * 100)}.csv`;
    setNodes(nds => nds.map(node =>
      node.id === id ? { ...node, data: { ...node.data, signals: [...(node.data.signals || []), { name, type: 'trend' }] } } : node
    ));
  };

  const removeSignal = (index) =>
    setNodes(nds => nds.map(node =>
      node.id === id ? { ...node, data: { ...node.data, signals: (node.data.signals || []).filter((_, i) => i !== index) } } : node
    ));

  return (
    <div className="bg-surface border-2 border-dashed border-brand/30 rounded-2xl shadow-md min-w-[340px] overflow-hidden">
      <div className="bg-brand-muted px-4 py-3 flex items-center justify-between border-b border-brand/20">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-brand" />
          <span className="text-[12px] font-black text-brand tracking-tight uppercase">EXPERIMENTAL EVIDENCE</span>
        </div>
        <button onClick={addSignalEvidence} className="p-1.5 bg-brand text-white rounded-lg hover:bg-brand-hover transition-colors shadow-sm shadow-brand/20">
          <PlusCircle className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 bg-canvas/50 min-h-[140px]">
        {(data.signals || []).length > 0 ? (
          <div className="space-y-3">
            {(data.signals || []).map((sig, i) => (
              <div key={i} className="bg-surface border-2 border-border rounded-2xl p-4 shadow-sm group/sig relative hover:border-brand/40 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-brand-muted rounded-xl flex items-center justify-center border border-brand/20">
                      <TrendingUp className="w-4 h-4 text-brand" />
                    </div>
                    <div>
                      <span className="text-[12px] font-black text-text-primary block leading-none">{sig.label || sig.name}</span>
                      <span className="text-[9px] font-bold text-text-subtle uppercase tracking-widest mt-1 block">{sig.tagId || 'CSV DATA'}</span>
                    </div>
                  </div>
                  <button onClick={() => removeSignal(i)} className="opacity-0 group-hover/sig:opacity-100 p-1.5 bg-surface-2 text-text-subtle hover:text-danger hover:bg-danger/10 rounded-lg transition-all">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="w-full h-12 bg-surface-2/50 rounded-xl border border-border flex items-end gap-1 px-2 pb-1.5 overflow-hidden">
                  {sig.trendData?.length > 0 ? (
                    sig.trendData.slice(-20).map((p, j) => (
                      <div key={j} className="flex-1 bg-brand/30 rounded-t-sm hover:bg-brand transition-colors" style={{ height: `${(p[1] / 100) * 100}%`, minHeight: '2px' }} />
                    ))
                  ) : (
                    <div className="w-full h-full flex items-center justify-center opacity-20">
                      <div className="w-full h-[1px] bg-border-strong" />
                    </div>
                  )}
                </div>

                <div className="mt-3 flex items-center justify-between text-[10px] font-black pt-2 border-t border-border">
                  <span className="text-success uppercase tracking-tighter">DATA LINKED</span>
                  <span className="flex items-center gap-1.5 text-brand cursor-pointer hover:tracking-wide transition-all uppercase tracking-tighter shadow-sm bg-brand-muted px-2 py-1 rounded-md">
                    <ExternalLink className="w-2.5 h-2.5" /> Full Analysis
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 py-10 opacity-40 grayscale">
            <div className="w-16 h-16 bg-surface-2 rounded-[2rem] flex items-center justify-center border-2 border-dashed border-border">
              <PlusCircle className="w-6 h-6 text-text-subtle" />
            </div>
            <p className="text-[12px] font-bold text-text-secondary text-center px-6">Select this node &amp; add signals from the Data Drawer</p>
          </div>
        )}
      </div>

      <div className="px-4 py-2 border-t border-brand/20 bg-surface flex items-center justify-center">
        <span className="text-[10px] text-text-subtle font-medium">Add time-series signals to correlate events</span>
      </div>

      <Handle type="source" position={Position.Bottom} className="w-2 h-2 opacity-0" />
      <Handle type="target" position={Position.Top} className="w-2 h-2 opacity-0" />
    </div>
  );
});
RCAEvidenceNode.displayName = 'RCAEvidenceNode';
