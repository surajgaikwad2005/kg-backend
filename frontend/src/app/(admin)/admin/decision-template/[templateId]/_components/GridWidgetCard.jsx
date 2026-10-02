'use client';
import React from 'react';
import { X } from 'lucide-react';
import { COL_SPAN_CLASS, ROW_SPAN_CLASS, COL_START_CLASS, ROW_START_CLASS } from '../_lib/gridConfig';
import { WIDGET_PREVIEWS } from './WidgetPreview';

export function GridWidgetCard({ widget, onRemove, widgetTypeMap }) {
    const type = widgetTypeMap?.[widget.typeId];
    if (!type) return null;

    const Icon = type.icon;
    const Preview = WIDGET_PREVIEWS[widget.typeId];
    // Size is chosen per placement (drag-select in GridCanvas), so a widget
    // can be a single cell (start === end — show one coordinate) or a larger
    // custom rectangle (show the full range).
    const rowEnd = widget.row + widget.rowSpan - 1;
    const colEnd = widget.col + widget.colSpan - 1;
    const isSingleCell = rowEnd === widget.row && colEnd === widget.col;

    return (
        <div
            className={`relative flex flex-col justify-between rounded-2xl p-3.5 shadow-md overflow-hidden transition-transform duration-base ease-default hover:-translate-y-0.5 hover:shadow-lg animate-time-selector-in ${type.gradientClass} ${COL_START_CLASS[widget.col + 1]} ${ROW_START_CLASS[widget.row + 1]} ${COL_SPAN_CLASS[widget.colSpan]} ${ROW_SPAN_CLASS[widget.rowSpan]}`}
        >
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                    <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-white/20 shrink-0">
                        <Icon className="w-3.5 h-3.5 text-white" />
                    </span>
                    <span className="text-xs font-black text-white uppercase tracking-wide truncate">{type.label}</span>
                </div>
                <button
                    type="button"
                    onClick={() => onRemove(widget.id)}
                    aria-label={`Remove ${type.label}`}
                    className="shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-white/70 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
                >
                    <X className="w-3.5 h-3.5" />
                </button>
            </div>

            <div className="flex-1 flex items-center justify-center py-1 min-h-0">
                {Preview ? <Preview /> : null}
            </div>

            <div className="flex items-center justify-between text-[10px] font-semibold text-white/70 uppercase tracking-wide">
                <span>Grid Block</span>
                <span className="font-mono normal-case">
                    {isSingleCell ? `[${widget.row}, ${widget.col}]` : `[${widget.row}, ${widget.col}] to [${rowEnd}, ${colEnd}]`}
                </span>
            </div>
        </div>
    );
}
