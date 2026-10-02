'use client';
import React from 'react';
import { AlertTriangle, Image as ImageIcon } from 'lucide-react';

function FlowChartPreview() {
    return (
        <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md bg-white/20 text-[11px] font-bold text-white">Node A</span>
                <span className="w-4 border-t border-dashed border-white/50" />
                <span className="px-2.5 py-1 rounded-md bg-white/20 text-[11px] font-bold text-white">Node B</span>
            </div>
            <span className="h-3 w-px border-l border-dashed border-white/50" />
            <span className="px-2.5 py-1 rounded-md bg-white/25 text-[11px] font-bold text-white">Decision</span>
        </div>
    );
}

function AlertPanelPreview() {
    return (
        <div className="flex flex-col items-center gap-2 text-center px-4">
            <div className="flex items-center gap-1.5 text-white/90 font-bold text-xs tracking-wide uppercase">
                <AlertTriangle className="w-3.5 h-3.5" />
                Critical
            </div>
            <p className="text-white/75 text-xs">Anomalous pattern identified</p>
        </div>
    );
}

function TextPanelPreview() {
    return (
        <div className="w-full px-5 space-y-1.5">
            <span className="block h-2 w-full rounded-full bg-white/35" />
            <span className="block h-2 w-4/5 rounded-full bg-white/35" />
            <span className="block h-2 w-3/5 rounded-full bg-white/35" />
        </div>
    );
}

function AnalyticalChartPreview() {
    return (
        <div className="flex items-end gap-1.5 h-12">
            <span className="w-2.5 h-[45%] rounded-t-sm bg-white/40" />
            <span className="w-2.5 h-[70%] rounded-t-sm bg-white/55" />
            <span className="w-2.5 h-[55%] rounded-t-sm bg-white/45" />
            <span className="w-2.5 h-[95%] rounded-t-sm bg-white/70" />
            <span className="w-2.5 h-[65%] rounded-t-sm bg-white/50" />
        </div>
    );
}

function KpiPanelPreview() {
    return (
        <div className="flex flex-col items-center gap-0.5">
            <span className="text-2xl font-black text-white">86%</span>
            <span className="text-[10px] font-semibold text-white/70 uppercase tracking-wide">Efficiency</span>
        </div>
    );
}

function DataTablePreview() {
    return (
        <div className="w-full px-5 space-y-1">
            {[0, 1, 2].map((row) => (
                <div key={row} className="flex gap-1.5">
                    <span className="h-2 flex-1 rounded-full bg-white/30" />
                    <span className="h-2 flex-1 rounded-full bg-white/30" />
                    <span className="h-2 w-8 rounded-full bg-white/30" />
                </div>
            ))}
        </div>
    );
}

function ImageContainerPreview() {
    return (
        <div className="flex flex-col items-center gap-1.5 text-white/70">
            <ImageIcon className="w-7 h-7" />
            <span className="text-[10px] font-semibold uppercase tracking-wide">No image</span>
        </div>
    );
}

export const WIDGET_PREVIEWS = {
    flowchart_field: FlowChartPreview,
    system_alerts_field: AlertPanelPreview,
    text_field: TextPanelPreview,
    chart_field: AnalyticalChartPreview,
    kpi_field: KpiPanelPreview,
    table_field: DataTablePreview,
    image_field: ImageContainerPreview,
};
