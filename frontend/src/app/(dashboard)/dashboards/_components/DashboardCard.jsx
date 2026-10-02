// 'use client';
// import React from 'react';
// import GetMiniChart from './widgets/getMiniChart';

// const ZOOMABLE_TYPES = new Set(['line', 'multi_line', 'area', 'stacked_area', 'bar', 'column', 'combo', 'threshold_line', 'min_max_band']);

// export function DashboardCard({ dashboard, isHovered, isDraggingRef, activeGridItemId, onEdit, onDelete, onHoverEnter, onHoverLeave, onChartMouseEnter, onChartMouseLeave }) {
//     const uid = String(dashboard.id);
//     const chartType = (dashboard.type || dashboard.chartType || 'line').toLowerCase();
//     const isZoomable = ZOOMABLE_TYPES.has(chartType);

//     return (
//         <div className="flex h-full w-full">
//             <article
//                 onMouseEnter={() => { if (!isDraggingRef.current) onHoverEnter(uid); }}
//                 onMouseLeave={() => { if (!isDraggingRef.current) onHoverLeave(); }}
//                 className={`flex flex-col w-full h-full min-w-0 rounded-2xl overflow-hidden relative border border-border bg-surface transition-[border-color,box-shadow] duration-200 select-none ${isHovered ? 'border-brand/40 shadow-xl shadow-border/30' : 'shadow-sm'}`}
//             >
//                 {/* Top-right controls */}
//                 <div className="absolute top-3 right-3 flex items-center gap-2 z-30">
//                     {isHovered && !isDraggingRef.current && (
//                         <>
//                             <button
//                                 onClick={e => { e.stopPropagation(); onEdit(dashboard); }}
//                                 aria-label="Edit visual"
//                                 className="bg-surface/95 p-1 px-2.5 rounded-lg cursor-pointer flex items-center justify-center shadow-sm border border-border text-text-muted hover:text-brand hover:bg-canvas transition-colors"
//                             >
//                                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} className="w-3.5 h-3.5">
//                                     <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
//                                     <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
//                                 </svg>
//                             </button>
//                             <button
//                                 onClick={e => { e.stopPropagation(); onDelete(dashboard); }}
//                                 aria-label="Delete visual"
//                                 className="bg-surface/95 p-1 px-2.5 rounded-lg cursor-pointer flex items-center justify-center shadow-sm border border-border text-text-muted hover:text-danger hover:bg-canvas transition-colors"
//                             >
//                                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} className="w-3.5 h-3.5">
//                                     <polyline points="3 6 5 6 21 6" />
//                                     <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
//                                     <line x1="10" y1="11" x2="10" y2="17" />
//                                     <line x1="14" y1="11" x2="14" y2="17" />
//                                 </svg>
//                             </button>
//                         </>
//                     )}
//                     <div className="drag-handle bg-surface/95 p-1 px-3 rounded-lg cursor-grab flex items-center justify-center shadow-sm border border-border hover:bg-surface active:cursor-grabbing transition-colors">
//                         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3.5 h-3.5 text-text-subtle">
//                             <circle cx="9" cy="5" r="1" /><circle cx="9" cy="12" r="1" /><circle cx="9" cy="19" r="1" />
//                             <circle cx="15" cy="5" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="15" cy="19" r="1" />
//                         </svg>
//                     </div>
//                 </div>

//                 {/* Header */}
//                 <div className="drag-handle cursor-grab active:cursor-grabbing px-5 py-4 bg-surface border-b border-border flex flex-col gap-1.5 shrink-0 justify-between select-none">
//                     <div className="text-[14px] font-bold text-text-primary tracking-tight truncate">{dashboard.name || 'Unnamed Monitoring Node'}</div>
//                     <div className="flex items-center justify-between gap-2 mt-0.5">
//                         <span className="text-[9px] font-bold text-text-subtle uppercase tracking-widest leading-none">Equipment: {dashboard.equipment}</span>
//                         {dashboard.chartType && (
//                             <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-surface-2 text-text-secondary font-mono text-[9px] font-bold uppercase tracking-wider">{dashboard.chartType}</span>
//                         )}
//                     </div>
//                 </div>

//                 {/* Chart area */}
//                 <div
//                     onMouseEnter={() => { if (!isDraggingRef.current) onChartMouseEnter(); }}
//                     onMouseLeave={e => { if (e.buttons !== 1) onChartMouseLeave(); }}
//                     onMouseDown={e => e.stopPropagation()}
//                     onMouseMove={e => e.stopPropagation()}
//                     onDragStart={e => e.preventDefault()}
//                     className={`flex-1 min-h-0 w-full relative bg-gradient-to-b from-canvas/50 to-surface p-1 ui-chart-container cancel-drag touch-none select-none ${isZoomable ? 'zoomable-chart-container [&_*:not(button):not(button_*):not(.cursor-pointer):not(.cursor-pointer_*):not(.recharts-legend-wrapper):not(.recharts-legend-wrapper_*):not(.recharts-tooltip-wrapper):not(.recharts-tooltip-wrapper_*)]:cursor-crosshair' : ''}`}
//                 >
//                     <GetMiniChart ws={dashboard} uid={uid} isDragging={activeGridItemId === uid} />
//                     <div className="absolute inset-0 bg-gradient-to-b from-surface-2/10 to-transparent pointer-events-none" />
//                 </div>
//             </article>
//         </div>
//     );
// }
'use client';
import React from 'react';
import GetMiniChart from './widgets/getMiniChart';

