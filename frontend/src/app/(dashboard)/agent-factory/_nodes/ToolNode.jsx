'use client';
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { X, Wrench } from 'lucide-react';
import { useAgent } from '../_context/AgentContext';

export function ToolNode({ id, data, selected }) {
  const { deleteNode, selectNode, nodes } = useAgent();

  return (
    <div
      onClick={(e) => { e.stopPropagation(); selectNode(nodes.find(n => n.id === id)); }}
      className={`w-[264px] rounded-[14px] overflow-visible cursor-default transition-all duration-200 border bg-gradient-to-br from-surface to-canvas shadow-md ${selected ? 'border-success ring-4 ring-success/10 shadow-[0_12px_32px_rgba(16,185,129,0.08)]' : 'border-border'}`}
    >
      <div className="h-[3px] bg-gradient-to-r from-success to-success/80 rounded-t-[14px]" />

      <Handle type="target" position={Position.Left} className="!w-3.5 !h-3.5 !-left-[7px] !bg-success !border-2 !border-surface shadow-[0_0_8px_rgba(16,185,129,0.15)]" />

      <div className="flex items-center justify-between p-[10px_14px_8px]">
        <div className="flex items-center gap-[7px]">
          <div className="w-[26px] h-[26px] rounded-lg flex items-center justify-center bg-success/15 border border-success/30">
            <Wrench size={13} className="text-success" />
          </div>
          <span className="text-[10px] font-extrabold tracking-[0.1em] uppercase text-success">Execution Tooling</span>
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
        <div className="bg-success/10 border border-success/30 rounded-lg p-[7px_10px]">
          <p className="m-0 mb-1 text-[9px] uppercase tracking-[0.08em] leading-none text-text-subtle">Description</p>
          <p className="m-0 text-[11px] text-text-secondary leading-relaxed line-clamp-2 overflow-hidden">{data.description}</p>
        </div>
        <div className="flex gap-1.5">
          <ToggleChip label="Toggle Access" value={data.toggle_access} />
          <ToggleChip label="Table Access"  value={data.table_access} />
        </div>
      </div>

      <Handle type="source" position={Position.Right} className="!w-3.5 !h-3.5 !-right-[7px] !bg-success !border-2 !border-surface shadow-[0_0_8px_rgba(16,185,129,0.15)]" />
    </div>
  );
}

function ToggleChip({ label, value }) {
  return (
    <div className="flex-1 bg-success/10 border border-success/30 rounded-lg p-[6px_10px] flex items-center justify-between gap-1.5">
      <p className="m-0 text-[9px] uppercase tracking-[0.07em] leading-none text-text-subtle">{label}</p>
      <div className={`w-[28px] h-[16px] rounded-full flex items-center px-[2px] shrink-0 transition-colors ${value ? 'bg-success' : 'bg-success/20'}`}>
        <div className={`w-3 h-3 rounded-full bg-white transition-transform duration-200 ${value ? 'translate-x-[12px]' : 'translate-x-0'}`} />
      </div>
    </div>
  );
}
