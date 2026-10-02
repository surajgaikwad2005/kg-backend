'use client';
import React from 'react';
import { GripVertical, MoreVertical } from 'lucide-react';
import { cn } from '@/src/lib/utils';

export function PanelHeader({ title, icon: Icon = null, titleClassName = 'text-caption' }) {
  return (
    <div className="drag-handle cursor-move px-4 py-3 border-b border-border flex items-center justify-between bg-surface rounded-t-xl shrink-0">
      <div className="flex items-center gap-2 min-w-0">
        <GripVertical className="w-4 h-4 text-text-subtle shrink-0" />
        <div className="flex items-center gap-2 min-w-0">
          {Icon && <Icon className="w-4 h-4 text-brand shrink-0" />}
          <h2 className={cn('text-text-primary font-bold uppercase tracking-wider truncate', titleClassName)}>
            {title}
          </h2>
        </div>
      </div>
      <MoreVertical className="w-4 h-4 text-text-subtle shrink-0 ml-2" />
    </div>
  );
}
