'use client';
import React, { useRef, useState } from 'react';
import {
  ArrowLeft, RotateCw, Loader2, Grid3X3, Tag, ZoomIn, Plus,
  Search, ChevronDown, Check, MoreHorizontal,
} from 'lucide-react';
import TimeSelector from '@/src/components/ui/TimeSelector';

/**
 * Top toolbar + sub-toolbar for WorkspaceViewer.
 * Time range is managed globally via TimeSelector — no localStart/localEnd props.
 */
export function WorkspaceToolbar({
  workspace,
  pendingTags,
  showGrid,
  showLabels,
  loading,
  tagData,
  selectedTags,
  deviatedCount,
  onBack,
  onGridToggle,
  onLabelsToggle,
  onResetZoom,
  onFetchData,
  onCustomTagOpen,
  onToggleTagVisibility,
  onAddTagsOpen,
}) {
  const [showVisibilitySelector, setShowVisibilitySelector] = useState(false);
  const [tagVisSearch, setTagVisSearch] = useState('');
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const visSelectorRef = useRef(null);
  const moreMenuRef = useRef(null);

  React.useEffect(() => {
    const fn = (e) => {
      if (visSelectorRef.current && !visSelectorRef.current.contains(e.target))
        setShowVisibilitySelector(false);
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target))
        setShowMoreMenu(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const paramCount = workspace.isBackend ? pendingTags.length : workspace.tags.length;

  const iconBtn = (label, icon, active, onClick, title) => (
    <button
      title={title ?? label}
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 h-8 rounded-lg border cursor-pointer text-xs font-semibold uppercase tracking-wider transition-all duration-150 shrink-0 ${
        active
          ? 'bg-brand text-white border-brand shadow-sm'
          : 'bg-surface-2 text-text-secondary border-border hover:bg-surface-3 hover:text-text-primary'
      }`}
    >
      {icon}
      <span className="hidden lg:inline text-[11px] font-bold tracking-wider">{label}</span>
    </button>
  );

  return (
    <>
      {/* ── Main Toolbar ── */}
      <div className="shrink-0 border-b border-border bg-surface">
        <div className="flex items-center justify-between px-3 sm:px-4 py-2 gap-3 min-w-0">

          {/* Left: Back + workspace name */}
          <div className="flex items-center gap-3 min-w-0 shrink-0">
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 px-3 h-8 rounded-lg border border-border bg-surface cursor-pointer text-xs font-semibold text-text-secondary uppercase tracking-wider hover:bg-surface-2 transition-colors shrink-0"
            >
              <ArrowLeft size={13} />
              <span className="hidden sm:inline">Back</span>
            </button>

            <div className="hidden sm:block w-px h-5 bg-border" />

            <div className="hidden sm:flex flex-col gap-0.5 min-w-0">
              <span className="text-xs font-bold text-text-primary uppercase tracking-tight truncate leading-none">
                {workspace.name}
              </span>
              <span className="text-[10px] font-medium text-text-subtle uppercase tracking-wider">
                {paramCount} Parameter{paramCount !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Right: TimeSelector + view toggles + action buttons */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            {/* TimeSelector — always visible */}
            <TimeSelector compact />

            {/* View toggles — hidden on small screens */}
            <div className="hidden md:flex items-center gap-1.5 border-l border-border pl-2.5 ml-0.5">
              {iconBtn('Grid', <Grid3X3 size={13} />, showGrid, onGridToggle)}
              {iconBtn('Labels', <Tag size={13} />, showLabels, onLabelsToggle)}
              {iconBtn('Zoom', <ZoomIn size={13} />, false, onResetZoom, 'Reset Zoom')}
            </div>

            {/* Divider */}
            <div className="hidden sm:block w-px h-5 bg-border mx-1" />

            {/* Refresh / Fetch Data */}
            <button
              onClick={onFetchData}
              disabled={loading}
              title="Refresh / Fetch Data"
              className={`flex items-center gap-1.5 px-3.5 h-8 bg-surface-inverse hover:opacity-90 text-white text-xs font-semibold uppercase tracking-wider rounded-lg cursor-pointer border-none shadow-sm transition-all duration-150 shrink-0 ${
                loading ? 'opacity-70 cursor-wait' : ''
              }`}
            >
              <RotateCw size={13} className={loading ? 'animate-spin' : ''} />
              <span>{loading ? 'Fetching…' : 'Refresh'}</span>
            </button>

            {/* Custom Tag */}
            <button
              onClick={onCustomTagOpen}
              className="hidden sm:flex items-center gap-1.5 px-3.5 h-8 bg-highlight hover:bg-highlight-hover text-white text-xs font-semibold uppercase tracking-wider rounded-lg cursor-pointer border-none shadow-sm transition-all duration-150 shrink-0"
            >
              <Plus size={13} />
              <span className="hidden lg:inline">Custom Tag</span>
              <span className="lg:hidden">Tag</span>
            </button>

            {/* More menu on small screens */}
            <div className="relative sm:hidden" ref={moreMenuRef}>
              <button
                onClick={() => setShowMoreMenu(v => !v)}
                className="flex items-center justify-center w-8 h-8 rounded-lg bg-surface-2 border-none cursor-pointer text-text-secondary"
              >
                <MoreHorizontal size={15} />
              </button>
              {showMoreMenu && (
                <div className="absolute top-[calc(100%+6px)] right-0 z-300 w-44 bg-surface border border-border rounded-xl shadow-card overflow-hidden">
                  <button onClick={() => { onCustomTagOpen(); setShowMoreMenu(false); }} className="w-full flex items-center gap-2 px-3.5 py-2.5 bg-transparent border-none cursor-pointer text-label font-bold text-text-secondary hover:bg-surface-2 transition-colors">
                    <Plus size={13} /> Custom Tag
                  </button>
                  <button onClick={() => { onGridToggle(); setShowMoreMenu(false); }} className={`w-full flex items-center gap-2 px-3.5 py-2.5 border-none cursor-pointer text-label font-bold transition-colors ${showGrid ? 'bg-brand-muted text-brand' : 'bg-transparent text-text-secondary hover:bg-surface-2'}`}>
                    <Grid3X3 size={13} /> {showGrid ? 'Hide Grid' : 'Show Grid'}
                  </button>
                  <button onClick={() => { onLabelsToggle(); setShowMoreMenu(false); }} className={`w-full flex items-center gap-2 px-3.5 py-2.5 border-none cursor-pointer text-label font-bold transition-colors ${showLabels ? 'bg-brand-muted text-brand' : 'bg-transparent text-text-secondary hover:bg-surface-2'}`}>
                    <Tag size={13} /> {showLabels ? 'Hide Labels' : 'Show Labels'}
                  </button>
                  <button onClick={() => { onResetZoom(); setShowMoreMenu(false); }} className="w-full flex items-center gap-2 px-3.5 py-2.5 bg-transparent border-none cursor-pointer text-label font-bold text-text-secondary hover:bg-surface-2 transition-colors">
                    <ZoomIn size={13} /> Reset Zoom
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Sub-Toolbar ── */}
      <div className="shrink-0 border-b border-border bg-surface">
        <div className="flex items-center px-3 sm:px-4 py-1.5 gap-2 sm:gap-3 overflow-x-auto scrollbar-hide">

          {/* Visibility selector */}
          <div className="relative shrink-0" ref={visSelectorRef}>
            <button
              onClick={() => setShowVisibilitySelector(v => !v)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full border cursor-pointer text-label font-black text-text-secondary uppercase tracking-wide transition-all ${showVisibilitySelector ? 'border-brand bg-brand-muted text-brand' : 'border-border bg-surface hover:border-brand/50'}`}
            >
              <Tag size={11} className={showVisibilitySelector ? 'text-brand' : 'text-text-subtle'} />
              <span className="whitespace-nowrap">
                {selectedTags.size}<span className="hidden sm:inline"> / {tagData.length}</span> Tags
              </span>
              <ChevronDown size={10} className={`transition-transform duration-200 ${showVisibilitySelector ? 'rotate-180' : ''}`} />
            </button>

            {showVisibilitySelector && (
              <div className="absolute top-[calc(100%+6px)] left-0 w-65 sm:w-70 bg-surface border border-border rounded-xl shadow-card z-200 overflow-hidden">
                <div className="px-3 py-2.5 bg-canvas border-b border-surface-2">
                  <div className="flex items-center gap-2 bg-surface border border-border rounded-lg px-2.5 py-1.5">
                    <Search size={11} className="text-text-subtle shrink-0" />
                    <input
                      autoFocus
                      value={tagVisSearch}
                      onChange={e => setTagVisSearch(e.target.value)}
                      placeholder="Search tags…"
                      className="border-none bg-transparent outline-none text-label font-bold w-full text-text-secondary"
                    />
                  </div>
                </div>
                <div className="max-h-55 overflow-y-auto py-1">
                  <button
                    onClick={() => {
                      if (selectedTags.size === tagData.length)
                        tagData.forEach(t => selectedTags.has(t.name) && onToggleTagVisibility(t.name));
                      else
                        tagData.filter(t => !selectedTags.has(t.name)).forEach(t => onToggleTagVisibility(t.name));
                    }}
                    className="w-full px-3 py-2 bg-transparent border-none border-b border-canvas text-left cursor-pointer flex items-center justify-between hover:bg-canvas"
                  >
                    <span className="text-label font-black text-brand">
                      {selectedTags.size === tagData.length ? 'Deselect All' : 'Select All'}
                    </span>
                    <Check size={12} className={`text-brand ${selectedTags.size === tagData.length ? 'opacity-100' : 'opacity-30'}`} />
                  </button>
                  {tagData
                    .filter(t => t.name.toLowerCase().includes(tagVisSearch.toLowerCase()))
                    .map(t => {
                      const sel = selectedTags.has(t.name);
                      return (
                        <button
                          key={t.name}
                          onClick={() => onToggleTagVisibility(t.name)}
                          className="w-full px-3 py-2 bg-transparent border-none text-left cursor-pointer flex items-center gap-2.5 hover:bg-canvas"
                        >
                          <div className={`w-3.5 h-3.5 rounded-[3px] border flex items-center justify-center transition-all shrink-0 ${sel ? 'border-brand bg-brand' : 'border-border-strong'}`}>
                            {sel && <Check size={10} color="#fff" strokeWidth={4} />}
                          </div>
                          <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: t.color }} />
                          <span className={`text-label ${sel ? 'font-extrabold text-text-primary' : 'font-semibold text-text-muted'}`}>{t.name}</span>
                        </button>
                      );
                    })}
                </div>
              </div>
            )}
          </div>

          {/* Add Tag */}
          <button
            onClick={onAddTagsOpen}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-border bg-surface cursor-pointer text-label font-black text-text-secondary uppercase tracking-wide hover:border-brand/50 hover:text-brand transition-all shrink-0"
          >
            <Plus size={11} className="text-brand" />
            <span>Add Tag</span>
          </button>

          {/* Deviation warnings */}
          {deviatedCount > 0 && (
            <span className="text-2xs font-black text-warning uppercase tracking-wide whitespace-nowrap shrink-0">
              ⚠ {deviatedCount} Deviated
            </span>
          )}
        </div>
      </div>
    </>
  );
}
