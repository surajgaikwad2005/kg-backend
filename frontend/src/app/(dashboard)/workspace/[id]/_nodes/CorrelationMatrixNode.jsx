'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Handle, Position, useReactFlow } from '@xyflow/react';
import { Network, Trash2, Pencil, Loader2, RefreshCw, AlertTriangle } from 'lucide-react';
import { updateWorkspaceAnalysis, deleteWorkspaceAnalysis, getCorrelationAnalysis } from '@/src/services/workspace/workspaceService';
import { getUsername, getWorkspaceName, getTimeRange, fmtDate } from './nodeUtils';
import { useApp } from '@/src/context/AppContext';

const getColorForVal = (val) => {
    if (val === 1) return 'bg-success/10 text-success font-bold';
    const abs = Math.abs(val);
    if (val > 0) {
        if (abs > 0.8) return 'bg-success text-white';
        if (abs > 0.5) return 'bg-success/60 text-text-primary';
        if (abs > 0.2) return 'bg-success/20 text-text-primary';
        return 'bg-success/10 text-text-muted';
    } else {
        if (abs > 0.8) return 'bg-danger text-white';
        if (abs > 0.5) return 'bg-danger/60 text-text-primary';
        if (abs > 0.2) return 'bg-danger/20 text-text-primary';
        return 'bg-danger/10 text-text-muted';
    }
};

