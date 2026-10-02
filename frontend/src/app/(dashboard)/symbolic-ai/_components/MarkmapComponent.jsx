"use client";
import React from 'react';
import { Trash2, X, Pencil, Check, Loader2 } from 'lucide-react';
import { useMarkmap } from '../_hooks/useMarkmap';

export default function MarkmapComponent({ markdown, ruleKey, fitKey, onDeleteNode, onRenameNode }) {
  const m = useMarkmap({ markdown, ruleKey, fitKey, onDeleteNode, onRenameNode });

  return (
    <div ref={m.containerRef} className="absolute inset-0 bg-surface rounded-3xl border border-border shadow-sm overflow-hidden">
      <svg ref={m.svgRef} className="w-full h-full block touch-none [&_.markmap-node_circle]:cursor-pointer [&_.markmap-node_text]:cursor-text [&_.markmap-node_foreignObject]:cursor-text [&_.markmap-node_foreignObject_*]:cursor-text [&_.markmap-node_text]:fill-current" />
      <div className="absolute inset-0 pointer-events-none border-12 border-surface/50 rounded-3xl" />

      {m.contextMenu && (
        <div
          className="absolute z-50 animate-in fade-in zoom-in-95 duration-150"
          style={{ left: m.contextMenu.x, top: m.contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-surface rounded-xl shadow-2xl border border-border overflow-hidden min-w-55">
            <div className="px-4 py-2.5 border-b border-border flex items-center justify-between gap-3 bg-surface-2">
              <span className="text-label font-black text-text-muted uppercase tracking-widest truncate max-w-40">
                {m.contextMenu.nodeContent}
              </span>
              <button onClick={() => m.setContextMenu(null)} aria-label="Close" className="text-text-subtle hover:text-text-muted shrink-0 cursor-pointer">
                <X className="w-3 h-3" />
              </button>
            </div>

            {m.contextMenu.type === 'rename' && (
              <div className="p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <Pencil className="w-3.5 h-3.5 text-brand shrink-0" />
                  <span className="text-label font-black text-brand uppercase tracking-widest">Rename Node</span>
                </div>
                <input
                  ref={m.renameInputRef}
                  type="text"
                  value={m.renameValue}
                  onChange={(e) => m.setRenameValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') m.handleRename();
                    if (e.key === 'Escape') m.setContextMenu(null);
                  }}
                  className="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-xs font-semibold text-text-primary outline-none focus:border-brand focus:bg-surface transition-all"
                />
                <div className="flex gap-2">
                  <button
                    onClick={m.handleRename}
                    disabled={m.isRenaming}
                    aria-busy={m.isRenaming}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-brand text-white rounded-lg text-caption font-black hover:opacity-90 transition-colors cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
                  >
                    {m.isRenaming
                      ? <><Loader2 className="w-3 h-3 animate-spin" /> Saving…</>
                      : <><Check className="w-3 h-3" /> Rename</>
                    }
                  </button>
                  <button
                    onClick={() => { if (!m.isRenaming) m.setContextMenu(null); }}
                    disabled={m.isRenaming}
                    className="px-3 py-2 bg-surface-2 text-text-muted rounded-lg text-caption font-black hover:bg-surface transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </div>
                <div className="border-t border-border pt-2">
                  <button
                    onClick={m.handleDelete}
                    disabled={m.isRenaming}
                    aria-label="Delete node and children"
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-caption font-black text-danger hover:bg-danger/5 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-3.5 h-3.5 shrink-0" />
                    Delete node &amp; children
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
