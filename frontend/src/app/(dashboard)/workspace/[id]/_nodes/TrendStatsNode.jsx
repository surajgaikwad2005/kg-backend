'use client';
import React, { useState, useEffect, useRef, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Handle, Position, useReactFlow } from '@xyflow/react';
import { TrendingUp, Trash2, Pencil, Loader2, RefreshCw, AlertTriangle } from 'lucide-react';
import { updateWorkspaceAnalysis, deleteWorkspaceAnalysis, getTimeseriesAnalysis, getTrendAnalysis } from '@/src/services/workspace/workspaceService';
import { getUsername, getWorkspaceName, getTimeRange, fmtDate } from './nodeUtils';
import { useApp } from '@/src/context/AppContext';

// Dynamic import — Plotly is browser-only
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false, loading: () => <PlotLoader /> });

function PlotLoader() {
    return (
        <div className="h-[300px] flex flex-col items-center justify-center bg-surface-2 rounded-2xl gap-3">
            <Loader2 className="w-6 h-6 text-success animate-spin" />
            <span className="text-[11px] font-bold text-text-subtle uppercase tracking-widest">Loading Chart…</span>
        </div>
    );
}

// ── Tag color palette ───────────────────────────────────────────────────────
const LINE_COLORS = [
    '#10b981', '#3b82f6', '#f59e0b', '#ef4444',
    '#8b5cf6', '#06b6d4', '#f97316', '#ec4899',
    '#14b8a6', '#84cc16',
];

// ── Parse the API response into { timestamps, series } ──────────────────────
// Supports: { timestamps[], series[{ tag, mean[], min[], max[], limits }] }
function parseTimeseriesData(apiData) {
    if (!apiData) return null;

    // Primary format — backend returns timestamps + series
    if (apiData.timestamps && Array.isArray(apiData.series) && apiData.series.length > 0) {
        return {
            timestamps: apiData.timestamps,
            series: apiData.series.map(s => ({
                tag: s.tag,
                mean: Array.isArray(s.mean) ? s.mean : [],
                min: Array.isArray(s.min) ? s.min : [],
                max: Array.isArray(s.max) ? s.max : [],
                limits: s.limits || null,
            })),
        };
    }

    // Fallback — older { series[{ x[], y[] }] } format
    if (Array.isArray(apiData.series) && apiData.series.length > 0) {
        const first = apiData.series[0];
        if (first.x && first.y) {
            return {
                timestamps: first.x,
                series: apiData.series.map(s => ({
                    tag: s.tag || 'Signal',
                    mean: s.y,
                    min: [],
                    max: [],
                    limits: null,
                })),
            };
        }
    }

    return null;
}

// ── Build Plotly traces + shapes from chartData ─────────────────────────────
function buildPlotlyData(chartData) {
    const traces = [];
    const shapes = [];
    const annotations = [];

    chartData.series.forEach((s, si) => {
        const color = LINE_COLORS[si % LINE_COLORS.length];

        // Main mean line
        traces.push({
            type: 'scatter',
            mode: 'lines+markers',
            name: s.tag,
            x: chartData.timestamps,
            y: s.mean,
            line: { color, width: 2, shape: 'spline', smoothing: 0.4 },
            marker: { color, size: 5, symbol: 'circle' },
            hovertemplate: `<b>${s.tag}</b><br>%{x}<br>Value: %{y:.4f}<extra></extra>`,
        });

        // Effective limits as dashed horizontal lines
        const eff = s.limits?.effective;
        if (eff?.high != null) {
            shapes.push({
                type: 'line',
                xref: 'paper', x0: 0, x1: 1,
                yref: 'y', y0: eff.high, y1: eff.high,
                line: { color, width: 1.5, dash: 'dash' },
                opacity: 0.7,
            });
            annotations.push({
                xref: 'paper', x: 1, xanchor: 'right',
                yref: 'y', y: eff.high,
                text: `${s.tag} High: ${eff.high.toFixed(2)}`,
                showarrow: false,
                font: { size: 9, color },
                bgcolor: 'rgba(255,255,255,0.7)',
                borderpad: 2,
            });
        }
        if (eff?.low != null) {
            shapes.push({
                type: 'line',
                xref: 'paper', x0: 0, x1: 1,
                yref: 'y', y0: eff.low, y1: eff.low,
                line: { color, width: 1.5, dash: 'dot' },
                opacity: 0.7,
            });
            annotations.push({
                xref: 'paper', x: 1, xanchor: 'right',
                yref: 'y', y: eff.low,
                text: `${s.tag} Low: ${eff.low.toFixed(2)}`,
                showarrow: false,
                font: { size: 9, color },
                bgcolor: 'rgba(255,255,255,0.7)',
                borderpad: 2,
            });
        }
    });

    return { traces, shapes, annotations };
}