export function CorrelationMatrixNode({ id, data, selected }) {
    const { setNodes } = useReactFlow();
    const { plantCode } = useApp();

    const [heatmap, setHeatmap] = useState(() => {
        const h = data?.apiData?.heatmap || (data?.apiData?.x && (data?.apiData?.values || data?.apiData?.z) ? data.apiData : null);
        if (h) return h;
        const sh = data?.savedHeatmap?.heatmap || (data?.savedHeatmap?.x && (data?.savedHeatmap?.values || data?.savedHeatmap?.z) ? data.savedHeatmap : null);
        return sh || data?.savedHeatmap || null;
    });
    const [loading, setLoading] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Only use tags explicitly configured by the user — no canvas signal fallback
    const activeTags = data.savedTags || [];

    const lastFetchedKey = useRef(data.savedHeatmap ? `${activeTags.slice().sort().join(',')}-${typeof window !== 'undefined' ? localStorage.getItem('timeRange') : ''}-0` : null);

    // Fetch heatmap when tags or time range change
    useEffect(() => {
        if (activeTags.length < 2) {
            setHeatmap(null);
            return;
        }
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
                const validAnalysisId = data.analysisId && !isNaN(Number(data.analysisId)) ? Number(data.analysisId) : undefined;

                let result;
                let newId;
                if (validAnalysisId) {
                    result = await updateWorkspaceAnalysis(plantCode, { username, workspace_name, analysis_type: 'correlation', analysis_id: validAnalysisId, tags: activeTags, start: fmtDate(start), end: fmtDate(end) });
                } else {
                    result = await getCorrelationAnalysis(plantCode, { username, workspace_name, tags: activeTags, start: fmtDate(start), end: fmtDate(end) });
                    newId = result?.analysisId ?? result?.analysis_id ?? result?.data?.analysisId ?? result?.data?.analysis_id;
                }

                const heatmapObj = result?.data?.heatmap || (result?.data?.x && result?.data?.values ? result.data : null);
                if (!cancelled && (result?.status_code === 200 || result?.statusCode === 200 || result?.success) && heatmapObj) {
                    setHeatmap(heatmapObj);
                    setNodes(nds => nds.map(n => {
                        if (n.id !== id) return n;
                        const updatedData = {
                            ...n.data,
                            savedHeatmap: heatmapObj,
                            savedTags: activeTags
                        };
                        if (newId) {
                            updatedData.analysisId = newId;
                            updatedData.analysisType = 'correlation';
                        }
                        return { ...n, data: updatedData };
                    }));
                }
            } catch (err) {
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        run();
        return () => { cancelled = true; };
    }, [activeTags.join(','), refreshTrigger, plantCode]);

    // Auto-refresh on global time range change
    useEffect(() => {
        const handler = () => setRefreshTrigger(v => v + 1);
        window.addEventListener('timeRangeChanged', handler);
        return () => window.removeEventListener('timeRangeChanged', handler);
    }, []);

    const removeNode = async (e) => {
        e.stopPropagation();
        if (data.analysisId && plantCode) {
            try {
                await deleteWorkspaceAnalysis(plantCode, { username: getUsername(), workspace_name: getWorkspaceName(), analysis_type: 'correlation', analysis_id: data.analysisId });
            } catch {}
        }
        setNodes(nds => nds.filter(n => n.id !== id));
    };

    const triggerDrawerOpen = (e) => {
        if (e) e.stopPropagation();
        const event = new CustomEvent('open-tag-drawer', { detail: { nodeId: id } });
        window.dispatchEvent(event);
    };

    const apiLabels = heatmap?.x || [];
    const apiValues = heatmap?.values || heatmap?.z || [];
    const hasApiData = apiLabels.length >= 2 && apiValues.length >= 2;
    const displayLabels = hasApiData ? apiLabels : [];

    const isUnconfigured = activeTags.length === 0;

    // ── Empty / unconfigured state ──────────────────────────────────────────
    if (isUnconfigured) {
        return (
            <div className="bg-surface border-2 border-dashed border-highlight/30 rounded-3xl p-10 min-w-[380px] text-center shadow-xl relative">
                <div className="absolute right-4 top-4 flex gap-1">
                    <button onClick={triggerDrawerOpen} className="p-2 text-text-subtle hover:text-highlight rounded-xl transition-all cursor-pointer"><Pencil className="w-4 h-4" /></button>
                    <button onClick={removeNode} className="p-2 text-text-subtle hover:text-danger rounded-xl transition-all cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                </div>
                <div className="w-16 h-16 bg-highlight/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-highlight/20">
                    <Network className="w-8 h-8 text-highlight" />
                </div>
                <div className="text-[15px] font-black text-text-primary mb-2">Correlation Matrix</div>
                <div className="text-[12px] font-bold text-text-muted leading-relaxed px-4">Select at least <span className="text-highlight">2 tags</span> to compute their statistical relationship.</div>
                <button onClick={triggerDrawerOpen} className="mt-4 px-4 py-2 bg-highlight hover:bg-highlight-hover text-white font-black text-[12px] rounded-xl transition-all cursor-pointer">Configure Tags</button>
            </div>
        );
    }

    return (
        <div className={`bg-surface border-2 rounded-[3rem] shadow-[0_40px_100px_rgba(124,58,237,0.15)] min-w-[500px] overflow-hidden transition-all duration-300 ${selected ? 'border-highlight ring-4 ring-highlight/20' : 'border-highlight/40'}`}>
            {/* Header */}
            <div className="bg-gradient-to-r from-highlight to-highlight/80 px-8 py-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20">
                        <Network className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <span className="text-white font-black text-[10px] uppercase tracking-[0.2em] block opacity-80">Statistical Engine</span>
                        <span className="text-white font-black text-[22px] mt-1 block tracking-tight">Correlation Matrix</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {loading && <span className="text-[10px] font-black text-white bg-overlay px-3 py-1 rounded-full animate-pulse uppercase">Computing…</span>}
                    <button onClick={() => setRefreshTrigger(v => v + 1)} className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/10 cursor-pointer transition-all">
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <button onClick={triggerDrawerOpen} className={`p-2.5 rounded-xl border cursor-pointer transition-all bg-white/10 text-white border-white/10 hover:bg-white/20`}>
                        <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={removeNode} className="p-2.5 bg-white/10 hover:bg-danger text-white rounded-xl border border-white/10 cursor-pointer transition-all">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Body */}
            <div className="p-8">
                {loading && !heatmap ? (
                    <div className="h-[200px] flex flex-col items-center justify-center bg-surface rounded-3xl border border-border gap-3 shadow-sm">
                        <Loader2 className="w-6 h-6 text-highlight animate-spin" />
                        <span className="text-[11px] font-black text-text-subtle uppercase tracking-widest">Correlating Tags…</span>
                    </div>
                ) : hasApiData ? (
                    <div>
                        <table className="w-full text-center border-collapse">
                            <thead>
                                <tr>
                                    <th className="p-2 border-b border-border" />
                                    {displayLabels.map(l => (
                                        <th key={l} className="p-2 text-[10px] font-black text-text-subtle uppercase tracking-wider max-w-28 truncate">{l.split('.').pop() || l}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {displayLabels.map((rowLabel, rIdx) => (
                                    <tr key={rowLabel} className="hover:bg-surface-2/40">
                                        <td className="p-2 text-right text-[10px] font-black text-text-subtle uppercase tracking-wider max-w-28 truncate">{rowLabel.split('.').pop() || rowLabel}</td>
                                        {displayLabels.map((colLabel, cIdx) => {
                                            const val = apiValues[rIdx]?.[cIdx] ?? 0;
                                            return (
                                                <td key={colLabel} className="p-1">
                                                    <div className={`w-12 h-12 mx-auto rounded-xl flex items-center justify-center text-[12px] transition-all shadow-inner border border-border ${getColorForVal(val)}`}>
                                                        {val.toFixed(2)}
                                                    </div>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Legend */}
                        <div className="mt-4 flex items-center gap-3 justify-end">
                            <span className="text-[9px] font-bold text-text-subtle uppercase tracking-widest">Correlation:</span>
                            {[
                                { bg: 'bg-danger', label: '−1.0' },
                                { bg: 'bg-danger/40', label: '−0.5' },
                                { bg: 'bg-surface-2 border border-border', label: '0' },
                                { bg: 'bg-success/40', label: '+0.5' },
                                { bg: 'bg-success', label: '+1.0' },
                            ].map(({ bg, label }) => (
                                <div key={label} className="flex items-center gap-1">
                                    <div className={`w-4 h-4 rounded ${bg}`} />
                                    <span className="text-[9px] font-bold text-text-subtle">{label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-10 gap-3 text-text-subtle opacity-60">
                        <Network className="w-10 h-10 text-text-subtle" />
                        <span className="text-[12px] font-bold">Select tags in the drawer to correlate.</span>
                    </div>
                )}
            </div>

            <Handle type="target" position={Position.Left} className="opacity-0!" />
            <Handle type="source" position={Position.Right} className="opacity-0!" />
        </div>
    );
}
CorrelationMatrixNode.displayName = 'CorrelationMatrixNode';
