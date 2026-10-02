'use client';
import React from 'react';
import { ShieldAlert, Loader2, Plus, Trash2, Zap, ArrowRightCircle } from 'lucide-react';
import { cn } from '@/src/lib/utils';

export function RiskTemplateCard({ template, isLoading, onOpen, onDelete }) {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Open template ${template.name}`}
      aria-busy={isLoading}
      onClick={onOpen}
      className={cn(
        'group relative bg-surface rounded-3xl border-2 border-border p-6 md:p-7',
        'hover:border-brand hover:shadow-panel',
        'transition-all duration-300 overflow-hidden h-60 flex flex-col justify-between cursor-pointer outline-none focus-visible:border-brand',
        isLoading && 'pointer-events-none opacity-80',
      )}
    >
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-30 bg-surface/80 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-7 h-7 text-brand animate-spin" />
          <p className="text-2xs font-black text-brand uppercase tracking-widest">Generating Mind Map…</p>
        </div>
      )}

      {/* Decorative glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-muted/50 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-brand-muted transition-colors pointer-events-none" />

      <div className="relative flex flex-col h-full">
        {/* Header row */}
        <div className="flex items-start justify-between mb-5">
          <div className="w-12 h-12 bg-surface-2 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-brand-muted transition-all shadow-card">
            <ShieldAlert className="w-6 h-6 text-brand" />
          </div>

          <button
            aria-label={`Delete template ${template.name}`}
            onClick={(e) => { e.stopPropagation(); onDelete(e); }}
            className={cn(
              'p-2 bg-surface border border-border rounded-xl text-text-subtle',
              'hover:text-danger hover:border-danger/20 hover:bg-danger/5',
              'transition-all duration-200 shadow-card',
              'opacity-0 group-hover:opacity-100 -translate-y-2 group-hover:translate-y-0',
              'relative z-20 cursor-pointer',
            )}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <h3 className="text-body font-black text-text-primary uppercase tracking-tight leading-tight group-hover:text-brand transition-colors truncate max-w-48">
              {template.name}
            </h3>
            {template.isBackend && (
              <span className="px-2 py-0.5 bg-brand-muted text-brand rounded text-2xs font-black uppercase tracking-widest border border-brand/20 flex items-center gap-1 shrink-0">
                <Zap className="w-2.5 h-2.5" /> System
              </span>
            )}
          </div>
          <p className="text-2xs font-black text-text-subtle uppercase tracking-widest">{template.date}</p>
        </div>
      </div>

      {/* Footer row */}
      <div className="flex items-center justify-between relative mt-3">
        <span className="text-caption font-black text-text-subtle group-hover:text-brand uppercase tracking-widest transition-colors flex items-center gap-2">
          <ArrowRightCircle className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
        </span>
        <div className="w-8 h-8 rounded-full border-2 border-border flex items-center justify-center group-hover:border-brand-muted group-hover:bg-brand-muted transition-all">
          <Plus className="w-4 h-4 text-text-subtle group-hover:text-brand transition-colors" />
        </div>
      </div>
    </div>
  );
}
