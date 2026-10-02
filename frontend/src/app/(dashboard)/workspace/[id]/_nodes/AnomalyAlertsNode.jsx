'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Handle, Position, useReactFlow } from '@xyflow/react';
import { BellRing, Shield, Trash2, Pencil, Loader2, RefreshCw, AlertTriangle, X } from 'lucide-react';
import { updateWorkspaceAnalysis, deleteWorkspaceAnalysis, getEventDetection } from '@/src/services/workspace/workspaceService';
import { normalizeEvents, severityClass } from './anomalyHelpers';
import { getUsername, getWorkspaceName, getTimeRange, fmtDate } from './nodeUtils';
import { useApp } from '@/src/context/AppContext';

export function AnomalyAlertsNode({ id, data, selected }) {
    const { setNodes } = useReactFlow();
    const { plantCode } = useApp();
    const [eventsData, setEventsData] = useState(() => data?.savedEvents || normalizeEvents(data?.apiData));
    const [loading, setLoading] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const activeTags = data.savedTags || [];
    const lastFetchedKey = useRef(eventsData?.length ? `${activeTags.slice().sort().join(',')}-${typeof window !== 'undefined' ? localStorage.getItem('timeRange') : ''}-0` : null);

    useEffect(() => {
        if (activeTags.length === 0) { setEventsData([]); return; }
        if (!plantCode) return;
        const currentKey = `${activeTags.slice().sort().join(',')}-${typeof window !== 'undefined' ? localStorage.getItem('timeRange') : ''}-${refreshTrigger}`;
        if (lastFetchedKey.current === currentKey) return;
        lastFetchedKey.current = currentKey;
        let cancelled = false;
        const run = async () => {
            setLoading(true);
            try {
                const { start, end } = getTimeRange();
                const username = getUsername(), workspace_name = getWorkspaceName();
                const validId = data.analysisId && !isNaN(Number(data.analysisId)) ? Number(data.analysisId) : undefined;
                let res;
                if (validId) {
                    res = await updateWorkspaceAnalysis(plantCode, { username, workspace_name, analysis_type: 'event_detection', analysis_id: validId, tags: activeTags, start: fmtDate(start), end: fmtDate(end) });
                } else {
                    res = await getEventDetection(plantCode, { username, workspace_name, tags: activeTags, start: fmtDate(start), end: fmtDate(end) });
                    const newId = res?.analysisId ?? res?.analysis_id ?? res?.data?.analysisId ?? res?.data?.analysis_id;
                    if (newId) setNodes(nds => nds.map(n => n.id === id ? { ...n, data: { ...n.data, analysisId: newId, analysisType: 'event_detection' } } : n));
                }
                if (!cancelled && (res?.status_code === 200 || res?.statusCode === 200 || res?.success) && res.data) {
                    const evs = normalizeEvents(res.data);
                    setEventsData(evs);
                    setNodes(nds => nds.map(n => n.id === id ? { ...n, data: { ...n.data, savedEvents: evs, savedTags: activeTags } } : n));
                }
            } catch (err) { }
            finally { if (!cancelled) setLoading(false); }
        };
        run();
        return () => { cancelled = true; };
    }, [activeTags.join(','), refreshTrigger, plantCode]);

    useEffect(() => {
        const handler = () => setRefreshTrigger(v => v + 1);
        window.addEventListener('timeRangeChanged', handler);
        return () => window.removeEventListener('timeRangeChanged', handler);
    }, []);

    const removeNode = async (e) => {
        e.stopPropagation();
        if (data.analysisId && plantCode) {
            try { await deleteWorkspaceAnalysis(plantCode, { username: getUsername(), workspace_name: getWorkspaceName(), analysis_type: 'event_detection', analysis_id: data.analysisId }); } catch {}
        }
        setNodes(nds => nds.filter(n => n.id !== id));
    };
    const toggleTag = (tag) => {
        setNodes(nds => nds.map(n => {
            if (n.id !== id) return n;
            const cur = n.data.savedTags || [];
            return { ...n, data: { ...n.data, savedTags: cur.includes(tag) ? cur.filter(t => t !== tag) : [...cur, tag] } };
        }));
    };
    const triggerDrawerOpen = (e) => {
        if (e) e.stopPropagation();
        const event = new CustomEvent('open-tag-drawer', { detail: { nodeId: id } });
        window.dispatchEvent(event);
    };

    // Only show API events — no local breach fallback
    const displayEvents = eventsData || [];
    const criticalCount = displayEvents.filter(e => (e.severity || '').toLowerCase() === 'critical').length;
    const highCount = displayEvents.filter(e => (e.severity || '').toLowerCase() === 'high').length;
    const hasEvents = displayEvents.length > 0;
    const isUnconfigured = activeTags.length === 0;

    if (isUnconfigured) {
        return (
            <div className="bg-surface border-2 border-dashed border-warning/30 rounded-3xl p-10 min-w-90 text-center shadow-xl relative">
                <div className="absolute right-4 top-4 flex gap-1">
                    <button onClick={triggerDrawerOpen} className="p-2 text-text-subtle hover:text-warning rounded-xl transition-all cursor-pointer"><Pencil className="w-4 h-4" /></button>
                    <button onClick={removeNode} className="p-2 text-text-subtle hover:text-danger rounded-xl transition-all cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                </div>
                <div className="w-16 h-16 bg-warning/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-warning/20"><BellRing className="w-8 h-8 text-warning" /></div>
                <div className="text-[15px] font-black text-text-primary mb-2">Event Detection Engine</div>
                <div className="text-[12px] font-bold text-text-muted leading-relaxed px-4">Configure tags to begin anomaly and breach detection.</div>
                <button onClick={triggerDrawerOpen} className="mt-4 px-4 py-2 bg-warning hover:bg-warning/90 text-white font-black text-[12px] rounded-xl transition-all cursor-pointer">Configure Tags</button>
            </div>
        );
    }

    return (
        <div className={`bg-surface border-2 rounded-[2.5rem] shadow-[0_25px_70px_rgba(245,158,11,0.2)] min-w-105 overflow-hidden transition-all duration-300 ${selected ? 'border-warning ring-4 ring-warning/20' : 'border-warning/60'}`}>
            <div className="bg-gradient-to-r from-warning to-warning/80 px-7 py-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md"><BellRing className="w-5 h-5 text-white" /></div>
                    <div>
                        <span className="text-white font-black text-[10px] uppercase tracking-[0.2em] block opacity-80">Surveillance Hub</span>
                        <span className="text-white font-black text-[16px] mt-1 block tracking-tight">Multi-Tag Anomaly Monitor</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className={`px-4 py-1.5 rounded-xl border-2 font-black text-[11px] transition-all duration-500 ${hasEvents ? 'bg-danger text-white border-danger/50 animate-pulse' : 'bg-white/10 text-white border-white/20'}`}>
                        {hasEvents ? `🚨 ${displayEvents.length} Events` : '✓ Secure'}
                    </div>
                    {loading && <span className="text-[10px] font-black text-white bg-overlay px-2 py-1 rounded-full animate-pulse uppercase">Running…</span>}
                    <button onClick={() => setRefreshTrigger(v => v + 1)} className="p-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl transition-all cursor-pointer"><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /></button>
                    <button onClick={triggerDrawerOpen} className="p-2 rounded-xl border cursor-pointer transition-all bg-white/10 text-white border-white/20 hover:bg-white/20"><Pencil className="w-4 h-4" /></button>
                    <button onClick={removeNode} className="p-2 bg-white/10 hover:bg-danger text-white border border-white/20 rounded-xl transition-all cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                </div>
            </div>

            <div className="p-6 space-y-5 max-h-130 overflow-y-auto bg-canvas/30">
                {loading && !hasEvents ? (
                    <div className="h-64 flex flex-col items-center justify-center bg-surface rounded-3xl border border-border gap-3 shadow-sm">
                        <Loader2 className="w-8 h-8 text-warning animate-spin" />
                        <span className="text-[11px] font-black text-text-subtle uppercase tracking-widest">Scanning for Events…</span>
                    </div>
                ) : hasEvents ? (
                    <>
                        <div className="grid grid-cols-3 gap-3">
                            {[{ label: 'Total Events', value: displayEvents.length, cls: 'text-text-primary' }, { label: 'Critical', value: criticalCount, cls: 'text-danger' }, { label: 'High', value: highCount, cls: 'text-warning' }].map(({ label, value, cls }) => (
                                <div key={label} className="bg-surface border border-border rounded-2xl p-4 flex flex-col items-center shadow-sm">
                                    <span className="text-[9px] font-black text-text-subtle uppercase tracking-widest">{label}</span>
                                    <span className={`text-[24px] font-black mt-1.5 ${cls}`}>{value}</span>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-2">
                            <div className="text-[10px] font-black text-text-subtle uppercase tracking-widest pl-1">Risk Summary by Signal</div>
                            {Object.entries(displayEvents.reduce((acc, ev) => {
                                const tag = ev.tag || 'Unknown';
                                if (!acc[tag]) acc[tag] = { count: 0, latest: ev };
                                acc[tag].count++;
                                return acc;
                            }, {})).map(([tag, { count, latest }]) => {
                                const { bar } = severityClass(latest.severity);
                                return (
                                    <div key={tag} className="flex items-center justify-between bg-surface p-3 rounded-2xl border border-border shadow-sm relative group/row">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-1.5 h-8 ${bar} rounded-full`} />
                                            <div>
                                                <div className="text-[12px] font-black text-text-primary truncate max-w-48 flex items-center gap-1.5">
                                                    {tag.split('.').pop() || tag}
                                                    <button onClick={(e) => { e.stopPropagation(); toggleTag(tag); }} title="Remove Tag" className="opacity-0 group-hover/row:opacity-100 p-0.5 text-text-subtle hover:text-danger rounded transition-all cursor-pointer"><X className="w-3 h-3" /></button>
                                                </div>
                                                <div className="text-[9px] text-text-subtle font-bold uppercase">{count} event{count !== 1 ? 's' : ''} detected</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[11px] font-black text-text-secondary">{latest.value != null ? Number(latest.value).toFixed(2) : '—'}</div>
                                            <div className="text-[8px] text-text-subtle font-bold uppercase">Latest Value</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="space-y-2">
                            <div className="text-[10px] font-black text-text-subtle uppercase tracking-widest pl-1">Event Log</div>
                            <div className="border border-border rounded-3xl overflow-hidden shadow-sm max-h-72 overflow-y-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-surface-2 border-b border-border">
                                            {['Tag', 'Event Type', 'Start Time', 'Duration', 'Severity'].map(h => <th key={h} className="p-3 text-[9px] font-black text-text-subtle uppercase tracking-wider">{h}</th>)}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {displayEvents.slice(0, 30).map((ev, idx) => {
                                            const { badge } = severityClass(ev.severity);
                                            return (
                                                <tr key={idx} className="hover:bg-surface-2/50 transition-colors">
                                                    <td className="p-3 text-[11px] font-extrabold text-text-primary max-w-32 truncate">{(ev.tag || 'Unknown').split('.').pop()}</td>
                                                    <td className="p-3 text-[10px] font-bold text-text-muted"><span className="bg-surface-2 px-2 py-0.5 rounded text-text-secondary">{ev.event_type || ev.message || 'Anomaly'}</span></td>
                                                    <td className="p-3 text-[10px] text-text-subtle">{ev.start_time || ev.start || '—'}</td>
                                                    <td className="p-3 text-[11px] font-bold text-text-secondary text-center">{ev.duration_minutes != null ? `${Number(ev.duration_minutes).toFixed(0)} min` : '—'}</td>
                                                    <td className="p-3"><span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase border ${badge}`}>{ev.severity || 'Low'}</span></td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 gap-4">
                        <div className="w-20 h-20 bg-success/10 rounded-[2rem] flex items-center justify-center border-2 border-success/20 shadow-inner"><Shield className="w-10 h-10 text-success" /></div>
                        <div className="text-center px-8">
                            <span className="text-[14px] font-black text-text-primary block">All Clear</span>
                            <span className="text-[11px] font-bold text-text-muted mt-1 block italic leading-relaxed">No anomalies detected in the selected time range.</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-surface px-7 py-4 border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${hasEvents ? 'bg-danger animate-ping' : 'bg-success shadow-[0_0_8px_rgba(16,185,129,0.5)]'}`} />
                    <span className="text-[10px] text-text-subtle font-black uppercase tracking-widest">{hasEvents ? 'Anomalies Detected' : 'Workspace Guard Active'}</span>
                </div>
                <span className="text-[10px] text-text-subtle font-bold">{activeTags.length} signal{activeTags.length !== 1 ? 's' : ''} monitored</span>
            </div>
            <Handle type="target" position={Position.Left} className="opacity-0!" />
            <Handle type="source" position={Position.Right} className="opacity-0!" />
        </div>
    );
}
AnomalyAlertsNode.displayName = 'AnomalyAlertsNode';
