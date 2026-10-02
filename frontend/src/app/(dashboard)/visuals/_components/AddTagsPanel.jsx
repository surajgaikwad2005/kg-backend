'use client';
import React from 'react';
import { Search, X, Check } from 'lucide-react';
import { TAG_COLORS } from '@/src/lib/dashboards.utils';

/**
 * Slide-in right panel for managing workspace tags.
 * Positioning and animations are handled by the parent (WorkspaceViewer).
 */
export function AddTagsPanel({
  allTags,
  pendingTags,
  addTagSearch,
  onSearchChange,
  onToggle,
  onClose,
  onApply,
}) {
  const uniqueAllTags = Array.from(new Set(allTags || []));
  const filteredTags = uniqueAllTags.filter(t => t.toLowerCase().includes(addTagSearch.toLowerCase()));

  return (
    <div className="h-full w-full flex flex-col bg-surface border-l border-border shadow-[-12px_0_40px_rgba(0,0,0,0.1)]">
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-surface-2 flex items-center justify-between shrink-0">
        <div>
          <div className="text-body-sm font-black text-text-primary">Manage Tags</div>
          <div className="text-label text-text-subtle mt-0.5">{pendingTags.length} selected</div>
        </div>
        <button
          onClick={onClose}
          aria-label="Close"
          className="bg-surface-2 border-none rounded-lg px-1.5 py-1 cursor-pointer text-text-secondary hover:bg-surface-3 transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      {/* Selected chips */}
      {pendingTags.length > 0 && (
        <div className="px-3.5 py-2.5 border-b border-surface-2 flex flex-wrap gap-1.5 shrink-0">
          {pendingTags.map((t, i) => (
            <span
              key={`${t}_${i}`}
              className="flex items-center gap-1 px-2 py-0.75 rounded-md text-label font-extrabold"
              style={{
                background: TAG_COLORS[i % TAG_COLORS.length] + '20',
                color: TAG_COLORS[i % TAG_COLORS.length],
                border: `1px solid ${TAG_COLORS[i % TAG_COLORS.length]}50`,
              }}
            >
              {t.split('.').pop()}
              <button onClick={() => onToggle(t)} aria-label={`Remove ${t.split('.').pop()}`} className="bg-transparent border-none cursor-pointer p-0 flex text-inherit">
                <X size={10} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Search */}
      <div className="px-3.5 py-2.5 border-b border-surface-2 shrink-0">
        <div className="flex items-center gap-1.5 px-2.5 py-1.75 bg-canvas border-[1.5px] border-border rounded-lg">
          <Search size={13} className="text-text-subtle shrink-0" />
          <input
            value={addTagSearch}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Search tags…"
            className="flex-1 border-none bg-transparent text-caption font-bold text-text-secondary outline-none focus:border-brand"
          />
        </div>
      </div>

      {/* Tag list */}
      <div className="flex-1 overflow-y-auto py-1.5">
        {filteredTags.length === 0 ? (
          <div className="px-4 py-6 text-center text-caption text-text-subtle font-medium">
            No tags match your search.
          </div>
        ) : (
          filteredTags.map((tag, idx) => {
            const sel = pendingTags.includes(tag);
            return (
              <button
                key={`${tag}_${idx}`}
                onClick={() => onToggle(tag)}
                className={`w-full flex items-center justify-between px-4 py-2 border-none cursor-pointer text-left text-caption font-bold border-b border-canvas transition-colors ${
                  sel ? 'bg-brand-muted text-brand' : 'bg-transparent text-text-secondary hover:bg-canvas'
                }`}
              >
                <span>{tag}</span>
                {sel && <Check size={13} className="text-brand shrink-0" />}
              </button>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-surface-2 flex gap-2 shrink-0">
        <button
          onClick={onClose}
          className="flex-1 py-2 border border-border rounded-lg bg-canvas text-caption font-extrabold text-text-secondary cursor-pointer hover:bg-surface-2 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onApply}
          className="flex-1 py-2 border-none rounded-lg bg-brand hover:bg-brand-hover text-caption font-black text-white cursor-pointer transition-colors"
        >
          Apply Tags
        </button>
      </div>
    </div>
  );
}
