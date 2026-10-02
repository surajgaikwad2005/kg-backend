'use client';
import React, { useState, useEffect } from 'react';
import { Handle, Position, useReactFlow } from '@xyflow/react';
import { GitBranch, Trash2, Pencil, Shield, X } from 'lucide-react';
import { updateWorkspaceAnalysis, deleteWorkspaceAnalysis, getRcaAnalysis } from '@/src/services/workspace/workspaceService';
import { getUsername, getWorkspaceName, getTimeRange, fmtDate } from './nodeUtils';
import { useApp } from '@/src/context/AppContext';

function normalizeRca(raw) {
    if (!raw) return null;
    let events = [];
    if (Array.isArray(raw.events)) events = raw.events;
    else if (Array.isArray(raw)) events = raw;
    else if (Array.isArray(raw.data?.events)) events = raw.data.events;
    else return null;

    return {
        events,
        total_rca_events: events.length,
        summary: {
            critical_events: events.filter(e => (e.severity || '').toLowerCase() === 'critical').length,
            high_events: events.filter(e => (e.severity || '').toLowerCase() === 'high').length,
            medium_events: events.filter(e => ['medium', 'low'].includes((e.severity || '').toLowerCase())).length
        }
    };
}

export function RcaAnalysisNode({ id, data, selected }) {
    const { setNodes } = useReactFlow();
    const { plantCode } = useApp();

    const [rcaData, setRcaData] = useState(() => {
        if (data?.savedEvents) return normalizeRca(data.savedEvents);
        return normalizeRca(data?.apiData) || normalizeRca(data?.computedData) || null;
    });
    const [loading, setLoading] = useState(false);

    // Only use tags explicitly configured by the user — no canvas signal scanning
    const activeTags = data.savedTags || [];
    useEffect(() => {
        if (activeTags.length === 0) return;
        if (!plantCode) return;
        let cancelled = false;
        const run = async () => {
            setLoading(true);
            try {
                const { start, end } = getTimeRange();
                const username = getUsername();
                const workspace_name = getWorkspaceName();
                const tags = activeTags.map(t => t.includes('.') ? t.split('.').pop() : t).filter(Boolean);
                let result;
                if (data.analysisId) {
                    result = await updateWorkspaceAnalysis(plantCode, { username, workspace_name, analysis_type: data.analysisType || 'rca', analysis_id: data.analysisId, tags, start: fmtDate(start), end: fmtDate(end) });
                } else {
                    result = await getRcaAnalysis(plantCode, { username, workspace_name, tags, start: fmtDate(start), end: fmtDate(end) });
                    const newId = result?.analysisId ?? result?.analysis_id ?? result?.data?.analysisId ?? result?.data?.analysis_id;
                    if (newId) setNodes(nds => nds.map(n => n.id === id ? { ...n, data: { ...n.data, analysisId: newId, analysisType: 'rca' } } : n));
                }
                if (!cancelled && (result.status_code === 200 || result.statusCode === 200 || result.success) && result.data) {
                    const processed = normalizeRca(result.data);
                    setRcaData(processed);
                    setNodes(nds => nds.map(n => n.id === id ? { ...n, data: { ...n.data, savedEvents: processed?.events || [], savedTags: activeTags } } : n));
                }
            } catch (err) { }
            finally { if (!cancelled) setLoading(false); }
        };
        run();
        return () => { cancelled = true; };
    }, [activeTags.join(','), plantCode]);

    const removeNode = async (e) => {
        e.stopPropagation();
        if (data.analysisId && plantCode) {
            try { await deleteWorkspaceAnalysis(plantCode, { username: getUsername(), workspace_name: getWorkspaceName(), analysis_type: data.analysisType || 'rca', analysis_id: data.analysisId }); } catch {}
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

    const hasEvents = rcaData && Array.isArray(rcaData.events) && rcaData.events.length > 0;
    const totalEventsCount = rcaData?.total_rca_events ?? 0;

    if (activeTags.length === 0) {
        return (
            <div className="bg-surface border-2 border-dashed border-danger/40 rounded-3xl p-10 min-w-[380px] text-center shadow-xl relative">
                <div className="absolute right-4 top-4 flex gap-1">
                    <button onClick={triggerDrawerOpen} className="p-2 text-text-subtle hover:text-danger rounded-xl transition-all cursor-pointer"><Pencil className="w-4 h-4" /></button>
                    <button onClick={removeNode} className="p-2 text-text-subtle hover:text-danger rounded-xl transition-all cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                </div>
                <div className="w-16 h-16 bg-danger/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-danger/20">
                    <GitBranch className="w-8 h-8 text-danger" />
                </div>
                <div className="text-[15px] font-black text-text-primary mb-2">Ready for Root Cause Analysis</div>
                <div className="text-[12px] font-bold text-text-muted leading-relaxed px-4">Add at least <span className="text-danger">1 signal</span> to the canvas or configure tags via settings.</div>
                <button onClick={triggerDrawerOpen} className="mt-4 px-4 py-2 bg-danger hover:bg-danger/90 text-white font-black text-[12px] rounded-xl transition-all cursor-pointer">Configure Tags</button>
            </div>
        );
    }

    return (
        <div className={`bg-surface border-2 rounded-[3rem] shadow-xl min-w-[850px] max-w-[950px] overflow-hidden transition-all duration-300 ${selected ? 'border-danger ring-4 ring-danger/20' : 'border-danger/40'}`}>
            <div className="bg-gradient-to-r from-danger to-danger/80 px-8 py-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center"><GitBranch className="w-6 h-6 text-white" /></div>
                    <div>
                        <span className="text-white font-black text-[10px] uppercase tracking-[0.2em] block opacity-80">RCA Hub</span>
                        <span className="text-white font-black text-[22px] mt-1 block">Root Cause Analysis Engine</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {loading && <span className="text-[10px] font-black text-white bg-overlay px-3 py-1 rounded-full animate-pulse uppercase">Analyzing...</span>}
                    <div className={`px-4 py-1.5 rounded-xl border font-black text-[11px] uppercase tracking-wider ${totalEventsCount > 0 ? 'bg-danger text-white border-danger/50' : 'bg-white/10 text-white border-white/20'}`}>
                        {totalEventsCount > 0 ? `🚨 ${totalEventsCount} RCA Breaches` : '✓ Analysis Clean'}
                    </div>
                    <button onClick={triggerDrawerOpen} className="p-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl transition-all cursor-pointer">
                        <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={removeNode} className="p-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl transition-all cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                </div>
            </div>

            <div className="p-8">
                <div className="space-y-8">
                    {/* Active tags badges */}
                    {activeTags.length > 0 && (
                        <div className="flex flex-wrap gap-2 items-center bg-surface-2 p-4 rounded-2xl border border-border">
                            <span className="text-[10px] font-black text-text-subtle uppercase tracking-widest mr-2">Monitored Signals:</span>
                            {activeTags.map(tag => (
                                <span key={tag} className="inline-flex items-center gap-1.5 px-3 py-1 bg-danger/10 border border-danger/20 rounded-xl text-[11px] font-bold text-danger">
                                    {tag.split('.').pop() || tag}
                                    <button
                                        onClick={(e) => { e.stopPropagation(); toggleTag(tag); }}
                                        title="Remove Tag"
                                        className="p-0.5 text-text-muted hover:text-danger rounded transition-all cursor-pointer"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}

                    <div className="grid grid-cols-4 gap-4">
                        {[
                            { label: 'Total RCA Events', value: rcaData?.total_rca_events ?? 0, cls: 'text-text-primary' },
                            { label: 'Critical', value: rcaData?.summary?.critical_events ?? 0, cls: 'text-danger' },
                            { label: 'High Priority', value: rcaData?.summary?.high_events ?? 0, cls: 'text-warning' },
                            { label: 'Medium Priority', value: rcaData?.summary?.medium_events ?? 0, cls: 'text-info' },
                        ].map(({ label, value, cls }) => (
                            <div key={label} className="bg-surface-2 border border-border rounded-3xl p-5 flex flex-col items-center justify-center">
                                <span className="text-[10px] font-black text-text-subtle uppercase tracking-widest">{label}</span>
                                <span className={`text-[28px] font-black mt-2.5 ${cls}`}>{value}</span>
                            </div>
                        ))}
                    </div>
                    <div>
                        <div className="text-[10px] font-black text-text-subtle uppercase tracking-widest pl-1 mb-2.5">Root Cause Event Stream Logs</div>
                        {hasEvents ? (
                            <div className="border border-border rounded-3xl overflow-hidden shadow-sm max-h-[300px] overflow-y-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-surface-2 border-b border-border">
                                            {['Tag Name', 'Root Event', 'Timeline', 'Duration', 'Severity', 'Score'].map(h => <th key={h} className="p-3.5 text-[10px] font-black text-text-subtle uppercase tracking-wider">{h}</th>)}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {rcaData.events.map((ev, idx) => {
                                            const sev = (ev.severity || '').toLowerCase();
                                            const sevCls = sev === 'critical' ? 'bg-danger/10 text-danger border-danger/20' : sev === 'high' ? 'bg-warning/10 text-warning border-warning/20' : 'bg-info/10 text-info border-info/20';
                                            return (
                                                <tr key={idx} className="hover:bg-surface-2/50 transition-colors">
                                                    <td className="p-3.5 text-[11px] font-extrabold text-text-primary">{typeof ev.tag === 'string' ? (ev.tag.split('.').pop() || ev.tag) : 'Unknown'}</td>
                                                    <td className="p-3.5 text-[10px] font-bold text-text-muted"><span className="bg-surface-2 px-2 py-0.5 rounded text-text-secondary">{ev.message || `${ev.event_type || 'Sensor Breach'} detected`}</span></td>
                                                    <td className="p-3.5 text-[10px] text-text-subtle"><div>{ev.start_time || ev.start}</div><div className="text-[9px] opacity-75">to {ev.end_time || ev.end}</div></td>
                                                    <td className="p-3.5 text-[11px] font-bold text-text-secondary text-center">{ev.duration_minutes ? `${ev.duration_minutes.toLocaleString()} min` : '-'}</td>
                                                    <td className="p-3.5 text-center"><span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase border ${sevCls}`}>{ev.severity}</span></td>
                                                    <td className="p-3.5 text-center"><span className="text-[11px] font-black text-text-secondary bg-surface-2/60 px-2 py-1 rounded">{ev.score ?? '-'}</span></td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-10 bg-surface-2 border border-dashed border-border rounded-3xl gap-3">
                                <Shield className="w-8 h-8 text-success" />
                                <span className="text-[11px] font-black text-text-subtle uppercase tracking-wider">No RCA Events Flagged for this Range</span>
                            </div>
                        )}
                    </div>
                    <div className="border-t border-border pt-6">
                        <div className="text-[10px] font-black text-text-subtle uppercase tracking-widest pl-1 mb-4">Investigation Findings & Resolutions</div>
                        <div className="grid grid-cols-3 gap-4">
                            {[{ key: 'rootCause', label: 'Primary Root Cause', placeholder: 'What triggered these events?...' }, { key: 'actions', label: 'Corrective Actions', placeholder: 'What actions are required to resolve?...' }, { key: 'insights', label: 'Insights & Observations', placeholder: 'Add critical learnings and notes...' }].map(({ key, label, placeholder }) => (
                                <div key={key} className="flex flex-col gap-1.5">
                                    <label className="text-[9px] font-black text-text-muted uppercase tracking-wider">{label}</label>
                                    <textarea value={data[key] || ''} onChange={e => setNodes(nds => nds.map(n => n.id === id ? { ...n, data: { ...n.data, [key]: e.target.value } } : n))} placeholder={placeholder} className="w-full bg-surface-2 border border-border hover:border-border-strong focus:border-danger/60 rounded-xl p-3 text-[12px] text-text-secondary outline-none transition-all min-h-[90px] resize-none" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-surface-2 px-8 py-4 border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-danger animate-ping" />
                    <span className="text-[10px] text-text-subtle font-black uppercase tracking-widest">RCA Investigation Active</span>
                </div>
                <div className="text-[10px] text-text-subtle italic">Auto-syncs with canvas telemetry</div>
            </div>
            <Handle type="target" position={Position.Left} className="!opacity-0" />
            <Handle type="source" position={Position.Right} className="!opacity-0" />
        </div>
    );
}
