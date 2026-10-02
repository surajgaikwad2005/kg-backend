'use client';
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { X, FileText } from 'lucide-react';
import { useAgent } from '../_context/AgentContext';

export function PromptNode({ id, data, selected }) {
  const { deleteNode, selectNode, nodes } = useAgent();

  return (
    <div
      onClick={(e) => { e.stopPropagation(); selectNode(nodes.find(n => n.id === id)); }}
      className={`w-[264px] rounded-[14px] overflow-visible cursor-default transition-all duration-200 border bg-gradient-to-br from-surface to-canvas shadow-md ${selected ? 'border-warning ring-4 ring-warning/10 shadow-[0_12px_32px_rgba(245,158,11,0.08)]' : 'border-border'}`}
    >
      <div className="h-[3px] bg-gradient-to-r from-warning to-warning/80 rounded-t-[14px]" />

      <Handle type="target" position={Position.Left} className="!w-3.5 !h-3.5 !-left-[7px] !bg-warning !border-2 !border-surface shadow-[0_0_8px_rgba(245,158,11,0.16)]" />

      <div className="flex items-center justify-between p-[10px_14px_8px]">
        <div className="flex items-center gap-[7px]">
          <div className="w-[26px] h-[26px] rounded-lg flex items-center justify-center bg-warning/15 border border-warning/30">
            <FileText size={13} className="text-warning" />
          </div>
          <span className="text-[10px] font-extrabold tracking-[0.1em] uppercase text-warning">Instruction Blueprint</span>
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
        <div className="bg-warning/10 border border-warning/30 rounded-lg p-[7px_10px]">
          <p className="m-0 mb-1 text-[9px] uppercase tracking-[0.08em] leading-none text-text-subtle">System Prompt Directive</p>
          <p className="m-0 text-[11px] font-normal leading-relaxed text-text-secondary line-clamp-2 overflow-hidden">{data.system_prompt}</p>
        </div>
        <div className="bg-warning/10 border border-warning/30 rounded-lg p-[7px_10px]">
          <p className="m-0 mb-1 text-[9px] uppercase tracking-[0.08em] leading-none text-text-subtle">User Input Template</p>
          <p className="m-0 text-xs font-semibold overflow-hidden text-ellipsis whitespace-nowrap text-text-secondary">{String(data.user_input_template)}</p>
        </div>
      </div>

      <Handle type="source" position={Position.Right} className="!w-3.5 !h-3.5 !-right-[7px] !bg-warning !border-2 !border-surface shadow-[0_0_8px_rgba(245,158,11,0.16)]" />
    </div>
  );
}
