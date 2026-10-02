'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Handle, Position, useReactFlow } from '@xyflow/react';
import { Gauge, Trash2, Pencil, Loader2, RefreshCw, AlertTriangle, Activity, Bell, CheckCircle2, Zap, X } from 'lucide-react';
import { updateWorkspaceAnalysis, deleteWorkspaceAnalysis, getKpiMonitoring } from '@/src/services/workspace/workspaceService';
import { getUsername, getWorkspaceName, getTimeRange, fmtDate } from './nodeUtils';
import { useApp } from '@/src/context/AppContext';

export function KpiMonitoringNode({ id, data, selected }) {
    const { setNodes } = useReactFlow();
    const { plantCode } = useApp();
    const [kpiData, setKpiData] = useState(() => {
        if (Array.isArray(data?.apiData)) return data.apiData;
        if (data?.apiData?.kpis) return data.apiData.kpis;
        return data?.savedKpis || null;
    });
    const [loading, setLoading] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const activeTags = data.savedTags || [];
    const lastFetchedKey = useRef(data.savedKpis ? `${activeTags.slice().sort().join(',')}-${typeof window !== 'undefined' ? localStorage.getItem('timeRange') : ''}-0` : null);

    useEffect(() => {
        if (activeTags.length === 0) {
            setKpiData(null);
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
                if (validAnalysisId) {
                    result = await updateWorkspaceAnalysis(plantCode, { username, workspace_name, analysis_type: data.analysisType || 'kpi_monitoring', analysis_id: validAnalysisId, tags: activeTags, start: fmtDate(start), end: fmtDate(end) });
                } else {
                    result = await getKpiMonitoring(plantCode, { username, workspace_name, tags: activeTags, start: fmtDate(start), end: fmtDate(end) });
                    const newId = result?.analysisId ?? result?.analysis_id ?? result?.data?.analysisId ?? result?.data?.analysis_id;
                    if (newId) setNodes(nds => nds.map(n => n.id === id ? { ...n, data: { ...n.data, analysisId: newId, analysisType: 'kpi_monitoring' } } : n));
                }
                const kpis = result.data?.kpis || (Array.isArray(result.data) ? result.data : null);
                if (!cancelled && (result.status_code === 200 || result.statusCode === 200 || result.success) && kpis) {
                    setKpiData(kpis);
                    setNodes(nds => nds.map(n => n.id === id ? { ...n, data: { ...n.data, savedKpis: kpis, savedTags: activeTags } } : n));
                }
            } catch (err) { }
            finally { if (!cancelled) setLoading(false); }
        };
        run();
        return () => { cancelled = true; };
    }, [activeTags.join(','), refreshTrigger, plantCode]);

    const removeNode = async (e) => {
        e.stopPropagation();
        if (data.analysisId && plantCode) {
            try { await deleteWorkspaceAnalysis(plantCode, { username: getUsername(), workspace_name: getWorkspaceName(), analysis_type: data.analysisType || 'kpi_monitoring', analysis_id: data.analysisId }); } catch {}
        }
        setNodes(nds => nds.filter(n => n.id !== id));
    };

    const toggleTag = (tag) => {
        setNodes(nds => nds.map(n => {
            if (n.id !== id) return n;
            const cur = n.data.savedTags || [];
            const newTags = cur.includes(tag) ? cur.filter(t => t !== tag) : [...cur, tag];
            return { ...n, data: { ...n.data, savedTags: newTags, savedKpis: newTags.length === 0 ? null : n.data.savedKpis } };
        }));
    };

    const triggerDrawerOpen = (e) => {
        if (e) e.stopPropagation();
        const event = new CustomEvent('open-tag-drawer', { detail: { nodeId: id } });
        window.dispatchEvent(event);
    };

    const isUnconfigured = activeTags.length === 0;

    if (isUnconfigured) {
        return (
            <div className="bg-surface border-2 border-dashed border-brand/30 rounded-3xl p-10 min-w-[360px] text-center shadow-xl relative">
                <div className="absolute right-4 top-4 flex gap-1">
                    <button onClick={triggerDrawerOpen} className="p-2 text-text-subtle hover:text-brand rounded-xl transition-all"><Pencil className="w-4 h-4" /></button>
                    <button onClick={removeNode} className="p-2 text-text-subtle hover:text-danger rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
                </div>
                <div className="w-16 h-16 bg-brand-muted rounded-2xl flex items-center justify-center mx-auto mb-4 border border-brand/20 animate-pulse">
                    <Gauge className="w-8 h-8 text-brand" />
                </div>
                <div className="text-[15px] font-black text-text-primary mb-2">Ready for KPI Monitoring</div>
                <div className="text-[12px] font-bold text-text-muted leading-relaxed px-4">Configure tags to start real-time process monitoring.</div>
                <button onClick={triggerDrawerOpen} className="mt-4 px-4 py-2 bg-brand hover:bg-brand-hover text-white font-black text-[12px] rounded-xl shadow-md hover:shadow-lg active:scale-95">Configure Tags</button>
            </div>
        );
    }

    return (
        <div className={`bg-surface border-2 rounded-[3rem] shadow-xl min-w-[550px] overflow-hidden transition-all duration-300 ${selected ? 'border-brand ring-4 ring-brand/20' : 'border-brand/40'}`}>
            <div className="bg-gradient-to-r from-brand to-brand/80 px-8 py-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
                        <Gauge className="w-6 h-6 text-white animate-pulse" />
                    </div>
                    <div>
                        <h2 className="text-white font-black text-[16px] tracking-wide">KPI Monitoring Dashboard</h2>
                        <span className="text-[9px] font-black uppercase tracking-widest text-white/80 bg-white/10 px-2 py-0.5 rounded-md border border-white/20 mt-1 inline-block">Active Analysis</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setRefreshTrigger(v => v + 1)} className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/10">
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <button onClick={triggerDrawerOpen} className={`p-2.5 rounded-xl border bg-white/10 text-white border-white/10 hover:bg-white/20`}>
                        <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={removeNode} className="p-2.5 bg-white/10 hover:bg-danger text-white rounded-xl border border-white/10"><Trash2 className="w-4 h-4" /></button>
                </div>
            </div>

            <div className="p-8 bg-canvas/50">
                <div>
                    {loading && !kpiData ? (
                        <div className="h-[250px] flex flex-col items-center justify-center bg-surface rounded-3xl border border-border gap-3 shadow-sm">
                            <Loader2 className="w-8 h-8 text-brand animate-spin" />
                            <span className="text-[11px] font-black text-text-subtle uppercase tracking-widest">Running KPI Monitoring Analysis...</span>
                        </div>
                    ) : !kpiData ? (
                        <div className="h-[250px] flex flex-col items-center justify-center bg-surface rounded-3xl border border-border gap-4 shadow-sm text-center px-8">
                            <AlertTriangle className="w-10 h-10 text-warning" />
                            <div>
                                <h4 className="text-[14px] font-black text-text-primary">No KPI Data Available</h4>
                                <p className="text-[11px] font-bold text-text-muted mt-1">Configure tags to begin monitoring.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {(Array.isArray(kpiData) ? kpiData : [kpiData]).map((kpi, idx) => {
                                const tagName = kpi.tag || 'Unknown';
                                const stateClass = (kpi.operational_state?.classification || 'stable').toLowerCase();
                                const stateBadge = stateClass === 'unstable' ? 'from-danger to-danger/80 text-white' : stateClass === 'oscillatory' ? 'from-warning to-warning/80 text-white' : 'from-success to-success/80 text-white';
                                const healthClass = (kpi.process_health?.classification || 'good').toLowerCase();
                                const healthColor = healthClass === 'critical' ? 'text-danger bg-danger/10 border-danger/20' : healthClass === 'degrading' ? 'text-warning bg-warning/10 border-warning/20' : 'text-success bg-success/10 border-success/20';
                                const healthBar = healthClass === 'critical' ? 'bg-danger' : healthClass === 'degrading' ? 'bg-warning' : 'bg-success';
                                const alarmSev = (kpi.alarms?.severity || 'low').toLowerCase();
                                const alarmColor = alarmSev === 'high' ? 'bg-danger/10 text-danger border-danger/20' : alarmSev === 'medium' ? 'bg-warning/10 text-warning border-warning/20' : 'bg-info/10 text-info border-info/20';
                                return (
                                    <div key={idx} className="bg-surface rounded-3xl border border-border shadow-md p-6 hover:shadow-xl transition-all relative group/row">
                                        <div className="flex items-start justify-between gap-4 mb-5 pb-4 border-b border-border">
                                            <div className="flex items-center gap-2">
                                                <div>
                                                    <span className="text-[14px] font-black text-text-secondary block">{tagName.split('.').pop() || tagName}</span>
                                                    <span className="text-[10px] font-bold text-text-subtle uppercase tracking-widest mt-0.5 block">{tagName}</span>
                                                </div>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); toggleTag(tagName); }}
                                                    title="Remove Tag"
                                                    className="opacity-0 group-hover/row:opacity-100 p-1 text-text-subtle hover:text-danger rounded-md hover:bg-surface-2 transition-all cursor-pointer ml-1"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                            <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r ${stateBadge} shadow-md flex items-center gap-1.5`}>
                                                <Activity className="w-3.5 h-3.5" />{stateClass}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-surface-2 rounded-2xl border border-border p-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-[10px] font-black text-text-subtle uppercase tracking-widest">Process Health</span>
                                                    <span className={`px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase border ${healthColor}`}>{healthClass}</span>
                                                </div>
                                                <div className="text-[20px] font-black text-text-primary leading-none mb-2">{kpi.process_health?.score ?? 100}%</div>
                                                <div className="w-full bg-surface-2 rounded-full h-2 overflow-hidden"><div className={`h-full rounded-full transition-all ${healthBar}`} style={{ width: `${kpi.process_health?.score ?? 100}%` }} /></div>
                                            </div>
                                            <div className="bg-surface-2 rounded-2xl border border-border p-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-[10px] font-black text-text-subtle uppercase tracking-widest">Stability</span>
                                                    <span className="text-[9px] font-black text-text-subtle bg-surface-2 px-2 py-0.5 rounded uppercase">{kpi.stability?.classification || 'stable'}</span>
                                                </div>
                                                <div className="text-[20px] font-black text-text-primary leading-none mb-2">{kpi.stability?.score ?? 100}%</div>
                                                <div className="w-full bg-surface-2 rounded-full h-2 overflow-hidden"><div className="h-full bg-brand rounded-full transition-all" style={{ width: `${kpi.stability?.score ?? 100}%` }} /></div>
                                            </div>
                                            <div className="bg-surface-2 rounded-2xl border border-border p-4 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-danger/10 rounded-xl flex items-center justify-center border border-danger/20"><Bell className="w-5 h-5 text-danger" /></div>
                                                    <div><span className="text-[9px] font-black text-text-subtle uppercase tracking-widest block">Alarms</span><span className="text-[18px] font-black text-text-primary mt-1 block">{kpi.alarms?.frequency ?? 0}</span></div>
                                                </div>
                                                <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase border ${alarmColor}`}>{alarmSev} sev</span>
                                            </div>
                                            <div className="bg-surface-2 rounded-2xl border border-border p-4 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-brand-muted rounded-xl flex items-center justify-center border border-brand/20"><CheckCircle2 className="w-5 h-5 text-brand" /></div>
                                                    <div><span className="text-[9px] font-black text-text-subtle uppercase tracking-widest block">Availability</span><span className="text-[18px] font-black text-text-primary mt-1 block">{kpi.availability?.percentage ?? 100}%</span></div>
                                                </div>
                                                <span className="text-[9px] font-black text-brand bg-brand-muted border border-brand/20 px-2 py-1 rounded-lg uppercase">{kpi.availability?.classification || 'excellent'}</span>
                                            </div>
                                        </div>
                                        {kpi.oscillation && (
                                            <div className="mt-4 bg-surface-2 rounded-2xl border border-border p-3.5 flex items-center justify-between">
                                                <div className="flex items-center gap-2"><Zap className="w-4 h-4 text-warning" /><span className="text-[10px] font-black text-text-muted uppercase tracking-wider">Oscillation Index</span></div>
                                                <div className="flex items-center gap-2.5">
                                                    <span className="text-[12px] font-black text-text-secondary">{kpi.oscillation.index?.toFixed(2) ?? '0.00'}</span>
                                                    <div className="w-[80px] bg-surface-2 rounded-full h-1.5 overflow-hidden"><div className="h-full bg-warning rounded-full" style={{ width: `${Math.min((kpi.oscillation.index ?? 0) * 100, 100)}%` }} /></div>
                                                    <span className="text-[9px] font-black text-warning bg-warning/10 px-2 py-0.5 rounded uppercase">{kpi.oscillation.classification || 'none'}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
            <Handle type="target" position={Position.Left} className="!opacity-0" />
            <Handle type="source" position={Position.Right} className="!opacity-0" />
        </div>
    );
}
KpiMonitoringNode.displayName = 'KpiMonitoringNode';
