'use client';
import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { TAG_COLORS } from '@/src/lib/dashboards.utils';
const HighchartsChart = dynamic(() => import('@/src/components/charts/HighchartsChart'), { ssr: false });
export function CombinedChart({ tagData, viewMode, windowStart, clampedEnd, showGrid, onZoom, onDoubleClick, }) {
    const options = useMemo(() => ({
        chart: {
            type: 'line',
            backgroundColor: 'transparent',
            style: { fontFamily: 'inherit' },
            spacing: [10, 16, 30, 60],
            animation: { duration: 300 },
            zooming: { type: 'x' },
            events: {
                selection(e) { if (e.xAxis) {
                    onZoom(e.xAxis[0].min, e.xAxis[0].max);
                    return false;
                } },
            },
        },
        title: { text: '' },
        credits: { enabled: false },
        legend: {
            enabled: true,
            layout: 'horizontal', align: 'right', verticalAlign: 'top',
            itemStyle: { fontSize: '10px', fontWeight: '700', color: '#475569' },
        },
        xAxis: {
            type: 'datetime', min: windowStart, max: clampedEnd,
            labels: { style: { fontSize: '11px', fontWeight: '700', color: '#475569' }, format: '{value:%d %b %H:%M}' },
            lineColor: '#e2e8f0', tickColor: '#e2e8f0',
            gridLineColor: showGrid ? '#f1f5f9' : 'transparent', gridLineWidth: showGrid ? 1 : 0,
        },
        yAxis: viewMode === 'oneLane'
            ? tagData.map((tag, i) => ({
                title: { text: '' }, opposite: i % 2 === 1,
                labels: { style: { color: TAG_COLORS[i % TAG_COLORS.length], fontSize: '9px', fontWeight: '700' }, x: i % 2 === 1 ? 10 : -10 },
                gridLineColor: showGrid ? '#f1f5f9' : 'transparent',
            }))
            : {
                title: { text: '' },
                labels: { style: { fontSize: '10px', fontWeight: '700', color: '#64748b' } },
                gridLineColor: showGrid ? '#f1f5f9' : 'transparent',
            },
        tooltip: {
            shared: true, valueDecimals: 3,
            style: { fontSize: '11px' },
            backgroundColor: 'rgba(255,255,255,0.97)',
            borderColor: '#e2e8f0', shadow: true,
            xDateFormat: '%d %b %Y %H:%M:%S',
        },
        series: tagData.map((tag, i) => ({
            type: 'line',
            name: tag.name,
            data: tag.data.filter(([t]) => t >= windowStart - 60000 && t <= clampedEnd + 60000),
            color: TAG_COLORS[i % TAG_COLORS.length],
            lineWidth: 1.5,
            marker: { enabled: false },
            yAxis: viewMode === 'oneLane' ? i : 0,
        })),
    }), [tagData, viewMode, windowStart, clampedEnd, showGrid]);
    return (<div onDoubleClick={onDoubleClick} className="h-full">
            <HighchartsChart options={options} containerProps={{ style: { height: '100%' } }}/>
        </div>);
}
