'use client';
import React, { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import TimeSelector from '@/src/components/ui/TimeSelector';
import { Bell, GripVertical, MoreVertical, ArrowLeft, History, Search, FileText, CheckCircle, GitCommit, AlertTriangle } from 'lucide-react';
import { ResponsiveGridLayout, useContainerWidth } from 'react-grid-layout';
const EQUIPMENT_MAP = {
    'scrub_1': 'Suction Scrubber 1',
    'comp_1': '1st Stage Compressor',
    'cool_1': 'Cooler 1',
    'asv_1': 'Anti-Surge Valve 1',
    'scrub_2': 'Suction Scrubber 2',
    'comp_2': '2nd Stage Compressor',
    'cool_2': 'Cooler 2',
    'asv_2': 'Anti-Surge Valve 2',
    'header': 'Discharge Header',
    'contact': 'Glycol Contactor',
};
const initialLayouts = {
    lg: [
        { i: 'timeline', x: 0, y: 0, w: 7, h: 4, minW: 5, minH: 3 },
        { i: 'scenario', x: 7, y: 0, w: 5, h: 4, minW: 4, minH: 3 },
        { i: 'root_cause', x: 0, y: 4, w: 3, h: 3, minW: 2, minH: 2 },
        { i: 'recommendation', x: 3, y: 4, w: 4, h: 3, minW: 3, minH: 2 },
        { i: 'summary', x: 7, y: 4, w: 5, h: 6, minW: 3, minH: 4 },
        { i: 'fault_tree', x: 0, y: 7, w: 7, h: 3, minW: 5, minH: 2 },
    ]
};
const PanelHeader = ({ title, icon: Icon, extra }) => (<div className="drag-handle cursor-move p-3 border-b border-border flex items-center justify-between bg-surface-2 shrink-0">
        <div className="flex items-center gap-2">
            <GripVertical className="w-4 h-4 text-text-subtle"/>
            {Icon && <Icon className="w-4 h-4 text-brand"/>}
            <h2 className="text-text-primary font-bold text-[16px] tracking-tight flex items-center">
                {title}
                {extra}
            </h2>
        </div>
        <MoreVertical className="w-4 h-4 text-text-subtle cursor-pointer"/>
    </div>);
// --- SPECIFIC WIDGETS ---
const TIMELINE_EVENTS = [
    { id: '391FN1', date: '2026-02-17', time: '12:00:00', position: 'top' },
    { id: '421BH1', date: '2026-02-17', time: '12:10:00', position: 'bottom' },
    { id: '351HG1', date: '2026-02-17', time: '12:12:00', position: 'top' },
    { id: '361VS1', date: '2026-02-17', time: '12:17:00', position: 'bottom' },
    { id: '361VS2', date: '2026-02-17', time: '12:20:00', position: 'top' },
];
const TimelineTableWidget = () => {
    const [view, setView] = useState('timeline');
    return (<div className="flex flex-col h-full bg-surface rounded-xl border overflow-hidden shadow-sm">
            <PanelHeader title="Timeline" icon={History} extra={<div className="flex bg-surface-2 p-0.5 rounded-lg ml-4 cursor-default" onPointerDown={e => e.stopPropagation()} onMouseDown={e => e.stopPropagation()}>
                        <button onClick={() => setView('timeline')} className={`px-3 py-1 text-[14px] font-bold rounded-md transition-colors ${view === 'timeline' ? 'bg-surface shadow-sm text-brand' : 'text-text-muted hover:text-text-secondary'}`}>Timeline</button>
                        <button onClick={() => setView('table')} className={`px-3 py-1 text-[14px] font-bold rounded-md transition-colors ${view === 'table' ? 'bg-surface shadow-sm text-brand' : 'text-text-muted hover:text-text-secondary'}`}>Table</button>
                    </div>}/>
            <div className="flex-1 overflow-auto bg-surface relative" onPointerDown={e => e.stopPropagation()} onMouseDown={e => e.stopPropagation()}>
                {view === 'timeline' ? (<div className="absolute inset-0 flex items-center justify-center px-10 py-6">
                        {/* Custom SVG Timeline matching user's screenshot */}
                        <div className="w-full h-full relative flex items-center">
                            {/* Horizontal backbone line */}
                            <div className="absolute left-0 right-0 h-0.5 bg-overlay-hover top-1/2 -translate-y-1/2 z-0">
                                {/* Left arrow cap */}
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 border-t-2 border-l-2 border-overlay-hover -rotate-45"></div>
                                {/* Right arrow cap */}
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 border-t-2 border-r-2 border-overlay-hover rotate-45"></div>
                            </div>

                            {/* Event nodes */}
                            <div className="relative w-full flex justify-between items-center z-10">
                                {TIMELINE_EVENTS.map((evt, i) => (<div key={evt.id} className="relative flex flex-col items-center" style={{ width: `${100 / TIMELINE_EVENTS.length}%` }}>
                                        {/* Card above or below */}
                                        {evt.position === 'top' && (<div className="absolute bottom-[calc(50%+20px)] left-1/2 -translate-x-1/2 flex flex-col items-center">
                                                <div className="bg-white border border-slate-200 rounded-lg shadow-md px-4 py-3 text-center min-w-[100px]">
                                                    <div className="text-[10px] text-slate-400 font-medium">{evt.date}</div>
                                                    <div className="text-[16px] font-black text-slate-900 mt-0.5">{evt.id}</div>
                                                    <div className="text-[10px] font-bold text-amber-500 mt-0.5">{evt.time}</div>
                                                </div>
                                                {/* Vertical connector line */}
                                                <div className="w-0.5 h-5 bg-slate-700"></div>
                                                {/* Dot on the line */}
                                                <div className="w-3 h-3 rounded-full bg-slate-700 border-2 border-white shadow-sm"></div>
                                            </div>)}

                                        {/* Time label on the line */}
                                        <div className="text-[9px] font-bold text-slate-500 absolute" style={{ top: evt.position === 'top' ? 'calc(50% + 8px)' : 'calc(50% - 18px)' }}>
                                            {evt.time}
                                        </div>

                                        {/* Small dot on the backbone */}
                                        <div className="w-2.5 h-2.5 rounded-full bg-teal-500 border-2 border-white shadow-sm z-10"></div>

                                        {evt.position === 'bottom' && (<div className="absolute top-[calc(50%+20px)] left-1/2 -translate-x-1/2 flex flex-col items-center">
                                                {/* Dot on the line */}
                                                <div className="w-3 h-3 rounded-full bg-slate-700 border-2 border-white shadow-sm"></div>
                                                {/* Vertical connector line */}
                                                <div className="w-0.5 h-5 bg-slate-700"></div>
                                                <div className="bg-white border border-slate-200 rounded-lg shadow-md px-4 py-3 text-center min-w-[100px]">
                                                    <div className="text-[16px] font-black text-slate-900">{evt.id}</div>
                                                    <div className="text-[10px] font-bold text-amber-500 mt-0.5">{evt.time}</div>
                                                    <div className="text-[10px] text-slate-400 font-medium mt-0.5">{evt.date}</div>
                                                </div>
                                            </div>)}
                                    </div>))}
                            </div>
                        </div>
                    </div>) : (<table className="w-full text-[16px] text-left text-slate-500">
                        <thead className="text-[14px] text-slate-700 uppercase bg-slate-50 sticky top-0 border-b border-slate-200">
                            <tr><th className="px-6 py-3 font-bold">Tag ID</th><th className="px-6 py-3 font-bold">Date</th><th className="px-6 py-3 font-bold">Time</th><th className="px-6 py-3 font-bold">Status</th></tr>
                        </thead>
                        <tbody>
                            {TIMELINE_EVENTS.map((evt, i) => (<tr key={evt.id} className="border-b hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-3 font-bold text-slate-900">{evt.id}</td>
                                    <td className="px-6 py-3">{evt.date}</td>
                                    <td className="px-6 py-3 font-medium text-amber-600">{evt.time}</td>
                                    <td className="px-6 py-3"><span className={`px-2 py-0.5 text-[14px] font-bold rounded border ${i === 0 ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : i === TIMELINE_EVENTS.length - 1 ? 'bg-red-100 text-red-700 border-red-200' : 'bg-blue-100 text-blue-700 border-blue-200'}`}>{i === 0 ? 'Initial' : i === TIMELINE_EVENTS.length - 1 ? 'Critical' : 'Active'}</span></td>
                                </tr>))}
                        </tbody>
                    </table>)}
            </div>
        </div>);
};
// Reference trend (current investigation) - always shown as dashed
const REF_PATHS = [
    'M0 20 Q 15 10, 30 18 T 60 12 T 100 8',
    'M0 30 Q 20 15, 40 25 T 70 10 T 100 15',
    'M0 10 Q 25 25, 50 20 T 80 30 T 100 25',
    'M0 25 Q 20 5, 45 15 T 75 20 T 100 10',
];
// Different scenario trend paths keyed by scenario id
const SCENARIO_PATHS = {
    1: ['M0 22 Q 20 8, 35 16 T 65 10 T 100 5', 'M0 28 Q 18 12, 42 22 T 72 8 T 100 12', 'M0 12 Q 22 22, 48 18 T 78 28 T 100 22', 'M0 24 Q 18 8, 43 14 T 73 18 T 100 8'],
    2: ['M0 18 Q 25 15, 40 22 T 70 18 T 100 12', 'M0 35 Q 15 20, 38 28 T 68 15 T 100 20', 'M0 8 Q 30 28, 55 22 T 85 32 T 100 28', 'M0 28 Q 22 2, 48 10 T 78 22 T 100 14'],
    3: ['M0 25 Q 18 12, 32 20 T 62 15 T 100 10', 'M0 32 Q 20 18, 45 25 T 75 12 T 100 18', 'M0 15 Q 28 30, 52 25 T 82 35 T 100 30', 'M0 20 Q 15 5, 40 12 T 70 15 T 100 6'],
    4: ['M0 20 Q 22 18, 38 24 T 68 20 T 100 16', 'M0 30 Q 18 22, 40 30 T 70 18 T 100 22', 'M0 12 Q 25 20, 48 16 T 78 25 T 100 20', 'M0 22 Q 20 10, 45 18 T 75 24 T 100 12'],
};
const SimilarScenarioWidget = () => {
    const [selectedId, setSelectedId] = useState(1);
    const scenarios = [
        { id: 1, date: '2025-08-12', similarity: '94%', action: 'Bearing replacement' },
        { id: 2, date: '2025-02-05', similarity: '88%', action: 'Seal recalibration' },
        { id: 3, date: '2024-11-20', similarity: '81%', action: 'Lube oil filter change' },
        { id: 4, date: '2024-06-15', similarity: '76%', action: 'Vibration analysis' },
    ];
    const selectedPaths = SCENARIO_PATHS[selectedId] || SCENARIO_PATHS[1];
    return (<div className="flex flex-col h-full bg-white rounded-xl border overflow-hidden shadow-sm">
            <PanelHeader title="Similar Scenarios" icon={Search}/>
            <div className="flex-1 flex bg-white overflow-hidden" onPointerDown={e => e.stopPropagation()} onMouseDown={e => e.stopPropagation()}>
                {/* 4 Graphs Left */}
                <div className="w-1/2 p-3 grid grid-cols-2 grid-rows-2 gap-2 border-r border-slate-200 bg-slate-50/50">
                    {[0, 1, 2, 3].map(g => (<div key={g} className="bg-white border border-slate-200 rounded p-2 flex flex-col relative shadow-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-slate-600">Trend {g + 1}</span>
                                <div className="flex items-center gap-2">
                                    <span className="flex items-center gap-0.5 text-[8px] text-slate-400"><span className="w-3 h-0 border-t-2 border-dashed border-red-400 inline-block"></span>Ref</span>
                                    <span className="flex items-center gap-0.5 text-[8px] text-blue-500"><span className="w-3 h-0 border-t-2 border-blue-500 inline-block"></span>Sel</span>
                                </div>
                            </div>
                            <div className="flex-1 w-full h-full border-b-2 border-l-2 border-slate-200 relative mt-1 overflow-hidden">
                                <svg viewBox="0 0 100 40" className="absolute inset-0 w-full h-full fill-none" preserveAspectRatio="none">
                                    {/* Reference trend (dashed red) */}
                                    <path d={REF_PATHS[g]} stroke="#f87171" strokeWidth="2" vectorEffect="non-scaling-stroke" opacity="0.7"/>
                                    {/* Selected scenario trend (solid blue) */}
                                    <path d={selectedPaths[g]} stroke="#3b82f6" strokeWidth="2.5" vectorEffect="non-scaling-stroke"/>
                                </svg>
                            </div>
                        </div>))}
                </div>
                {/* Table Right */}
                <div className="w-1/2 overflow-auto relative">
                    <table className="w-full text-[14px] text-left text-slate-600">
                        <thead className="text-[10px] font-bold text-slate-500 uppercase bg-slate-50 sticky top-0 border-b border-slate-200 shadow-sm z-10">
                            <tr><th className="px-4 py-2">Date</th><th className="px-2 py-2">Match</th><th className="px-2 py-2">Action</th></tr>
                        </thead>
                        <tbody>
                            {scenarios.map(row => (<tr key={row.id} onClick={() => setSelectedId(row.id)} className={`cursor-pointer border-b border-slate-100 transition-colors ${selectedId === row.id ? 'bg-blue-50/80 border-l-4 border-l-blue-500 border-blue-200 shadow-inner' : 'hover:bg-slate-50'}`}>
                                    <td className="px-4 py-3 font-semibold whitespace-nowrap">{row.date}</td>
                                    <td className="px-2 py-3"><span className="px-1.5 py-0.5 bg-emerald-100 border border-emerald-200 text-emerald-700 rounded text-[9px] font-bold">{row.similarity}</span></td>
                                    <td className="px-2 py-3 truncate max-w-[80px]" title={row.action}>{row.action}</td>
                                </tr>))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>);
};
const RootCauseWidget = () => (<div className="flex flex-col h-full bg-white rounded-xl border overflow-hidden shadow-sm">
        <PanelHeader title="Possible Root Cause" icon={AlertTriangle}/>
        <div className="flex-1 p-5 overflow-auto bg-slate-50/50 flex flex-col gap-4">
            <div>
                <div className="flex justify-between text-[14px] font-bold text-slate-600 mb-1">
                    <span>Bearing Degradation</span>
                    <span className="text-red-600">85%</span>
                </div>
                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 w-[85%]"></div>
                </div>
            </div>
            <div>
                <div className="flex justify-between text-[14px] font-bold text-slate-600 mb-1">
                    <span>Lube Oil Contamination</span>
                    <span className="text-amber-600">60%</span>
                </div>
                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 w-[60%]"></div>
                </div>
            </div>
            <div>
                <div className="flex justify-between text-[14px] font-bold text-slate-600 mb-1">
                    <span>Seal Leakage</span>
                    <span className="text-blue-600">30%</span>
                </div>
                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 w-[30%]"></div>
                </div>
            </div>
        </div>
    </div>);
const RecommendationWidget = () => (<div className="flex flex-col h-full bg-white rounded-xl border overflow-hidden shadow-sm">
        <PanelHeader title="Recommendations" icon={CheckCircle}/>
        <div className="flex-1 p-5 overflow-auto bg-white flex flex-col gap-3">
            <div className="flex items-start gap-3 p-3 bg-blue-50/50 border border-blue-100 rounded-lg">
                <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 shrink-0"/>
                <div>
                    <h4 className="text-[14px] font-bold text-slate-900">Inspect Journal Bearings</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">Schedule immediate visual inspection of DE/NDE bearings during next short window.</p>
                </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-100 rounded-lg">
                <CheckCircle className="w-4 h-4 text-slate-400 mt-0.5 shrink-0"/>
                <div>
                    <h4 className="text-[14px] font-bold text-slate-900">Oil Sample Analysis</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">Send current lube oil samples to the lab for particle count and viscosity match.</p>
                </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-100 rounded-lg">
                <CheckCircle className="w-4 h-4 text-slate-400 mt-0.5 shrink-0"/>
                <div>
                    <h4 className="text-[14px] font-bold text-slate-900">Vibration Signature</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">Perform advanced spectrum vibration analysis to confirm specific frequency multiples.</p>
                </div>
            </div>
        </div>
    </div>);
const SummaryWidget = () => (<div className="flex flex-col h-full bg-white rounded-xl border overflow-hidden shadow-sm">
        <PanelHeader title="Executive Summary" icon={FileText}/>
        <div className="flex-1 p-6 overflow-auto bg-slate-50/50">
            <div className="prose prose-sm prose-slate max-w-none">
                <p className="text-[16px] font-medium leading-relaxed text-slate-700">
                    The current investigation targets a rapid deviation in vibration and pressure parameters observed across the primary compressor stage. Historical mapping bounds this deviation with a 94% similarity to a previous bearing wear incident recorded in August 2025.
                </p>
                <div className="my-5 p-4 bg-white border border-slate-200 rounded-xl shadow-sm border-l-4 border-l-red-500">
                    <h4 className="text-[14px] font-bold uppercase text-slate-400 tracking-wider mb-2">Automated Conclusion</h4>
                    <p className="text-[16px] text-slate-800 leading-relaxed m-0 text-justify">
                        The AI predicts an imminent critical failure linked directly to the Journal Bearing integrity. Primary recommendation is to execute a controlled trip and perform physical inspection within 48 hours. Lube oil degradation is a secondary contributing factor.
                    </p>
                </div>
                <div className="mt-4 flex gap-2">
                    <span className="px-2.5 py-1 bg-red-100 text-red-700 font-bold text-[10px] rounded uppercase border border-red-200">High Priority</span>
                    <span className="px-2.5 py-1 bg-slate-200 text-slate-600 font-bold text-[10px] rounded uppercase border border-slate-300">Mechanical</span>
                </div>
            </div>
        </div>
    </div>);
const FaultTreeWidget = () => {
    const [diagramView, setDiagramView] = useState('ishikawa');
    return (<div className="flex flex-col h-full bg-white rounded-xl border overflow-hidden shadow-sm">
            <PanelHeader title="Diagram" icon={GitCommit} extra={<div className="flex bg-slate-200 p-0.5 rounded-lg ml-4 cursor-default" onPointerDown={e => e.stopPropagation()} onMouseDown={e => e.stopPropagation()}>
                        <button onClick={() => setDiagramView('ishikawa')} className={`px-3 py-1 text-[14px] font-bold rounded-md transition-colors ${diagramView === 'ishikawa' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>Ishikawa</button>
                        <button onClick={() => setDiagramView('fault_tree')} className={`px-3 py-1 text-[14px] font-bold rounded-md transition-colors ${diagramView === 'fault_tree' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>Fault Tree</button>
                    </div>}/>
            <div className="flex-1 p-2 flex items-center justify-center bg-white relative overflow-hidden" onPointerDown={e => e.stopPropagation()} onMouseDown={e => e.stopPropagation()}>
                {diagramView === 'ishikawa' ? (
        /* Ishikawa (Fishbone) Diagram */
        <svg viewBox="0 0 520 130" className="w-full h-full max-w-2xl drop-shadow-sm">
                        <g stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none">
                            <path d="M 50 65 H 430" markerEnd="url(#ik-arrow)"/>
                            <path d="M 150 65 L 110 22"/><path d="M 300 65 L 260 22"/>
                            <path d="M 220 65 L 180 108"/><path d="M 370 65 L 330 108"/>
                            <path d="M 130 43 H 88" strokeWidth="1.5" strokeDasharray="3 3"/>
                            <path d="M 280 43 H 238" strokeWidth="1.5" strokeDasharray="3 3"/>
                            <path d="M 200 87 H 158" strokeWidth="1.5" strokeDasharray="3 3"/>
                            <path d="M 350 87 H 308" strokeWidth="1.5" strokeDasharray="3 3"/>
                        </g>
                        <defs><marker id="ik-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M 0 0 L 5 3 L 0 6 Z" fill="#94a3b8"/></marker></defs>
                        <g fill="#334155" fontSize="10" fontWeight="bold">
                            <text x="442" y="68" fontSize="12" fill="#ef4444">FAILURE</text>
                            <text x="115" y="17" textAnchor="end">Vibration</text>
                            <text x="265" y="17" textAnchor="end">Lube Oil</text>
                            <text x="185" y="120" textAnchor="end">Surge</text>
                            <text x="335" y="120" textAnchor="end">Seal Leak</text>
                            <text x="83" y="46" fontSize="8" fill="#64748b" textAnchor="end">Bearing wear</text>
                            <text x="233" y="46" fontSize="8" fill="#64748b" textAnchor="end">Contamination</text>
                            <text x="153" y="90" fontSize="8" fill="#64748b" textAnchor="end">ASV failure</text>
                            <text x="303" y="90" fontSize="8" fill="#64748b" textAnchor="end">O-ring decay</text>
                        </g>
                        <g fill="#fff" stroke="#3b82f6" strokeWidth="2">
                            <circle cx="150" cy="65" r="4"/><circle cx="220" cy="65" r="4"/>
                            <circle cx="300" cy="65" r="4"/><circle cx="370" cy="65" r="4"/>
                        </g>
                    </svg>) : (
        /* Fault Tree Diagram */
        <svg viewBox="0 0 500 180" className="w-full h-full max-w-2xl drop-shadow-sm">
                        {/* Top Event */}
                        <rect x="190" y="5" width="120" height="30" rx="4" fill="#fef2f2" stroke="#ef4444" strokeWidth="2"/>
                        <text x="250" y="25" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#dc2626">COMPRESSOR FAIL</text>
                        <line x1="250" y1="35" x2="250" y2="50" stroke="#475569" strokeWidth="2"/>

                        {/* OR Gate */}
                        <path d="M 230 50 Q 250 70, 270 50 Z" fill="#e2e8f0" stroke="#475569" strokeWidth="2"/>
                        <text x="250" y="64" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#334155">OR</text>
                        <line x1="240" y1="68" x2="240" y2="85" stroke="#475569" strokeWidth="1.5"/>
                        <line x1="260" y1="68" x2="260" y2="85" stroke="#475569" strokeWidth="1.5"/>

                        {/* Left branch - Mechanical */}
                        <line x1="240" y1="68" x2="120" y2="85" stroke="#475569" strokeWidth="1.5"/>
                        <rect x="70" y="85" width="100" height="25" rx="4" fill="#fef9c3" stroke="#eab308" strokeWidth="1.5"/>
                        <text x="120" y="102" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#854d0e">Mechanical</text>

                        {/* AND Gate under Mechanical */}
                        <line x1="120" y1="110" x2="120" y2="125" stroke="#475569" strokeWidth="1.5"/>
                        <rect x="105" y="125" width="30" height="14" rx="2" fill="#e2e8f0" stroke="#475569" strokeWidth="1.5"/>
                        <text x="120" y="135" textAnchor="middle" fontSize="7" fontWeight="bold" fill="#334155">AND</text>
                        <line x1="108" y1="139" x2="80" y2="155" stroke="#475569" strokeWidth="1.5"/>
                        <line x1="132" y1="139" x2="160" y2="155" stroke="#475569" strokeWidth="1.5"/>

                        {/* Mechanical leaves */}
                        <rect x="45" y="155" width="70" height="20" rx="3" fill="#fff" stroke="#94a3b8" strokeWidth="1.5"/>
                        <text x="80" y="169" textAnchor="middle" fontSize="8" fill="#475569">Bearing Wear</text>
                        <rect x="125" y="155" width="70" height="20" rx="3" fill="#fff" stroke="#94a3b8" strokeWidth="1.5"/>
                        <text x="160" y="169" textAnchor="middle" fontSize="8" fill="#475569">Vibration</text>

                        {/* Right branch - Process */}
                        <line x1="260" y1="68" x2="380" y2="85" stroke="#475569" strokeWidth="1.5"/>
                        <rect x="330" y="85" width="100" height="25" rx="4" fill="#dbeafe" stroke="#3b82f6" strokeWidth="1.5"/>
                        <text x="380" y="102" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#1e40af">Process</text>

                        {/* OR Gate under Process */}
                        <line x1="380" y1="110" x2="380" y2="125" stroke="#475569" strokeWidth="1.5"/>
                        <path d="M 365 125 Q 380 142, 395 125 Z" fill="#e2e8f0" stroke="#475569" strokeWidth="1.5"/>
                        <text x="380" y="137" textAnchor="middle" fontSize="7" fontWeight="bold" fill="#334155">OR</text>
                        <line x1="370" y1="140" x2="340" y2="155" stroke="#475569" strokeWidth="1.5"/>
                        <line x1="390" y1="140" x2="420" y2="155" stroke="#475569" strokeWidth="1.5"/>

                        {/* Process leaves */}
                        <rect x="305" y="155" width="70" height="20" rx="3" fill="#fff" stroke="#94a3b8" strokeWidth="1.5"/>
                        <text x="340" y="169" textAnchor="middle" fontSize="8" fill="#475569">Surge</text>
                        <rect x="385" y="155" width="70" height="20" rx="3" fill="#fff" stroke="#94a3b8" strokeWidth="1.5"/>
                        <text x="420" y="169" textAnchor="middle" fontSize="8" fill="#475569">Seal Leak</text>
                    </svg>)}
            </div>
        </div>);
};
// ──────────────────────────────── MAIN PAGE ────────────────────────────────
function InvestigationContent({ params }) {
    const router = useRouter();
    const equipmentId = params.id;
    const equipmentName = EQUIPMENT_MAP[equipmentId] || 'Investigation';
    const { width, containerRef, mounted } = useContainerWidth();
    const [layouts, setLayouts] = useState(initialLayouts);
    return (<>
                <header className="h-16 border-b border-slate-200 flex items-center justify-between px-6 bg-white shrink-0">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.push(`/compressor-details/${equipmentId}`)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors group">
                            <ArrowLeft className="w-5 h-5 text-slate-500 group-hover:text-slate-800 transition-colors"/>
                        </button>
                        <h1 className="text-[22px] font-bold text-slate-900 tracking-tight uppercase flex items-center gap-3">
                            {equipmentName}
                            <span className="bg-red-100 text-red-700 border border-red-200 px-3 py-1 rounded-full text-[14px] font-bold tracking-widest flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                                ACTIVE INVESTIGATION
                            </span>
                        </h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <TimeSelector />
                        <button onClick={() => setLayouts(initialLayouts)} className="px-3 py-1.5 text-[14px] font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all uppercase shadow-sm">
                            Reset Layout
                        </button>
                        <Bell className="w-5 h-5 text-slate-400 cursor-pointer hover:text-slate-600 transition-colors"/>
                    </div>
                </header>

                <div className="flex-1 p-6 overflow-y-auto" ref={containerRef}>
                    {mounted && (<ResponsiveGridLayout width={width} layouts={layouts} onLayoutChange={(_, allLayouts) => setLayouts(allLayouts)} breakpoints={{ lg: 1200, md: 996 }} cols={{ lg: 12, md: 12 }} rowHeight={80} dragConfig={{ handle: '.drag-handle' }} margin={[24, 24]}>
                            <div key="timeline" className="h-full"><TimelineTableWidget /></div>
                            <div key="scenario" className="h-full"><SimilarScenarioWidget /></div>
                            <div key="root_cause" className="h-full"><RootCauseWidget /></div>
                            <div key="recommendation" className="h-full"><RecommendationWidget /></div>
                            <div key="summary" className="h-full"><SummaryWidget /></div>
                            <div key="fault_tree" className="h-full"><FaultTreeWidget /></div>
                        </ResponsiveGridLayout>)}
                </div>
        </>);
}
export default function InvestigationPage({ params }) {
    const resolvedParams = use(params);
    return (<React.Suspense fallback={<div className="h-screen w-full flex items-center justify-center bg-slate-50 font-black uppercase tracking-widest text-slate-400">Loading Investigation Engine...</div>}>
            <InvestigationContent params={resolvedParams}/>
        </React.Suspense>);
}