// ── Plotly chart wrapper ────────────────────────────────────────────────────
function TimeseriesPlot({ chartData }) {
    const { traces, shapes, annotations } = buildPlotlyData(chartData);

    const layout = {
        autosize: true,
        height: 300,
        margin: { l: 48, r: 16, t: 12, b: 40 },
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        font: { family: 'system-ui, sans-serif', size: 10, color: '#94a3b8' },
        legend: {
            orientation: 'h',
            x: 0,
            y: 1.08,
            font: { size: 10, color: '#475569' },
            bgcolor: 'rgba(0,0,0,0)',
            borderwidth: 0,
        },
        xaxis: {
            type: 'category',
            tickangle: -30,
            tickfont: { size: 9, color: '#94a3b8' },
            linecolor: '#e2e8f0',
            gridcolor: '#f1f5f9',
            showgrid: true,
            zeroline: false,
            automargin: true,
        },
        yaxis: {
            tickfont: { size: 9, color: '#94a3b8' },
            linecolor: '#e2e8f0',
            gridcolor: '#f1f5f9',
            showgrid: true,
            zeroline: false,
            automargin: true,
        },
        shapes,
        annotations,
        hovermode: 'x unified',
        hoverlabel: {
            bgcolor: '#fff',
            bordercolor: '#e2e8f0',
            font: { size: 11, color: '#1e293b' },
        },
    };

    const config = {
        displayModeBar: true,
        modeBarButtonsToRemove: ['sendDataToCloud', 'lasso2d', 'select2d', 'toImage'],
        displaylogo: false,
        responsive: true,
        scrollZoom: true,
    };

    return (
        <Plot
            data={traces}
            layout={layout}
            config={config}
            style={{ width: '100%', height: 300 }}
            useResizeHandler
        />
    );
}

