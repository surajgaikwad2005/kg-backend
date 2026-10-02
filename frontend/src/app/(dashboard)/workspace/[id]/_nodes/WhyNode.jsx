'use client';
import React from 'react';
import { useReactFlow, Handle, Position } from '@xyflow/react';

const WHY_COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#c084fc', '#e879f9'];

// Not memoised — intentionally a function declaration to allow flexible usage
export function WhyNode({ id, data }) {
  const { setNodes } = useReactFlow();
  const levelIndex = parseInt(data.level || '0');
  const color = WHY_COLORS[Math.min(levelIndex, WHY_COLORS.length - 1)];

  return (
    <div
      className="rounded-2xl shadow-lg p-5 min-w-[340px] relative group/why"
      style={{ background: '#fff', border: `2px solid ${color}30`, borderLeft: `5px solid ${color}` }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-[13px] shadow-md"
          style={{ background: color }}
        >
          W{levelIndex + 1}
        </div>
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.15em]" style={{ color }}>
            {data.label || `Why #${levelIndex + 1}`}
          </div>
          <div className="text-[11px] text-text-subtle font-semibold">Level {levelIndex + 1} inquiry</div>
        </div>
      </div>

      <textarea
        value={data.value || ''}
        onChange={e =>
          setNodes(nds =>
            nds.map(n => n.id === id ? { ...n, data: { ...n.data, value: e.target.value } } : n)
          )
        }
        placeholder="Enter your answer to this 'Why'..."
        className="w-full bg-surface-2 border border-border rounded-xl p-3 text-[13px] text-text-primary outline-none focus:ring-2 transition-all min-h-[72px] resize-none leading-relaxed"
        style={{ '--tw-ring-color': color }}
      />

      <Handle type="target" position={Position.Top} className="!opacity-0 !w-2 !h-2" />
      <Handle type="source" position={Position.Bottom} className="!opacity-0 !w-2 !h-2" />
    </div>
  );
}
WhyNode.displayName = 'WhyNode';
