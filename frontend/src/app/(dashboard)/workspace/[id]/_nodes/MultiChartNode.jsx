'use client';
import React, { useState, useEffect } from 'react';
import { Handle, Position, useReactFlow } from '@xyflow/react';
import { BarChart3, Trash2, Settings, Loader2 } from 'lucide-react';
import { Select } from '@/src/components/ui/Select';
import { listAvailableTags, updateWorkspaceAnalysis, deleteWorkspaceAnalysis, getMultiChartVisualization } from '@/src/services/workspace/workspaceService';
import dynamic from 'next/dynamic';
import { getUsername, getWorkspaceName, getTimeRange } from './nodeUtils';
import { useApp } from '@/src/context/AppContext';

const HighchartsReact = dynamic(() => import('highcharts-react-official'), { ssr: false });
let Highcharts;
if (typeof window !== 'undefined') {
    Highcharts = require('highcharts');
}

function fmtIso(d) {
    const pad = n => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

const CHART_TYPES = ['scatter', 'histogram', 'bar'];
const BAR_OPS = ['mean', 'sum', 'min', 'max', 'std'];

export function MultiChartNode({ id, data, selected }) {
    const { setNodes } = useReactFlow();
    const { plantCode } = useApp();
    const [chartType, setChartType] = useState(data.chartType || 'scatter');
    const [chartData, setChartData] = useState(data.savedChartData || null);
    const [loading, setLoading] = useState(false);
    // savedChartData is stripped before localStorage save (quota guard); use chart config fields to detect prior configuration.
    const hasPriorConfig = !!(data.xAxis || data.yAxis || data.histTag || (data.barTags && data.barTags.length > 0));
    const [showSettings, setShowSettings] = useState(!data.savedChartData && !hasPriorConfig);
    const [fetchingTags, setFetchingTags] = useState(false);
    const [allTags, setAllTags] = useState([]);
    const [xAxis, setXAxis] = useState(data.xAxis || '');
    const [yAxis, setYAxis] = useState(data.yAxis || '');
    const [histTag, setHistTag] = useState(data.histTag || '');
    const [histBins, setHistBins] = useState(data.histBins || 30);
    const [barTags, setBarTags] = useState(data.barTags || []);
    const [barOp, setBarOp] = useState(data.barOp || 'mean');

    useEffect(() => {
        if (!showSettings || allTags.length > 0 || !plantCode) return;
        setFetchingTags(true);
        listAvailableTags(plantCode, getUsername(), getWorkspaceName())
            .then(d => setAllTags(Array.isArray(d.data) ? d.data : (Array.isArray(d) ? d : [])))
            .catch(() => {})
            .finally(() => setFetchingTags(false));
    }, [showSettings, plantCode]);

    const fetchChart = async () => {
        if (!plantCode) return;
        setLoading(true);
        try {
            const { start, end } = getTimeRange();
            const username = getUsername();
            const workspace_name = getWorkspaceName();
            let tags = [];
            if (chartType === 'scatter') tags = [xAxis, ...(Array.isArray(yAxis) ? yAxis : [yAxis])].filter(Boolean);
            else if (chartType === 'histogram') tags = histTag ? [histTag] : [];
            else if (chartType === 'bar') tags = barTags;
            let body = { username, workspace_name, chart_type: chartType, tags, start: fmtIso(start), end: fmtIso(end), formula_operations: null, custom_tag_name: null };
            if (chartType === 'scatter') { body.x_axis = xAxis; body.y_axis = yAxis ? [yAxis] : []; }
            else if (chartType === 'histogram') { body.tag = histTag; body.bins = histBins; }
            else if (chartType === 'bar') { body.operation = barOp; body.tags = barTags; }
            const validAnalysisId = data.analysisId && !isNaN(Number(data.analysisId)) ? Number(data.analysisId) : undefined;
            let result;
            if (validAnalysisId) {
                result = await updateWorkspaceAnalysis(plantCode, { ...body, analysis_type: 'multi_chart_visualization', analysis_id: validAnalysisId });
            } else {
                result = await getMultiChartVisualization(plantCode, body);
                    const newId = result?.analysisId ?? result?.analysis_id ?? result?.data?.analysisId ?? result?.data?.analysis_id;
                    if (newId) setNodes(nds => nds.map(n => n.id === id ? { ...n, data: { ...n.data, analysisId: newId, analysisType: 'multi_chart_visualization' } } : n));
            }
            if (result?.data) {
                setChartData(result.data);
                setNodes(nds => nds.map(n => n.id === id ? { ...n, data: { ...n.data, savedChartData: result.data, chartType, xAxis, yAxis, histTag, histBins, barTags, barOp } } : n));
                setShowSettings(false);
            }
        } catch (err) { }
        finally { setLoading(false); }
    };

    const removeNode = async (e) => {
        e.stopPropagation();
        if (data.analysisId && plantCode) {
            try { await deleteWorkspaceAnalysis(plantCode, { username: getUsername(), workspace_name: getWorkspaceName(), analysis_type: 'multi_chart_visualization', analysis_id: data.analysisId }); } catch {}
        }
        setNodes(nds => nds.filter(n => n.id !== id));
    };

    let hcOptions = null;
    if (chartData && Highcharts) {
        hcOptions = { credits: { enabled: false }, title: { text: '' }, chart: { backgroundColor: 'transparent' } };
        if (chartData.chart_type === 'scatter') {
            hcOptions.chart.type = 'scatter';
            hcOptions.xAxis = { title: { text: chartData.x_axis } };
            hcOptions.yAxis = { title: { text: chartData.series?.[0]?.tag || '' } };
            hcOptions.series = (chartData.series || []).map(s => ({ name: s.tag, data: s.points.map(p => [p.x, p.y]) }));
        } else if (chartData.chart_type === 'histogram') {
            hcOptions.chart.type = 'column';
            hcOptions.xAxis = { title: { text: chartData.tag }, categories: (chartData.bins || []).map(b => `${b.start?.toFixed(2)}-${b.end?.toFixed(2)}`) };
            hcOptions.yAxis = { title: { text: 'Count' } };
            hcOptions.series = [{ name: chartData.tag, data: (chartData.bins || []).map(b => b.count) }];
        } else if (chartData.chart_type === 'bar') {
            hcOptions.chart.type = 'column';
            hcOptions.xAxis = { categories: (chartData.data || []).map(d => d.tag?.split('.').pop() || d.tag) };
            hcOptions.yAxis = { title: { text: chartData.operation } };
            hcOptions.series = [{ name: chartData.operation, data: (chartData.data || []).map(d => d.value), colorByPoint: true }];
        }
    }

    return (
        <div className={`bg-surface border-2 rounded-[2.5rem] shadow-xl min-w-[450px] overflow-hidden transition-all duration-300 ${selected ? 'border-highlight ring-4 ring-highlight/20' : 'border-highlight/40'}`}>
            <div className="bg-gradient-to-r from-highlight to-highlight/80 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center"><BarChart3 className="w-5 h-5 text-white" /></div>
                    <div>
                        <span className="text-white font-black text-[9px] uppercase tracking-[0.2em] block opacity-80">Multi Chart</span>
                        <span className="text-white font-black text-[18px] mt-0.5 block">Visualization</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setShowSettings(v => !v)} className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all"><Settings className="w-4 h-4" /></button>
                    <button onClick={removeNode} className="p-2 bg-white/10 hover:bg-danger text-white rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
                </div>
            </div>

            <div className="p-6">
                {showSettings ? (
                    <div className="space-y-5">
                        {/* Chart type selector */}
                        <div>
                            <label className="text-[11px] font-black text-text-muted uppercase tracking-wider block mb-2">Chart Type</label>
                            <div className="flex gap-2">
                                {CHART_TYPES.map(t => (
                                    <button key={t} onClick={() => setChartType(t)} className={`px-4 py-2 rounded-xl text-[12px] font-black border transition-all capitalize ${chartType === t ? 'bg-highlight text-white border-highlight' : 'bg-surface text-text-secondary border-border hover:border-highlight/40'}`}>{t}</button>
                                ))}
                            </div>
                        </div>

                        {fetchingTags ? (
                            <div className="flex items-center gap-2 text-text-subtle"><Loader2 className="w-4 h-4 animate-spin" /><span className="text-[12px]">Loading tags...</span></div>
                        ) : (
                            <>
                                {chartType === 'scatter' && (
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-[11px] font-black text-text-muted uppercase tracking-wider block mb-1">X Axis Tag</label>
                                            <Select
                                                value={xAxis}
                                                onChange={setXAxis}
                                                placeholder="Select tag..."
                                                options={allTags.map((t) => ({ value: t, label: t }))}
                                                searchable
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[11px] font-black text-text-muted uppercase tracking-wider block mb-1">Y Axis Tag</label>
                                            <Select
                                                value={yAxis}
                                                onChange={setYAxis}
                                                placeholder="Select tag..."
                                                options={allTags.map((t) => ({ value: t, label: t }))}
                                                searchable
                                            />
                                        </div>
                                    </div>
                                )}
                                {chartType === 'histogram' && (
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-[11px] font-black text-text-muted uppercase tracking-wider block mb-1">Tag</label>
                                            <Select
                                                value={histTag}
                                                onChange={setHistTag}
                                                placeholder="Select tag..."
                                                options={allTags.map((t) => ({ value: t, label: t }))}
                                                searchable
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[11px] font-black text-text-muted uppercase tracking-wider block mb-1">Bin Count</label>
                                            <input type="number" min={5} max={200} value={histBins} onChange={e => setHistBins(Number(e.target.value))} className="w-full px-3 py-2 border border-border rounded-xl text-[13px] focus:outline-none focus:border-highlight" />
                                        </div>
                                    </div>
                                )}
                                {chartType === 'bar' && (
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-[11px] font-black text-text-muted uppercase tracking-wider block mb-1">Tags (select multiple)</label>
                                            <div className="border border-border rounded-xl p-2 max-h-[140px] overflow-y-auto flex flex-wrap gap-2">
                                                {allTags.map(t => (
                                                    <button key={t} type="button" onClick={() => setBarTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])} className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${barTags.includes(t) ? 'bg-highlight text-white border-highlight' : 'bg-surface text-text-secondary border-border hover:border-highlight/40'}`}>{t.split('.').pop() || t}</button>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[11px] font-black text-text-muted uppercase tracking-wider block mb-1">Aggregation</label>
                                            <Select
                                                value={barOp}
                                                onChange={setBarOp}
                                                options={BAR_OPS.map((op) => ({ value: op, label: op.toUpperCase() }))}
                                            />
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        <button onClick={fetchChart} disabled={loading} className="w-full py-3 bg-highlight hover:bg-highlight-hover disabled:opacity-50 text-white font-black text-[13px] rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2">
                            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : 'Generate Chart'}
                        </button>
                    </div>
                ) : (
                    <div>
                        {loading ? (
                            <div className="h-[300px] flex flex-col items-center justify-center gap-3">
                                <Loader2 className="w-8 h-8 text-highlight animate-spin" />
                                <span className="text-[11px] font-black text-text-subtle uppercase tracking-widest">Generating Chart...</span>
                            </div>
                        ) : hcOptions && Highcharts ? (
                            <div className="h-[350px]">
                                <HighchartsReact highcharts={Highcharts} options={{ ...hcOptions, chart: { ...hcOptions.chart, height: 330 } }} />
                            </div>
                        ) : (
                            <div className="h-[200px] flex flex-col items-center justify-center gap-3 text-text-subtle">
                                <BarChart3 className="w-10 h-10 text-text-subtle" />
                                <span className="text-[12px] font-bold">No chart data yet.</span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <Handle type="target" position={Position.Left} className="!opacity-0" />
            <Handle type="source" position={Position.Right} className="!opacity-0" />
        </div>
    );
}
