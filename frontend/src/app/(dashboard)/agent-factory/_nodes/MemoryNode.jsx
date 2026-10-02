'use client';
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { X, Database } from 'lucide-react';
import { useAgent } from '../_context/AgentContext';

export function MemoryNode({ id, data, selected }) {
  const { deleteNode, selectNode, nodes } = useAgent();

  return (
    <div
      onClick={(e) => { e.stopPropagation(); selectNode(nodes.find(n => n.id === id)); }}
      className={`w-[264px] rounded-[14px] overflow-visible cursor-default transition-all duration-200 border bg-gradient-to-br from-surface to-canvas shadow-md ${selected ? 'border-brand ring-4 ring-brand/10 shadow-[0_12px_32px_rgba(139,92,246,0.1)]' : 'border-border'}`}
    >
      <div className="h-[3px] bg-gradient-to-r from-brand to-brand/80 rounded-t-[14px]" />

      <Handle type="target" position={Position.Left} className="!w-3.5 !h-3.5 !-left-[7px] !bg-brand !border-2 !border-surface shadow-[0_0_8px_rgba(139,92,246,0.18)]" />

      <div className="flex items-center justify-between p-[10px_14px_8px]">
        <div className="flex items-center gap-[7px]">
          <div className="w-[26px] h-[26px] rounded-lg flex items-center justify-center bg-brand/15 border border-brand/30">
            <Database size={13} className="text-brand" />
          </div>
          <span className="text-[10px] font-extrabold tracking-[0.1em] uppercase text-brand">Context Unit</span>
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
        <DataRow label="Strategy"     value={data.strategy} />
        <DataRow label="Lookback"     value={`${data.lookback} pairs`} />
        <DataRow label="Storage Path" value={data.storage_path} />
      </div>

      <Handle type="source" position={Position.Right} className="!w-3.5 !h-3.5 !-right-[7px] !bg-brand !border-2 !border-surface shadow-[0_0_8px_rgba(139,92,246,0.18)]" />
    </div>
  );
}

function DataRow({ label, value }) {
  return (
    <div className="min-w-0 bg-surface-2 border border-border rounded-lg p-[7px_10px]">
      <p className="m-0 mb-1 text-[9px] uppercase tracking-[0.08em] leading-none text-text-subtle">{label}</p>
      <p className="m-0 text-xs font-semibold overflow-hidden text-ellipsis whitespace-nowrap text-text-secondary">{String(value)}</p>
    </div>
  );
}
