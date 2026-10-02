'use client';
import React, { useState } from 'react';
import { Tag, Layers, GitMerge, AlignCenter, Minimize2, Maximize2, Eye, EyeOff, ChevronUp, Trash2 } from 'lucide-react';

/**
 * Bottom resizable section: summary strip + tag details table.
 *
 * @param {{
 *   tagData: object[],
 *   tagMetadata: Record<string, object>,
 *   deviationInfo: object[],
 *   deviatedCount: number,
 *   focusedTag: string | null,
 *   selectedTags: Set<string>,
 *   viewMode: string,
 *   isTableMinimized: boolean,
 *   tableHeight: number,
 *   onFocusTag: (name: string | null) => void,
 *   onToggleVisibility: (name: string) => void,
 *   onDeleteTag: (name: string) => void,
 *   onMinimize: () => void,
 *   onStartResize: (e: MouseEvent) => void,
 *   onViewModeChange: (mode: string) => void,
 * }} props
 */
export function TagDetailsTable({
  tagData,
  tagMetadata = {},
  deviationInfo,
  deviatedCount,
  focusedTag,
  selectedTags,
  viewMode,
  isTableMinimized,
  tableHeight,
  onFocusTag,
  onToggleVisibility,
  onDeleteTag,
  onMinimize,
  onStartResize,
  onViewModeChange,
}) {
  const [deletingTag, setDeletingTag] = useState(null);

  const handleDeleteClick = async (tagName) => {
    setDeletingTag(tagName);
    try {
      await onDeleteTag(tagName);
    } finally {
      setDeletingTag(null);
    }
  };

  const modeBtn = (mode, icon, label, hint) => (
    <button
      title={hint}
      onClick={() => onViewModeChange(mode)}
      className={`flex items-center gap-1.25 px-2 py-0.5 rounded text-2xs font-black uppercase tracking-[0.06em] cursor-pointer border-none transition-all ${viewMode === mode ? 'bg-highlight text-white shadow-card' : 'bg-surface-2 text-text-secondary'}`}
    >
      {icon}{label}
    </button>
  );

  return (
    <>
      {/* Resize handle */}
      <div
        onMouseDown={onStartResize}
        className="h-2.5 cursor-ns-resize shrink-0 bg-surface-2 border-y border-border flex items-center justify-center transition-colors z-30 hover:bg-brand-muted group"
      >
        <div className="w-7.5 h-1 rounded-sm bg-border-strong group-hover:bg-brand/50" />
      </div>

      {/* Bottom section */}
      <div className="shrink-0 min-h-0 border-t border-border bg-surface flex flex-col" style={{ height: isTableMinimized ? 28 : tableHeight }}>
        {/* Summary strip */}
        <div className="flex items-center gap-3.75 px-3.75 py-2.5 border-b border-canvas bg-surface shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="text-caption font-black text-text-primary">{tagData.length}</span>
            <span className="text-caption font-extrabold text-text-muted tracking-[0.05em]">TOTAL TAGS</span>
          </div>

          {focusedTag && (
            <div className="flex items-center gap-2 bg-brand-muted px-3 py-0.75 rounded-[20px] border border-brand/20">
              <span className="text-label font-black text-brand uppercase">FOCUSED: {focusedTag}</span>
              <button onClick={() => onFocusTag(null)} aria-label="Clear focus" className="bg-brand text-white border-none rounded-full w-3.5 h-3.5 cursor-pointer flex items-center justify-center">
                ✕
              </button>
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <span className="text-caption text-brand font-black">✓</span>
            <span className="text-caption font-extrabold text-text-muted tracking-[0.05em]">DEVIATION HIGHLIGHTED</span>
          </div>
          {deviatedCount > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-caption text-warning font-black">⚠</span>
              <span className="text-caption font-extrabold text-text-muted tracking-[0.05em]">{deviatedCount} DEVIATED IN WINDOW</span>
            </div>
          )}
        </div>

        {isTableMinimized ? (
          <div
            onClick={onMinimize}
            className="flex-1 flex items-center justify-center gap-2.5 cursor-pointer hover:bg-brand-muted"
          >
            <span className="text-2xs font-black text-brand uppercase tracking-[0.15em]">Restore Parameter Details</span>
            <ChevronUp size={12} className="text-brand" />
          </div>
        ) : (
          <>
            {/* Table header row */}
            <div className="px-3.5 py-1.5 flex items-center justify-between border-b border-surface-2 bg-canvas">
              <div className="flex items-center gap-2">
                <Tag size={16} className="text-text-secondary" />
                <span className="text-caption font-black text-text-primary">TAG DETAILS</span>
                <span className="text-label text-text-subtle font-semibold">{tagData.length} parameters</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-caption font-bold text-text-subtle mr-1">View as:</span>
                {modeBtn('lanes', <Layers size={11} />, 'Lanes', 'Each tag in its own lane')}
                {modeBtn('oneLane', <GitMerge size={11} />, 'One Lane', 'All tags together, independent Y-axes')}
                {modeBtn('oneAxis', <AlignCenter size={11} />, 'One Axis', 'All tags share Y-axis')}
                <span className="w-px h-4 bg-border mx-1" />
                <button onClick={onMinimize} aria-label="Minimize table" className="bg-transparent border-none cursor-pointer p-1 hover:bg-surface-2 rounded">
                  <Minimize2 size={14} className="text-text-muted" />
                </button>
              </div>
            </div>

            {/* Table body */}
            <div className="flex-1 overflow-y-auto">
              <table className="w-full border-collapse">
                <thead className="sticky top-0 bg-surface z-10">
                  <tr className="bg-canvas border-b border-border">
                    <th className="w-10 px-3 py-2"></th>
                    {['Lane', 'Tag Name', 'Description', 'Unit', 'Min Threshold', 'Max Threshold', 'St. Deviation', 'Status', 'Focus', 'Delete'].map(h => (
                      <th key={h} className="text-left px-3 py-2 text-label font-black text-text-muted uppercase tracking-[0.07em]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tagData.map((t, idx) => {
                    const d = deviationInfo[idx];
                    const meta = tagMetadata[t.name] || {};
                    const isSel = selectedTags.has(t.name);
                    const isFocus = focusedTag === t.name;
                    const isDeleting = deletingTag === t.name;
                    return (
                      <tr
                        key={t.name}
                        className={`border-b border-surface-2 hover:bg-brand-muted ${idx % 2 === 0 ? 'bg-surface' : 'bg-canvas'} ${isSel ? 'opacity-100' : 'opacity-40'}`}
                      >
                        {/* Visibility toggle */}
                        <td className="px-3 py-2 text-center">
                          <button onClick={() => onToggleVisibility(t.name)} aria-label={isSel ? 'Hide tag' : 'Show tag'} className="bg-transparent border-none cursor-pointer">
                            {isSel ? <Eye size={16} className="text-brand" /> : <EyeOff size={16} className="text-text-subtle" />}
                          </button>
                        </td>

                        {/* Lane number */}
                        <td className="px-3 py-2">
                          <span className="bg-surface-2 rounded px-2 py-0.5 text-caption font-black text-text-secondary">{idx + 1}</span>
                        </td>

                        {/* Tag name + color swatch */}
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <div className="w-3.5 h-1 rounded-sm" style={{ background: t.color }} />
                            <span className="text-caption font-bold text-text-primary">{t.name}</span>
                          </div>
                        </td>

                        {/* Description from metadata */}
                        <td className="px-3 py-2 text-caption text-text-muted max-w-40 truncate" title={meta.description || meta.tag_description || '—'}>
                          {meta.description || meta.tag_description || '—'}
                        </td>

                        {/* Unit from metadata */}
                        <td className="px-3 py-2 text-caption text-text-muted">
                          {meta.unit || meta.eng_unit || '—'}
                        </td>

                        {/* Min threshold */}
                        <td className="px-3 py-2 text-caption text-warning font-bold">{(d?.minTh ?? 0).toFixed(3)}</td>

                        {/* Max threshold */}
                        <td className="px-3 py-2 text-caption text-danger font-bold">{(d?.maxTh ?? 0).toFixed(3)}</td>

                        {/* Std deviation */}
                        <td className="px-3 py-2 text-caption text-brand font-bold">{(d?.stdDev ?? 0).toFixed(3)}</td>

                        {/* Deviation status badge */}
                        <td className="px-3 py-2">
                          <span className={`text-label font-black uppercase tracking-[0.06em] px-2.5 py-0.75 rounded-xl border ${d?.isDeviated ? 'bg-warning/10 text-warning border-warning/30' : 'bg-success/10 text-success border-success/30'}`}>
                            {d?.isDeviated ? '⚠ Deviated' : '✓ Normal'}
                          </span>
                        </td>

                        {/* Focus toggle */}
                        <td className="px-3 py-2">
                          <button
                            onClick={() => onFocusTag(isFocus ? null : t.name)}
                            aria-label={isFocus ? 'Unfocus tag' : 'Focus tag'}
                            className={`rounded-md px-2 py-1.25 cursor-pointer border ${isFocus ? 'bg-danger/10 border-danger/20 text-danger' : 'bg-brand-muted border-brand/20 text-brand'}`}
                          >
                            {isFocus ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                          </button>
                        </td>

                        {/* Delete button */}
                        <td className="px-3 py-2">
                          <button
                            onClick={() => handleDeleteClick(t.name)}
                            disabled={isDeleting}
                            aria-label={`Delete tag ${t.name}`}
                            title={`Remove ${t.name} from dashboard`}
                            className={`rounded-md px-2 py-1.25 cursor-pointer border transition-colors ${isDeleting ? 'bg-surface-2 border-border text-text-subtle cursor-wait' : 'bg-danger/10 border-danger/20 text-danger hover:bg-danger/20'}`}
                          >
                            <Trash2 size={15} className={isDeleting ? 'animate-pulse' : ''} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </>
  );
}
