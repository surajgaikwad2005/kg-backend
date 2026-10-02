'use client';
import React, { useState, useEffect, use, useMemo, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTimeRange } from '@/src/hooks/dashboard/useTimeRange';
// industrial-data service removed from cpcp-configuration (out of the refactored
// contract) — disabled until this page is rewired to a real backend.
// import {
//     getTags,
//     getVisualData,
//     getTopKParameters,
//     getTimeseriesMetadata,
// } from '@/src/services/cpcp/industrial-data/industrialDataService';
import TimeSelector from '@/src/components/ui/TimeSelector';
import { ArrowLeft, Bell, Activity, AlertTriangle, Grid3X3, Tag, RotateCcw, Layers, GitMerge, AlignCenter, ChevronDown, ChevronUp, ZoomIn, Maximize2, Minimize2, X, Eye, EyeOff, Search, Check, Plus, } from 'lucide-react';
import dynamic from 'next/dynamic';
const HighchartsChart = dynamic(() => import('@/src/components/charts/HighchartsChart'), { ssr: false });
/* ═══════════════════════════ CONSTANTS ═══════════════════════════ */
const EQUIPMENT_MAP = {
    'scrub_1': 'V-2410', 'comp_1': 'V-2420', 'cool_1': 'V-2430',
    'asv_1': 'Anti-Surge Valve 1', 'scrub_2': 'V-2440', 'comp_2': 'V-2450',
    'cool_2': 'V-2430B', 'asv_2': 'Anti-Surge Valve 2', 'header': 'Discharge Header',
    'contact': 'Glycol Contactor', 'v2470a': 'V-2470A', 'k2480a': 'K-2480A',
    'e2490a': 'E-2490A', 'v2470b': 'V-2470B', 'k2480b': 'K-2480B', 'e2490b': 'E-2490B',
};
const getDynamicLabel = (id, train) => {
    const base = EQUIPMENT_MAP[id] || 'Equipment';
    if (['v2470a', 'k2480a', 'e2490a', 'v2470b', 'k2480b', 'e2490b'].includes(id))
        return base;
    if (id === 'header' || id === 'contact' || id.startsWith('asv'))
        return base;
    if (id === 'cool_2')
        return train.includes('B') ? 'V-2460B' : 'V-2460A';
    const suffix = train.includes('B') ? 'B' : 'A';
    return `${base}${suffix}`;
};
const TAG_COLORS = [
    '#6366f1', '#10b981', '#f59e0b', '#ef4444',
    '#8b5cf6', '#0ea5e9', '#f97316', '#ec4899',
];
const DEV_HIGHLIGHT = {
    V: 'rgba(99,102,241,0.12)',
    P: 'rgba(59,130,246,0.12)',
    C: 'rgba(34,197,94,0.12)',
    S: 'rgba(251,191,36,0.12)',
};
const DEVIATION_CATEGORIES = {
    V: { letter: 'V', label: 'Vibration / Mechanical', desc: 'Mechanical/vibration anomaly', color: '#6366f1' },
    P: { letter: 'P', label: 'Process / Performance', desc: 'Process or performance upset', color: '#3b82f6' },
    C: { letter: 'C', label: 'Cooling / Lubrication', desc: 'Cooling or lubrication issue', color: '#10b981' },
    S: { letter: 'S', label: 'Startup / Logic', desc: 'Startup or control logic', color: '#f59e0b' },
};
const WINDOW_PRESETS = [
    { label: '1H', hours: 1 }, { label: '2H', hours: 2 }, { label: '6H', hours: 6 },
    { label: '12H', hours: 12 }, { label: '1D', hours: 24 },
];
/* ═══════════════════════════ HELPERS ═══════════════════════════ */
function classifyTag(n) {
    const u = n.toUpperCase();
    if (u.includes('VIB') || u.includes('NDE') || u.includes('RPM') || u.includes('SPEED') || u.includes('BRG'))
        return 'V';
    if (u.includes('COOL') || u.includes('LUBE') || u.includes('OIL') || u.includes('TANK') || u.includes('SUPP'))
        return 'C';
    if (u.includes('TEMP') && !u.includes('BRG'))
        return 'C';
    return 'P';
}
function pad2(n) { return n.toString().padStart(2, '0'); }
function fmtTs(ts) {
    const d = new Date(ts);
    return `${d.getDate()}/${pad2(d.getMonth() + 1)}/${d.getFullYear()} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}
function fmtShort(ts) {
    const mo = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const d = new Date(ts);
    return `${mo[d.getMonth()]} '${String(d.getFullYear()).slice(2)}`;
}
function LaneChart({ tag, idx, isLast, info, windowStart, clampedEnd, windowHours, showGrid, showLabels, laneH, onZoom, onDoubleClick }) {
    const color = TAG_COLORS[idx % TAG_COLORS.length];
    const cat = classifyTag(tag.name);
    const catInfo = DEVIATION_CATEGORIES[cat];
    const { isDeviated, minTh, maxTh, devRegions } = info;
    const padding = windowHours * 3600000 * 0.01;
    const sliced = tag.data.filter(([t]) => t >= windowStart - padding && t <= clampedEnd + padding);
    const data = (sliced.length > 0 ? sliced : tag.data);
    const plotBands = isDeviated
        ? devRegions.map(r => ({ from: r.from, to: r.to, color: DEV_HIGHLIGHT[cat], zIndex: 0 }))
        : [];
    const opts = {
        time: { useUTC: false },
        chart: {
            type: 'line',
            backgroundColor: 'transparent',
            style: { fontFamily: 'Inter, system-ui, sans-serif' },
            // Minimal margins to bring trend lines closer
            margin: [15, 20, isLast ? 30 : 5, 60],
            animation: false,
            zooming: { type: 'x' },
            events: {
                selection: function (event) {
                    if (event.xAxis && onZoom) {
                        onZoom(event.xAxis[0].min, event.xAxis[0].max);
                        return false;
                    }
                    return true;
                }
            }
        },
        title: { text: '' },
        credits: { enabled: false },
        legend: { enabled: false },
        xAxis: {
            type: 'datetime',
            min: windowStart,
            max: clampedEnd,
            labels: {
                enabled: isLast,
                style: { fontSize: '12px', color: 'var(--do-text-3)', fontWeight: 'bold' },
                format: '{value:%d %b %H:%M}',
                step: 2,
            },
            lineColor: isLast ? 'var(--do-border)' : 'transparent',
            tickColor: 'var(--do-border)',
            tickLength: isLast ? 3 : 0,
            crosshair: { width: 1, color: 'var(--do-text-4)', dashStyle: 'Dot' },
            gridLineWidth: showGrid ? 1 : 0,
            gridLineColor: 'var(--do-surface-2)',
            plotBands,
        },
        yAxis: {
            opposite: false,
            title: { text: '', style: { color: 'var(--do-text-4)', fontSize: '9px', fontWeight: '700' } },
            labels: {
                enabled: true,
                align: 'right',
                x: -6,
                style: { fontSize: '11px', color: 'var(--do-text-3)', fontWeight: '700' },
            },
            gridLineColor: showGrid ? 'var(--do-surface-2)' : 'transparent',
            gridLineWidth: 1,
            lineColor: 'var(--do-border)',
            lineWidth: 1,
            tickAmount: 4,
            maxPadding: 0.1,
            minPadding: 0.1,
            plotLines: [
                {
                    value: minTh, color: isDeviated ? 'var(--do-warning)' : 'var(--do-border-2)',
                    width: 1.5, dashStyle: 'ShortDash', zIndex: 5,
                    label: {
                        text: 'Low Limit', align: 'left', x: 2,
                        style: { fontSize: '9px', color: isDeviated ? 'var(--do-warning)' : 'var(--do-text-4)', fontWeight: '700' },
                    },
                },
                {
                    value: maxTh, color: 'var(--do-danger)',
                    width: 1.5, dashStyle: 'ShortDash', zIndex: 5,
                    label: {
                        text: 'High Limit', align: 'left', x: 2,
                        style: { fontSize: '9px', color: 'var(--do-danger)', fontWeight: '700' },
                    },
                },
            ],
        },
        tooltip: {
            backgroundColor: 'var(--do-surface)',
            borderColor: 'var(--do-border)', borderRadius: 6, shadow: true,
            style: { fontSize: '10px' },
            xDateFormat: '%d %b %Y  %H:%M',
            headerFormat: '<span style="color:var(--do-text-3);font-size:8px;font-weight:700">{point.key}</span><br/>',
            pointFormat: `<span style="color:${color};font-weight:700">${tag.name}</span>: <b>{point.y:.3f}</b><br/>`,
        },
        plotOptions: { line: { animation: false } },
        series: [{
            type: 'line',
            name: tag.name,
            data,
            color: isDeviated ? color : '#cbd5e1',
            lineWidth: isDeviated ? 1.6 : 1,
            marker: { enabled: false },
            states: { hover: { lineWidth: 2 } },
        }],
    };
    return (<div onDoubleClick={onDoubleClick} style={{ position: 'relative', height: laneH, marginBottom: isLast ? 0 : 5, background: '#fff' }}>
        {/* Tag Name Label - Top Right */}
        <div style={{
            position: 'absolute', top: 6, right: 20, zIndex: 10,
            fontSize: 12, fontWeight: 700,
            color: isDeviated ? color : '#94a3b8',
            textTransform: 'none', letterSpacing: '0.02em',
            pointerEvents: 'none'
        }}>
            {tag.name}
        </div>

        {/* Chart Area */}
        <div style={{ height: '100%', width: '100%' }}>
            <HighchartsChart options={opts} />
        </div>
    </div>);
}
function CombinedChart({ tagData, deviationInfo, viewMode, windowStart, clampedEnd, windowHours, showGrid, height, onZoom, onDoubleClick }) {
    const n = tagData.length;
    const isOneLane = viewMode === 'oneLane';
    // For "one lane" mode: left margin = n * 50 + 20 to fit all y-axes
    const leftMargin = isOneLane ? Math.min(n * 48 + 20, 320) : 60;
    const opts = useMemo(() => {
        const padding = windowHours * 3600000 * 0.01;
        // Build series
        const series = tagData.map((tag, idx) => {
            const color = TAG_COLORS[idx % TAG_COLORS.length];
            const sliced = tag.data.filter(([t]) => t >= windowStart - padding && t <= clampedEnd + padding);
            const data = (sliced.length > 0 ? sliced : tag.data);
            return {
                type: 'line',
                name: tag.name,
                data,
                yAxis: isOneLane ? idx : 0,
                color,
                lineWidth: 1.5,
                marker: { enabled: false },
                states: { hover: { lineWidth: 2 } },
                tooltip: { valueDecimals: 3 },
            };
        });
        // Build Y-axes
        let yAxes;
        if (isOneLane) {
            // Each tag gets its own Y-axis, offset to the left in sequence
            yAxes = tagData.map((tag, idx) => {
                const color = TAG_COLORS[idx % TAG_COLORS.length];
                const info = deviationInfo[idx];
                const offset = -(idx * 48);
                return {
                    title: { text: '' },
                    labels: {
                        align: 'right',
                        style: { color, fontSize: '10px', fontWeight: '800' },
                    },
                    lineColor: color,
                    lineWidth: 2,
                    tickColor: color,
                    tickLength: 4,
                    offset,
                    gridLineWidth: idx === 0 ? (showGrid ? 1 : 0) : 0,
                    gridLineColor: 'var(--do-surface-2)',
                    tickAmount: 4,
                    maxPadding: 0.2,
                    minPadding: 0.2,
                    plotLines: info ? [
                        { value: info.minTh, color, width: 1, dashStyle: 'ShortDash', label: { text: 'Low', align: 'left', x: 5, style: { fontSize: '9px', color, fontWeight: '700' } } },
                        { value: info.maxTh, color: 'var(--do-danger)', width: 1, dashStyle: 'ShortDash', label: { text: 'High', align: 'left', x: 5, style: { fontSize: '9px', color: 'var(--do-danger)', fontWeight: '700' } } },
                    ] : [],
                };
            });
        }
        else {
            // One shared Y-axis
            yAxes = [{
                title: { text: '' },
                labels: { style: { fontSize: '10px', color: '#64748b', fontWeight: '700' } },
                gridLineWidth: showGrid ? 1 : 0,
                gridLineColor: '#f1f5f9',
                tickAmount: 5,
            }];
        }
        // X-axis plotBands — highlight across shared X when any tag is deviated
        const xPlotBands = [];
        if (!isOneLane) {
            deviationInfo.forEach((info, idx) => {
                if (!info.isDeviated)
                    return;
                const cat = classifyTag(tagData[idx].name);
                info.devRegions.forEach(r => {
                    xPlotBands.push({ from: r.from, to: r.to, color: DEV_HIGHLIGHT[cat] });
                });
            });
        }
        return {
            time: { useUTC: false },
            chart: {
                type: 'line',
                backgroundColor: 'var(--do-surface)',
                style: { fontFamily: 'Inter, system-ui, sans-serif' },
                marginLeft: leftMargin,
                marginRight: 20,
                marginTop: 20,
                marginBottom: 45,
                height: height,
                animation: false,
                zooming: { type: 'x' },
                events: {
                    selection: function (event) {
                        if (event.xAxis && onZoom) {
                            onZoom(event.xAxis[0].min, event.xAxis[0].max);
                            return false;
                        }
                        return true;
                    }
                }
            },
            title: { text: '' },
            credits: { enabled: false },
            legend: {
                enabled: true,
                align: 'right',
                verticalAlign: 'top',
                itemStyle: { fontSize: '11px', fontWeight: '800', color: 'var(--do-text-2)' },
                symbolWidth: 16,
                symbolHeight: 4,
            },
            xAxis: {
                type: 'datetime',
                min: windowStart,
                max: clampedEnd,
                labels: {
                    style: { fontSize: '11px', color: 'var(--do-text-3)', fontWeight: 'bold' },
                    format: '{value:%d %b %H:%M}',
                },
                gridLineWidth: showGrid ? 1 : 0,
                gridLineColor: 'var(--do-surface-2)',
                lineColor: 'var(--do-border)',
                tickColor: 'var(--do-border)',
                crosshair: { width: 1, color: 'var(--do-text-4)', dashStyle: 'Dot' },
                plotBands: xPlotBands,
            },
            yAxis: yAxes,
            tooltip: {
                shared: true,
                backgroundColor: 'rgba(255,255,255,0.97)',
                borderColor: 'var(--do-border)', borderRadius: 6, shadow: true,
                style: { fontSize: '10px' },
                xDateFormat: '%d %b %Y  %H:%M',
            },
            plotOptions: { line: { animation: false } },
            series,
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tagData, deviationInfo, viewMode, windowStart, clampedEnd, windowHours, showGrid]);
    return (<div onDoubleClick={onDoubleClick} style={{ height, background: '#fff' }}>
        <HighchartsChart options={opts} />
    </div>);
}
function TagDetailsTable({ tagData, deviationInfo, equipmentName, viewMode, setViewMode, focusedTag, setFocusedTag, deviatedCount, selectedTags, toggleTag, onMinimize }) {
    const [open, setOpen] = useState(true);
    const modeBtn = (mode, icon, label, hint) => (<button title={hint} disabled={!!focusedTag} onClick={() => setViewMode(mode)} style={{
        display: 'flex', alignItems: 'center', gap: 5,
        padding: '3px 10px', borderRadius: 5, fontSize: 12,
        fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.06em',
        cursor: focusedTag ? 'not-allowed' : 'pointer', border: 'none', transition: 'all 0.15s',
        opacity: focusedTag ? 0.5 : 1,
        background: viewMode === mode ? '#4f46e5' : '#f1f5f9',
        color: viewMode === mode ? '#fff' : '#475569',
        boxShadow: viewMode === mode ? '0 2px 8px rgba(79,70,229,0.3)' : 'none',
    }}>
        {icon}
        {label}
    </button>);
    return (<div style={{ flexShrink: 0, background: '#fff', borderTop: '1px solid #e2e8f0', boxShadow: '0 -8px 24px -12px rgba(0,0,0,0.08)' }}>
        {/* Summary bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 15, padding: '10px 15px', borderBottom: '1px solid #f8fafc', background: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 900, color: '#0f172a' }}>{tagData.length}</span>
                <span style={{ fontSize: 12, fontWeight: 800, color: '#64748b', letterSpacing: '0.05em' }}>TOTAL TAGS</span>
            </div>

            {focusedTag && (<div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#eff6ff', padding: '3px 12px', borderRadius: 20, border: '1px solid #bfdbfe' }}>
                <span style={{ fontSize: 10, fontWeight: 800, color: '#2563eb' }}>FOCUSED: {focusedTag}</span>
                <button onClick={() => setFocusedTag(null)} style={{ background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '50%', width: 14, height: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <X size={10} />
                </button>
            </div>)}

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, opacity: focusedTag ? 0.3 : 1 }}>
                <span style={{ fontSize: 12, color: '#f59e0b', fontWeight: 900 }}>✓</span>
                <span style={{ fontSize: 12, fontWeight: 800, color: '#64748b', letterSpacing: '0.05em' }}>DEVIATION HIGHLIGHTED</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, opacity: focusedTag ? 0.3 : 1 }}>
                <span style={{ fontSize: 12, color: '#ea580c', fontWeight: 900 }}>⚠</span>
                <span style={{ fontSize: 12, fontWeight: 800, color: '#64748b', letterSpacing: '0.05em' }}>{deviatedCount} DEVIATED IN WINDOW</span>
            </div>
        </div>

        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 14px', borderBottom: open ? '1px solid #f1f5f9' : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button onClick={() => setOpen(!open)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 900, fontSize: 12, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                    <Tag size={16} />
                    Tag Details
                    {open ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                </button>
                <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>{tagData.length} parameters</span>
            </div>

            {/* View mode toggles — Seeq-like */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', marginRight: 4 }}>View as:</span>
                {modeBtn('lanes', <Layers size={12} />, 'Lanes', 'Each tag in its own lane with independent Y-axis')}
                {modeBtn('oneLane', <GitMerge size={12} />, 'One Lane', 'All tags in one lane — independent Y-axes per tag')}
                {modeBtn('oneAxis', <AlignCenter size={12} />, 'One Axis', 'All tags share one common Y-axis')}
                <span style={{ width: 1, height: 16, background: '#e2e8f0', margin: '0 4px' }} />
                <button onClick={onMinimize} title="Minimize Section" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', borderRadius: 4 }} className="hover:bg-surface-2">
                    <Minimize2 size={16} color="#64748b" />
                </button>
            </div>
        </div>

        {/* Table */}
        {open && (<div style={{ height: 'calc(100% - 80px)', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                        <th style={{ padding: '8px 12px', width: 40 }}></th>
                        {['Lane', 'Tag Name', 'Description', 'Category', 'Low Limit', 'High Limit', 'Status', 'Asset', 'Focus'].map(h => (<th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 900, fontSize: 12, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em', whiteSpace: 'nowrap' }}>
                            {h}
                        </th>))}

                    </tr>
                </thead>
                <tbody>
                    {tagData.map((tag, idx) => {
                        const isSelected = selectedTags.has(tag.name);
                        const color = TAG_COLORS[idx % TAG_COLORS.length];
                        const info = deviationInfo[idx] || { isDeviated: false, minTh: 0, maxTh: 0 };
                        const cat = classifyTag(tag.name);
                        const catInfo = DEVIATION_CATEGORIES[cat];
                        return (<tr key={tag.name} style={{ borderBottom: '1px solid #f8fafc', background: idx % 2 === 0 ? '#fff' : '#f8fafc', opacity: isSelected ? 1 : 0.4 }} className="hover:bg-brand-muted">
                            {/* Selector */}
                            <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                                <button onClick={() => toggleTag(tag.name)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                                    {isSelected ? <Eye size={16} color="#4f46e5" /> : <EyeOff size={16} color="#94a3b8" />}
                                </button>
                            </td>
                            {/* Lane */}
                            <td style={{ padding: '8px 12px', fontWeight: 700, color: '#64748b' }}>
                                <span style={{ background: '#f1f5f9', borderRadius: 4, padding: '2px 8px', fontSize: 12, fontWeight: 900, color: '#475569' }}>
                                    {idx + 1}
                                </span>
                            </td>
                            {/* Tag name */}
                            <td style={{ padding: '8px 12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <div style={{ width: 16, height: 4, borderRadius: 2, background: color, flexShrink: 0 }} />
                                    <span style={{ fontWeight: 700, color: '#0f172a', fontSize: 12 }}>{tag.name}</span>
                                </div>
                            </td>
                            {/* Description */}
                            <td style={{ padding: '8px 12px', color: '#64748b', fontSize: 12 }}>{catInfo.label} Parameter</td>
                            {/* Category */}
                            <td style={{ padding: '8px 12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <div style={{ width: 18, height: 18, borderRadius: '50%', background: catInfo.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10, fontWeight: 900 }}>
                                        {catInfo.letter}
                                    </div>
                                    <span style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>{catInfo.label}</span>
                                </div>
                            </td>
                            {/* Min/Max */}
                            <td style={{ padding: '8px 12px', fontFamily: 'monospace', fontSize: 12, color: '#d97706', fontWeight: 700 }}>{(info.minTh ?? 0).toFixed(3)}</td>
                            <td style={{ padding: '8px 12px', fontFamily: 'monospace', fontSize: 12, color: '#ef4444', fontWeight: 700 }}>{(info.maxTh ?? 0).toFixed(3)}</td>
                            {/* Status */}
                            <td style={{ padding: '8px 12px' }}>
                                <span style={{
                                    fontSize: 12, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.06em',
                                    padding: '3px 10px', borderRadius: 12,
                                    background: info.isDeviated ? '#fffbeb' : '#f0fdf4',
                                    color: info.isDeviated ? '#b45309' : '#15803d',
                                    border: `1px solid ${info.isDeviated ? '#fcd34d' : '#86efac'}`,
                                }}>
                                    {info.isDeviated ? '⚠ Deviated' : '✓ Normal'}
                                </span>
                            </td>
                            {/* Asset */}
                            <td style={{ padding: '8px 12px', fontSize: 12, color: '#3b82f6', fontWeight: 600 }}>{equipmentName}</td>
                            {/* Focus toggle */}
                            <td style={{ padding: '8px 12px' }}>
                                <button title={focusedTag === tag.name ? "Exit focus" : "Focus on this parameter"} onClick={() => setFocusedTag(focusedTag === tag.name ? null : tag.name)} style={{
                                    background: focusedTag === tag.name ? '#fef2f2' : (focusedTag ? '#f1f5f9' : '#eff6ff'),
                                    border: `1px solid ${focusedTag === tag.name ? '#fecaca' : (focusedTag ? '#e2e8f0' : '#dbeafe')}`,
                                    borderRadius: 6, padding: '5px 8px', cursor: 'pointer', color: focusedTag === tag.name ? '#ef4444' : (focusedTag ? '#94a3b8' : '#3b82f6'),
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
                                }}>
                                    {focusedTag === tag.name ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                                </button>
                            </td>
                        </tr>);
                    })}
                </tbody>
            </table>
        </div>)}
    </div>);
}
/* ═══════════════════════════ MAIN CONTENT ═══════════════════════════ */
function TagAnalysisContent({ params }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const range = useTimeRange();
    const equipmentId = params.id;
    const train = searchParams.get('train') || 'A';
    const equipmentName = getDynamicLabel(equipmentId, train);
    const anomalyId = searchParams.get('anomalyId');
    const startTime = searchParams.get('startTime');
    const endTime = searchParams.get('endTime');
    const [tagData, setTagData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showGrid, setShowGrid] = useState(true);
    const [showLabels, setShowLabels] = useState(true);
    const [viewMode, setViewMode] = useState('lanes');
    const [focusedTag, setFocusedTag] = useState(null);
    const [subscribedTags, setSubscribedTags] = useState([]);
    const [tagMetadata, setTagMetadata] = useState({});
    const [tableHeight, setTableHeight] = useState(280); // Default px height
    const [isTableMinimized, setIsTableMinimized] = useState(false);
    const isResizingRef = useRef(false);
    const startResize = useCallback((e) => {
        isResizingRef.current = true;
        document.body.style.cursor = 'ns-resize';
        const startY = e.clientY;
        const startH = tableHeight;
        const onMouseMove = (ev) => {
            if (!isResizingRef.current)
                return;
            const delta = startH + (startY - ev.clientY);
            setTableHeight(Math.min(600, Math.max(120, delta)));
        };
        const onMouseUp = () => {
            isResizingRef.current = false;
            document.body.style.cursor = '';
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }, [tableHeight]);
    /* ── system tags (for adding new ones) ── */
    const [allTags, setAllTags] = useState([]);
    const [showAddTag, setShowAddTag] = useState(false);
    const [addTagSearch, setAddTagSearch] = useState('');
    const addTagRef = useRef(null);
    useEffect(() => {
        // getTags disabled — industrial-data removed from cpcp-configuration.
        // getTags().then(data => setAllTags(data)).catch(() => {});
    }, []);
    /* ── tag selection ── */
    const [selectedTags, setSelectedTags] = useState(new Set());
    const [showSelector, setShowSelector] = useState(false);
    const [tagSearch, setTagSearch] = useState('');
    const selectorRef = useRef(null);
    const toggleTag = (tagName) => {
        setSelectedTags(prev => {
            const next = new Set(prev);
            if (next.has(tagName))
                next.delete(tagName);
            else
                next.add(tagName);
            return next;
        });
    };
    const toggleAll = () => {
        if (selectedTags.size === tagData.length)
            setSelectedTags(new Set());
        else
            setSelectedTags(new Set(tagData.map(t => t.name)));
    };
    // Auto-select all tags when data first arrives
    useEffect(() => {
        if (tagData.length > 0 && selectedTags.size === 0) {
            setSelectedTags(new Set(tagData.map(t => t.name)));
        }
    }, [tagData]);
    const filteredSelectorTags = tagData.filter(t => t.name.toLowerCase().includes(tagSearch.toLowerCase()));
    /* ── Click outside to close selectors ── */
    useEffect(() => {
        const handleClick = (e) => {
            if (selectorRef.current && !selectorRef.current.contains(e.target)) {
                setShowSelector(false);
            }
            if (addTagRef.current && !addTagRef.current.contains(e.target)) {
                setShowAddTag(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);
    const addNewTag = async () => {
        // getVisualData disabled — industrial-data removed from cpcp-configuration.
        // const shortName = tagName.split('.').pop() || tagName;
        // if (tagData.some(t => t.name === shortName))
        //     return; // Already exists
        // try {
        //     const p2 = (v) => v.toString().padStart(2, '0');
        //     const fmt = (d) => `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())} ${p2(d.getHours())}:${p2(d.getMinutes())}:${p2(d.getSeconds())}`;
        //     const body = await getVisualData({
        //         start: fmt(range.start), end: fmt(range.end), tags: [shortName], dashboard_name: 'api',
        //     });
        //     if (body.statusCode === 200) {
        //         const g = (body.data || []).filter((i) => i.tagGraph).flatMap((i) => i.tagGraph);
        //         if (g[0]) {
        //             const newTag = {
        //                 name: shortName,
        //                 color: TAG_COLORS[tagData.length % TAG_COLORS.length],
        //                 data: (g[0].x || []).map((x, i) => [new Date(x.replace(' ', 'T')).getTime(), g[0].y[i]]),
        //             };
        //             setTagData(prev => {
        //                 if (prev.some(t => t.name === shortName))
        //                     return prev;
        //                 return [...prev, newTag];
        //             });
        //             setSubscribedTags(prev => prev.includes(shortName) ? prev : [...prev, shortName]);
        //             setSelectedTags(prev => new Set([...Array.from(prev), shortName]));
        //             setShowAddTag(false);
        //             setAddTagSearch('');
        //         }
        //     }
        // }
        // catch (e) {
        // }
    };
    const fetchMetadata = async () => {
        // getTimeseriesMetadata disabled — industrial-data removed from cpcp-configuration.
        // deviationInfo below already falls back to statistical thresholds when
        // tagMetadata has no entry for a tag, so leaving it empty is safe.
        // if (!tags.length)
        //     return;
        // try {
        //     const body = await getTimeseriesMetadata(tags);
        //     if (body.statusCode === 200 && body.data) {
        //         const metaMap = {};
        //         body.data.forEach((item) => {
        //             if (item.metadata && item.metadata[0]) {
        //                 metaMap[item.tag_name || item.tag.split('.').pop()] = item.metadata[0];
        //             }
        //         });
        //         setTagMetadata(prev => ({ ...prev, ...metaMap }));
        //     }
        // }
        // catch (err) {
        // }
    };
    /* ── time window ── */
    const allTimes = tagData.flatMap(t => t.data.map(([ts]) => ts));
    const dataStart = allTimes.length > 0 ? Math.min(...allTimes) : Date.now() - 6 * 3600000;
    const dataEnd = allTimes.length > 0 ? Math.max(...allTimes) : Date.now();
    const totalDur = dataEnd - dataStart;
    const [windowHours, setWindowHours] = useState(6);
    const [windowEnd, setWindowEnd] = useState(0);
    const clampedEnd = windowEnd > 0
        ? Math.min(Math.max(windowEnd, dataStart + windowHours * 3600000), dataEnd)
        : dataEnd;
    const windowStart = clampedEnd - windowHours * 3600000;
    const navLeft = totalDur > 0 ? ((windowStart - dataStart) / totalDur) * 100 : 0;
    const navWidth = totalDur > 0 ? (windowHours * 3600000 / totalDur) * 100 : 100;
    const step = windowHours * 3600000 * 0.5;
    const goBack = () => setWindowEnd(e => Math.max(dataStart + windowHours * 3600000, (e || dataEnd) - step));
    const goFwd = () => setWindowEnd(e => Math.min(dataEnd, (e || dataEnd) + step));
    const goFirst = () => setWindowEnd(dataStart + windowHours * 3600000);
    const goLast = () => setWindowEnd(dataEnd);
    const wLabel = windowHours < 24 ? `${windowHours}H` : `${(windowHours / 24).toFixed(1)}D`;
    /* ── fetch ── */
    /* ── Fetch Top K (Initial Load) ── */
    useEffect(() => {
        if (!anomalyId)
            return;
        // getTopKParameters disabled — industrial-data removed from cpcp-configuration.
        Promise.resolve().then(() => {
            setLoading(false);
            setError('Anomaly parameter lookup is currently unavailable.');
        });
        // setLoading(true);
        // getTopKParameters(Number(anomalyId))
        //     .then(body => {
        //         const params_ = body?.data?.top_k_parameter || {};
        //         const tags = Object.keys(params_).map(t => t.split('.').pop() || t);
        //         setSubscribedTags(tags);
        //     })
        //     .catch(e => {
        //         setError('Failed to load anomaly parameters.');
        //         setLoading(false);
        //     });
    }, [anomalyId]);
    /* ── Fetch Visual Data ── */
    const fetchData = useCallback(async () => {
        if (subscribedTags.length === 0)
            return;
        if (tagData.length === 0)
            setLoading(true); // only show full-page loader on initial load
        setError(null);
        try {
            // getVisualData disabled — industrial-data removed from cpcp-configuration.
            // p2/fmt/fetchStart/fetchEnd were only needed to build that request.
            // const p2 = (v) => v.toString().padStart(2, '0');
            // const fmt = (d) => `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())} ${p2(d.getHours())}:${p2(d.getMinutes())}:${p2(d.getSeconds())}`;
            // // Priority: URL params > global range
            // let fetchStart = range.start;
            // let fetchEnd = range.end;
            // if (startTime && endTime) {
            //     const s = new Date(startTime.replace(' ', 'T'));
            //     const e = new Date(endTime.replace(' ', 'T'));
            //     if (!isNaN(s.getTime()) && !isNaN(e.getTime())) {
            //         // Fetch a 48H buffer around the anomaly for context
            //         fetchStart = new Date(s.getTime() - 24 * 3600000);
            //         fetchEnd = new Date(e.getTime() + 24 * 3600000);
            //     }
            // }
            // Unreachable in practice today (subscribedTags never populates without
            // getTopKParameters above), kept commented for structure/future restore.
            // const results = await Promise.all(subscribedTags.map(async (tagName, ti) => {
            //     try {
            //         const body = await getVisualData({
            //             start: fmt(fetchStart), end: fmt(fetchEnd), tags: [tagName], dashboard_name: 'api',
            //         });
            //         if (body.statusCode === 200) {
            //             const g = (body.data || []).filter((i) => i.tagGraph).flatMap((i) => i.tagGraph);
            //             if (!g[0])
            //                 return null;
            //             return {
            //                 name: g[0].name.split('.').pop() || g[0].name,
            //                 color: TAG_COLORS[ti % TAG_COLORS.length],
            //                 data: (g[0].x || []).map((x, i) => [new Date(x.replace(' ', 'T')).getTime(), g[0].y[i]]),
            //             };
            //         }
            //     }
            //     catch {
            //         return null;
            //     }
            //     return null;
            // }));
            const results = [];
            const valid = results.filter(Boolean);
            setTagData(valid);
            // Also fetch metadata for these tags
            if (valid.length > 0) {
                fetchMetadata(valid.map(t => t.name));
            }
            if (valid.length > 0) {
                // Initial window should match URL if present
                if (startTime && endTime) {
                    const s = new Date(startTime.replace(' ', 'T'));
                    const e = new Date(endTime.replace(' ', 'T'));
                    if (!isNaN(s.getTime()) && !isNaN(e.getTime())) {
                        const durMs = e.getTime() - s.getTime();
                        let diffH = durMs / 3600000;
                        if (diffH <= 0)
                            diffH = 6;
                        // Set window to anomaly range + 20% buffer on each side
                        const buffer = durMs * 0.2;
                        setWindowEnd(e.getTime() + buffer);
                        setWindowHours(diffH * 1.4);
                    }
                }
                else {
                    const times = valid.flatMap(t => t.data.map(([ts]) => ts));
                    setWindowEnd(Math.max(...times));
                    setWindowHours(Math.max(1, Math.round((range.end.getTime() - range.start.getTime()) / 3600000)));
                }
            }
            else {
                setError('No trend data available.');
            }
        }
        catch (e) {
            setError('Failed to load data. Please retry.');
        }
        finally {
            setLoading(false);
        }
    }, [subscribedTags, range.start, range.end, startTime, endTime]);
    useEffect(() => { fetchData(); }, [fetchData]);
    // SYNCHRONIZE VIEW WINDOW: Ensure trend viewer aligns with global TimeSelector baseline
    useEffect(() => {
        // If we have URL overrides, don't auto-sync with global range on initial load if anomaly is present
        if (startTime && endTime)
            return;
        if (range.start && range.end) {
            const end = range.end.getTime();
            const start = range.start.getTime();
            const diffHours = Math.max(1, Math.round((end - start) / 3600000));
            setWindowEnd(end);
            setWindowHours(diffHours);
        }
    }, [range.start, range.end, startTime, endTime]);
    /* ── per-tag deviation ── */
    const deviationInfo = useMemo(() => tagData.map(tag => {
        const meta = tagMetadata[tag.name];
        const vals = tag.data.map(([, v]) => v);
        if (!vals.length)
            return { isDeviated: false, minTh: 0, maxTh: 0, devRegions: [] };
        // Use metadata limits if available, otherwise fallback to statistical thresholds
        const minTh = (meta?.low !== undefined && meta?.low !== null) ? meta.low : (vals.reduce((a, b) => a + b, 0) / vals.length) - 1.5 * (Math.sqrt(vals.reduce((a, b) => a + (b - (vals.reduce((a, b) => a + b, 0) / vals.length)) ** 2, 0) / vals.length) || 1);
        const maxTh = (meta?.high !== undefined && meta?.high !== null) ? meta.high : (vals.reduce((a, b) => a + b, 0) / vals.length) + 1.5 * (Math.sqrt(vals.reduce((a, b) => a + (b - (vals.reduce((a, b) => a + b, 0) / vals.length)) ** 2, 0) / vals.length) || 1);
        const win = tag.data.filter(([t]) => t >= windowStart && t <= clampedEnd);
        const devRegions = [];
        let dStart = null;
        win.forEach(([t, v]) => {
            const oob = v < minTh || v > maxTh;
            if (oob && dStart === null)
                dStart = t;
            else if (!oob && dStart !== null) {
                devRegions.push({ from: dStart, to: t });
                dStart = null;
            }
        });
        if (dStart !== null && win.length > 0)
            devRegions.push({ from: dStart, to: win[win.length - 1][0] });
        return { isDeviated: win.some(([, v]) => v < minTh || v > maxTh), minTh, maxTh, devRegions };
    }), [tagData, tagMetadata, windowStart, clampedEnd]);
    const deviatedCount = deviationInfo.filter(d => d.isDeviated).length;
    // Apply visibility filter
    const visibleTags = tagData.filter(t => selectedTags.has(t.name));
    const visibleDev = deviationInfo.filter((_, idx) => selectedTags.has(tagData[idx].name));
    // Apply focus filter
    const displayTags = focusedTag ? visibleTags.filter(t => t.name === focusedTag) : visibleTags;
    const displayDev = focusedTag ? visibleDev.filter((_, idx) => visibleTags[idx].name === focusedTag) : visibleDev;
    /* ── zoom handler ── */
    const handleZoom = useCallback((min, max) => {
        setWindowEnd(max);
        setWindowHours((max - min) / 3600000);
    }, []);
    const resetZoom = useCallback(() => {
        const diffH = (range.end.getTime() - range.start.getTime()) / 3600000;
        setWindowEnd(range.end.getTime());
        setWindowHours(Math.max(1, Math.round(diffH)));
    }, [range.start, range.end]);
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
            const timelineElement = document.getElementById('timeline-navigator-bar');
            if (!timelineElement)
                return;
            const rect = timelineElement.getBoundingClientRect();
            const deltaX = ev.clientX - drag.startX;
            const deltaPct = deltaX / rect.width;
            const deltaMs = deltaPct * totalDur;
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
    }, [windowStart, clampedEnd, windowHours, totalDur, dataStart, dataEnd]);
    // ── Measure actual available chart area height via ResizeObserver ──
    const chartAreaRef = useRef(null);
    const [availH, setAvailH] = useState(0);
    useEffect(() => {
        const el = chartAreaRef.current;
        if (!el)
            return;
        // Initial measurement
        setAvailH(el.clientHeight);
        const ro = new ResizeObserver(([entry]) => {
            setAvailH(Math.floor(entry.contentRect.height));
        });
        ro.observe(el);
        return () => ro.disconnect();
    }, [loading, tagData.length]); // re-observe when data/loading state changes
    // Divide available height among lanes. If they exceed space at min-height (100px), allow scrolling.
    const n = displayTags.length;
    const totalGaps = n > 1 ? (n - 1) * 5 : 0;
    const minLaneH = 100;
    const LANE_H = n > 0 && availH > 0
        ? Math.max(minLaneH, Math.floor((availH - totalGaps) / n))
        : 150;
    /* ───── render ───── */
    return (<div className="flex flex-col h-full overflow-hidden bg-surface">

        {/* ── Status + toolbar ── */}
        {!loading && tagData.length > 0 && (<div style={{ flexShrink: 0, borderBottom: '1px solid #e2e8f0', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 12px', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 10 }}>
                {/* TAG SELECTOR DROPDOWN */}
                <div style={{ position: 'relative' }} ref={selectorRef}>
                    <button onClick={() => setShowSelector(!showSelector)} style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '5px 12px', borderRadius: 7, border: '1.5px solid #e2e8f0',
                        background: '#fff', cursor: 'pointer', fontSize: 10, fontWeight: 900, color: '#475569',
                        textTransform: 'uppercase', letterSpacing: '0.05em', transition: 'all 0.2s',
                        boxShadow: showSelector ? '0 0 0 3px rgba(79,70,229,0.1)' : 'none',
                        borderColor: showSelector ? '#4f46e5' : '#e2e8f0'
                    }}>
                        <Tag size={12} color={showSelector ? '#4f46e5' : '#64748b'} />
                        <span>{selectedTags.size} / {tagData.length} Tags Visible</span>
                        <ChevronDown size={11} style={{ transform: showSelector ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                    </button>

                    {showSelector && (<div style={{
                        position: 'absolute', top: 'calc(100% + 6px)', left: 0, width: 280,
                        background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10,
                        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
                        zIndex: 1000, overflow: 'hidden'
                    }}>
                        <div style={{ padding: '10px 12px', background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 6, padding: '4px 8px' }}>
                                <Search size={12} color="#94a3b8" />
                                <input autoFocus value={tagSearch} onChange={e => setTagSearch(e.target.value)} placeholder="Search tags..." style={{ border: 'none', background: 'none', outline: 'none', fontSize: 10, fontWeight: 700, width: '100%', color: '#475569' }} />
                            </div>
                        </div>

                        <div style={{ maxHeight: 240, overflowY: 'auto', padding: '4px 0' }}>
                            <button onClick={toggleAll} style={{ width: '100%', padding: '8px 12px', background: 'none', border: 'none', borderBottom: '1px solid #f8fafc', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: 10, fontWeight: 900, color: '#4f46e5' }}>{selectedTags.size === tagData.length ? 'DESELECT ALL' : 'SELECT ALL'}</span>
                                <Check size={12} color="#4f46e5" style={{ opacity: selectedTags.size === tagData.length ? 1 : 0.3 }} />
                            </button>
                            {filteredSelectorTags.map(tag => {
                                const sel = selectedTags.has(tag.name);
                                return (<button key={tag.name} onClick={() => toggleTag(tag.name)} style={{ width: '100%', padding: '8px 12px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{ width: 14, height: 14, borderRadius: 3, border: `1.5px solid ${sel ? '#4f46e5' : '#cbd5e1'}`, background: sel ? '#4f46e5' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}>
                                        {sel && <Check size={10} color="#fff" strokeWidth={4} />}
                                    </div>
                                    <span style={{ fontSize: 10, fontWeight: sel ? 800 : 600, color: sel ? '#0f172a' : '#64748b' }}>{tag.name}</span>
                                </button>);
                            })}
                            {filteredSelectorTags.length === 0 && (<div style={{ padding: 20, textAlign: 'center', fontSize: 10, color: '#94a3b8' }}>No tags matching "{tagSearch}"</div>)}
                        </div>
                    </div>)}
                </div>

                <div style={{ position: 'relative' }} ref={addTagRef}>
                    <button onClick={() => setShowAddTag(!showAddTag)} style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '5px 12px', borderRadius: 7, border: '1.5px solid #e2e8f0',
                        background: '#f8fafc', cursor: 'pointer', fontSize: 10, fontWeight: 900, color: '#4338ca',
                        textTransform: 'uppercase', letterSpacing: '0.05em', transition: 'all 0.2s',
                        borderColor: showAddTag ? '#4f46e5' : '#e2e8f0'
                    }}>
                        <Plus size={12} color="#4f46e5" />
                        <span>Add Tag</span>
                    </button>

                    {showAddTag && (<div style={{
                        position: 'absolute', top: 'calc(100% + 6px)', left: 0, width: 280,
                        background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10,
                        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
                        zIndex: 1001, overflow: 'hidden'
                    }}>
                        <div style={{ padding: '10px 12px', background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 6, padding: '4px 8px' }}>
                                <Search size={12} color="#94a3b8" />
                                <input autoFocus value={addTagSearch} onChange={e => setAddTagSearch(e.target.value)} placeholder="Search system tags..." style={{ border: 'none', background: 'none', outline: 'none', fontSize: 10, fontWeight: 700, width: '100%', color: '#475569' }} />
                            </div>
                        </div>
                        <div style={{ maxHeight: 240, overflowY: 'auto', padding: '4px 0' }}>
                            {allTags
                                .filter(t => t.toLowerCase().includes(addTagSearch.toLowerCase()))
                                .map(tag => (<button key={tag} onClick={() => addNewTag(tag)} style={{ width: '100%', padding: '8px 12px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: 10, fontWeight: 600, color: '#475569', borderBottom: '1px solid #f8fafc' }}>
                                    {tag}
                                </button>))}
                            {allTags.length === 0 && <div style={{ padding: 20, textAlign: 'center', fontSize: 10, color: '#94a3b8' }}>Loading system tags...</div>}
                        </div>
                    </div>)}
                </div>

                <span style={{ width: 1, height: 12, background: '#e2e8f0' }} />
                <span style={{ fontWeight: 900, color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <AlertTriangle size={11} /> DEVIATION HIGHLIGHTED
                </span>
                {deviatedCount > 0 && (<span style={{ fontSize: 9, fontWeight: 900, color: '#b45309', background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 4, padding: '1px 7px', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <AlertTriangle size={9} /> {deviatedCount} DEVIATED IN WINDOW
                </span>)}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <button title="Toggle Gridlines" onClick={() => setShowGrid(v => !v)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '3px 7px', borderRadius: 5, border: 'none', cursor: 'pointer', fontSize: 7, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.07em', background: showGrid ? '#4f46e5' : '#f1f5f9', color: showGrid ? '#fff' : '#475569' }}>
                    <Grid3X3 size={13} /><span>Grid</span>
                </button>
                <button title="Toggle Labels" onClick={() => setShowLabels(v => !v)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '3px 7px', borderRadius: 5, border: 'none', cursor: 'pointer', fontSize: 7, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.07em', background: showLabels ? '#4f46e5' : '#f1f5f9', color: showLabels ? '#fff' : '#475569' }}>
                    <Tag size={13} /><span>Labels</span>
                </button>
                <button title="Reset" onClick={fetchData} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '3px 7px', borderRadius: 5, border: 'none', cursor: 'pointer', fontSize: 7, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.07em', background: '#f1f5f9', color: '#475569' }}>
                    <RotateCcw size={13} /><span>Reset</span>
                </button>
                <button title="Reset Zoom" onClick={() => {
                    const diffH = (range.end.getTime() - range.start.getTime()) / 3600000;
                    setWindowEnd(range.end.getTime());
                    setWindowHours(Math.max(1, Math.round(diffH)));
                }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '3px 7px', borderRadius: 5, border: 'none', cursor: 'pointer', fontSize: 7, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.07em', background: '#f1f5f9', color: '#475569' }}>
                    <ZoomIn size={13} /><span>Reset Zoom</span>
                </button>
                <span style={{ width: 1, height: 20, background: '#e2e8f0', margin: '0 4px' }} />
                <button onClick={() => router.push(`/compressor-details/${equipmentId}/investigation?endTime=${encodeURIComponent(endTime || '')}&anomalyId=${anomalyId}`)} style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8, padding: '8px 20px', background: '#0f172a', color: '#fff', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', borderRadius: 8, cursor: 'pointer', border: 'none', boxShadow: '0 4px 12px rgba(15,23,42,0.2)' }}>
                    <Activity size={14} /><span style={{ whiteSpace: 'nowrap' }}>Investigate & Perform RCA</span>
                </button>
            </div>
        </div>)}

        {/* ── Navigator / time controls ── */}
        {!loading && tagData.length > 0 && (<div style={{ flexShrink: 0, borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
            {/* Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px' }}>
                <span style={{ fontSize: 8, fontWeight: 700, color: '#64748b', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>◀ {fmtTs(windowStart)}</span>
                <div style={{ display: 'flex', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 5, overflow: 'hidden', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
                    {[['⏮', goFirst], ['◀', goBack]].map(([lbl, fn]) => (<button key={lbl} onClick={fn} style={{ padding: '2px 7px', fontSize: 10, fontWeight: 900, color: '#64748b', cursor: 'pointer', background: 'none', border: 'none', borderRight: '1px solid #f1f5f9' }}>{lbl}</button>))}
                    {WINDOW_PRESETS.map(p => (<button key={p.label} onClick={() => { setWindowHours(p.hours); setWindowEnd(dataEnd); }} style={{ padding: '2px 8px', fontSize: 9, fontWeight: 900, cursor: 'pointer', border: 'none', borderRight: '1px solid #f1f5f9', background: windowHours === p.hours ? '#4f46e5' : 'none', color: windowHours === p.hours ? '#fff' : '#64748b' }}>
                        {p.label}
                    </button>))}
                    {[['▶', goFwd], ['⏭', goLast]].map(([lbl, fn]) => (<button key={lbl} onClick={fn} style={{ padding: '2px 7px', fontSize: 10, fontWeight: 900, color: '#64748b', cursor: 'pointer', background: 'none', border: 'none', borderLeft: '1px solid #f1f5f9' }}>{lbl}</button>))}
                </div>
                <span style={{ fontSize: 8, fontWeight: 700, color: '#64748b', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>{fmtTs(clampedEnd)} ▶</span>
                <div style={{ flex: 1 }} />
                <span style={{ fontSize: 8, fontWeight: 900, color: '#4f46e5', background: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: 4, padding: '1px 8px' }}>{wLabel}</span>
            </div>
            {/* Navigator strip */}
            <div style={{ padding: '0 12px 6px' }}>
                <div id="timeline-navigator-bar" style={{ position: 'relative', height: 26, background: '#f1f5f9', borderRadius: 4, border: '1px solid #e2e8f0', overflow: 'hidden', cursor: 'pointer' }} onClick={e => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const pct = (e.clientX - rect.left) / rect.width;
                    const ts = dataStart + pct * totalDur;
                    setWindowEnd(Math.min(dataEnd, Math.max(dataStart + windowHours * 3600000, ts + windowHours * 3600000 / 2)));
                }}>
                    <div style={{ position: 'absolute', inset: 0 }}>
                        {tagData.slice(0, 6).map((tag, i) => {
                            const vs = tag.data.map(([, v]) => v), minV = Math.min(...vs), maxV = Math.max(...vs), rng = maxV - minV || 1;
                            return (<svg key={tag.name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 1000 26" preserveAspectRatio="none">
                                <polyline fill="none" stroke={TAG_COLORS[i % TAG_COLORS.length]} strokeWidth="1.2" strokeOpacity="0.5" points={tag.data.map(([t, v]) => `${((t - dataStart) / totalDur) * 1000},${24 - ((v - minV) / rng) * 20}`).join(' ')} />
                            </svg>);
                        })}
                    </div>
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        bottom: 0,
                        left: `${Math.max(0, Math.min(navLeft, 100 - navWidth))}%`,
                        width: `${Math.min(navWidth, 100)}%`,
                        background: 'rgba(255, 255, 255, 0.35)',
                        borderLeft: '2.5px solid #1e293b',
                        borderRight: '2.5px solid #1e293b',
                        cursor: 'grab',
                    }} onMouseDown={e => handleNavigatorMouseDown(e, 'center')}>
                        <div style={{ position: 'absolute', left: 0, top: '50%', transform: 'translate(-50%,-50%)', width: 7, height: 14, background: '#475569', borderRadius: 2 }} />
                        <div style={{ position: 'absolute', right: 0, top: '50%', transform: 'translate(50%,-50%)', width: 7, height: 14, background: '#475569', borderRadius: 2 }} />
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            bottom: 0,
                            left: -6,
                            width: 12,
                            cursor: 'col-resize',
                            zIndex: 10,
                        }} onMouseDown={e => handleNavigatorMouseDown(e, 'left')} />
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            bottom: 0,
                            right: -6,
                            width: 12,
                            cursor: 'col-resize',
                            zIndex: 10,
                        }} onMouseDown={e => handleNavigatorMouseDown(e, 'right')} />
                    </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2, fontSize: 7, fontWeight: 700, color: '#94a3b8' }}>
                    <span>{fmtShort(dataStart)}</span><span>{fmtShort(dataEnd)}</span>
                </div>
            </div>
        </div>)}

        {/* ── Chart area — ref measured so LANE_H fills it exactly ── */}
        <div ref={chartAreaRef} style={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', paddingBottom: 24 }}>
            {loading ? (<div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
                <img src="/images/Aivee_timer.gif" alt="Loading..." style={{ width: 120, height: 120, objectFit: 'contain' }} />
            </div>) : error ? (<div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 32 }}>
                <AlertTriangle size={36} color="#f59e0b" />
                <span style={{ fontSize: 13, fontWeight: 700, color: '#475569', textAlign: 'center' }}>{error}</span>
                <button onClick={fetchData} style={{ padding: '6px 18px', background: '#4f46e5', color: '#fff', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', borderRadius: 8, cursor: 'pointer', border: 'none' }}>Retry</button>
            </div>) : tagData.length === 0 ? (<div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>
                No tag trends for this anomaly.
            </div>) : viewMode === 'lanes' ? (
                /* ── Stacked lanes filling exactly 100% (or scrolling if too many) ── */
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
                    {displayTags.map((tag, idx) => (<LaneChart key={tag.name} tag={tag} idx={idx} isLast={idx === displayTags.length - 1} info={displayDev[idx] || { isDeviated: false, minTh: 0, maxTh: 0, devRegions: [] }} windowStart={windowStart} clampedEnd={clampedEnd} windowHours={windowHours} showGrid={showGrid} showLabels={showLabels} laneH={LANE_H} onZoom={handleZoom} onDoubleClick={resetZoom} />))}
                </div>) : (
                /* ── Combined chart (One Lane / One Axis) ── */
                <CombinedChart tagData={displayTags} deviationInfo={displayDev} viewMode={viewMode} windowStart={windowStart} clampedEnd={clampedEnd} windowHours={windowHours} showGrid={showGrid} height={availH} onZoom={handleZoom} onDoubleClick={resetZoom} />)}
        </div>

        {/* ── Resize handle ── */}
        {!loading && tagData.length > 0 && (<div onMouseDown={startResize} style={{
            height: 10, cursor: 'ns-resize', flexShrink: 0,
            background: '#f1f5f9', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0',
            display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s',
            zIndex: 30
        }} className="hover:bg-brand-muted group">
            <div style={{ width: 30, height: 4, borderRadius: 2, background: '#cbd5e1' }} className="group-hover:bg-brand" />
        </div>)}

        {/* ── Tag details + view mode switcher ── */}
        {!loading && tagData.length > 0 && (isTableMinimized ? (<div onClick={() => setIsTableMinimized(false)} style={{
            height: 28, background: '#f8fafc', borderTop: '1px solid #e2e8f0',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 10, cursor: 'pointer', flexShrink: 0
        }} className="hover:bg-brand-muted">
            <span style={{ fontSize: 10, fontWeight: 900, color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Restore Parameter Details</span>
            <Maximize2 size={12} color="#4f46e5" />
        </div>) : (<div style={{ height: tableHeight, flexShrink: 0, minHeight: 0 }}>
            <TagDetailsTable tagData={tagData} deviationInfo={deviationInfo} equipmentName={equipmentName} viewMode={viewMode} setViewMode={setViewMode} focusedTag={focusedTag} setFocusedTag={setFocusedTag} deviatedCount={deviatedCount} selectedTags={selectedTags} toggleTag={toggleTag} onMinimize={() => setIsTableMinimized(true)} />
        </div>))}
    </div>);
}
/* ═══════════════════════════ PAGE SHELL ═══════════════════════════ */
export default function TagAnalysisPage({ params }) {
    const resolved = use(params);
    const router = useRouter();
    const searchParams = useSearchParams();
    const equipmentName = EQUIPMENT_MAP[resolved.id] || 'Equipment';
    const anomalyId = searchParams.get('anomalyId');
    const endTime = searchParams.get('endTime');
    return (<>
            {/* Header */}
            <header style={{ height: 48, borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', flexShrink: 0, zIndex: 20, background: '#fff' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <button onClick={() => router.back()} style={{ padding: 6, border: 'none', background: 'none', cursor: 'pointer', borderRadius: 6, display: 'flex' }} className="hover:bg-surface-2">
                        <ArrowLeft size={16} color="#64748b" />
                    </button>
                    <Activity size={15} color="#10b981" />
                    <div>
                        <div style={{ fontSize: 12, fontWeight: 900, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 1 }}>Tag Deviation Analysis</div>
                        <div style={{ fontSize: 8, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.12em', marginTop: 2 }}>
                            {equipmentName} · Anomaly #{anomalyId}{endTime ? ` · ${endTime}` : ''}
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <TimeSelector />
                    <Bell size={15} color="#94a3b8" style={{ cursor: 'pointer' }} />
                </div>
            </header>

            {/* Content */}
            <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
                <React.Suspense fallback={<div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Loading…</div>}>
                    <TagAnalysisContent params={resolved} />
                </React.Suspense>
            </div>
    </>);
}
