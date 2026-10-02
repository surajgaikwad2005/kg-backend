'use client';
import React, { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import {
    X, Search, Filter, CheckSquare, ArrowLeft, Activity,
    Plus, Loader2, TrendingUp, Network, AlertTriangle, GitBranch,
    Gauge, BarChart3, BellRing, Layers, Check, Info, Database
} from 'lucide-react';
import dynamic from 'next/dynamic';

const HighchartsChart = dynamic(() => import('@/src/components/charts/HighchartsChart'), { ssr: false });

// Maps node types → display metadata for the context banner
const NODE_META = {
    trendStats:       { label: 'Time Series Profiler',     iconBg: 'bg-success',  bannerBg: 'bg-success/10',  Icon: TrendingUp   },
    correlationMatrix:{ label: 'Correlation Matrix',       iconBg: 'bg-chart-1',   bannerBg: 'bg-chart-1/10',   Icon: Network      },
    anomalyAlerts:    { label: 'Event Detection Engine',   iconBg: 'bg-warning',    bannerBg: 'bg-warning/10',    Icon: BellRing     },
    kpiMonitoring:    { label: 'KPI Monitoring',           iconBg: 'bg-brand',     bannerBg: 'bg-brand/10',     Icon: Gauge        },
    rcaAnalysis:      { label: 'Root Cause Analysis',      iconBg: 'bg-danger',      bannerBg: 'bg-danger/10',      Icon: GitBranch    },
    multiChart:       { label: 'Multi Chart Visualization',iconBg: 'bg-chart-2',  bannerBg: 'bg-chart-2/10',  Icon: BarChart3    },
    rcaEvidence:      { label: 'Evidence Container',       iconBg: 'bg-brand',   bannerBg: 'bg-brand/10',   Icon: Layers       },
};

/**
 * DataDrawer
 *
 * isOpen controls the slide-in/out CSS transition.
 * activeTargetNode — when set, shows a context banner and highlights already-added tags.
 */
export function DataDrawer({
    isOpen,
    workspaceName,
    assetsList,
    isLoadingAssets,
    selectedItems,
    searchQuery,
    activeCategory,
    activeItem,
    activeTab,
    activeItemTrend,
    isLoadingTrend,
    activeTargetNode,
    onClose,
    onSearchChange,
    onCategoryChange,
    onItemClick,
    onItemSelect,
    onBack,
    onTabChange,
    onAddToCanvas,
    onAddSelected,
    onRemoveTag,
}) {
    // Dynamic resizable width state
    const [width, setWidth] = useState(500);
    const [isResizing, setIsResizing] = useState(false);
    const isResizingRef = useRef(false);

    const startResizing = useCallback((e) => {
        e.preventDefault();
        isResizingRef.current = true;
        setIsResizing(true);
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
    }, []);

    const stopResizing = useCallback(() => {
        isResizingRef.current = false;
        setIsResizing(false);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
    }, []);

    const resize = useCallback((e) => {
        if (!isResizingRef.current) return;
        const newWidth = window.innerWidth - e.clientX;
        if (newWidth >= 320 && newWidth <= Math.min(window.innerWidth * 0.7, 850)) {
            setWidth(newWidth);
        }
    }, []);

    useEffect(() => {
        window.addEventListener('mousemove', resize);
        window.addEventListener('mouseup', stopResizing);
        return () => {
            window.removeEventListener('mousemove', resize);
            window.removeEventListener('mouseup', stopResizing);
        };
    }, [resize, stopResizing]);

    // Tags already wired up to the target node
    const targetSelectedTags = useMemo(() => {
        if (!activeTargetNode) return new Set();
        return new Set([
            ...(activeTargetNode.data?.savedTags || []),
            ...(activeTargetNode.data?.signals || []).map(s => s.label || s.tagId || ''),
        ].filter(Boolean));
    }, [activeTargetNode]);

    const nodeMeta = activeTargetNode ? NODE_META[activeTargetNode.type] : null;

    const filteredAssets = assetsList.filter(a =>
        a.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const alreadyAdded = filteredAssets.filter(a => targetSelectedTags.has(a.name)).length;

    const previewChartOptions = {
        chart: {
            type: 'area', backgroundColor: 'transparent', height: null,
            spacing: [10, 10, 15, 10], style: { fontFamily: 'inherit' }
        },
        title: { text: '' },
        credits: { enabled: false },
        xAxis: {
            type: 'datetime',
            labels: { style: { color: '#94a3b8', fontSize: '10px', fontWeight: 'bold' } },
            lineColor: '#f1f5f9', tickColor: '#f1f5f9'
        },
        yAxis: {
            title: { text: '' },
            labels: { style: { color: '#94a3b8', fontSize: '10px', fontWeight: 'bold' } },
            gridLineColor: '#f1f5f9'
        },
        legend: { enabled: false },
        tooltip: {
            backgroundColor: '#1e293b', borderWidth: 0, shadow: true, useHTML: true,
            style: { color: '#fff' },
            headerFormat: '<div style="font-size:10px;font-weight:800;color:#94a3b8;margin-bottom:4px;">{point.key}</div>',
            pointFormat: '<div style="font-size:14px;font-weight:900;color:#fff;">{point.y:.2f}</div>'
        },
        plotOptions: {
            area: {
                fillColor: {
                    linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                    stops: [[0, 'rgba(37,99,235,0.15)'], [1, 'rgba(37,99,235,0)']]
                },
                marker: { enabled: false, states: { hover: { enabled: true, radius: 5 } } },
                lineWidth: 3, color: '#2563eb',
                states: { hover: { lineWidth: 4 } }
            }
        },
        series: [{ data: activeItemTrend }]
    };

    return (
        // Outer wrapper: always in DOM; width-collapse drives enter/exit (translate leaves a flex gap)
        <div
            className={`shrink-0 overflow-hidden relative ${isResizing ? '' : 'transition-all duration-300 ease-in-out'} ${isOpen ? '' : 'pointer-events-none'}`}
            style={{ width: isOpen ? `${width}px` : '0px' }}
        >
            <div 
                className={`h-full min-h-0 bg-surface border-l border-border flex flex-col shadow-[-10px_0_20px_rgba(0,0,0,0.03)] overflow-hidden transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
                style={{ width: `${width}px` }}
            >
                {/* Resize Handle */}
                <div
                    onMouseDown={startResizing}
                    className="absolute top-0 bottom-0 left-0 w-1.5 cursor-col-resize hover:bg-brand/30 active:bg-brand/50 transition-colors z-50 flex items-center justify-center group"
                >
                    <div className="w-[2px] h-8 bg-border rounded-full group-hover:bg-brand-hover group-active:bg-brand transition-colors" />
                </div>

                {/* ── List view ── */}
                {!activeItem ? (
                    <>
                        {/* Header */}
                        <div className="px-5 py-4 border-b border-border flex items-center justify-between shrink-0 bg-surface">
                            <div>
                                <h2 className="text-[15px] font-black text-text-primary">Find and select data</h2>
                                <p className="text-[11px] text-text-subtle font-medium mt-0.5">
                                    {activeTargetNode
                                        ? `Adding to: ${activeTargetNode.data?.label || nodeMeta?.label || activeTargetNode.type}`
                                        : 'Drag or click a tag to add it to the canvas'}
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-1.5 hover:bg-surface-2 rounded-lg transition-colors text-text-subtle hover:text-text-primary cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Context banner — shown when a specific node is targeted */}
                        {nodeMeta && (
                            <div className={`px-5 py-3 flex items-center justify-between shrink-0 ${nodeMeta.bannerBg}`}>
                                <div className="flex items-center gap-2.5">
                                    <div className={`w-7 h-7 ${nodeMeta.iconBg} rounded-lg flex items-center justify-center shadow-sm`}>
                                        <nodeMeta.Icon className="w-3.5 h-3.5 text-white" />
                                    </div>
                                    <div>
                                        <div className="text-[11px] font-black text-text-primary uppercase tracking-wider">{nodeMeta.label}</div>
                                        {targetSelectedTags.size > 0 && (
                                            <div className="text-[10px] font-bold text-text-secondary mt-0.5">
                                                {targetSelectedTags.size} tag{targetSelectedTags.size !== 1 ? 's' : ''} already configured
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {targetSelectedTags.size > 0 && (
                                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-surface/60 border border-white/80 rounded-full">
                                        <Check className="w-3 h-3 text-success" />
                                        <span className="text-[10px] font-black text-success">{alreadyAdded} active</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Search */}
                        <div className="px-5 py-3 shrink-0 flex flex-col gap-3 border-b border-border">
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle" />
                                <input
                                    type="text"
                                    placeholder="Search tags…"
                                    value={searchQuery}
                                    onChange={e => onSearchChange(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2.5 bg-surface-2 border border-border rounded-xl text-[13px] font-medium outline-none hover:border-border focus:border-brand focus:bg-surface transition-all"
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex gap-1.5">
                                    {['Time Series', 'Files'].map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => onCategoryChange(cat)}
                                            className={`flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${activeCategory === cat ? 'bg-text-primary text-white shadow-sm' : 'bg-surface-2 text-text-secondary hover:bg-border'}`}
                                        >
                                            {cat}
                                            <span className={`font-black text-[10px] px-1.5 py-0.5 rounded-md ${activeCategory === cat ? 'bg-surface/20 text-white' : 'bg-border/70 text-text-secondary'}`}>
                                                {cat === 'Time Series' ? assetsList.length : 0}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                                <button className="flex items-center gap-1.5 text-[12px] font-bold text-text-secondary hover:bg-surface-2 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer">
                                    <Filter className="w-3.5 h-3.5" />
                                    Filter
                                </button>
                            </div>
                        </div>

                        {/* Tag list */}
                        <div className="flex-1 overflow-y-auto min-h-0 px-3 py-2">
                            {isLoadingAssets ? (
                                <div className="flex flex-col items-center justify-center py-16 text-text-subtle gap-3">
                                    <Loader2 className="w-8 h-8 text-brand animate-spin" />
                                    <div className="text-body-sm font-bold text-text-secondary">Loading tags…</div>
                                    <div className="text-caption text-text-subtle">Fetching available data streams</div>
                                </div>
                            ) : filteredAssets.length > 0 ? (
                                <div className="space-y-1">
                                    {filteredAssets.map(item => {
                                        const isAdded = targetSelectedTags.has(item.name);
                                        const isChecked = selectedItems.includes(item.id);
                                        return (
                                            <div
                                                key={item.id}
                                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all group border ${isAdded ? 'bg-success/10 border-success/20 hover:bg-success/20' : 'bg-surface border-transparent hover:bg-surface-2 hover:border-border'}`}
                                                onClick={() => isAdded ? (onRemoveTag && onRemoveTag(item.name)) : onAddToCanvas(item)}
                                            >
                                                {/* Checkbox */}
                                                <div
                                                    onClick={e => { e.stopPropagation(); if (isAdded) { if (onRemoveTag) onRemoveTag(item.name); } else { onItemSelect(item.id, e); } }}
                                                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all cursor-pointer ${isAdded ? 'bg-success border-success hover:bg-danger hover:border-danger' : isChecked ? 'bg-text-primary border-border-strong' : 'border-border group-hover:border-border-strong'}`}
                                                >
                                                    {isAdded ? (
                                                        <Check className="w-3 h-3 text-white group-hover:hidden" />
                                                    ) : isChecked ? (
                                                        <CheckSquare className="w-3.5 h-3.5 text-white" />
                                                    ) : null}
                                                    {isAdded && (
                                                        <X className="w-3 h-3 text-white hidden group-hover:block" />
                                                    )}
                                                </div>

                                                {/* Tag info */}
                                                <div className="flex-1 min-w-0">
                                                    <div className={`text-[13px] font-bold truncate ${isAdded ? 'text-success' : 'text-text-primary'}`}>
                                                        {item.name}
                                                    </div>
                                                    <div className="text-[11px] text-text-subtle truncate">{item.desc}</div>
                                                </div>

                                                {/* Status badge */}
                                                {isAdded ? (
                                                    <span className="text-[10px] font-black text-success bg-success/10 px-2 py-0.5 rounded-full shrink-0 uppercase tracking-wide">Added</span>
                                                ) : (
                                                    <Plus className="w-4 h-4 text-text-subtle group-hover:text-brand shrink-0 transition-colors" />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : searchQuery ? (
                                <div className="flex flex-col items-center justify-center py-16 text-text-subtle gap-3">
                                    <Search className="w-10 h-10 text-text-subtle" />
                                    <div className="text-body-sm font-bold text-text-secondary">No tags match &ldquo;{searchQuery}&rdquo;</div>
                                    <div className="text-caption text-text-subtle">Try a different search term</div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-16 gap-4">
                                    <div className="w-16 h-16 rounded-2xl bg-surface-2 flex items-center justify-center">
                                        <Database className="w-7 h-7 text-text-subtle" />
                                    </div>
                                    <div className="text-center">
                                        <div className="text-body-sm font-bold text-text-secondary">No data available</div>
                                        <div className="text-caption text-text-subtle mt-1 max-w-55 leading-relaxed">
                                            No tags were found for this workspace. Add a custom tag to get started.
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-4 py-3 bg-surface border-t border-border shrink-0">
                            {!activeTargetNode ? (
                                <div className="flex items-center gap-2.5 px-2 py-2 bg-surface-2 rounded-xl border border-border">
                                    <Info className="w-4 h-4 text-text-subtle shrink-0" />
                                    <p className="text-[12px] text-text-secondary font-medium leading-tight">
                                        Click an analysis node on the canvas to target it, then select tags to add.
                                    </p>
                                </div>
                            ) : selectedItems.length > 0 ? (
                                <div className="flex items-center justify-between bg-text-primary rounded-xl p-2 shadow-lg shadow-overlay/10">
                                    <div className="px-2">
                                        <p className="text-white text-[10px] font-bold uppercase tracking-wider leading-tight">Selected</p>
                                        <p className="text-text-subtle text-[13px] font-black leading-tight">{selectedItems.length} tag{selectedItems.length !== 1 ? 's' : ''}</p>
                                    </div>
                                    <button
                                        onClick={onAddSelected}
                                        className="px-4 py-2 rounded-lg text-[13px] font-black bg-surface text-text-primary hover:bg-surface-2 transition-colors cursor-pointer shadow-sm"
                                    >
                                        {`Add to ${nodeMeta?.label || activeTargetNode.type}`}
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 px-2 py-1">
                                    <Info className="w-3.5 h-3.5 text-text-subtle shrink-0" />
                                    <p className="text-[12px] text-text-subtle">
                                        Click a tag to add it, or use checkboxes to select multiple.
                                    </p>
                                </div>
                            )}
                        </div>
                    </>
                ) : (

                    /* ── Detail view ── */
                    <>
                        <div className="flex flex-col shrink-0 border-b border-border bg-surface">
                            <div className="px-5 pt-4 pb-3 flex items-start justify-between">
                                <button
                                    onClick={onBack}
                                    className="p-1.5 hover:bg-surface-2 rounded-lg transition-colors text-text-secondary cursor-pointer shrink-0"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                </button>
                                <div className="flex-1 mx-3">
                                    <h2 className="text-[18px] font-black text-text-primary leading-tight truncate">{activeItem.name}</h2>
                                    <p className="text-[12px] text-text-subtle mt-0.5 font-medium">{activeItem.desc}</p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-1.5 hover:bg-surface-2 rounded-lg transition-colors text-text-subtle cursor-pointer shrink-0"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="px-5 pb-3 flex items-center gap-3">
                                <div className="flex items-center gap-1.5 px-3 py-1 bg-brand/10 text-brand text-[12px] font-bold rounded-full border border-brand/20">
                                    <Activity className="w-3.5 h-3.5" />
                                    Time Series
                                </div>
                                <button
                                    onClick={() => onAddToCanvas(activeItem)}
                                    className="ml-auto flex items-center gap-1.5 px-4 py-1.5 bg-text-primary text-white text-[13px] font-bold rounded-xl hover:bg-text-primary hover:opacity-90 transition-colors shadow-sm cursor-pointer"
                                >
                                    <Plus className="w-4 h-4" />
                                    {activeTargetNode ? 'Add to node' : 'Add to canvas'}
                                </button>
                            </div>

                            <div className="flex items-center gap-6 px-5 border-t border-border">
                                {['Overview', 'Properties', 'Data View', 'Events'].map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => onTabChange(tab)}
                                        className={`py-3 text-[13px] font-bold whitespace-nowrap border-b-2 transition-all cursor-pointer ${activeTab === tab ? 'text-text-primary border-border-strong' : 'text-text-subtle border-transparent hover:text-text-primary'}`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex-1 min-h-0 overflow-y-auto bg-surface-2/50 p-5 flex flex-col">
                            {activeTab === 'Overview' ? (
                                <div className="flex flex-col gap-5">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-1 h-5 bg-brand rounded-full" />
                                            <h3 className="text-[13px] font-black text-text-primary uppercase tracking-tight">Signal Behavior</h3>
                                        </div>
                                        <div className="flex items-center gap-1.5 px-3 py-1 bg-surface border border-border rounded-full shadow-sm">
                                            <div className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
                                            <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Live</span>
                                        </div>
                                    </div>

                                    <div className="flex-1 min-h-[260px] bg-surface rounded-2xl border border-border p-4 shadow-sm relative">
                                        {isLoadingTrend ? (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-surface/80 backdrop-blur-sm rounded-2xl z-10">
                                                <Loader2 className="w-7 h-7 text-brand animate-spin" />
                                                <span className="text-[12px] font-bold text-text-subtle">Loading data…</span>
                                            </div>
                                        ) : activeItemTrend.length > 0 ? (
                                            <HighchartsChart
                                                options={previewChartOptions}
                                                containerProps={{ style: { height: '260px', width: '100%' } }}
                                            />
                                        ) : (
                                            <div className="w-full h-full min-h-[240px] flex flex-col items-center justify-center text-text-subtle">
                                                <Activity className="w-10 h-10 mb-2" />
                                                <p className="text-[12px] font-bold">No data for this range</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-surface p-4 rounded-2xl border border-border shadow-sm">
                                            <div className="text-[10px] font-black text-text-subtle uppercase tracking-widest mb-1.5">Stream Status</div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-success" />
                                                <span className="text-[13px] font-bold text-text-primary">Healthy</span>
                                            </div>
                                        </div>
                                        <div className="bg-surface p-4 rounded-2xl border border-border shadow-sm">
                                            <div className="text-[10px] font-black text-text-subtle uppercase tracking-widest mb-1.5">Last Update</div>
                                            <div className="text-[13px] font-bold text-text-primary">Real-time</div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-text-subtle">
                                    <Activity className="w-10 h-10 text-text-subtle mb-3" />
                                    <p className="text-[13px] font-medium">{activeTab} view coming soon.</p>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
