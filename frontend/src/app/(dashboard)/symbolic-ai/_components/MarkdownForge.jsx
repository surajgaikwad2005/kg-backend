'use client';
import React from 'react';
import { PlusCircle, Hash, Trash2 } from 'lucide-react';
import { cn } from '@/src/lib/utils';

export function MarkdownForge({ tempMarkdown, onUpdate, onAdd, onDelete, onAddRoot }) {
  const lines = tempMarkdown.split('\n');

  return (
    <div className="w-full h-full p-5 flex flex-col bg-surface overflow-y-auto thin-scrollbar animate-in fade-in zoom-in-95 duration-300">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between border-b border-border pb-4 shrink-0">
        <div>
          <h3 className="text-caption font-black text-text-primary uppercase tracking-widest">Forensic Rule Forge</h3>
          <p className="text-2xs font-bold text-text-muted uppercase tracking-widest mt-1">Direct Manipulation Protocol Active</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
          <span className="text-2xs font-black text-success uppercase tracking-widest leading-none">Syncing</span>
        </div>
      </div>

      {/* Editable lines */}
      <div className="space-y-2">
        {lines.map((line, idx) => {
          if (line.trim() === '---' || line.startsWith('markmap:') || line.startsWith('  initial') || line.trim() === '') return null;

          const isHeader = line.startsWith('#');
          const level = (line.match(/^#+/) || line.match(/^\s*/))?.[0].length || 0;
          const content = line.replace(/^[#\s-]*/, '').trim();

          return (
            <div
              key={idx}
              className={cn(
                'group flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all duration-200',
                isHeader
                  ? 'bg-surface-2 border-border'
                  : 'bg-surface border-border/60 hover:border-brand-muted hover:shadow-card',
              )}
              style={{ marginLeft: `${level * 14}px` }}
            >
              <div className="flex items-center gap-2.5 shrink-0">
                {isHeader ? (
                  <Hash className="w-4 h-4 text-brand shrink-0" />
                ) : (
                  <div className="w-2 h-2 bg-border-strong rounded-full group-hover:bg-brand transition-colors shrink-0" />
                )}
              </div>

              <input
                type="text"
                value={content}
                onChange={e => onUpdate(idx, e.target.value)}
                className={cn(
                  'flex-1 bg-transparent border-none outline-none font-bold text-text-primary focus:text-brand transition-colors min-w-0',
                  isHeader ? 'text-body-sm' : 'text-caption font-medium',
                )}
              />

              <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <button
                  onClick={() => onAdd(idx)}
                  title="Add Sub-Mechanism"
                  aria-label="Add Sub-Mechanism"
                  className="p-1.5 bg-brand-muted border border-brand/20 rounded-lg text-brand hover:bg-brand hover:text-white hover:border-brand transition-all"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onDelete(idx)}
                  aria-label="Delete line"
                  className="p-1.5 bg-danger/5 border border-danger/15 rounded-lg text-danger/70 hover:bg-danger hover:text-white hover:border-danger transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add root */}
      <button
        onClick={onAddRoot}
        className="mt-6 flex items-center justify-center gap-2 p-4 border-2 border-dashed border-border rounded-2xl text-caption font-black text-text-muted hover:border-brand-muted hover:text-brand hover:bg-brand-muted/30 transition-all uppercase tracking-widest"
      >
        <PlusCircle className="w-4 h-4" />
        Add Root Investigation Path
      </button>
    </div>
  );
}
