'use client';
import React from 'react';
import Link from 'next/link';
import {
  Undo2, Redo2, Plus, ChevronDown, Maximize2, Minimize2
} from 'lucide-react';
import TimeSelector from '@/src/components/ui/TimeSelector';

export default function WorkspaceHeader({
  workspaceName,
  setWorkspaceName,
  isEditingName,
  setIsEditingName,
  isExpanded,
  setIsExpanded,
  onOpenCustomTagModal,
  onAddDataClick,
}) {
  return (
    <header className="h-14 border-b border-border flex items-center justify-between px-4 bg-surface shrink-0 z-40">
      <div className="flex items-center gap-4">
        <Link href="/workspace" className="flex items-center justify-center p-1.5 hover:bg-surface-2 rounded-md transition-colors">
          <div className="w-6 h-6 bg-brand/20 rounded-md flex items-center justify-center text-brand font-bold text-xs border border-brand/30 shadow-sm">C</div>
        </Link>

        <div className="flex items-center gap-2 text-[14px]">
          <Link href="/workspace" className="text-text-secondary hover:text-text-primary transition-colors font-medium">Workspace</Link>
          <span className="text-text-subtle">/</span>
          <div
            className="flex items-center gap-1 cursor-pointer group px-2 py-1 rounded-md hover:bg-surface-2 transition-colors"
            onClick={() => setIsEditingName(true)}
          >
            {isEditingName ? (
              <input
                type="text"
                value={workspaceName}
                onChange={e => setWorkspaceName(e.target.value)}
                onBlur={() => setIsEditingName(false)}
                onKeyDown={e => e.key === 'Enter' && setIsEditingName(false)}
                autoFocus
                className="font-bold text-text-primary outline-none bg-transparent w-auto min-w-[100px]"
              />
            ) : (
              <>
                <span className="font-bold text-text-primary">{workspaceName}</span>
                <ChevronDown className="w-3.5 h-3.5 text-text-subtle group-hover:text-text-secondary" />
              </>
            )}
          </div>
          <button
            type="button"
            onClick={() => setIsExpanded(prev => !prev)}
            title={isExpanded ? "Exit Fullscreen" : "Fullscreen Mode"}
            className="p-1.5 text-text-subtle hover:text-text-primary hover:bg-surface-2 rounded-md transition-colors cursor-pointer ml-1 animate-fadeIn"
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <button className="p-1.5 text-text-subtle hover:text-text-primary hover:bg-surface-2 rounded-md transition-colors"><Undo2 className="w-4 h-4" /></button>
          <button className="p-1.5 text-text-subtle hover:text-text-primary hover:bg-surface-2 rounded-md transition-colors"><Redo2 className="w-4 h-4" /></button>
        </div>
        <div className="w-px h-4 bg-border" />
        <TimeSelector />
        <span className="text-[12px] text-text-subtle hidden xl:inline font-medium">Updated 1 minute ago</span>
     
        <button
          onClick={onOpenCustomTagModal}
          className="flex items-center gap-2 bg-brand hover:bg-brand-hover text-white px-4 py-1.5 rounded-md text-[13px] font-bold transition-all ml-2 shadow-sm shadow-brand/20 active:scale-95 cursor-pointer hover:shadow-md"
        >
          <Plus className="w-4 h-4" />
          Custom Tag
        </button>
        <button
          onClick={onAddDataClick}
          className="flex items-center gap-2 bg-text-primary hover:bg-text-primary hover:opacity-90 text-white px-4 py-1.5 rounded-md text-[13px] font-bold transition-all ml-2 shadow-sm shadow-text-primary/20 active:scale-95 cursor-pointer hover:shadow-md"
        >
          <Plus className="w-4 h-4" />
          Add data
        </button>
      </div>
    </header>
  );
}