// ── Main Node ───────────────────────────────────────────────────────────────
export function TrendStatsNode({ id, data, selected }) {
    const { setNodes } = useReactFlow();
    const { plantCode } = useApp();

    const [chartData, setChartData] = useState(() =>
        parseTimeseriesData(data?.apiData || data?.computedData)
    );
    const [loading, setLoading] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const activeTags = data.savedTags || [];
    const lastFetchedKey = useRef(
        chartData
            ? `${activeTags.slice().sort().join(',')}-${typeof window !== 'undefined' ? localStorage.getItem('timeRange') : ''}-0`
            : null
    );

    // ── Fetch / update on tag or time-range change ─────────────────────────
    useEffect(() => {
        if (activeTags.length === 0) { setChartData(null); return; }
        if (!plantCode) return;

        const currentKey = `${activeTags.slice().sort().join(',')}-${typeof window !== 'undefined' ? localStorage.getItem('timeRange') : ''}-${refreshTrigger}`;
        if (lastFetchedKey.current === currentKey) return;
        lastFetchedKey.current = currentKey;

        let cancelled = false;
        const run = async () => {
            setLoading(true);
            try {
                const { start, end } = getTimeRange();
                const username = getUsername();
                const workspace_name = getWorkspaceName();
                const analysisType = data.analysisType || 'timeseries';
                const validAnalysisId = data.analysisId && !isNaN(Number(data.analysisId))
                    ? Number(data.analysisId)
                    : undefined;

                let result;
                if (validAnalysisId) {
                    result = await updateWorkspaceAnalysis(plantCode, {
                        username, workspace_name,
                        analysis_type: analysisType,
                        analysis_id: validAnalysisId,
                        tags: activeTags,
                        start: fmtDate(start), end: fmtDate(end),
                    });
                } else {
                    const runAnalysis = analysisType === 'trend_analysis' ? getTrendAnalysis : getTimeseriesAnalysis;
                    result = await runAnalysis(plantCode, {
                        username, workspace_name,
                        tags: activeTags,
                        start: fmtDate(start), end: fmtDate(end),
                    });
                    const newId = result?.analysisId ?? result?.analysis_id
                        ?? result?.data?.analysisId ?? result?.data?.analysis_id;
                    if (newId) {
                        setNodes(nds => nds.map(n =>
                            n.id === id ? { ...n, data: { ...n.data, analysisId: newId, analysisType } } : n
                        ));
                    }
                }

                if (!cancelled && (result?.status_code === 200 || result?.statusCode === 200 || result?.success) && result.data) {
                    const parsed = parseTimeseriesData(result.data);
                    if (parsed) {
                        setChartData(parsed);
                        setNodes(nds => nds.map(n =>
                            n.id === id ? { ...n, data: { ...n.data, apiData: result.data, savedTags: activeTags } } : n
                        ));
                    }
                }
            } catch (err) {
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        run();
        return () => { cancelled = true; };
    }, [activeTags.join(','), refreshTrigger, plantCode]);

    // ── Auto-refresh on global time-range change ───────────────────────────
    useEffect(() => {
        const handler = () => setRefreshTrigger(v => v + 1);
        window.addEventListener('timeRangeChanged', handler);
        return () => window.removeEventListener('timeRangeChanged', handler);
    }, []);

    const removeNode = async (e) => {
        e.stopPropagation();
        if (data.analysisId && plantCode) {
            try {
                await deleteWorkspaceAnalysis(plantCode, {
                    username: getUsername(),
                    workspace_name: getWorkspaceName(),
                    analysis_type: data.analysisType || 'timeseries',
                    analysis_id: data.analysisId,
                });
            } catch {}
        }
        setNodes(nds => nds.filter(n => n.id !== id));
    };

    const triggerDrawerOpen = (e) => {
        if (e) e.stopPropagation();
        window.dispatchEvent(new CustomEvent('open-tag-drawer', { detail: { nodeId: id } }));
    };

    const isUnconfigured = activeTags.length === 0;

    // ── Unconfigured / empty state ─────────────────────────────────────────
    if (isUnconfigured) {
        return (
            <div className="bg-surface border-2 border-dashed border-success/30 rounded-3xl p-10 min-w-[360px] text-center shadow-xl relative">
                <div className="absolute right-4 top-4 flex gap-1">
                    <button onClick={triggerDrawerOpen} className="p-2 text-text-subtle hover:text-success rounded-xl transition-all cursor-pointer" aria-label="Edit node">
                        <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={removeNode} className="p-2 text-text-subtle hover:text-danger rounded-xl transition-all cursor-pointer" aria-label="Remove node">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
                <div className="w-16 h-16 bg-success/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-success/20 animate-pulse">
                    <TrendingUp className="w-8 h-8 text-success" />
                </div>
                <div className="text-[15px] font-black text-text-primary mb-2">{data.label || 'Timeseries Trend Graph'}</div>
                <div className="text-[12px] font-bold text-text-muted leading-relaxed px-4">
                    Configure tags to visualize time series trend lines.
                </div>
                <button
                    onClick={triggerDrawerOpen}
                    className="mt-4 px-4 py-2 bg-success hover:bg-success/90 text-white font-black text-[12px] rounded-xl transition-all cursor-pointer shadow-md hover:shadow-lg active:scale-95"
                >
                    Configure Tags
                </button>
            </div>
        );
    }

    return (
            <div className={`bg-surface border-2 rounded-[2.5rem] shadow-[0_30px_90px_rgba(16,185,129,0.15)] min-w-[640px] overflow-hidden transition-all duration-300 ${selected ? 'border-success ring-4 ring-success/20' : 'border-success/40'}`}>

            {/* ── Header ── */}
            <div className="bg-gradient-to-r from-success to-success/80 px-7 py-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                        <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <span className="text-white font-black text-[10px] uppercase tracking-[0.2em] block leading-none opacity-80">
                            Process Monitoring
                        </span>
                        <span className="text-white font-black text-[18px] mt-1 block tracking-tight">
                            {data.label || 'Timeseries Trend Graph'}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {activeTags.length > 0 && (
                        <div className="px-3 py-1.5 bg-white/15 border border-white/20 rounded-xl text-white text-[10px] font-black uppercase tracking-wider">
                            {activeTags.length} Signal{activeTags.length !== 1 ? 's' : ''} Active
                        </div>
                    )}
                    {loading && (
                        <span className="text-[10px] font-black text-white bg-overlay px-3 py-1 rounded-full animate-pulse uppercase">
                            Analyzing…
                        </span>
                    )}
                    <button
                        onClick={() => setRefreshTrigger(v => v + 1)}
                        className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/10 cursor-pointer transition-all"
                        aria-label="Refresh chart"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                        onClick={triggerDrawerOpen}
                        className="p-2.5 rounded-xl border cursor-pointer transition-all bg-white/10 text-white border-white/10 hover:bg-white/20"
                        aria-label="Edit node"
                    >
                        <Pencil className="w-4 h-4" />
                    </button>
                    <button
                        onClick={removeNode}
                        className="p-2.5 bg-white/10 hover:bg-danger text-white rounded-xl border border-white/10 cursor-pointer transition-all"
                        aria-label="Remove node"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* ── Chart Body ── */}
            <div className="px-4 pt-4 pb-2 bg-surface">
                {loading && !chartData ? (
                    <div className="h-[300px] flex flex-col items-center justify-center bg-surface-2 rounded-3xl border border-border gap-3 shadow-inner">
                        <Loader2 className="w-8 h-8 text-success animate-spin" />
                        <span className="text-[11px] font-black text-text-subtle uppercase tracking-widest">Running Analysis…</span>
                    </div>
                ) : chartData && chartData.timestamps.length > 0 ? (
                    <TimeseriesPlot chartData={chartData} />
                ) : (
                    <div className="h-[300px] flex flex-col items-center justify-center gap-4 opacity-40">
                        <AlertTriangle className="w-12 h-12 text-text-subtle" />
                        <div className="text-center px-8 text-[12px] font-bold text-text-muted">
                            No data returned. Check tag configuration or time range.
                        </div>
                    </div>
                )}
            </div>

            {/* ── Footer ── */}
            <div className="bg-surface px-7 py-4 border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-success shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    <span className="text-[10px] text-text-subtle font-black uppercase tracking-widest">Timeseries Engine Active</span>
                </div>
                <span className="text-[10px] text-text-subtle font-bold">
                    {chartData
                        ? `${chartData.timestamps.length} timestamps · ${chartData.series.length} signal${chartData.series.length !== 1 ? 's' : ''}`
                        : `${activeTags.length} tag${activeTags.length !== 1 ? 's' : ''} configured`
                    }
                </span>
            </div>

            <Handle type="target" position={Position.Left} className="!opacity-0" />
            <Handle type="source" position={Position.Right} className="!opacity-0" />
        </div>
    );
}
TrendStatsNode.displayName = 'TrendStatsNode';
