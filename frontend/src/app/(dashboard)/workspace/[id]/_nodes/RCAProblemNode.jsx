'use client';
import React from 'react';
import { AlertTriangle, Clock } from 'lucide-react';

export const RCAProblemNode = React.memo(({ data }) => (
  <div className="bg-surface border-2 border-danger/30 rounded-2xl shadow-xl min-w-[320px] overflow-hidden">
    <div className="bg-danger px-5 py-3 flex items-center gap-3">
      <AlertTriangle className="w-5 h-5 text-white" />
      <span className="text-[14px] font-black text-white tracking-tight">PROBLEM STATEMENT</span>
    </div>
    <div className="p-4 space-y-2">
      <div className="text-[16px] font-black text-text-primary leading-tight">{data.eventName || 'Untitled Event'}</div>
      <div className="flex items-center gap-4 text-[11px]">
        <span className="flex items-center gap-1 text-text-muted"><Clock className="w-3 h-3" />{data.eventDate || '—'}</span>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${data.severity === 'Critical' ? 'bg-danger/10 text-danger' : data.severity === 'High' ? 'bg-warning/15 text-warning' : data.severity === 'Medium' ? 'bg-warning/10 text-warning' : 'bg-info/10 text-info'}`}>
          {data.severity || 'Medium'}
        </span>
      </div>
      <div className="text-[12px] text-text-muted leading-relaxed mt-1">{data.description || 'No description provided.'}</div>
      {data.equipment && (
        <div className="text-[11px] text-text-subtle border-t border-border pt-2 mt-2">
          Equipment: <span className="font-bold text-text-secondary">{data.equipment}</span>
        </div>
      )}
    </div>
  </div>
));
RCAProblemNode.displayName = 'RCAProblemNode';
