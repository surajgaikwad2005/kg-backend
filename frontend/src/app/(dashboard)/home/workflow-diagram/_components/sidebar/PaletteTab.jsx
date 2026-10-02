'use client';
import React from 'react';
import { Layers, Search, RefreshCw, Monitor, Trash2 } from 'lucide-react';
import { Tooltip } from '@/src/components/ui/Tooltip';
import { parseGeneratedSvg } from "../../_utils/SvgParser";
import { useSummaryStatus } from "../../_queries/useCpcpConfigQueries";
import { EquipmentSummaryTooltip } from "./EquipmentSummaryTooltip";

export function PaletteTab({
  catalog,
  pnidComponents,
  pnidLoading,
  clearAiComponents,
  paletteSearch,
  setPaletteSearch,
  filteredPnidComponents,
  onDragStartPnid,
  loadingDiagrams,
  savedDiagrams,
  fetchSidebarData,
  onLoad,
  handleDeleteDiagram,
  handleTogglePin,
  plantCode
}) {
  // Hovering a card fetches the plant's Detailed Equipment Summary status via useSummaryStatus;
  // HOVER_INTENT_MS debounce prevents fan-out requests when sweeping cursor across grid.
  const [isHovering, setIsHovering] = React.useState(false);
  const hoverTimerRef = React.useRef(null);

  const onHoverStart = React.useCallback(() => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = setTimeout(() => setIsHovering(true), 250);
  }, []);

  const onHoverEnd = React.useCallback(() => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = null;
  }, []);

  const summaryQuery = useSummaryStatus({ enabled: isHovering });
  const summary = React.useMemo(() => ({
    status: summaryQuery.data ?? null,
    loading: summaryQuery.isLoading,
    error: summaryQuery.error ? (summaryQuery.error.message || 'Summary status unavailable') : null,
    onHoverStart,
    onHoverEnd,
  }), [summaryQuery.data, summaryQuery.isLoading, summaryQuery.error, onHoverStart, onHoverEnd]);

  return (
    <>
      <div className="px-4 pt-3 pb-2 border-b border-border bg-surface shrink-0">
        <h3 className="font-black text-text-primary text-body uppercase tracking-widest">
          Equipment
        </h3>
        <p className="text-[9px] font-bold text-text-muted mt-0.5 uppercase tracking-wide">
          Drag components into canvas
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
        <div className="flex items-center justify-between px-1 pt-1 pb-1 border-b border-border">
          <div className="flex items-center gap-1.5">
            <p className="text-[9px] font-black text-text-muted tracking-widest uppercase">
              Available Equipment
            </p>
            {!pnidLoading && pnidComponents.length > 0 && (
              <span className="text-[8px] bg-surface-2 text-text-muted px-1.5 py-0.5 rounded-full font-bold border border-border">
                {filteredPnidComponents.length}
              </span>
            )}
          </div>
          {Object.keys(catalog).some((k) => k.startsWith("ai_")) && (
            <button
              onClick={clearAiComponents}
              className="text-[8px] font-bold text-text-muted hover:text-danger transition-colors uppercase tracking-widest cursor-pointer px-1.5 py-0.5 hover:bg-danger/10 rounded-lg"
            >
              Clear AI
            </button>
          )}
        </div>

        <div className="relative w-full">
          <label htmlFor="palette-search" className="sr-only">
            Search components
          </label>
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted pointer-events-none" />
          <input
            id="palette-search"
            type="text"
            placeholder="Search components..."
            value={paletteSearch}
            onChange={(e) => setPaletteSearch(e.target.value)}
            className="w-full h-10 rounded-xl border border-border bg-surface-2 pl-10 pr-3 text-sm text-text-primary placeholder:text-text-muted transition-all duration-200 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
        </div>

        {pnidLoading ? (
          <div className="grid grid-cols-2 gap-2.5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="bg-surface border border-border rounded-xl overflow-hidden"
              >
                <div
                  className="skeleton-shimmer h-[92px] bg-surface-2"
                  style={{ "--sk-delay": `${i * 0.07}s` }}
                />
                <div className="p-2 border-t border-border">
                  <div
                    className="skeleton-shimmer h-2.5 bg-surface-2 rounded w-3/4"
                    style={{ "--sk-delay": `${i * 0.07 + 0.05}s` }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : filteredPnidComponents.length === 0 ? (
          <p className="text-label text-text-muted italic text-center py-6">
            {paletteSearch
              ? "No components match your search"
              : "No components available"}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            {filteredPnidComponents.map((component) => {
              const key = `pnid_${component.name.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
              const normName = component.name.toLowerCase().replace(/[^a-z0-9]/g, "");
              const def = catalog[key] || catalog[Object.keys(catalog).find((k) => k.toLowerCase().replace(/^pnid_?|^ai_?/, "").replace(/[^a-z0-9]/g, "") === normName)];
              let renderGraphic = def ? def.render("normal", "") : null;
              if (!renderGraphic && component.code) {
                const parsed = parseGeneratedSvg(component.code, { status: "normal", label: "" });
                if (parsed?.svgMarkup) {
                  renderGraphic = (
                    <svg viewBox={parsed.defaultViewBox} width="100%" height="100%">
                      <g dangerouslySetInnerHTML={{ __html: parsed.svgMarkup }} />
                    </svg>
                  );
                }
              }

              return (
                // The panel below replaces the card's old native `title`
                // tooltip — two tooltips on one card would otherwise stack.
                <Tooltip
                  key={component.name}
                  side="left"
                  variant="panel"
                  label={
                    <EquipmentSummaryTooltip
                      name={component.name}
                      description={component.description}
                      status={summary.status}
                      loading={summary.loading}
                      error={summary.error}
                    />
                  }
                >
                <div
                  draggable
                  tabIndex={0}
                  aria-label={`${component.name} — drag onto the canvas`}
                  onDragStart={(e) => onDragStartPnid(e, component)}
                  onMouseEnter={summary.onHoverStart}
                  onMouseLeave={summary.onHoverEnd}
                  onFocus={summary.onHoverStart}
                  onBlur={summary.onHoverEnd}
                  className="relative bg-surface border border-border rounded-xl cursor-grab transition-all duration-200 hover:shadow-md hover:border-brand/40 hover:scale-[1.03] active:cursor-grabbing active:scale-[0.98] overflow-hidden group outline-none focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/20"
                >
                  <div className="h-[92px] w-full flex items-center justify-center bg-surface-2/50 p-2 overflow-hidden group-hover:bg-surface transition-colors">
                    {renderGraphic || (
                      <span className="text-[9px] text-text-muted font-mono text-center px-1 leading-snug">
                        {component.name}
                      </span>
                    )}
                  </div>
                  <div className="p-2 border-t border-border bg-surface group-hover:bg-surface-2 transition-colors flex items-center justify-between gap-1">
                    <p className="text-[9px] font-black text-text-primary uppercase tracking-tight truncate">
                      {component.name}
                    </p>
                    {Object.keys(catalog).find(
                      (k) =>
                        k.startsWith("ai_") &&
                        catalog[k].label === component.name,
                    ) && (
                      <span className="text-[8px] bg-brand/10 text-brand px-1 rounded font-bold shrink-0">
                        AI
                      </span>
                    )}
                  </div>
                </div>
                </Tooltip>
              );
            })}
          </div>
        )}
      </div>

      <div className="border-t border-border bg-surface shrink-0">
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center gap-1.5">
            <p className="text-[9px] font-black text-text-muted tracking-widest uppercase">
              Saved Workflows
            </p>
            {!loadingDiagrams && savedDiagrams.length > 0 && (
              <span className="text-[8px] bg-surface-2 text-text-muted px-1.5 py-0.5 rounded-full font-black border border-border">
                {savedDiagrams.length}
              </span>
            )}
          </div>
          <button
            onClick={fetchSidebarData}
            aria-label="Refresh workflows"
            title="Refresh"
            className="p-1.5 hover:bg-surface-2 rounded-lg transition-colors cursor-pointer"
          >
            <RefreshCw
              className={`w-3 h-3 text-text-muted ${loadingDiagrams ? "animate-spin" : ""}`}
            />
          </button>
        </div>
        <div className="h-48 overflow-y-auto px-3 pb-3 space-y-2 plant-scrollbar">
          {loadingDiagrams ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="p-2.5 bg-surface border border-border rounded-lg"
              >
                <div className="mb-2">
                  <div
                    className="skeleton-shimmer h-3 bg-surface-2 rounded w-3/4"
                    style={{ "--sk-delay": `${i * 0.12}s` }}
                  />
                </div>
                <div
                  className="skeleton-shimmer h-2 bg-surface-2 rounded w-1/3"
                  style={{ "--sk-delay": `${i * 0.12 + 0.06}s` }}
                />
              </div>
            ))
          ) : savedDiagrams.length === 0 ? (
            <p className="text-label text-text-muted italic text-center py-6">
              No saved diagrams
            </p>
          ) : (
            savedDiagrams.map((diagram) => (
              <div
                key={diagram.id}
                onClick={() => onLoad(diagram.id)}
                className="group relative p-2.5 bg-surface border border-border rounded-lg cursor-pointer hover:border-brand/40 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-black text-text-primary truncate uppercase tracking-tight">
                      {diagram.name}
                    </p>
                    <p className="text-[9px] font-bold text-text-muted mt-1 uppercase tracking-wider truncate">
                      {diagram.updated_at
                        ? new Date(diagram.updated_at).toLocaleDateString()
                        : "Unknown date"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                      onClick={(e) => handleTogglePin(e, diagram)}
                      title={diagram.is_dashboard ? "Unpin from dashboard" : "Pin to dashboard"}
                      className={`p-1.5 rounded transition-colors cursor-pointer ${
                        diagram.is_dashboard
                          ? "text-brand hover:bg-brand/10 bg-brand/5"
                          : "text-text-muted hover:bg-surface-2"
                      }`}
                    >
                      <Monitor className="w-[13px] h-[13px]" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteDiagram(e, diagram.id, diagram.name)}
                      title="Delete diagram"
                      className="p-1.5 rounded text-text-muted hover:bg-danger/10 hover:text-danger transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-[13px] h-[13px]" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
