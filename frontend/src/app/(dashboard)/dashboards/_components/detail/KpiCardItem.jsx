'use client';

import React from 'react';
import { motion } from 'framer-motion';
import GetMiniChart from '../widgets/getMiniChart';
import { Sliders, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { getVisualProps } from '../helpers';

export default function KpiCardItem({
  visual,
  idx,
  total,
  isFloating = false,
  editMode = false,
  onEdit,
  onDelete,
  onMove,
}) {
  const vProps = getVisualProps(visual);
  const data = vProps.data;
  const datasets = data.datasets || [];
  const dataset = datasets[0] || {};
  const datasetData = dataset?.data || dataset?.values || (Array.isArray(data.data) ? data.data : []);
  const lastPoint = datasetData.length > 0 ? datasetData[datasetData.length - 1] : undefined;

  const rawValue = (data.value !== undefined && data.value !== null && data.value !== 0)
    ? data.value
    : (lastPoint !== undefined ? lastPoint : (data.value ?? 0));
  const value = typeof rawValue === 'number' ? rawValue : (Number(rawValue) || 0);
  const unit = data.unit || dataset.unit || data.labels?.y?.unit || '';
  const desc = data.description || dataset.description || data.label || dataset.label || '';
  const visualType = vProps.type;
  const isKpi = visualType === 'kpi' || visualType === 'kpi_card' || visualType === 'kpigrid';

  const colors = [
    'border-t-brand hover:border-brand/40',
    'border-t-success hover:border-success/40',
    'border-t-warning hover:border-warning/40',
    'border-t-danger hover:border-danger/40',
    'border-t-highlight hover:border-highlight/40'
  ];
  const borderClass = isFloating ? colors[idx % colors.length] : '';

  return (
    <motion.div
      key={visual.id}
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ layout: { type: 'spring', stiffness: 350, damping: 25 }, opacity: { duration: 0.2 } }}
      className={
        isFloating
          ? `bg-surface border border-border border-t-2 ${borderClass} rounded-xl p-3.5 flex items-center justify-between min-h-[100px] relative shadow-card hover:shadow-panel hover:-translate-y-0.5 transition-all duration-300 group gap-2 overflow-hidden`
          : 'bg-surface p-3.5 flex items-center justify-between min-h-[100px] relative hover:bg-surface-2/40 transition-colors duration-200 group gap-2 overflow-hidden'
      }
    >
      {editMode && (
        <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-surface/90 border border-border shadow-sm rounded-md p-0.5 z-10">
          {idx > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMove(visual.id, 'left');
              }}
              className="p-1 rounded hover:bg-surface-2 text-text-muted hover:text-brand transition-colors cursor-pointer"
              title="Move Left"
            >
              <ChevronLeft size={11} />
            </button>
          )}
          {idx < total - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMove(visual.id, 'right');
              }}
              className="p-1 rounded hover:bg-surface-2 text-text-muted hover:text-brand transition-colors cursor-pointer"
              title="Move Right"
            >
              <ChevronRight size={11} />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(visual);
            }}
            className="p-1 rounded hover:bg-surface-2 text-text-muted hover:text-brand transition-colors cursor-pointer"
            title="Edit Properties"
          >
            <Sliders size={11} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(visual.id);
            }}
            className="p-1 rounded hover:bg-danger/10 text-text-muted hover:text-danger transition-colors cursor-pointer"
            title="Delete Visual"
          >
            <Trash2 size={11} />
          </button>
        </div>
      )}

      <div className={`w-[55%] min-w-0 flex flex-col justify-center ${isKpi ? 'w-full items-center text-center px-1' : 'pr-2'}`}>
        <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1 truncate w-full" title={visual.title}>
          {visual.title}
        </div>
        <div className={`flex items-baseline gap-1 truncate w-full ${isKpi ? 'justify-center' : ''}`}>
          <span className="text-xl font-extrabold text-text-primary leading-none tracking-tight truncate">
            {typeof value === 'number' ? (isKpi ? value : value.toFixed(1)) : value}
          </span>
          {unit && (
            <span className="text-[11px] font-bold text-text-muted flex-shrink-0">
              {unit}
            </span>
          )}
        </div>
        <div
          className="text-[9.5px] text-text-subtle font-medium mt-1.5 truncate w-full"
          title={desc}
        >
          {desc}
        </div>
      </div>

      {!isKpi && (
        <div className="w-[45%] max-w-[140px] h-20 sm:h-22 flex-shrink-0 flex items-center justify-center relative overflow-hidden ml-auto">
          <GetMiniChart
            isMini={true}
            ws={{
              id: visual.id,
              type: visualType,
              chartType: visualType,
              visual_type: visualType,
              data: data,
              chartData: data,
            }}
          />
        </div>
      )}
    </motion.div>
  );
}
