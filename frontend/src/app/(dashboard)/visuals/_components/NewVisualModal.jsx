'use client';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { X, Search, ChevronDown, Check, Plus, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Modal } from '@/src/components/ui/Modal';
import { listTags } from '@/src/services/visuals/visualsService';
import { getCleanUsername } from '@/src/lib/dashboards.utils';

export function NewVisualModal({ isOpen, allTags = [], onClose, onCreate }) {
  const [name, setName] = useState('');
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [fetchedTags, setFetchedTags] = useState([]);
  const [isLoadingTags, setIsLoadingTags] = useState(false);
  const dropRef = useRef(null);

  // Combine parent provided allTags with on-demand fetchedTags
  const availableTags = useMemo(() => {
    const combined = [...(allTags || []), ...(fetchedTags || [])];
    return Array.from(new Set(combined));
  }, [allTags, fetchedTags]);

  const filtered = useMemo(() => {
    if (!search.trim()) return availableTags;
    return availableTags.filter(t => t.toLowerCase().includes(search.toLowerCase()));
  }, [availableTags, search]);

  useEffect(() => {
    const fn = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  // Fetch tags on demand when modal opens
  useEffect(() => {
    if (!isOpen) return;
    setName('');
    setSelected([]);
    setSearch('');
    setOpen(false);

    if (availableTags.length === 0) {
      const username = getCleanUsername();
      setIsLoadingTags(true);
      listTags({ username })
        .then(res => {
          const tagsArr = Array.isArray(res) ? res : (res?.data || []);
          setFetchedTags(tagsArr);
        })
        .catch(() => setFetchedTags([]))
        .finally(() => setIsLoadingTags(false));
    }
  }, [isOpen, availableTags.length]);

  const toggle = (tag) => {
    setSelected(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const canCreate = name.trim().length > 0;

  return (
    <Modal open={isOpen} onClose={onClose} size="xl" className="sm:max-w-145 max-h-[85dvh] flex flex-col border border-border rounded-2xl shadow-card overflow-hidden bg-surface">
      {/* Header */}
      <div className="px-6 py-4.5 border-b border-surface-2 flex items-center justify-between shrink-0 bg-canvas/60">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand">
            <Sparkles size={18} />
          </div>
          <div>
            <h3 id="new-visual-modal-title" className="m-0 text-base font-black text-text-primary tracking-tight">New Visual Workspace</h3>
            <p className="mt-0.5 mb-0 text-2xs font-semibold text-text-subtle">Configure data tags and parameters for your dashboard</p>
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Close"
          className="bg-surface-2 border-none rounded-xl p-1.5 cursor-pointer text-text-secondary hover:bg-surface-3 transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
        {/* Name Input */}
        <div>
          <label className="block text-2xs font-black text-text-secondary uppercase tracking-wider mb-1.5">
            Visual Name <span className="text-brand">*</span>
          </label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Compressor Stage 1 Monitoring"
            className="w-full px-3.5 py-2.5 rounded-lg border-[1.5px] border-border text-body-sm font-bold text-text-primary outline-none box-border bg-canvas focus:border-brand focus:ring-2 focus:ring-brand/10 transition-all"
          />
        </div>

        {/* Tag Selector */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-2xs font-black text-text-secondary uppercase tracking-wider">
              Add Data Tags ({selected.length} Selected)
            </label>
            {availableTags.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (selected.length === availableTags.length) {
                    setSelected([]);
                  } else {
                    setSelected([...availableTags]);
                  }
                }}
                className="text-2xs font-bold text-brand hover:text-brand-hover bg-transparent border-none cursor-pointer"
              >
                {selected.length === availableTags.length ? 'Deselect All' : 'Select All'}
              </button>
            )}
          </div>

          {/* Selected chips */}
          {selected.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3 max-h-28 overflow-y-auto p-2 bg-brand/5 border border-brand/20 rounded-xl">
              {selected.map((t, idx) => (
                <span
                  key={`${t}_${idx}`}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-brand/10 text-brand border border-brand/30 rounded-lg text-2xs font-bold"
                >
                  <span>{t.split('.').pop()}</span>
                  <button
                    onClick={() => toggle(t)}
                    aria-label={`Remove ${t}`}
                    className="bg-transparent border-none cursor-pointer p-0 flex text-brand hover:opacity-80 transition-colors"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Search bar & dropdown */}
          <div ref={dropRef} className="relative">
            <div
              className="flex items-center gap-2 px-3 py-2.5 bg-canvas border-[1.5px] border-border rounded-lg cursor-text focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/10 transition-all"
              onClick={() => setOpen(true)}
            >
              <Search size={14} className="text-text-subtle shrink-0" />
              <input
                value={search}
                onChange={e => { setSearch(e.target.value); setOpen(true); }}
                onFocus={() => setOpen(true)}
                placeholder={isLoadingTags ? "Loading sensor tags..." : "Search and add tags..."}
                className="flex-1 border-none bg-transparent text-xs font-semibold text-text-secondary outline-none"
              />
              {isLoadingTags ? (
                <Loader2 size={14} className="animate-spin text-brand shrink-0" />
              ) : (
                <ChevronDown size={14} className={`text-text-subtle transition-transform duration-200 shrink-0 ${open ? 'rotate-180' : ''}`} />
              )}
            </div>

            <AnimatePresence>
              {open && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.12 }}
                  className="absolute top-[calc(100%+6px)] left-0 right-0 z-200 bg-surface border border-border rounded-xl shadow-card max-h-56 overflow-y-auto py-1"
                >
                  {filtered.map(tag => (
                    <button
                      key={tag}
                      onClick={() => { toggle(tag); setSearch(''); }}
                      className={`w-full flex items-center justify-between px-3.5 py-2 border-none cursor-pointer text-left text-caption font-bold transition-colors ${selected.includes(tag) ? 'bg-brand-muted text-brand' : 'bg-transparent text-text-secondary hover:bg-canvas'
                        }`}
                    >
                      <span>{tag}</span>
                      {selected.includes(tag) && <Check size={13} className="text-brand shrink-0" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {selected.length === 0 && !isLoadingTags && (
            <div className="text-2xs text-text-subtle mt-1.5 font-medium">
              No tags selected. All available tags ({availableTags.length}) will be included by default.
            </div>
          )}
          {open && filtered.length > 0 && <div className="h-44" />}
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-surface-2 flex items-center justify-end gap-3 shrink-0 bg-canvas/60">
        <button
          onClick={onClose}
          className="px-4.5 py-2.5 rounded-xl border border-border bg-surface text-xs font-bold text-text-secondary cursor-pointer hover:bg-surface-2 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            if (canCreate) onCreate(name.trim(), selected.length > 0 ? selected : availableTags);
          }}
          disabled={!canCreate}
          className={`px-6 py-2.5 rounded-xl border-none text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all ${canCreate
              ? 'bg-brand hover:bg-brand-hover text-white cursor-pointer shadow-card active:scale-95'
              : 'bg-border text-text-subtle cursor-not-allowed'
            }`}
        >
          <Plus size={14} /> Create Visual
        </button>
      </div>
    </Modal>
  );
}
