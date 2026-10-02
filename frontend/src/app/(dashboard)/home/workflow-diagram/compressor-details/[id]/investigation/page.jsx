'use client';
import React, { useState, useRef, use, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTimeRange } from '@/src/hooks/dashboard/useTimeRange';
// industrial-data service removed from cpcp-configuration (out of the refactored
// contract) — disabled until this page is rewired to a real backend.
// import { getVisualData, getInvestigationReport } from '@/src/services/cpcp/industrial-data/industrialDataService';
import { ArrowLeft, Bell, Clock, GitBranch, Lightbulb, FileText, Activity, ChevronLeft, ChevronRight, GripVertical, MoreVertical, X, Maximize2, Minimize2 } from 'lucide-react';
import { ResponsiveGridLayout, useContainerWidth } from 'react-grid-layout';
import dynamic from 'next/dynamic';
const HighchartsChart = dynamic(() => import('@/src/components/charts/HighchartsChart'), { ssr: false });
// ── Equipment Map ──
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
// ── Timeline Template Metadata ──
const TIMELINE_METADATA = [];
// ── Similar scenario data ──
const INVESTIGATION_TAGS = [
    'EXP_STG1_DIS_P',
    'EXP_STG2_DIS_P',
    'EXP_STG2_SUC_P',
    'GG_EX_T10B',
    'RINJ_DIS_P',
    'RINJ_DIS_T',
    'RINJ_IN_DP',
    'RINJ_SUC_P'
];
// ──────────────────────────────── COMPONENTS ────────────────────────────────
// ── Timeline/Table Container ──
function TimelineTableContainer({ view, referenceEndTime, reportData }) {
    // Calculate dynamic timeline data based on referenceEndTime
    const calculateEvents = () => {
        const end = referenceEndTime ? new Date(referenceEndTime.replace(' ', 'T')) : new Date();
        const formatDate = (date) => {
            const pad = (n) => n.toString().padStart(2, '0');
            return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
        };
        const formatTime = (date) => {
            const pad = (n) => n.toString().padStart(2, '0');
            return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
        };
        if (reportData && reportData.length > 0) {
            return reportData.map((ev, i) => {
                const rawTime = ev.timestamp || ev.Timestamp || ev.start_time || ev["start time"] || ev.Time || ev.time || "";
                const eventTime = rawTime ? new Date(rawTime.includes('Z') ? rawTime : rawTime.replace(' ', 'T')) : new Date();
                const eventTitle = ev.event || ev.Event || ev.issue || ev.Issue || ev.description || ev.Description || ev.tagDesc || 'Anomaly Event';
                return {
                    id: i + 1,
                    AssetId: ev.AssetId || ev.assetId || ev.asset_id || ev["Asset ID"] || 'N/A',
                    AssetDescription: ev.AssetDescription || ev.assetDescription || ev.asset_description || 'Industrial Asset',
                    TagId: ev.TagId || ev.tagId || ev.tag_id || 'N/A',
                    event: eventTitle,
                    date: formatDate(eventTime),
                    time: formatTime(eventTime),
                    timestamp: eventTime.getTime(),
                    type: 'Sequence Event',
                    status: i === reportData.length - 1 ? 'Current' : 'History',
                    color: i % 2 === 0 ? 'bg-brand-muted text-brand border border-brand/20' : 'bg-surface-2 text-text-secondary border border-border',
                };
            });
        }
        return TIMELINE_METADATA.map((meta, i) => {
            const offsetMinutes = (TIMELINE_METADATA.length - 1 - i) * 15;
            const eventTime = new Date(end.getTime() - offsetMinutes * 60000);
            return {
                id: i + 1,
                AssetId: meta.AssetId,
                AssetDescription: meta.AssetDescription || 'Compressor Sub-system',
                TagId: meta.TagId,
                event: meta.event,
                date: formatDate(eventTime),
                time: formatTime(eventTime),
                timestamp: eventTime.getTime(),
                type: i % 2 === 0 ? 'System Alert' : 'Deviation',
                status: i === 4 ? 'Critical' : i % 2 === 0 ? 'Warning' : 'Info',
                color: i === 4 ? 'bg-danger/10 text-danger border border-danger/20' : i % 2 === 0 ? 'bg-warning/10 text-warning border border-warning/20' : 'bg-info/10 text-info border border-info/20',
            };
        });
    };
    const dynamicData = calculateEvents();
    const timelineOptions = React.useMemo(() => ({
        chart: {
            type: 'timeline',
            height: 500,
            spacingTop: 40,
            spacingBottom: 80,
            spacingLeft: 50,
            spacingRight: 50,
            backgroundColor: 'transparent',
            style: { fontFamily: 'inherit' },
            inverted: false
        },
        title: { text: '' },
        credits: { enabled: false },
        xAxis: {
            visible: false
        },
        yAxis: { visible: false },
        legend: { enabled: false },
        tooltip: {
            enabled: true,
            useHTML: true,
            style: { fontWeight: '600', fontSize: '11px' },
            headerFormat: '<span style="font-size: 10px; color: #64748b">{point.key}</span><br/>',
            pointFormat: '<div style="margin-top: 4px; color: #0f172a"><b>Tag:</b> {point.TagId}</div>' +
                '<div style="color: #475569"><b>Asset:</b> {point.AssetId}</div>' +
                '<div style="color: #64748b; font-size: 10px; margin-top: 2px">{point.AssetDescription}</div>',
            backgroundColor: 'rgba(255, 255, 255, 0.98)',
            borderWidth: 1,
            borderColor: '#000000',
            borderRadius: 8,
            shadow: true
        },
        series: [{
                type: 'timeline',
                data: dynamicData.map((t, index) => ({
                    x: index,
                    name: t.event,
                    label: t.event,
                    TagId: t.TagId,
                    AssetId: t.AssetId,
                    AssetDescription: t.AssetDescription,
                    description: `${t.date} ${t.time}`,
                })),
                lineWidth: 2,
                color: '#cbd5e1',
                marker: {
                    symbol: 'circle',
                    lineWidth: 2,
                    lineColor: '#ffffff',
                    radius: 8,
                    fillColor: '#4f46e5'
                },
                dataLabels: {
                    allowOverlap: true,
                    alternate: true,
                    distance: 100,
                    connectorColor: '#475569',
                    connectorWidth: 2,
                    backgroundColor: '#ffffff',
                    borderColor: '#000000',
                    borderWidth: 1.5,
                    borderRadius: 8,
                    padding: 10,
                    shadow: false,
                    overflow: 'allow',
                    crop: false,
                    style: { fontWeight: '800', fontSize: '10px', color: '#0f172a', textOutline: 'none', width: '160px', textAlign: 'center' },
                    formatter: function () {
                        const p = this.point;
                        return `<span style="font-size: 10px; color: #4f46e5; font-weight: 900">${p.description}</span><br/>` +
                            `<span style="font-size: 10px; font-weight: 900">${p.name}</span><br/>` +
                            `<span style="font-size: 9px; color: #64748b; font-weight: 700">TAG: ${p.TagId}</span>`;
                    }
                },
            }],
    }), [dynamicData]);
    return (<div className="flex flex-col h-full bg-white relative">
            <div className="flex-1 flex flex-col">
                {view === 'timeline' ? (<div className="flex-1 overflow-x-auto overflow-y-visible custom-scrollbar h-full">
                        <div className="p-8 inline-block min-w-full min-h-full">
                            <CustomHorizontalTimeline data={dynamicData}/>
                        </div>
                    </div>) : (<div className="flex-1 overflow-auto">
                        <table className="w-full text-[14px] text-left text-text-muted">
                            <thead className="text-[10px] text-text-secondary uppercase bg-canvas sticky top-0 border-b border-black">
                                <tr>
                                    <th className="px-3 py-3 font-extrabold whitespace-nowrap">Event Title</th>
                                    <th className="px-3 py-3 font-extrabold whitespace-nowrap">Asset ID</th>
                                    <th className="px-3 py-3 font-extrabold whitespace-nowrap">Description</th>
                                    <th className="px-3 py-3 font-extrabold whitespace-nowrap">Tag ID</th>
                                    <th className="px-3 py-3 font-extrabold text-center">Date</th>
                                    <th className="px-3 py-3 font-extrabold text-center">Time</th>
                                    <th className="px-3 py-3 font-extrabold text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border italic font-medium">
                                {dynamicData.map((r) => (<tr key={r.id} className="bg-white hover:bg-canvas transition-colors">
                                        <td className="px-3 py-3 text-text-primary font-black">{r.event}</td>
                                        <td className="px-3 py-3 text-brand font-bold">{r.AssetId}</td>
                                        <td className="px-3 py-3 text-text-subtle truncate max-w-[150px]">{r.AssetDescription}</td>
                                        <td className="px-3 py-3 text-brand font-black">{r.TagId}</td>
                                        <td className="px-3 py-3 text-text-subtle text-center">{r.date}</td>
                                        <td className="px-3 py-3 font-bold text-text-primary text-center">{r.time}</td>
                                        <td className="px-3 py-3 text-center">
                                            <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded-full ${r.color}`}>{r.status}</span>
                                        </td>
                                    </tr>))}
                            </tbody>
                        </table>
                    </div>)}
            </div>
        </div>);
}
function CustomHorizontalTimeline({ data }) {
    const [hoveredId, setHoveredId] = useState(null);
    const stepWidth = 240;
    const totalWidth = data.length * stepWidth;
    return (<div className="relative h-[650px] flex items-center py-20 pointer-events-auto bg-white/50 rounded-2xl">
            {/* Main Spine */}
            <div className="absolute top-1/2 left-0 h-1 bg-black -translate-y-1/2 rounded-full" style={{ width: `${totalWidth}px` }}/>

            <div className="relative flex" style={{ width: `${totalWidth}px` }}>
                {data.map((event, index) => {
            const isTop = index % 2 === 0;
            const xPos = index * stepWidth + stepWidth / 2;
            return (<div key={event.id} className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center" style={{ left: `${xPos}px`, width: '1px' }}>
                            {/* Marker on spine - pulsating effect for latest */}
                            <div className={`w-5 h-5 rounded-full border-4 border-white shadow-lg z-20 transition-all duration-300 cursor-pointer ${index === data.length - 1 ? 'bg-brand scale-110' : 'bg-info'} hover:scale-150 hover:bg-brand-hover`} onMouseEnter={() => setHoveredId(event.id)} onMouseLeave={() => setHoveredId(null)}/>

                            {/* Connector Line */}
                            <div className={`absolute left-1/2 -translate-x-1/2 w-0.5 bg-black ${isTop ? 'bottom-1/2 mb-2.5 h-28' : 'top-1/2 mt-2.5 h-28'}`}/>

                            {/* Event Card */}
                            <div className={`absolute left-1/2 -translate-x-1/2 flex flex-col items-center ${isTop ? 'bottom-1/2 mb-36' : 'top-1/2 mt-36'}`}>
                                <div onMouseEnter={() => setHoveredId(event.id)} onMouseLeave={() => setHoveredId(null)} className="bg-white rounded-2xl border border-border-strong shadow-xl p-4 w-56 hover:shadow-2xl hover:border-brand transition-all duration-300 cursor-pointer group relative z-30">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-brand shadow-[0_0_8px_rgba(59,130,246,0.5)]"/>
                                        <span className="text-text-subtle text-[10px] font-black uppercase tracking-widest">{event.date} {event.time}</span>
                                    </div>
                                    <div className="text-text-primary text-[13px] font-black leading-tight group-hover:text-brand transition-colors uppercase tracking-tight line-clamp-2">
                                        {event.event}
                                    </div>

                                    {/* Detailed Popover (Hover State) */}
                                    {hoveredId === event.id && (<div className={`absolute ${isTop ? 'top-full mt-6 animate-in slide-in-from-top-2' : 'bottom-full mb-6 animate-in slide-in-from-bottom-2'} left-1/2 -translate-x-1/2 w-72 bg-white rounded-2xl border-2 border-black shadow-[0_20px_50px_rgba(0,0,0,0.2)] p-5 z-[100] fade-in zoom-in duration-200 pointer-events-none`}>
                                            <div className="text-text-primary text-[14px] font-black mb-4 border-b-2 border-black pb-3 bg-canvas -m-5 p-5 rounded-t-2xl flex items-center justify-between">
                                                <span className="uppercase">{event.event}</span>
                                                <Clock className="w-4 h-4 text-brand"/>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[10px] font-black text-text-subtle uppercase tracking-[0.2em]">Tag Identifier</span>
                                                    <span className="text-[12px] font-black text-brand bg-brand-muted px-2 py-1 rounded w-fit border border-brand/20">{event.TagId}</span>
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[10px] font-black text-text-subtle uppercase tracking-[0.2em]">Asset Reference</span>
                                                    <span className="text-[12px] font-black text-text-primary">{event.AssetId}</span>
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[10px] font-black text-text-subtle uppercase tracking-[0.2em]">Diagnostic Note</span>
                                                    <div className="text-[11px] font-bold text-text-secondary bg-canvas p-2 rounded-lg border border-border italic leading-relaxed">
                                                        "{event.AssetDescription}"
                                                    </div>
                                                </div>
                                            </div>
                                            {/* Pointer Triangle */}
                                            <div className={`absolute ${isTop ? '-top-2 border-t-2 border-l-2' : '-bottom-2 border-b-2 border-r-2'} left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-black rotate-45`}/>
                                        </div>)}
                                </div>
                            </div>
                        </div>);
        })}
            </div>
        </div>);
}
// ── Tag Deviation Charts Widget ──
const TAG_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#ec4899'];
const WINDOW_PRESETS = [
    { label: '1H', hours: 1 },
    { label: '2H', hours: 2 },
    { label: '6H', hours: 6 },
    { label: '12H', hours: 12 },
    { label: '1D', hours: 24 },
];
function TagDeviationChartsWidget({ data, referenceEndTime }) {
    const tags = data.filter(d => d.data && d.data.length > 0);
    // Compute full data extent
    const allTimes = tags.flatMap(t => t.data.map(([ts]) => ts));
    const dataStart = allTimes.length > 0 ? Math.min(...allTimes) : Date.now() - 6 * 3600000;
    const dataEnd = allTimes.length > 0 ? Math.max(...allTimes) : Date.now();
    const totalDuration = dataEnd - dataStart;
    // Time window state (default: 6h ending at dataEnd)
    const [windowHours, setWindowHours] = useState(6);
    const [windowEnd, setWindowEnd] = useState(dataEnd);
    // Clamp windowEnd to data bounds
    const clampedEnd = Math.min(Math.max(windowEnd, dataStart + windowHours * 3600000), dataEnd);
    const windowStart = clampedEnd - windowHours * 3600000;
    // Sync when new data arrives
    useEffect(() => {
        if (allTimes.length > 0)
            setWindowEnd(dataEnd);
    }, [dataEnd]);
    const resetZoom = useCallback(() => {
        setWindowEnd(dataEnd);
        setWindowHours(6);
    }, [dataEnd]);
    const dragRef = useRef({ type: null, startX: 0, startWindowStart: 0, startClampedEnd: 0, startWindowHours: 0 });
    const handleNavigatorMouseDown = useCallback((e, type) => {
        e.stopPropagation();
        e.preventDefault();
        dragRef.current = {
            type,
            startX: e.clientX,
            startWindowStart: windowStart,
            startClampedEnd: clampedEnd,
            startWindowHours: windowHours
        };
        document.body.style.cursor = type === 'center' ? 'grabbing' : 'col-resize';
        const onMouseMove = (ev) => {
            const drag = dragRef.current;
            if (!drag.type)
                return;
            const timelineElement = document.getElementById('timeline-navigator-bar-investigation');
            if (!timelineElement)
                return;
            const rect = timelineElement.getBoundingClientRect();
            const deltaX = ev.clientX - drag.startX;
            const deltaPct = deltaX / rect.width;
            const deltaMs = deltaPct * totalDuration;
            if (drag.type === 'left') {
                let newStart = drag.startWindowStart + deltaMs;
                const minDuration = 5 * 60 * 1000; // 5 mins
                newStart = Math.max(dataStart, Math.min(newStart, clampedEnd - minDuration));
                const newHours = (clampedEnd - newStart) / 3600000;
                setWindowHours(newHours);
            }
            else if (drag.type === 'right') {
                let newEnd = drag.startClampedEnd + deltaMs;
                const minDuration = 5 * 60 * 1000; // 5 mins
                newEnd = Math.max(windowStart + minDuration, Math.min(newEnd, dataEnd));
                setWindowEnd(newEnd);
                const newHours = (newEnd - windowStart) / 3600000;
                setWindowHours(newHours);
            }
            else if (drag.type === 'center') {
                let newStart = drag.startWindowStart + deltaMs;
                let newEnd = drag.startClampedEnd + deltaMs;
                const currentDuration = drag.startWindowHours * 3600000;
                if (newStart < dataStart) {
                    newStart = dataStart;
                    newEnd = dataStart + currentDuration;
                }
                else if (newEnd > dataEnd) {
                    newEnd = dataEnd;
                    newStart = dataEnd - currentDuration;
                }
                setWindowEnd(newEnd);
            }
        };
        const onMouseUp = () => {
            dragRef.current.type = null;
            document.body.style.cursor = '';
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }, [windowStart, clampedEnd, windowHours, totalDuration, dataStart, dataEnd]);
    const formatTs = (ts) => {
        const d = new Date(ts);
        const pad = (n) => n.toString().padStart(2, '0');
        return `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };
    const step = windowHours * 3600000 * 0.5; // 50% overlap per step
    const goBack = () => setWindowEnd(e => Math.max(dataStart + windowHours * 3600000, e - step));
    const goForward = () => setWindowEnd(e => Math.min(dataEnd, e + step));
    const goFirst = () => setWindowEnd(dataStart + windowHours * 3600000);
    const goLast = () => setWindowEnd(dataEnd);
    // Navigator position: percentage of total range
    const navLeft = totalDuration > 0 ? ((windowStart - dataStart) / totalDuration) * 100 : 0;
    const navWidth = totalDuration > 0 ? (windowHours * 3600000 / totalDuration) * 100 : 100;
    const makeTagChartOptions = (tag, idx) => {
        // Slice data to current window (expand slightly for context)
        const padding = windowHours * 3600000 * 0.05;
        const windowedData = tag.data.filter(([t]) => t >= windowStart - padding && t <= clampedEnd + padding);
        const displayData = windowedData.length > 0 ? windowedData : tag.data;
        const values = tag.data.map(([, v]) => v); // Use full data for threshold calc
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const std = Math.sqrt(values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length);
        const minThreshold = mean - 1.5 * std;
        const maxThreshold = mean + 1.5 * std;
        const color = TAG_COLORS[idx % TAG_COLORS.length];
        // Find deviation windows within the windowed range
        const deviationRanges = [];
        let devStart = null;
        displayData.forEach(([t, v]) => {
            const isDeviated = v < minThreshold || v > maxThreshold;
            if (isDeviated && devStart === null)
                devStart = t;
            else if (!isDeviated && devStart !== null) {
                deviationRanges.push({ from: devStart, to: t });
                devStart = null;
            }
        });
        if (devStart !== null && displayData.length > 0)
            deviationRanges.push({ from: devStart, to: displayData[displayData.length - 1][0] });
        const isDeviated = deviationRanges.length > 0;
        return {
            chart: {
                type: 'line',
                height: 120,
                backgroundColor: 'transparent',
                style: { fontFamily: 'inherit' },
                spacing: [6, 16, 6, 6],
                animation: { duration: 300 }
            },
            title: { text: '' },
            credits: { enabled: false },
            legend: { enabled: false },
            xAxis: {
                type: 'datetime',
                min: windowStart,
                max: clampedEnd,
                labels: { style: { fontSize: '8px', color: '#94a3b8' }, format: '{value:%H:%M}' },
                lineColor: '#e2e8f0',
                tickColor: '#e2e8f0',
                plotBands: deviationRanges.map(r => ({
                    from: r.from,
                    to: r.to,
                    color: `${color}20`,
                    borderWidth: 1,
                    borderColor: `${color}55`,
                })),
            },
            yAxis: {
                title: { text: '' },
                labels: { style: { fontSize: '8px', color: '#94a3b8' }, x: -4 },
                gridLineColor: '#f1f5f9',
                plotLines: [
                    { value: minThreshold, color: '#f97316', width: 1.2, dashStyle: 'ShortDash', zIndex: 5, label: { text: 'Min', align: 'right', style: { fontSize: '7px', color: '#f97316' } } },
                    { value: maxThreshold, color: '#ef4444', width: 1.2, dashStyle: 'ShortDash', zIndex: 5, label: { text: 'Max', align: 'right', style: { fontSize: '7px', color: '#ef4444' } } },
                ]
            },
            tooltip: {
                shared: false,
                valueDecimals: 3,
                style: { fontSize: '10px' },
                backgroundColor: 'rgba(255,255,255,0.97)',
                borderColor: '#e2e8f0',
                shadow: true,
                xDateFormat: '%d %b %H:%M:%S',
            },
            series: [{
                    type: 'line',
                    name: tag.name,
                    data: displayData,
                    color: isDeviated ? color : '#94a3b8',
                    lineWidth: 1.5,
                    marker: { enabled: false },
                    states: { hover: { lineWidth: 2.5 } },
                    zones: deviationRanges.flatMap(r => [
                        { value: r.from, color: '#94a3b8' },
                        { value: r.to, color }
                    ])
                }],
        };
    };
    const deviationCount = tags.filter(tag => {
        const values = tag.data.map(([, v]) => v);
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const std = Math.sqrt(values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length);
        const min = mean - 1.5 * std;
        const max = mean + 1.5 * std;
        return tag.data.some(([t, v]) => t >= windowStart && t <= clampedEnd && (v < min || v > max));
    }).length;
    return (<div className="flex flex-col h-full bg-white overflow-hidden">
            {/* ── Time Window Toolbar ── */}
            <div className="shrink-0 border-b border-border bg-canvas px-3 py-2 flex items-center gap-3 flex-wrap">
                {/* Window timestamps */}
                <div className="flex items-center gap-1.5 text-[10px] font-black text-text-secondary bg-white border border-border rounded-lg px-2.5 py-1 shadow-sm">
                    <span className="text-text-subtle">▶</span>
                    <span>{formatTs(windowStart)}</span>
                    <span className="text-text-subtle mx-1">—</span>
                    <span>{formatTs(clampedEnd)}</span>
                    <span className="text-text-subtle">◀</span>
                </div>

                {/* Navigation */}
                <div className="flex items-center bg-white border border-border rounded-lg overflow-hidden shadow-sm">
                    <button onClick={goFirst} title="First" className="px-2 py-1.5 text-text-muted hover:bg-canvas hover:text-brand text-[11px] font-black border-r border-border transition-colors">⏮</button>
                    <button onClick={goBack} title="Previous" className="px-2 py-1.5 text-text-muted hover:bg-canvas hover:text-brand text-[11px] font-black border-r border-border transition-colors">◀</button>
                    <span className="px-2.5 py-1.5 text-[9px] font-black text-text-muted uppercase tracking-wider bg-canvas border-r border-border">
                        {windowHours < 24 ? `${windowHours}H` : '1D'}
                    </span>
                    <button onClick={goForward} title="Next" className="px-2 py-1.5 text-text-muted hover:bg-canvas hover:text-brand text-[11px] font-black border-r border-border transition-colors">▶</button>
                    <button onClick={goLast} title="Latest" className="px-2 py-1.5 text-text-muted hover:bg-canvas hover:text-brand text-[11px] font-black transition-colors">⏭</button>
                </div>

                {/* Duration Presets */}
                <div className="flex items-center gap-1">
                    {WINDOW_PRESETS.map(p => (<button key={p.label} onClick={() => { setWindowHours(p.hours); setWindowEnd(dataEnd); }} className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${windowHours === p.hours
                ? 'bg-brand text-white shadow-sm shadow-brand/20'
                : 'bg-white text-text-muted border border-border hover:border-brand hover:text-brand'}`}>
                            {p.label}
                        </button>))}
                </div>

                {/* Deviation count badge */}
                <div className="ml-auto flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider">
                    {deviationCount > 0 ? (<span className="px-2.5 py-1 bg-warning/10 text-warning border border-warning/20 rounded-full">
                            ⚠ {deviationCount} Deviated in Window
                        </span>) : (<span className="px-2.5 py-1 bg-success/10 text-success border border-success/20 rounded-full">
                            ✓ No Deviations
                        </span>)}
                </div>
            </div>

            {/* ── Mini Navigator Bar ── */}
            {totalDuration > 0 && (<div className="shrink-0 px-3 py-1.5 border-b border-border bg-white">
                    <div className="flex items-center gap-2 text-[8px] font-bold text-text-subtle mb-1">
                        <span>{formatTs(dataStart)}</span>
                        <div id="timeline-navigator-bar-investigation" className="flex-1 relative h-5 bg-surface-2 rounded-full overflow-hidden cursor-pointer" onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickPct = (e.clientX - rect.left) / rect.width;
                const clickTs = dataStart + clickPct * totalDuration;
                setWindowEnd(Math.min(dataEnd, Math.max(dataStart + windowHours * 3600000, clickTs + windowHours * 3600000 / 2)));
            }}>
                            {/* Background tag sparklines */}
                            <div className="absolute inset-0 flex items-end px-0.5">
                                {tags.slice(0, 3).map((tag, i) => {
                const vals = tag.data.map(([, v]) => v);
                const minV = Math.min(...vals);
                const maxV = Math.max(...vals);
                const range = maxV - minV || 1;
                return (<svg key={tag.name} className="flex-1 h-full" preserveAspectRatio="none" viewBox={`0 0 100 20`}>
                                            <polyline fill="none" stroke={TAG_COLORS[i % TAG_COLORS.length]} strokeWidth="1" strokeOpacity="0.5" points={tag.data.map(([t, v], j) => {
                        const x = ((t - dataStart) / totalDuration) * 100;
                        const y = 20 - ((v - minV) / range) * 18;
                        return `${x},${y}`;
                    }).join(' ')}/>
                                        </svg>);
            })}
                            </div>
                            {/* Selection window highlight */}
                            <div className="absolute top-0 bottom-0 bg-brand/20 border-x-2 border-brand rounded transition-all duration-150" style={{ left: `${Math.max(0, Math.min(navLeft, 100 - navWidth))}%`, width: `${Math.min(navWidth, 100)}%`, cursor: 'grab' }} onMouseDown={e => handleNavigatorMouseDown(e, 'center')}>
                                <div className="absolute top-0 bottom-0 cursor-col-resize z-10" style={{ left: -6, width: 12 }} onMouseDown={e => handleNavigatorMouseDown(e, 'left')}/>
                                <div className="absolute top-0 bottom-0 cursor-col-resize z-10" style={{ right: -6, width: 12 }} onMouseDown={e => handleNavigatorMouseDown(e, 'right')}/>
                            </div>
                        </div>
                        <span>{formatTs(dataEnd)}</span>
                    </div>
                </div>)}

            {/* ── Tag Charts List ── */}
            <div className="flex-1 overflow-y-auto">
                {tags.length === 0 ? (<div className="h-full flex items-center justify-center text-text-subtle text-[12px] font-bold uppercase tracking-widest italic">
                        No tag trends available
                    </div>) : (<div className="divide-y divide-border">
                        {tags.map((tag, idx) => {
                const values = tag.data.map(([, v]) => v);
                const mean = values.reduce((a, b) => a + b, 0) / values.length;
                const std = Math.sqrt(values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length);
                const minTh = mean - 1.5 * std;
                const maxTh = mean + 1.5 * std;
                const isDeviatedInWindow = tag.data.some(([t, v]) => t >= windowStart && t <= clampedEnd && (v < minTh || v > maxTh));
                return (<div key={tag.name} className="flex items-stretch">
                                    {/* Tag label */}
                                    <div className="w-36 shrink-0 flex flex-col justify-center px-3 py-1 bg-canvas border-r border-border">
                                        <span className="text-[9px] font-black text-text-subtle uppercase tracking-widest leading-none mb-0.5">TAG</span>
                                        <span className="text-[11px] font-black text-text-primary tracking-tight leading-snug break-all">{tag.name}</span>
                                        <span className={`mt-1 text-[8px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full w-fit border ${isDeviatedInWindow
                        ? 'bg-warning/10 text-warning border-warning/20'
                        : 'bg-success/10 text-success border-success/20'}`}>
                                            {isDeviatedInWindow ? '⚠ Deviated' : '✓ Normal'}
                                        </span>
                                    </div>
                                    {/* Chart */}
                                    <div onDoubleClick={resetZoom} className="flex-1 min-w-0 cursor-pointer">
                                        <HighchartsChart options={makeTagChartOptions(tag, idx)}/>
                                    </div>
                                </div>);
            })}
                    </div>)}
            </div>
        </div>);
}
// ── Scenario Constants ──
const SCENARIO_LIBRARY = [
    { id: 1, name: 'Scenario A', date: '2026-03-23 00:00:00', match: '96%' },
    { id: 2, name: 'Scenario B', date: '2026-02-15 00:00:00', match: '84%' },
];
const ScenarioTable = ({ selectedRow, setSelectedRow }) => (<div className="flex-1 overflow-auto">
        <table className="w-full text-[11px] text-left border-collapse">
            <thead className="sticky top-0 bg-surface-2 z-10 border-b border-black">
                <tr>
                    <th className="px-4 py-2 font-bold uppercase text-text-muted tracking-wider">Scenario</th>
                    <th className="px-4 py-2 font-bold uppercase text-text-muted tracking-wider">Date</th>
                    <th className="px-4 py-2 font-bold uppercase text-text-muted tracking-wider text-center">Match</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
                {SCENARIO_LIBRARY.map((row) => (<tr key={row.id} onClick={() => setSelectedRow(selectedRow === row.id ? null : row.id)} className={`cursor-pointer transition-colors group ${selectedRow === row.id ? 'bg-brand-muted/50' : 'hover:bg-canvas'}`}>
                        <td className={`px-4 py-3 font-bold transition-colors ${selectedRow === row.id ? 'text-brand' : 'text-text-secondary group-hover:text-brand'}`}>
                            {row.name}
                        </td>
                        <td className="px-4 py-3 text-text-subtle">{row.date}</td>
                        <td className="px-4 py-3 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${selectedRow === row.id ? 'bg-success text-white border-success' : 'bg-success/10 text-success border-success/20'}`}>
                                {row.match}
                            </span>
                        </td>
                    </tr>))}
            </tbody>
        </table>
    </div>);
function SimilarScenarioContainer({ page, data, loading, error, liveStartTime, selectedScenarioId, setSelectedRow }) {
    const [expandedIndex, setExpandedIndex] = useState(null);
    const [historicalData, setHistoricalData] = useState([]);
    const [historicalLoading, setHistoricalLoading] = useState(false);
    const [historicalError, setHistoricalError] = useState(null);
    const chartsPerPage = 4;
    const fetchHistoricalData = async () => {
        setHistoricalLoading(true);
        setHistoricalError(null);
        // getVisualData disabled — industrial-data removed from cpcp-configuration.
        try {
            // const end = new Date(scenarioDate.replace(' ', 'T'));
            // const start = new Date(end.getTime());
            // start.setHours(end.getHours() - 6);
            // const formatDate = (date) => {
            //     const pad = (n) => n.toString().padStart(2, '0');
            //     return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
            //         `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
            // };
            // const endStr = formatDate(end);
            // const startStr = formatDate(start);
            // const fetchPromises = INVESTIGATION_TAGS.map(async (tag) => {
            //     try {
            //         const body = await getVisualData({
            //             start: startStr,
            //             end: endStr,
            //             tags: [tag],
            //             dashboard_name: "api",
            //         });
            //         if (body.statusCode === 200) {
            //             const graphs = (body.data || [])
            //                 .filter((item) => item.tagGraph)
            //                 .flatMap((item) => item.tagGraph);
            //             return graphs.map((g) => ({
            //                 name: g.name.split('.').pop() || g.name,
            //                 color: '#475569', // Consistent historical color
            //                 data: (g.x || []).map((xVal, idx) => [
            //                     new Date(xVal.replace(' ', 'T')).getTime(),
            //                     g.y[idx]
            //                 ])
            //             }))[0] || null;
            //         }
            //     }
            //     catch (err) {
            //     }
            //     return [];
            // });
            // const results = await Promise.all(fetchPromises);
            // const validData = results.map(r => r || { name: 'Unknown', color: '#475569', data: [] });
            // // Timestamp Shifting Logic: Align historical start with live start
            // if (liveStartTime && validData.length > 0) {
            //     const histStart = start.getTime();
            //     const shift = liveStartTime - histStart;
            //     const shiftedResults = validData.map(graph => ({
            //         ...graph,
            //         data: graph.data.map(([ts, val]) => [ts + shift, val])
            //     }));
            //     setHistoricalData(shiftedResults);
            // }
            // else {
            //     setHistoricalData(validData);
            // }
            setHistoricalData([]);
        }
        catch (err) {
            setHistoricalError('Failed to sync historical data');
        }
        finally {
            setHistoricalLoading(false);
        }
    };
    useEffect(() => {
        if (selectedScenarioId) {
            const scenario = SCENARIO_LIBRARY.find(s => s.id === selectedScenarioId);
            if (scenario)
                fetchHistoricalData(scenario.date);
        }
        else {
            setHistoricalData([]);
        }
    }, [selectedScenarioId, liveStartTime]);
    const makeChartOptions = (current, historical, isExpanded = false) => ({
        chart: { height: isExpanded ? 320 : 160, backgroundColor: 'transparent', style: { fontFamily: 'inherit' }, spacingTop: 10, spacingBottom: 5 },
        title: { text: current.name, style: { fontSize: isExpanded ? '14px' : '10px', fontWeight: '800', color: '#1e293b' }, align: 'left' },
        credits: { enabled: false },
        legend: {
            enabled: !!historical,
            align: 'right',
            verticalAlign: 'top',
            layout: 'horizontal',
            itemStyle: { fontSize: isExpanded ? '10px' : '8px', color: '#64748b' },
            itemDistance: 10,
            symbolHeight: 6,
            symbolWidth: 10
        },
        xAxis: { type: 'datetime', labels: { style: { fontSize: isExpanded ? '10px' : '8px', color: '#64748b' } }, lineColor: '#e2e8f0', tickColor: '#e2e8f0' },
        yAxis: { title: { text: '' }, labels: { style: { fontSize: isExpanded ? '10px' : '8px', color: '#64748b' } }, gridLineColor: '#f1f5f9' },
        tooltip: { shared: true, valueDecimals: 2, style: { fontSize: isExpanded ? '11px' : '9px' } },
        series: [
            { type: 'line', name: 'Current', data: current.data, color: current.color, lineWidth: isExpanded ? 3.5 : 2.5, marker: { enabled: false }, zIndex: 2 },
            ...(historical ? [{
                    type: 'line',
                    name: 'Historical Pattern',
                    data: historical.data,
                    color: '#475569',
                    lineWidth: isExpanded ? 3 : 2,
                    dashStyle: 'Dash',
                    opacity: 1,
                    marker: { enabled: false },
                    zIndex: 1
                }] : [])
        ],
    });
    return (<div className="flex flex-col h-full bg-white overflow-hidden relative">


            {loading ? (<div className="flex-1 flex flex-col items-center justify-center bg-canvas/50">
                    <img src="/images/Aivee_timer.gif" alt="Loading..." className="w-40 h-40  object-contain"/>
                </div>) : error ? (<div className="flex-1 flex flex-col items-center justify-center bg-canvas/50 p-6 text-center">
                    <div className="w-12 h-12 bg-danger/10 rounded-full flex items-center justify-center mb-3">
                        <X className="w-6 h-6 text-danger"/>
                    </div>
                    <h3 className="text-[16px] font-bold text-text-primary mb-1">Trends Sync Failed</h3>
                    <p className="text-[14px] text-text-muted max-w-[200px]">{error}</p>
                </div>) : (<div className="flex h-full bg-white overflow-hidden relative">
                    <div className="flex-1 p-3 grid grid-cols-2 grid-rows-2 gap-2 bg-canvas/50 relative">
                        {data.slice(page * chartsPerPage, (page + 1) * chartsPerPage).map((s, localIdx) => {
                const i = page * chartsPerPage + localIdx;
                return (<div key={i} className="group relative bg-white border border-black rounded-lg overflow-hidden transition-all shadow-sm flex flex-col hover:shadow-md">
                                    <button onClick={(e) => { e.stopPropagation(); setExpandedIndex(i); }} className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur-sm border border-black rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-all z-10 hover:bg-canvas text-text-muted hover:text-brand cursor-pointer" title="Expand Chart">
                                        <Maximize2 className="w-3.5 h-3.5"/>
                                    </button>

                                    <div className="flex-1 min-h-0">
                                        <HighchartsChart options={makeChartOptions(s, historicalData[i] || null)}/>
                                    </div>
                                </div>);
            })}
                        {data.length === 0 && (<div className="col-span-2 row-span-2 flex items-center justify-center text-text-subtle text-[14px] italic">
                                No parameter trends to display
                            </div>)}
                    </div>

                    <div className="w-1/3 border-l border-black bg-white flex flex-col">
                        <ScenarioTable selectedRow={selectedScenarioId} setSelectedRow={setSelectedRow}/>
                        {historicalLoading && (<div className="p-2 w-full bg-brand-muted/50 border-t border-black flex items-center justify-center">
                                <img src="/images/Aivee_timer.gif" alt="Loading..." className="w-10 h-10 object-contain"/>
                            </div>)}
                        {historicalError && (<div className="p-2 w-full bg-danger/10 border-t border-black text-center">
                                <span className="text-[9px] font-bold text-danger uppercase">{historicalError}</span>
                            </div>)}
                    </div>
                </div>)}

            {expandedIndex !== null && data[expandedIndex] && (<div className="absolute inset-0 z-[50] flex bg-white animate-in fade-in duration-200 shadow-xl border border-black">
                    <div className="flex-1 pr-8 border-r border-black/10 flex flex-col justify-between relative p-4 lg:p-6">
                        <button onClick={() => setExpandedIndex(null)} className="absolute right-4 top-0 p-2 border border-black rounded-xl bg-white hover:bg-surface-2 text-text-subtle hover:text-text-secondary transition-all z-50 shadow-sm">
                            <Minimize2 className="w-5 h-5"/>
                        </button>
                        <div className="flex-1 min-h-0 pt-2">
                            <HighchartsChart options={makeChartOptions(data[expandedIndex], historicalData[expandedIndex] || null, true)}/>
                        </div>
                    </div>
                </div>)}
        </div>);
}
// ── Ishikawa / Fault Tree Container ──
function IshikawaFaultTreeContainer({ view, reportData }) {
    if (!reportData)
        return <div className="h-full flex items-center justify-center text-text-subtle font-bold uppercase tracking-widest text-[10px]">Loading Diagnostic Engine...</div>;
    const effect = reportData.ishikawa_diagram?.Effect || "COMPRESSOR INSTABILITY";
    const ishikawa = reportData.ishikawa_diagram || {};
    const fta = reportData.Fault_Tree_Analysis || {};
    const branches = [
        { label: 'MANPOWER', items: ishikawa["Man Power"] || [] },
        { label: 'METHOD', items: ishikawa["Method"] || [] },
        { label: 'MACHINE', items: ishikawa["Machine"] || [] },
        { label: 'MATERIAL', items: ishikawa["Material"] || [] },
        { label: 'ENVIRONMENT', items: ishikawa["Environment"] || [] },
    ];
    return (<div className="flex flex-col h-full bg-white">
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center">
                {view === 'ishikawa' ? (<svg viewBox="0 0 800 320" className="w-full h-full max-h-[480px]">
                        {/* Spine */}
                        <line x1="40" y1="160" x2="720" y2="160" stroke="#1e293b" strokeWidth="4"/>
                        <polygon points="720,152 745,160 720,168" fill="#1e293b"/>
                        <text x="715" y="145" textAnchor="end" className="text-[12px] font-black fill-text-primary uppercase whitespace-nowrap">High Discharge Pressure & Temperature / Compressor Instability</text>
                        <text x="750" y="165" className="text-[14px] font-black fill-text-primary whitespace-nowrap">EFFECT</text>

                        {/* Top branches */}
                        {branches.slice(0, 3).map((b, i) => (<g key={i}>
                                <line x1={160 + i * 180} y1="160" x2={160 + i * 180 - 50} y2="40" stroke="#64748b" strokeWidth="3"/>
                                <text x={160 + i * 180 - 65} y="25" className="text-[13px] font-extrabold fill-brand uppercase">{b.label}</text>
                                {b.items.map((item, j) => (<g key={j}>
                                        <line x1={160 + i * 180 - 20 - j * 10} y1={110 - j * 16} x2={160 + i * 180 - 55 - j * 10} y2={90 - j * 16} stroke="#94a3b8" strokeWidth="2"/>
                                        <text x={160 + i * 180 - 60 - j * 10} y={88 - j * 16} textAnchor="end" className="text-[9px] font-bold fill-text-muted">{item}</text>
                                    </g>))}
                            </g>))}

                        {/* Bottom branches */}
                        {branches.slice(3).map((b, i) => (<g key={i}>
                                <line x1={260 + i * 220} y1="160" x2={260 + i * 220 - 50} y2="280" stroke="#64748b" strokeWidth="3"/>
                                <text x={260 + i * 220 - 65} y="305" className="text-[13px] font-extrabold fill-brand uppercase">{b.label}</text>
                                {b.items.map((item, j) => (<g key={j}>
                                        <line x1={260 + i * 220 - 15 - j * 10} y1={210 + j * 18} x2={260 + i * 220 - 55 - j * 10} y2={235 + j * 18} stroke="#94a3b8" strokeWidth="2"/>
                                        <text x={260 + i * 220 - 60 - j * 10} y={240 + j * 18} textAnchor="end" className="text-[9px] font-bold fill-text-muted">{item}</text>
                                    </g>))}
                            </g>))}


                    </svg>) : (<svg viewBox="0 0 800 360" className="w-full h-full max-h-[480px]">
                        {/* Top event */}
                        <rect x="250" y="10" width="300" height="40" rx="8" fill="#ef4444" stroke="#dc2626" strokeWidth="2.5"/>
                        <text x="400" y="36" textAnchor="middle" className="text-[14px] font-extrabold fill-white uppercase italic">High Discharge Pressure & Temperature</text>

                        {/* OR gate */}
                        <line x1="400" y1="50" x2="400" y2="75" stroke="#475569" strokeWidth="2.5"/>
                        <circle cx="400" cy="85" r="12" fill="#f8fafc" stroke="#475569" strokeWidth="2"/>
                        <text x="400" y="89" textAnchor="middle" className="text-[9px] font-black fill-text-primary">OR</text>

                        {/* Level 1 Branches */}
                        <line x1="400" y1="97" x2="200" y2="130" stroke="#475569" strokeWidth="2"/>
                        <line x1="400" y1="97" x2="600" y2="130" stroke="#475569" strokeWidth="2"/>

                        {/* Level 1: Injection System Fault */}
                        <rect x="100" y="130" width="200" height="35" rx="6" fill="#fef3c7" stroke="#f59e0b" strokeWidth="2.5"/>
                        <text x="200" y="152" textAnchor="middle" className="text-[11px] font-black fill-warning uppercase">Injection System Fault</text>
                        <line x1="200" y1="165" x2="200" y2="190" stroke="#475569" strokeWidth="2"/>
                        <circle cx="200" cy="198" r="10" fill="#f8fafc" stroke="#475569" strokeWidth="1.5"/>
                        <text x="200" y="202" textAnchor="middle" className="text-[8.5px] font-black fill-text-secondary">OR</text>
                        <line x1="200" y1="208" x2="110" y2="235" stroke="#475569" strokeWidth="1.5"/>
                        <line x1="200" y1="208" x2="290" y2="235" stroke="#475569" strokeWidth="1.5"/>

                        <rect x="45" y="235" width="130" height="45" rx="5" fill="#e0f2fe" stroke="#0ea5e9" strokeWidth="1.5"/>
                        <text x="110" y="254" textAnchor="middle" className="text-[10px] font-extrabold fill-info">Flow Restriction</text>
                        <text x="110" y="268" textAnchor="middle" className="text-[9px] font-black fill-brand uppercase tracking-wider">RINJ_IN_DP</text>

                        <rect x="225" y="235" width="130" height="45" rx="5" fill="#e0f2fe" stroke="#0ea5e9" strokeWidth="1.5"/>
                        <text x="290" y="254" textAnchor="middle" className="text-[10px] font-extrabold fill-info">Suction Instability</text>
                        <text x="290" y="268" textAnchor="middle" className="text-[9px] font-black fill-brand uppercase tracking-wider">RINJ_SUC_P</text>

                        {/* Level 1: Compression Imbalance */}
                        <rect x="500" y="130" width="200" height="35" rx="6" fill="#fef3c7" stroke="#f59e0b" strokeWidth="2.5"/>
                        <text x="600" y="152" textAnchor="middle" className="text-[11px] font-black fill-warning uppercase">Compression Imbalance</text>
                        <line x1="600" y1="165" x2="600" y2="190" stroke="#475569" strokeWidth="2"/>
                        <circle cx="600" cy="198" r="10" fill="#f8fafc" stroke="#475569" strokeWidth="1.5"/>
                        <text x="600" y="202" textAnchor="middle" className="text-[8.5px] font-black fill-text-secondary">OR</text>

                        <line x1="600" y1="208" x2="480" y2="235" stroke="#475569" strokeWidth="1.5"/>
                        <line x1="600" y1="208" x2="600" y2="235" stroke="#475569" strokeWidth="1.5"/>
                        <line x1="600" y1="208" x2="720" y2="235" stroke="#475569" strokeWidth="1.5"/>

                        <rect x="420" y="235" width="120" height="45" rx="5" fill="#e0f2fe" stroke="#0ea5e9" strokeWidth="1.5"/>
                        <text x="480" y="254" textAnchor="middle" className="text-[10px] font-extrabold fill-info">High Discharge P</text>
                        <text x="480" y="268" textAnchor="middle" className="text-[9px] font-black fill-brand uppercase tracking-wider">RINJ_DIS_P</text>

                        <rect x="540" y="235" width="120" height="45" rx="5" fill="#e0f2fe" stroke="#0ea5e9" strokeWidth="1.5"/>
                        <text x="600" y="254" textAnchor="middle" className="text-[10px] font-extrabold fill-info">Thermal Rise</text>
                        <text x="600" y="268" textAnchor="middle" className="text-[9px] font-black fill-brand uppercase tracking-wider">RINJ_DIS_T</text>

                        <rect x="660" y="235" width="120" height="45" rx="5" fill="#e0f2fe" stroke="#0ea5e9" strokeWidth="1.5"/>
                        <text x="720" y="254" textAnchor="middle" className="text-[10px] font-extrabold fill-info">Stage Disturbance</text>
                        <text x="720" y="268" textAnchor="middle" className="text-[8px] font-black fill-brand uppercase tracking-wider">EXP_STG2_SUC_P</text>
                    </svg>)}
            </div>
        </div>);
}
// ── Drag-handle panel header for grid items ──
const InvPanelHeader = ({ title, icon: Icon, children }) => (<div className="drag-handle cursor-move p-3 border-b border-black flex items-center bg-canvas rounded-t-xl shrink-0">
        <div className="flex items-center gap-2">
            <GripVertical className="w-4 h-4 text-text-subtle"/>
            {Icon && <Icon className="w-4 h-4 text-brand"/>}
            <h2 className="text-text-primary font-bold text-[16px] tracking-tight">
                {title}
            </h2>
        </div>
        <div className="ml-auto flex items-center gap-3">
            {children}
            <MoreVertical className="w-4 h-4 text-text-subtle cursor-pointer"/>
        </div>
    </div>);
const investigationLayouts = {
    lg: [
        { i: 'timeline', x: 0, y: 0, w: 12, h: 9, minW: 6, minH: 5 },
        { i: 'scenario', x: 0, y: 6, w: 12, h: 5, minW: 6, minH: 3 },
        { i: 'rootcause', x: 0, y: 11, w: 6, h: 4, minW: 3, minH: 2 },
        { i: 'recommendation', x: 6, y: 11, w: 6, h: 4, minW: 3, minH: 2 },
        { i: 'ishikawa', x: 0, y: 15, w: 8, h: 7, minW: 4, minH: 3 },
        { i: 'summary', x: 8, y: 15, w: 4, h: 7, minW: 3, minH: 2 },
    ],
    md: [
        { i: 'timeline', x: 0, y: 0, w: 12, h: 9, minW: 6, minH: 5 },
        { i: 'scenario', x: 0, y: 6, w: 12, h: 5, minW: 6, minH: 3 },
        { i: 'rootcause', x: 0, y: 11, w: 6, h: 4, minW: 3, minH: 2 },
        { i: 'recommendation', x: 6, y: 11, w: 6, h: 4, minW: 3, minH: 2 },
        { i: 'ishikawa', x: 0, y: 15, w: 8, h: 6, minW: 4, minH: 3 },
        { i: 'summary', x: 8, y: 15, w: 4, h: 6, minW: 3, minH: 2 },
    ],
};
// ──────────────────────────────── MAIN PAGE ────────────────────────────────
function InvestigationContent({ params }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const equipmentId = params.id;
    const equipmentName = EQUIPMENT_MAP[equipmentId] || 'Equipment';
    const referenceEndTime = searchParams.get('endTime') || undefined;
    const { width, containerRef, mounted } = useContainerWidth();
    const [layouts, setLayouts] = useState(investigationLayouts);
    const [timelineView, setTimelineView] = useState('timeline');
    const [ishikawaView, setIshikawaView] = useState('ishikawa');
    const [page, setPage] = useState(0);
    // API state for investigation data
    const [invData, setInvData] = useState([]);
    const [invLoading, setInvLoading] = useState(false);
    const [invError, setInvError] = useState(null);
    const [liveStartTime, setLiveStartTime] = useState(null);
    const [selectedScenarioId, setSelectedScenarioId] = useState(null);
    const [report, setReport] = useState(null);
    const [reportLoading, setReportLoading] = useState(false);
    const range = useTimeRange();
    const fetchInvestigationData = useCallback(async () => {
        // Fetch Trends — getVisualData disabled, industrial-data removed from cpcp-configuration.
        setInvLoading(true);
        setInvError(null);
        try {
            const start = range.start;
            setLiveStartTime(start.getTime());
            // const end = range.end;
            // const formatDate = (date) => {
            //     const pad = (n) => n.toString().padStart(2, '0');
            //     return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
            //         `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
            // };
            // const endStr = formatDate(end);
            // const startStr = formatDate(start);
            // const fetchPromises = INVESTIGATION_TAGS.map(async (tagName) => {
            //     try {
            //         const body = await getVisualData({
            //             start: startStr,
            //             end: endStr,
            //             tags: [tagName],
            //             dashboard_name: "api",
            //         });
            //         if (body.statusCode === 200) {
            //             const tagGraph = (body.data || [])
            //                 .filter((item) => item.tagGraph)
            //                 .flatMap((item) => item.tagGraph);
            //             return tagGraph.map((g) => ({
            //                 name: g.name.split('.').pop() || g.name,
            //                 color: g.line?.color || '#3b82f6',
            //                 data: (g.x || []).map((xVal, idx) => [
            //                     new Date(xVal.replace(' ', 'T')).getTime(),
            //                     g.y[idx]
            //                 ])
            //             }))[0] || null;
            //         }
            //     }
            //     catch (err) {
            //     }
            //     return null;
            // });
            // const results = await Promise.all(fetchPromises);
            const results = INVESTIGATION_TAGS.map(() => null);
            const validData = results.map((r, i) => r || {
                name: INVESTIGATION_TAGS[i],
                color: '#3b82f6',
                data: []
            });
            setInvData(validData);
            if (results.every(r => !r))
                setInvError('No real-time data found for these tags.');
        }
        finally {
            setInvLoading(false);
        }
    }, [range.start]);
    const fetchInvestigationReport = useCallback(async () => {
        const anomalyId = searchParams.get('anomalyId');
        if (!anomalyId)
            return;
        setReportLoading(true);
        // getInvestigationReport disabled — industrial-data removed from cpcp-configuration.
        try {
            // const body = await getInvestigationReport(parseInt(anomalyId.toString().replace('#', ''), 10));
            // if (body.statusCode === 200) {
            //     setReport(body.data);
            // }
        }
        catch (err) {
        }
        finally {
            setReportLoading(false);
        }
    }, [searchParams]);
    useEffect(() => {
        if (mounted) {
            fetchInvestigationData(referenceEndTime);
            fetchInvestigationReport();
        }
    }, [mounted, fetchInvestigationData, fetchInvestigationReport, referenceEndTime]);
    const chartsPerPage = 4;
    const totalPages = Math.ceil(Math.max(invData.length, 1) / chartsPerPage);
    const scenarioPagination = (<div className="flex items-center bg-white border border-black rounded-lg p-0.5 shadow-sm ml-auto">
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className={`p-1 rounded-md transition-all ${page === 0 ? 'text-text-subtle' : 'text-text-secondary hover:bg-canvas hover:text-brand shadow-xs'}`}>
                <ChevronLeft className="w-4 h-4"/>
            </button>
            <div className="w-px h-4 bg-border mx-1"></div>
            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1} className={`p-1 rounded-md transition-all ${page === totalPages - 1 ? 'text-text-subtle' : 'text-text-secondary hover:bg-canvas hover:text-brand shadow-xs'}`}>
                <ChevronRight className="w-4 h-4"/>
            </button>
        </div>);
    const segmentedTabs = (view, setView, opt1, opt2, label1, label2) => (<div className="flex bg-surface-2/60 p-0.5 rounded-lg cursor-default pointer-events-auto" onPointerDown={e => e.stopPropagation()} onMouseDown={e => e.stopPropagation()}>
            <button onClick={() => setView(opt1)} className={`px-3 py-1 text-[10px] font-extrabold rounded-md transition-all ${view === opt1 ? 'bg-white shadow-sm text-brand' : 'text-text-muted hover:text-text-secondary'}`}>{label1}</button>
            <button onClick={() => setView(opt2)} className={`px-3 py-1 text-[10px] font-extrabold rounded-md transition-all ${view === opt2 ? 'bg-white shadow-sm text-brand' : 'text-text-muted hover:text-text-secondary'}`}>{label2}</button>
        </div>);
    // ─── No Sidebar/Main shell here anymore ───
    return (<div className="absolute inset-0 p-6 overflow-y-auto" ref={containerRef}>
            {mounted && (<ResponsiveGridLayout width={width} layouts={layouts} onLayoutChange={(_, allLayouts) => setLayouts(allLayouts)} breakpoints={{ lg: 1200, md: 996 }} cols={{ lg: 12, md: 12 }} rowHeight={80} dragConfig={{ handle: '.drag-handle' }} margin={[24, 24]}>
                    {/* Timeline / Table */}
                    <div key="timeline" className="bg-white rounded-xl border border-black shadow-sm overflow-visible flex flex-col relative">
                        {reportLoading && (<div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] z-50 flex items-center justify-center rounded-xl">
                                <img src="/images/Aivee_timer.gif" alt="Loading..." className="w-100 h-100 object-contain"/>
                            </div>)}
                        <InvPanelHeader title="Sequence of Events" icon={Clock}>
                            {segmentedTabs(timelineView, setTimelineView, 'timeline', 'table', 'Timeline', 'Table')}
                        </InvPanelHeader>
                        <div className="flex-1 overflow-visible">
                            <TimelineTableContainer view={timelineView} referenceEndTime={referenceEndTime} reportData={report?.Timeline_of_Events}/>
                        </div>
                    </div>



                    {/* Similar Scenarios */}
                    <div key="scenario" className="bg-white rounded-xl border border-black shadow-sm overflow-hidden flex flex-col">
                        <InvPanelHeader title="Similar Scenarios" icon={Activity}>
                            {scenarioPagination}
                        </InvPanelHeader>
                        <div className="flex-1 overflow-hidden">
                            <SimilarScenarioContainer page={page} data={invData} loading={invLoading} error={invError} liveStartTime={liveStartTime} selectedScenarioId={selectedScenarioId} setSelectedRow={setSelectedScenarioId}/>
                        </div>
                    </div>

                    {/* Possible Root Causes */}
                    <div key="rootcause" className="bg-white rounded-xl border border-black shadow-sm overflow-hidden flex flex-col relative">
                        {reportLoading && (<div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] z-50 flex items-center justify-center rounded-xl">
                                <img src="/images/Aivee_timer.gif" alt="Loading..." className="w-40 h-40  object-contain"/>
                            </div>)}
                        <InvPanelHeader title="Possible Root Causes" icon={GitBranch}/>
                        <div className="flex-1 p-4 overflow-y-auto">
                            <ul className="space-y-3">
                                {(report?.possible_root_causes || ['Partial flow restriction in injection line', 'Thermal fluctuation in exhaust system', 'Increase in RINJ_DIS_T points to minor thermal rise during compression']).map((cause, i) => (<li key={i} className="flex items-start gap-3 text-[16px] text-text-secondary leading-relaxed italic">
                                        <span className="mt-0.5 flex items-center justify-center w-5 h-5 rounded-full bg-warning/10 text-warning text-[10px] font-black shrink-0 border border-warning/20">{i + 1}</span>
                                        {cause}
                                    </li>))}
                            </ul>
                        </div>
                    </div>

                    {/* Recommendations */}
                    <div key="recommendation" className="bg-white rounded-xl border border-black shadow-sm overflow-hidden flex flex-col relative">
                        {reportLoading && (<div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] z-50 flex items-center justify-center rounded-xl">
                                <img src="/images/Aivee_timer.gif" alt="Loading..." className="w-40 h-40  object-contain"/>
                            </div>)}
                        <InvPanelHeader title="Recommendations" icon={Lightbulb}/>
                        <div className="flex-1 p-4 overflow-y-auto">
                            <ul className="space-y-3">
                                {(report?.recommendations || ['Inspect Suction & Injection Line', 'Review anti-surge valve response time and adjust control parameters', 'Schedule immediate bearing inspection and replacement if worn beyond tolerance']).map((rec, i) => (<li key={i} className="flex items-start gap-3 text-[16px] text-text-secondary leading-relaxed font-bold">
                                        <span className="mt-0.5 flex items-center justify-center w-5 h-5 rounded-full bg-brand-muted text-brand text-[10px] font-black shrink-0 border border-brand/20">{i + 1}</span>
                                        {rec}
                                    </li>))}
                            </ul>
                        </div>
                    </div>

                    {/* Summary */}
                    <div key="summary" className="bg-white rounded-xl border border-black shadow-sm overflow-hidden flex flex-col relative">
                        {reportLoading && (<div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] z-50 flex items-center justify-center">
                                <img src="/images/Aivee_timer.gif" alt="Loading..." className="w-40 h-40  object-contain"/>
                            </div>)}
                        <InvPanelHeader title="Summary" icon={FileText}/>
                        <div className="flex-1 p-4 overflow-y-auto">
                            <p className="text-[16px] text-text-secondary leading-relaxed mb-3">
                                {report?.Summary || `${equipmentName} exhibited abnormal behaviour. Multiple tags triggered within a window, indicating a cascading event pattern consistent with historical scenarios.`}
                            </p>
                            <div className="p-3 bg-canvas text-text-primary text-[14px] rounded-lg border border-black leading-relaxed font-bold">
                                <Lightbulb className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5 text-brand"/>
                                AI Confidence: <strong>92%</strong> — {selectedScenarioId ? `This event matches Scenario ${SCENARIO_LIBRARY.find(s => s.id === selectedScenarioId)?.name || ''} with high correlation.` : 'Correlating with historical patterns...'}
                            </div>
                        </div>
                    </div>

                    {/* Ishikawa / Fault Tree */}
                    <div key="ishikawa" className="bg-white rounded-xl border border-black shadow-sm overflow-hidden flex flex-col relative">
                        {reportLoading && (<div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] z-50 flex items-center justify-center">
                                <img src="/images/Aivee_timer.gif" alt="Loading..." className="w-40 h-40  object-contain"/>
                            </div>)}
                        <InvPanelHeader title="Ishikawa / Fault Tree" icon={GitBranch}>
                            {segmentedTabs(ishikawaView, setIshikawaView, 'ishikawa', 'fault_tree', 'Ishikawa', 'Fault Tree')}
                        </InvPanelHeader>
                        <div className="flex-1 overflow-hidden">
                            <IshikawaFaultTreeContainer view={ishikawaView} reportData={report}/>
                        </div>
                    </div>

                </ResponsiveGridLayout>)}
        </div>);
}
// ── REPORTS DUMMY CONTENT & RENDERER ──
const REPORT_MARKDOWN = `# Root Cause Analysis Report: Compressor Trip and Loss of Process Containment
 
## Introduction

@[equipmentId:b2401,startTime:2025-02-04 09:00:00,endTime:2025-02-06 23:10:00]@
 
During the period between ||2025-02-04 09:00:00|| and ||2025-02-06 23:10:00||, a critical incident occurred involving compressor system (b2401). The event sequence began with upstream pressure fluctuations leading to RPM instability, followed by differential pressure collapse, sustained thermal deviation for over 24 hours, and ultimately a compressor trip with a loss of process containment leak of 8.3 kg. Key process parameters including stage differential pressures, recycle gas temperature, and compressor speed showed significant deviations from normal operating envelopes.
 
## Findings
 
### Primary Root Cause Identification
- **Root Cause Equipment**: b2401 (Industrial Asset/Compressor System)
- **Equipment Chain Path**: Upstream System → Compressor Stage 1 (b2401) → Compressor Stage 2 (b2401)
- **Investigation Summary**: The primary root cause was identified as upstream pressure fluctuations causing RPM instability, which led to a cascade of differential pressure collapse, flow reduction, and thermal imbalance. Prolonged deviation (>24 hours) combined with delayed operator intervention resulted in mechanical stress and a final LOPC event.


### Analysis
 
#### Compressor System (b2401) – Process Deviation Analysis
1. **RPM Fluctuation & Mechanical Response**
   - Parameter: ^[tagId:[COMP_SPEED],equipmentId:b2401,startTime:2025-02-04 09:00:00,endTime:2025-02-06 23:10:00,plotType:line]^
   - Event: RPM fluctuation started (2025-02-04 09:00:00)
   - Correlation: RPM drop followed by axial displacement spike
 
2. **Stage 1 Differential Pressure Investigation**
   - Parameter: ^[tagId:[EXP_STG1_IN_DP],equipmentId:b2401,startTime:2025-02-04 09:00:00,endTime:2025-02-06 23:10:00,plotType:line]^
   - Observation: DP decline began at 09:20:00, followed by complete flow reduction at stable RPM
   - Impact: Stage 1 DP collapse leading to reduced throughput
 
3. **Stage 2 Differential Pressure & Recycle Temperature**
   - Parameter: ^[tagId:[EXP_STG2_IN_DP],equipmentId:b2401,startTime:2025-02-04 09:00:00,endTime:2025-02-06 23:10:00,plotType:line]^
   - Associated Parameter: ^[tagId:[EXP_STG2_RGAS_T],equipmentId:b2401,startTime:2025-02-04 09:00:00,endTime:2025-02-06 23:10:00,plotType:line]^
   - Observation: Stage 2 DP collapse coincident with recycle gas temperature drop (thermal imbalance)

4. **Suction Temperature Deviations**
   - Stage 1 Suction Temp: ^[tagId:[EXP_STG1_SUC_T],equipmentId:b2401,startTime:2025-02-04 09:00:00,endTime:2025-02-06 23:10:00,plotType:line]^
   - Stage 2 Suction Temp: ^[tagId:[EXP_STG2_SUC_T],equipmentId:b2401,startTime:2025-02-04 09:00:00,endTime:2025-02-06 23:10:00,plotType:line]^
   - Observation: Sustained deviation exceeded 24 hours without recovery

### Supporting Pressure Parameters
- ^[tagId:[EXP_STG1_DIS_P],equipmentId:b2401,startTime:2025-02-04 09:00:00,endTime:2025-02-06 23:10:00,plotType:line]^
- ^[tagId:[EXP_STG2_DIS_P],equipmentId:b2401,startTime:2025-02-04 09:00:00,endTime:2025-02-06 23:10:00,plotType:line]^
- ^[tagId:[EXP_STG2_SUC_P],equipmentId:b2401,startTime:2025-02-04 09:00:00,endTime:2025-02-06 23:10:00,plotType:line]^

### Related System Parameters (RINJ)
- ^[tagId:[RINJ_DIS_P],equipmentId:b2401,startTime:2025-02-04 09:00:00,endTime:2025-02-06 23:10:00,plotType:line]^
- ^[tagId:[RINJ_DIS_T],equipmentId:b2401,startTime:2025-02-04 09:00:00,endTime:2025-02-06 23:10:00,plotType:line]^
- ^[tagId:[RINJ_IN_DP],equipmentId:b2401,startTime:2025-02-04 09:00:00,endTime:2025-02-06 23:10:00,plotType:line]^
- ^[tagId:[RINJ_SUC_P],equipmentId:b2401,startTime:2025-02-04 09:00:00,endTime:2025-02-06 23:10:00,plotType:line]^
 

## Investigation
 
### Supporting Evidence

1. **Event Timeline Correlation**
   - Strong temporal correlation between upstream pressure fluctuation (09:00) and Stage 1 DP decline (09:20)
   - DP collapse and temperature drop occurred simultaneously (09:40)
   - RPM drop with axial displacement spike followed at 09:50
   - Deviation sustained without recovery for >24 hours (until 2025-02-05 18:30)
   - Final flow decline at 2025-02-06 22:30 leading to shutdown and LOPC at 23:10
 
2. **Fault Tree Analysis Validation**
   - Top Event: Compressor Trip & LOPC (8.3 kg leak via 0.4mm orifice, BNCPP-B GTC-B)
   - Contributing paths: Process Deviation (>24h) + Thermal Instability + RPM/Mechanical Stress
   - Root causes traceable to upstream pressure fluctuations and weak disturbance response process
 
3. **Ishikawa Causal Factors**
   - **Man Power**: Delayed operator response, poor upstream-downstream awareness
   - **Machine**: Flow instability (DP collapse), anti-surge delay, axial displacement during RPM fluctuation
   - **Material**: Gas composition variation, cooling performance variation
   - **Method**: Weak disturbance response process, missing feed-forward control
   - **Environment**: Upstream pressure fluctuations, header pressure interactions


### Events Analysis
The event sequence began when upstream pressure fluctuations caused RPM instability at ||2025-02-04 09:00:00||. This led to Stage 1 differential pressure decline at 09:20, followed by a complete DP collapse and recycle gas temperature drop at 09:40. The system experienced an RPM drop with axial displacement spike at 09:50, and the deviation was sustained without recovery. By 2025-02-05 18:30, the deviation had exceeded 24 hours, indicating a chronic rather than transient issue. A secondary flow decline occurred on 2025-02-06 at 22:30, culminating in a compressor trip and LOPC leak of 8.3 kg at 23:10 via a 0.4mm leak path (BNCPP-B GTC-B).
 

## Recommendations
1. **Enable DP Rate-of-Change Alarms**
   Based on the observed Stage 1 DP decline (^[tagId:[EXP_STG1_IN_DP],equipmentId:b2401,startTime:2025-02-04 09:00:00,endTime:2025-02-06 23:10:00,plotType:line]^) and Stage 2 DP collapse (^[tagId:[EXP_STG2_IN_DP],equipmentId:b2401,startTime:2025-02-04 09:00:00,endTime:2025-02-06 23:10:00,plotType:line]^), implement DP rate-of-change alarms with a threshold of >15% drop to enable early detection of flow instability. ($[Data/Datasheet/Compressor b2401.pdf]$)
2. **Optimize Anti-Surge Valve Response**
   Given the repeated DP collapse and flow reduction events, review and optimize anti-surge valve control logic to respond more rapidly to incipient surge conditions, particularly during upstream pressure transients. ($[Data/Datasheet/Compressor b2401.pdf]$)
3. **Add Feed-Forward Control from Upstream Pressure**
   To mitigate the impact of upstream pressure fluctuations (identified as a key environmental factor in the Ishikawa diagram), implement a feed-forward control loop that adjusts compressor operation proactively based on upstream pressure changes. ($[Data/Datasheet/Compressor b2401.pdf]$)
4. **Define Mandatory Intervention & Escalation Rules**
   Address the "Delayed operator response" and "Weak disturbance response process" findings by establishing mandatory intervention rules when deviations persist beyond defined time limits (e.g., 4 hours), with clear escalation pathways to prevent >24-hour sustained deviations as observed in this event. ($[Data/Datasheet/Compressor b2401.pdf]$)
 

## Possible Root Cause
The primary root cause has been identified as **upstream pressure fluctuation leading to RPM drop and instability**, which triggered a cascade of failures. This is evidenced by:
1. RPM fluctuation started at 09:00, immediately followed by Stage 1 DP decline at 09:20 (^[tagId:[EXP_STG1_IN_DP],equipmentId:b2401,startTime:2025-02-04 09:00:00,endTime:2025-02-06 23:10:00,plotType:line]^)
2. Stage 2 DP collapse and recycle gas temperature drop at 09:40 (^[tagId:[EXP_STG2_IN_DP],equipmentId:b2401,startTime:2025-02-04 09:00:00,endTime:2025-02-06 23:10:00,plotType:line]^ and ^[tagId:[EXP_STG2_RGAS_T],equipmentId:b2401,startTime:2025-02-04 09:00:00,endTime:2025-02-06 23:10:00,plotType:line]^)
3. RPM drop with axial displacement spike at 09:50 (^[tagId:[COMP_SPEED],equipmentId:b2401,startTime:2025-02-04 09:00:00,endTime:2025-02-06 23:10:00,plotType:line]^)
4. Prolonged deviation exceeding 24 hours without effective recovery
5. Final shutdown triggered by RPM drop and 8.3 kg LOPC leak (0.4mm orifice, BNCPP-B GTC-B)
 

The event was exacerbated by delayed operator response, missing feed-forward control, and inadequate disturbance response processes. Immediate implementation of the recommended controls is required to prevent recurrence and mitigate LOPC risk.
 `;
