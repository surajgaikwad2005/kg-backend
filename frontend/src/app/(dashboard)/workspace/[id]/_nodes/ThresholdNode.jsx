'use client';
import React from 'react';
import { ArrowUpFromLine, ArrowDownToLine, Trash2 } from 'lucide-react';
import { useReactFlow, Handle, Position } from '@xyflow/react';

export const ThresholdNode = React.memo(({ id, data }) => {
  const { setNodes } = useReactFlow();
  const isUpper = data.type === 'upper';

  const removeNode = (e) => { e.stopPropagation(); setNodes(nds => nds.filter(n => n.id !== id)); };

  return (
    <div className="bg-surface border-2 border-border rounded-[2.5rem] shadow-[0_25px_60px_rgba(0,0,0,0.08)] min-w-[320px] p-6 group/threshold">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isUpper ? 'bg-danger' : 'bg-brand'} shadow-lg text-white`}>
            {isUpper ? <ArrowUpFromLine className="w-6 h-6" /> : <ArrowDownToLine className="w-6 h-6" />}
          </div>
          <div>
            <span className="text-[10px] font-black text-text-subtle uppercase tracking-[0.2em] block leading-none">{isUpper ? 'Upper Limit' : 'Lower Limit'}</span>
            <span className="text-[13px] font-black text-text-primary mt-1 block">Static Guardrail</span>
          </div>
        </div>
        <button onClick={removeNode} className="p-2 text-text-subtle hover:text-danger transition-colors opacity-0 group-hover/threshold:opacity-100 cursor-pointer" aria-label="Remove node">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="relative">
        <input type="number" value={data.value ?? (isUpper ? 80 : 20)} onChange={e => { const val = parseFloat(e.target.value); setNodes(nds => nds.map(n => n.id === id ? { ...n, data: { ...n.data, value: val } } : n)); }} className="w-full bg-surface border-2 border-border rounded-2xl px-4 py-3 text-[18px] font-black text-text-primary outline-none focus:border-border-strong transition-all shadow-inner" />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-end">
          <span className="text-[9px] font-black text-text-subtle uppercase tracking-widest">UNIT</span>
          <span className="text-[9px] font-bold text-text-muted">VALUE</span>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <div className={`w-1.5 h-1.5 rounded-full ${isUpper ? 'bg-danger' : 'bg-info'}`} />
        <p className="text-[10px] text-text-muted font-bold italic leading-tight">
          {isUpper ? 'Trigger anomaly if signal climbs above this' : 'Trigger anomaly if signal dips below this'}
        </p>
      </div>

      <Handle type="source" position={Position.Right} className="w-2 h-2 opacity-0 group-hover:opacity-100" />
      <Handle type="target" position={Position.Left} className="w-2 h-2 opacity-0 group-hover:opacity-100" />
    </div>
  );
});
ThresholdNode.displayName = 'ThresholdNode';
