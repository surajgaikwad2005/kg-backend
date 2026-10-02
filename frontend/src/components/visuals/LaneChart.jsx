'use client';
import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
const HighchartsChart = dynamic(() => import('@/src/components/charts/HighchartsChart'), { ssr: false });
export function LaneChart({ tag, idx, isLast, laneH, windowStart, clampedEnd, showGrid, showLabels, onZoom, color, metadata, onDoubleClick, }) {
    const windowed = tag.data.filter(([t]) => t >= windowStart - 60000 && t <= clampedEnd + 60000);
    const display = windowed.length > 0 ? windowed : tag.data;
    const vals = tag.data.map(([, v]) => v);
    const mean = vals.reduce((a, b) => a + b, 0) / (vals.length || 1);
    const std = Math.sqrt(vals.reduce((a, b) => a + (b - mean) ** 2, 0) / (vals.length || 1)) || 1;
    // Use metadata limits if available, else fallback to statistical ones
    const minTh = metadata?.low ?? (mean - 1.5 * std);
    const maxTh = metadata?.high ?? (mean + 1.5 * std);
    const options = useMemo(() => ({
        chart: {
            type: 'line',
            height: laneH,
            backgroundColor: 'transparent',
            style: { fontFamily: 'inherit' },
            margin: [15, 20, isLast ? 30 : 5, 60],
            animation: { duration: 300 },
            zooming: { type: 'x' },
            events: {
                selection(e) {
                    if (e.xAxis) {
                        onZoom(e.xAxis[0].min, e.xAxis[0].max);
                        return false;
                    }
                },
            },
        },
        title: { text: '' },
        credits: { enabled: false },
        legend: { enabled: false },
        xAxis: {
            type: 'datetime',
            min: windowStart, max: clampedEnd,
            labels: {
                enabled: isLast,
                style: { fontSize: '11px', fontWeight: '700', color: '#475569' },
                format: '{value:%d %b %H:%M}',
            },
            lineColor: '#e2e8f0', tickColor: '#e2e8f0',
            gridLineColor: showGrid ? '#f1f5f9' : 'transparent',
            gridLineWidth: showGrid ? 1 : 0,
        },
        yAxis: {
            title: { text: '' },
            labels: {
                style: { fontSize: '10px', fontWeight: '700', color: '#64748b' },
                x: -50, align: 'left',
            },
            gridLineColor: showGrid ? '#f1f5f9' : 'transparent',
            plotLines: [
                { value: minTh, color: '#f97316', width: 1.2, dashStyle: 'ShortDash', zIndex: 5, label: { text: metadata?.low ? 'Low Limit' : '', style: { color: '#f97316', fontSize: '9px', fontWeight: 'bold' } } },
                { value: maxTh, color: '#ef4444', width: 1.2, dashStyle: 'ShortDash', zIndex: 5, label: { text: metadata?.high ? 'High Limit' : '', style: { color: '#ef4444', fontSize: '9px', fontWeight: 'bold' } } },
            ],
            plotBands: (tag.data.filter(([t, v]) => (v < minTh || v > maxTh) && t >= windowStart && t <= clampedEnd).length > 0) ? [
                { from: windowStart, to: clampedEnd, color: 'rgba(251, 146, 60, 0.05)', zIndex: 0 }
            ] : []
        },
        tooltip: {
            shared: false, valueDecimals: 3,
            style: { fontSize: '11px' },
            backgroundColor: 'rgba(255,255,255,0.97)',
            borderColor: '#e2e8f0', shadow: true,
            xDateFormat: '%d %b %Y %H:%M:%S',
        },
        series: [{
                type: 'line',
                name: tag.name,
                data: display,
                color,
                lineWidth: 1.5,
                marker: { enabled: false },
            }, {
                type: 'arearange',
                name: 'Deviation',
                data: tag.data.filter(([t, v]) => (v < minTh || v > maxTh)).map(([t, v]) => [t, v, v]),
                color: '#f97316',
                fillOpacity: 0.2,
                lineWidth: 0,
                marker: { enabled: false },
                enableMouseTracking: false,
                zIndex: 1
            }],
    }), [tag, display, laneH, windowStart, clampedEnd, showGrid, isLast, minTh, maxTh, color, metadata]);
    return (<div onDoubleClick={onDoubleClick} className={`relative ${!isLast ? 'border-b border-border' : ''}`} style={{ height: laneH }}>
            {showLabels && (<div className="absolute left-1.5 top-1.5 z-[5]">
                    <div className="text-[8px] font-black text-text-subtle uppercase tracking-[0.08em] mb-[1px]">
                        TAG · LANE {idx + 1}
                    </div>
                    <div className="text-[11px] font-black tracking-[-0.02em]" style={{ color }}>{tag.name}</div>
                </div>)}
            <HighchartsChart options={options}/>
        </div>);
}