const DummyAnomalyChart = ({ equipmentId, startTime, endTime }) => {
    // Generate dummy data
    const generateData = () => {
        const data = [];
        let y = 0.2;
        for (let i = 0; i < 100; i++) {
            if (i > 40 && i < 60) {
                y += (Math.random() * 0.1 - 0.02);
            }
            else if (i >= 60) {
                y += (Math.random() * 0.05 - 0.04);
            }
            else {
                y += (Math.random() * 0.02 - 0.01);
            }
            y = Math.max(0, Math.min(1, y));
            data.push(y);
        }
        return data;
    };
    const options = {
        chart: {
            type: 'spline',
            height: 250,
            backgroundColor: 'transparent',
            style: { fontFamily: 'inherit' },
            spacingTop: 15,
            spacingBottom: 5,
        },
        title: { text: '' },
        credits: { enabled: false },
        legend: { enabled: false },
        xAxis: {
            visible: false,
        },
        yAxis: {
            title: { text: '' },
            labels: { style: { fontSize: '9px', color: '#64748b' }, format: '{value:.1f}' },
            gridLineColor: '#f1f5f9',
            plotLines: [{
                    value: 0.7, // Threshold
                    color: '#ef4444',
                    width: 2,
                    dashStyle: 'ShortDash',
                    label: { text: 'Critical Threshold', align: 'right', x: -10, y: -5, style: { color: '#ef4444', fontSize: '10px', fontWeight: 'bold' } },
                    zIndex: 4
                }]
        },
        tooltip: {
            enabled: false
        },
        series: [{
                type: 'spline',
                name: 'Discharge Temp Deviation',
                data: generateData(),
                color: '#3b82f6',
                lineWidth: 2.5,
                marker: { enabled: false },
                states: { hover: { enabled: false } }, // Disable hover effect causing tooltip styling artifacts
                zones: [
                    { value: 0.7, color: '#3b82f6' },
                    { color: '#ef4444' }
                ],
                zIndex: 3
            }]
    };
    return (<div className="bg-canvas border border-border rounded-xl p-4 my-6 shadow-xs flex flex-col">
            <div className="flex items-center justify-between mb-2 pb-3 border-b border-border/60">
                <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-danger/10 rounded-lg shrink-0">
                        <Activity className="w-4 h-4 text-danger animate-pulse"/>
                    </div>
                    <div className="flex flex-col">
                        <h4 className="text-[13px] font-black text-text-primary tracking-tight uppercase">Anomaly Event Profile</h4>
                        <p className="text-[10px] font-bold text-text-muted tracking-widest">{equipmentId}</p>
                    </div>
                </div>
                {startTime && endTime && (<div className="flex items-center gap-1.5 text-[9px] font-black text-text-muted tracking-wider bg-white border border-border rounded-md px-2 py-1.5 shadow-sm uppercase">
                        <Clock className="w-3 h-3 text-text-subtle mr-1"/>
                        <span>{startTime}</span>
                        <span className="text-text-subtle">—</span>
                        <span>{endTime}</span>
                    </div>)}
            </div>
            <div className="flex-1 w-full relative min-h-[250px] -ml-2">
                <HighchartsChart options={options}/>
            </div>
        </div>);
};
const MarkdownRenderer = ({ content, onTagClick }) => {
    const renderInline = (text) => {
        const parts = text.split(/(\*\*.*?\*\*|\|\|.*?\|\||\^\[.*?\]\^|\$\[.*?\]\$|@\[.*?\]@)/g);
        return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i} className="font-bold text-text-primary">{part.slice(2, -2)}</strong>;
            }
            if (part.startsWith('||') && part.endsWith('||')) {
                return <span key={i} className="bg-warning/10 text-warning font-bold px-1.5 py-0.5 rounded text-[11px] whitespace-nowrap">{part.slice(2, -2)}</span>;
            }
            if (part.startsWith('^[') && part.endsWith(']^')) {
                const inner = part.slice(2, -2);
                const partsArr = inner.split(',');
                let dict = {};
                partsArr.forEach(p => {
                    const colonIdx = p.indexOf(':');
                    if (colonIdx !== -1) {
                        const k = p.substring(0, colonIdx);
                        let v = p.substring(colonIdx + 1);
                        if (v.startsWith('[') && v.endsWith(']'))
                            v = v.substring(1, v.length - 1);
                        if (k && v)
                            dict[k.trim()] = v.trim();
                    }
                });
                const label = dict.tagId || 'TAG';
                return (<span key={i} onClick={() => onTagClick?.(dict)} className="bg-brand-muted border border-brand/20 text-brand font-bold px-1.5 py-0.5 rounded text-[10px] mx-1 cursor-pointer hover:bg-brand-muted shadow-sm transition-colors active:scale-95 inline-block">
                        {label}
                    </span>);
            }
            if (part.startsWith('$[') && part.endsWith(']$')) {
                const inner = part.slice(2, -2);
                return <span key={i} className="inline-flex items-center gap-1 bg-success/10 border border-success/20 text-success font-bold px-1.5 py-0.5 rounded text-[10px] mx-1 cursor-pointer hover:bg-success/20 shadow-sm">{'🔗 ' + inner.split('/').pop()}</span>;
            }
            if (part.startsWith('@[') && part.endsWith(']@')) {
                const tagContent = part.slice(2, -2);
                const partsArr = tagContent.split(',');
                let dict = {};
                partsArr.forEach(p => {
                    const colonIdx = p.indexOf(':');
                    if (colonIdx !== -1) {
                        const k = p.substring(0, colonIdx);
                        const v = p.substring(colonIdx + 1);
                        if (k && v)
                            dict[k.trim()] = v.trim();
                    }
                });
                return <DummyAnomalyChart key={i} equipmentId={dict.equipmentId || 'Unknown'} startTime={dict.startTime || ''} endTime={dict.endTime || ''}/>;
            }
            return <span key={i}>{part}</span>;
        });
    };
    const normalizedContent = content.replace(/^(#{1,6}\s+.*)\n(?!\n)/gm, '$1\n\n');
    return (<div className="markdown-body space-y-4 text-[13px] text-text-secondary leading-relaxed font-medium">
            {normalizedContent.split(/\n\s*\n/).map((paragraph, idx) => {
            const p = paragraph.trim();
            if (!p)
                return null;
            if (p.startsWith('@[') && p.endsWith(']@')) {
                const tagContent = p.slice(2, -2);
                const partsArr = tagContent.split(',');
                let dict = {};
                partsArr.forEach(partStr => {
                    const colonIdx = partStr.indexOf(':');
                    if (colonIdx !== -1) {
                        const k = partStr.substring(0, colonIdx);
                        const v = partStr.substring(colonIdx + 1);
                        if (k && v)
                            dict[k.trim()] = v.trim();
                    }
                });
                return <DummyAnomalyChart key={idx} equipmentId={dict.equipmentId || 'Unknown'} startTime={dict.startTime || ''} endTime={dict.endTime || ''}/>;
            }
            if (p.startsWith('# ')) {
                return <h1 key={idx} className="text-[20px] tracking-tight font-black text-text-primary border-b border-black/10 pb-3">{renderInline(p.substring(2))}</h1>;
            }
            if (p.startsWith('## ')) {
                return <h2 key={idx} className="text-[16px] font-extrabold text-text-primary mt-8 mb-4 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-brand"></div>{renderInline(p.substring(3))}</h2>;
            }
            if (p.startsWith('### ')) {
                return <h3 key={idx} className="text-[14px] font-bold text-text-primary mt-6 mb-3 uppercase tracking-wider">{renderInline(p.substring(4))}</h3>;
            }
            if (p.startsWith('#### ')) {
                return <h4 key={idx} className="text-[13px] font-bold text-text-secondary mt-4 mb-2 underline decoration-border underline-offset-4">{renderInline(p.substring(5))}</h4>;
            }
            if (p.startsWith('- ')) {
                const items = p.split('\n').filter(Boolean).map((line, i) => <li key={i} className="ml-5 list-disc pl-1 mb-1">{renderInline(line.replace(/^- /, ''))}</li>);
                return <ul key={idx} className="my-3 space-y-1 bg-canvas border border-border p-4 rounded-xl">{items}</ul>;
            }
            if (p.match(/^\d+\./)) {
                // Numbered list handler
                const lines = p.split('\n').filter(Boolean);
                const items = [];
                lines.forEach((line, i) => {
                    if (line.match(/^\d+\./)) {
                        items.push(<li key={i} className="ml-5 list-decimal pl-1 mb-2 text-text-primary font-extrabold text-[14px]">{renderInline(line.replace(/^\d+\.\s*/, ''))}</li>);
                    }
                    else if (line.trim().startsWith('-')) {
                        items.push(<div key={i + 100} className="ml-8 text-text-secondary mb-1 flex items-start gap-2 text-[13px]">
                                    <span className="text-text-subtle mt-0.5 font-bold">•</span>
                                    <span>{renderInline(line.trim().replace(/^- /, ''))}</span>
                                </div>);
                    }
                    else if (line.trim().startsWith('![')) {
                        const tagStr = line.trim();
                        const match = tagStr.match(/tagId:\[?(.*?)\]?\,/);
                        let label = 'TAG';
                        if (match)
                            label = match[1].replace(/[\[\]]/g, '');
                        items.push(<div key={i + 200} className="ml-8 my-3 p-4 bg-white border border-border rounded-xl shadow-sm flex flex-col items-center justify-center h-40 gap-2">
                                    <Activity className="w-8 h-8 text-brand/50"/>
                                    <span className="text-text-subtle text-[10px] uppercase font-black tracking-widest">Trend Analysis Chart Placeholder</span>
                                    <span className="text-brand font-mono text-[10px] bg-brand-muted px-2 py-0.5 rounded">{label}</span>
                                </div>);
                    }
                    else {
                        items.push(<div key={i + 300} className="ml-8 text-text-muted mb-1 text-[13px]">{renderInline(line.trim())}</div>);
                    }
                });
                return <div key={idx} className="my-4">{items}</div>;
            }
            if (p.startsWith('![')) {
                const match = p.match(/tagId:\[?(.*?)\]?\,/);
                let label = 'TAG';
                if (match)
                    label = match[1].replace(/[\[\]]/g, '');
                return (<div key={idx} className="my-6 p-6 bg-canvas border border-border rounded-xl flex flex-col items-center justify-center h-48 gap-3 shadow-inner">
                            <Activity className="w-10 h-10 text-brand/50"/>
                            <span className="text-text-subtle text-[11px] uppercase font-black tracking-widest">Trend Analysis Chart Placeholder</span>
                            <span className="text-brand font-mono text-[11px] bg-brand-muted px-2 py-0.5 rounded border border-brand/20">{label}</span>
                        </div>);
            }
            return <div key={idx} className="mb-4 text-justify">{renderInline(p)}</div>;
        })}
        </div>);
};
function ReportsContent({ equipmentName }) {
    const [tagModalOpen, setTagModalOpen] = useState(false);
    const [isTagLoading, setIsTagLoading] = useState(false);
    const [selectedTagGraph, setSelectedTagGraph] = useState(null);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsInitialLoading(false);
        }, 2000);
        return () => clearTimeout(timer);
    }, []);
    const handleTagClick = async (tagInfo) => {
        setTagModalOpen(true);
        setIsTagLoading(true);
        setSelectedTagGraph({ name: tagInfo.tagId || 'Loading...', data: [] });
        // getVisualData disabled — industrial-data removed from cpcp-configuration.
        try {
            // const body = await getVisualData({
            //     start: tagInfo.startTime || "2025-02-04 09:00:00",
            //     end: tagInfo.endTime || "2025-02-06 23:10:00",
            //     tags: [tagInfo.tagId],
            //     dashboard_name: "api",
            // });
            // if (body.statusCode === 200) {
            //     const graphs = Array.isArray(body.data) ? body.data.filter((item) => item.tagGraph).flatMap((item) => item.tagGraph) : [];
            //     const graphData = graphs.map((g) => ({
            //         name: g.name ? g.name.split('.').pop() : (tagInfo.tagId || 'Tag Data'),
            //         color: '#3b82f6',
            //         data: (g.x || []).map((xVal, idx) => [
            //             new Date(xVal.replace(' ', 'T')).getTime(),
            //             g.y[idx]
            //         ])
            //     }))[0];
            //     if (graphData)
            //         setSelectedTagGraph(graphData);
            // }
        }
        catch (e) {
        }
        finally {
            setIsTagLoading(false);
        }
    };
    if (isInitialLoading) {
        return (<div className="absolute inset-0 flex items-center justify-center bg-canvas">
                <img src="/images/Aivee_timer.gif" alt="Loading..." className="w-24 h-24 object-contain"/>
            </div>);
    }
    return (<div className="absolute inset-0 p-6 overflow-y-auto">
            <div className="bg-white rounded-xl border border-black shadow-sm flex flex-col mx-auto max-w-5xl overflow-hidden min-h-full pb-10">
                <InvPanelHeader title={`Investigation Report ━ ${equipmentName}`} icon={FileText}/>
                <div className="p-8 lg:p-12 overflow-y-auto w-full relative">
                    <MarkdownRenderer content={REPORT_MARKDOWN} onTagClick={handleTagClick}/>
                </div>
            </div>

            {tagModalOpen && (<div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-8 animate-in fade-in duration-200" onClick={() => setTagModalOpen(false)}>
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="tag-trend-modal-title"
                        className="bg-white w-full max-w-4xl rounded-xl shadow-2xl flex flex-col overflow-hidden relative"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="px-5 py-3.5 bg-canvas border-b border-black/10 flex justify-between items-center">
                             <div className="flex items-center gap-2.5">
                                  <div className="p-1.5 bg-brand-muted rounded-lg">
                                    <Activity className="w-4 h-4 text-brand"/>
                                  </div>
                                  <div className="flex flex-col">
                                      <h3 id="tag-trend-modal-title" className="font-extrabold text-text-primary text-[14px] leading-none mb-1">{selectedTagGraph?.name || 'Trend Chart'}</h3>
                                      <span className="text-[10px] font-bold text-text-subtle uppercase tracking-widest">Interactive Tag Plot</span>
                                  </div>
                             </div>
                             <button onClick={() => setTagModalOpen(false)} aria-label="Close" className="p-1.5 hover:bg-surface-2 rounded-md transition-colors text-text-secondary hover:text-text-primary cursor-pointer">
                                  <X className="w-4 h-4"/>
                             </button>
                        </div>
                        <div className="p-6 h-[400px] relative bg-white flex flex-col">
                             {isTagLoading ? (<div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-10 backdrop-blur-[1px]">
                                       <img src="/images/Aivee_timer.gif" alt="Loading..." className="w-16 h-16 object-contain mb-3 drop-shadow"/>
                                       <span className="text-[11px] font-black tracking-widest text-text-subtle uppercase">Fetching Plot Data...</span>
                                  </div>) : null}
                             {!isTagLoading && selectedTagGraph?.data?.length > 0 ? (<HighchartsChart options={{
                    chart: { type: 'line', backgroundColor: 'transparent', style: { fontFamily: 'inherit' } },
                    title: { text: '' },
                    credits: { enabled: false },
                    xAxis: { type: 'datetime', lineColor: '#e2e8f0' },
                    yAxis: { title: { text: '' }, gridLineColor: '#f1f5f9' },
                    tooltip: { shared: true, valueDecimals: 2 },
                    series: [{
                            type: 'line',
                            name: selectedTagGraph.name,
                            data: selectedTagGraph.data,
                            color: selectedTagGraph.color,
                            lineWidth: 2,
                            marker: { enabled: false }
                        }]
                }}/>) : !isTagLoading ? (<div className="flex items-center justify-center h-full w-full bg-canvas rounded-xl border border-border text-[13px] font-bold tracking-wide text-text-subtle italic">No historical data available for this tag in the given timerange.</div>) : null}
                        </div>
                    </div>
                </div>)}
        </div>);
}
// ── MAIN SHELL (SHELL-FIRST HYDRATION) ──
export default function InvestigationPage({ params }) {
    const resolvedParams = use(params);
    const router = useRouter();
    const equipmentId = resolvedParams.id;
    const equipmentName = EQUIPMENT_MAP[equipmentId] || 'Equipment';
    const [activeTab, setActiveTab] = useState('Classical');
    return (<>
                <header className="h-14 border-b border-border flex items-center justify-between px-6 bg-white shrink-0 z-20">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.push(`/compressor-details/${equipmentId}`)} className="p-2 hover:bg-surface-2 rounded-lg transition-colors group">
                            <ArrowLeft className="w-5 h-5 text-text-muted group-hover:text-text-primary transition-colors"/>
                        </button>
                        <h1 className="text-[20px] font-bold text-text-primary tracking-tight uppercase">
                            Investigation &mdash; {equipmentName}
                        </h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex bg-surface-2 p-0.5 rounded-lg border border-border shadow-sm">
                            <button onClick={() => setActiveTab('Classical')} className={`px-4 py-1.5 text-[12px] font-bold rounded-md transition-all ${activeTab === 'Classical' ? 'bg-white shadow-sm text-brand' : 'text-text-muted hover:text-text-secondary'}`}>
                                Classical
                            </button>
                            <button onClick={() => setActiveTab('Reports')} className={`px-4 py-1.5 text-[12px] font-bold rounded-md transition-all ${activeTab === 'Reports' ? 'bg-white shadow-sm text-brand' : 'text-text-muted hover:text-text-secondary'}`}>
                                Reports
                            </button>
                        </div>
                        <button onClick={() => window.location.reload()} className="px-3 py-1.5 text-[14px] font-bold bg-brand text-white rounded-lg hover:bg-brand-hover transition-colors uppercase shadow-sm">
                            Reset Layout
                        </button>
                        <Bell className="w-5 h-5 text-text-subtle cursor-pointer hover:text-text-secondary transition-colors"/>
                    </div>
                </header>

                {/* Hydration-Protected Content Area */}
                <div className="flex-1 overflow-hidden relative">
                    {activeTab === 'Classical' ? (<React.Suspense fallback={<div className="h-full w-full flex items-center justify-center bg-canvas">
                                <img src="/images/Aivee_timer.gif" alt="Loading..." className="w-24 h-24 object-contain"/>
                            </div>}>
                            <InvestigationContent params={resolvedParams}/>
                        </React.Suspense>) : (<ReportsContent equipmentName={equipmentName}/>)}
                </div>

                {/* Sticky Notification Footer */}
                <div className="fixed bottom-4 right-6 z-50">
                    <button onClick={() => router.push(`/compressor-details/${equipmentId}/investigation/notification`)} className="px-8 py-2 bg-overlay text-white text-[14px] font-black uppercase tracking-widest rounded-xl shadow-xl hover:bg-black hover:scale-[1.03] active:scale-95 transition-all flex items-center gap-2">
                        <Bell className="w-4 h-4"/>
                        Generate Notification
                    </button>
                </div>
    </>);
}
