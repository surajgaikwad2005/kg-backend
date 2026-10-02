'use client';
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { X, Radio } from 'lucide-react';
import { useAgent } from '../_context/AgentContext';

export function OutputNode({ id, data, selected }) {
  const { deleteNode, selectNode, nodes } = useAgent();

  return (
    <div
      onClick={(e) => { e.stopPropagation(); selectNode(nodes.find(n => n.id === id)); }}
      className={`w-[240px] rounded-[14px] overflow-visible cursor-default transition-all duration-200 border bg-gradient-to-br from-surface to-canvas shadow-md ${selected ? 'border-text-muted ring-4 ring-text-muted/10 shadow-[0_12px_32px_rgba(100,116,139,0.08)]' : 'border-border'}`}
    >
      <div className="h-[3px] bg-gradient-to-r from-text-muted to-text-subtle rounded-t-[14px]" />

      <Handle type="target" position={Position.Left} className="!w-3.5 !h-3.5 !-left-[7px] !bg-surface-2 !border-2 !border-border shadow-[0_0_8px_rgba(100,116,139,0.16)]" />

      <div className="flex items-center justify-between p-[10px_14px_8px]">
        <div className="flex items-center gap-[7px]">
          <div className="w-[26px] h-[26px] rounded-lg flex items-center justify-center bg-surface-2 border border-border">
            <Radio size={13} className="text-text-muted" />
          </div>
          <span className="text-[10px] font-extrabold tracking-[0.1em] uppercase text-text-subtle">Response Gateway</span>
        </div>
        <button onClick={(e) => { e.stopPropagation(); deleteNode(id); }} aria-label="Delete node" className="p-[3px] rounded-md bg-transparent border-none cursor-pointer flex items-center justify-center transition-colors text-text-subtle hover:text-danger">
          <X size={12} />
        </button>
      </div>

      <div className="h-px mx-[14px] bg-border" />

      <div className="p-[10px_14px_8px]">
        <p className="m-0 text-xs font-bold text-text-primary tracking-[0.02em]">{data.label}</p>
      </div>

      <div className="p-[0_14px_14px] flex flex-col gap-1.5">
        <div className="bg-surface-2 border border-border rounded-lg p-[7px_10px] flex items-center justify-between">
          <p className="m-0 text-[9px] uppercase tracking-[0.08em] text-text-subtle">Delivery Mode</p>
          <span className="text-[11px] font-extrabold text-text-secondary bg-text-muted/10 border border-text-muted/20 rounded-md py-0.5 px-2 tracking-[0.06em]">{data.delivery_mode}</span>
        </div>
        <div className="bg-surface-2 border border-border rounded-lg p-[7px_10px]">
          <p className="m-0 mb-1 text-[9px] uppercase tracking-[0.08em] leading-none text-text-subtle">Output</p>
          <p className="m-0 text-[11px] text-text-muted italic leading-relaxed line-clamp-2 overflow-hidden">{data.format}</p>
        </div>
      </div>
    </div>
  );
}