const ZOOMABLE_TYPES = new Set(['line', 'multi_line', 'area', 'stacked_area', 'bar', 'column', 'combo', 'threshold_line', 'min_max_band']);

export function DashboardCard({
    dashboard,
    isHovered,
    isDraggingRef,
    activeGridItemId,
    onEdit,
    onDelete,
    onHoverEnter,
    onHoverLeave,
    onChartMouseEnter,
    onChartMouseLeave,

}) {
    const uid = String(dashboard.id);
    const chartType = (dashboard.type || dashboard.chartType || 'line').toLowerCase();
    const isZoomable = ZOOMABLE_TYPES.has(chartType);
    const isLive = dashboard.is_live === true || dashboard.is_live === 'True'
    return (
        <div className="flex h-full w-full">
            <article
                onMouseEnter={() => { if (!isDraggingRef.current) onHoverEnter(uid); }}
                onMouseLeave={() => { if (!isDraggingRef.current) onHoverLeave(); }}
                className={`flex flex-col w-full h-full min-w-0 rounded-2xl overflow-hidden relative border border-border bg-surface transition-[border-color,box-shadow] duration-200 select-none ${isHovered ? 'border-brand/40 shadow-xl shadow-border/30' : 'shadow-sm'}`}
            >
                {/* Top-right controls */}
                <div className="absolute top-3 right-3 flex items-center gap-2 z-30">
                    {isHovered && !isDraggingRef.current && (
                        <>
                            <button
                                onClick={e => { e.stopPropagation(); onEdit(dashboard); }}
                                aria-label="Edit visual"
                                className="bg-surface/95 p-1 px-2.5 rounded-lg cursor-pointer flex items-center justify-center shadow-sm border border-border text-text-muted hover:text-brand hover:bg-canvas transition-colors"
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} className="w-3.5 h-3.5">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                            </button>
                            <button
                                onClick={e => { e.stopPropagation(); onDelete(dashboard); }}
                                aria-label="Delete visual"
                                className="bg-surface/95 p-1 px-2.5 rounded-lg cursor-pointer flex items-center justify-center shadow-sm border border-border text-text-muted hover:text-danger hover:bg-canvas transition-colors"
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} className="w-3.5 h-3.5">
                                    <polyline points="3 6 5 6 21 6" />
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                    <line x1="10" y1="11" x2="10" y2="17" />
                                    <line x1="14" y1="11" x2="14" y2="17" />
                                </svg>
                            </button>
                        </>
                    )}
                    <div className="drag-handle bg-surface/95 p-1 px-3 rounded-lg cursor-grab flex items-center justify-center shadow-sm border border-border hover:bg-surface active:cursor-grabbing transition-colors">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3.5 h-3.5 text-text-subtle">
                            <circle cx="9" cy="5" r="1" /><circle cx="9" cy="12" r="1" /><circle cx="9" cy="19" r="1" />
                            <circle cx="15" cy="5" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="15" cy="19" r="1" />
                        </svg>
                    </div>
                </div>

                {/* Header */}
                <div className="drag-handle cursor-grab active:cursor-grabbing px-5 py-4 bg-surface border-b border-border flex flex-col gap-1.5 shrink-0 justify-between select-none">
                    <div className="text-[14px] font-bold text-text-primary tracking-tight truncate">{dashboard.name || 'Unnamed Monitoring Node'}</div>
                    <div className="flex items-center justify-between gap-2 mt-0.5">

                        <div className="flex items-center gap-2.5">
                            <span className="text-[9px] font-bold text-text-subtle uppercase tracking-widest leading-none">Equipment: {dashboard.equipment}</span>

                            {/* GREEN BLINKING LIVE BADGE */}
                            {isLive && (
                                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-success/30 bg-success/10 text-success">
                                    <span className="relative flex h-1.5 w-1.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-success"></span>
                                    </span>
                                    <span className="text-[8px] font-extrabold uppercase tracking-wider leading-none">Live</span>
                                </div>
                            )}
                        </div>

                        {dashboard.chartType && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-surface-2 text-text-secondary font-mono text-[9px] font-bold uppercase tracking-wider">{dashboard.chartType}</span>
                        )}
                    </div>
                </div>

                {/* Chart area */}
                <div
                    onMouseEnter={() => { if (!isDraggingRef.current) onChartMouseEnter(); }}
                    onMouseLeave={e => { if (e.buttons !== 1) onChartMouseLeave(); }}
                    onMouseDown={e => e.stopPropagation()}
                    onMouseMove={e => e.stopPropagation()}
                    onDragStart={e => e.preventDefault()}
                    className={`flex-1 min-h-0 w-full relative bg-gradient-to-b from-canvas/50 to-surface p-1 ui-chart-container cancel-drag touch-none select-none ${isZoomable ? 'zoomable-chart-container [&_*:not(button):not(button_*):not(.cursor-pointer):not(.cursor-pointer_*):not(.recharts-legend-wrapper):not(.recharts-legend-wrapper_*):not(.recharts-tooltip-wrapper):not(.recharts-tooltip-wrapper_*)]:cursor-crosshair' : ''}`}
                >
                    <GetMiniChart ws={dashboard} uid={uid} isDragging={activeGridItemId === uid} />
                    <div className="absolute inset-0 bg-gradient-to-b from-surface-2/10 to-transparent pointer-events-none" />
                </div>
            </article>
        </div>
    );
}