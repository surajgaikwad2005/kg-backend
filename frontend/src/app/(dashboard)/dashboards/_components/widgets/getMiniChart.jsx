import React, { memo } from 'react';
import ModernLineWidget from './ModernLineWidget';
import ModernAreaWidget from './ModernAreaWidget';
import ModernBarWidget from './ModernBarWidget';
import ModernComboWidget from './ModernComboWidget';
import ModernGaugeWidget from './ModernGaugeWidget';
import ModernKpiWidget from './ModernKpiWidget';
import ModernTableWidget from './ModernTableWidget';
import ModernHeatmapWidget from './ModernHeatmapWidget';
import ModernThresholdWidget from './ModernThresholdWidget';
import ModernMinMaxBandWidget from './ModernMinMaxBandWidget';

// Lightweight visual placeholder component to prevent rendering heavy charts during drag/resize.
// This completely resolves rendering lag and maintains 60 FPS performance.
function ChartSkeleton({ chartType }) {
  const isKpi = chartType === 'kpi' || chartType === 'kpi_card';
  const isTable = chartType === 'table';
  
  return (
    <div className="flex h-full w-full flex-col justify-between p-5 bg-surface-2/50 rounded-xl border border-border/50 animate-pulse select-none overflow-hidden">
      {/* Grid & Shimmer */}
      <div className="w-full flex-1 flex flex-col gap-3 justify-center items-center">
        {/* Shimmer icon tailored to chart type */}
        <div className="p-3 bg-surface border border-border-strong/50 shadow-lg shadow-chart-1/20 rounded-xl text-chart-1 flex items-center justify-center">
          {chartType === 'bar' || chartType === 'column' ? (
            <svg className="w-6 h-6 text-chart-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
          ) : isKpi ? (
            <svg className="w-6 h-6 text-chart-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M9 17V11" />
              <path d="M13 17V7" />
              <path d="M17 17V13" />
            </svg>
          ) : chartType === 'gauge' ? (
            <svg className="w-6 h-6 text-chart-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a10 10 0 0 1 10 10" />
              <path d="M12 22a10 10 0 0 1-10-10" />
              <path d="m16 12-4-4" />
            </svg>
          ) : isTable ? (
            <svg className="w-6 h-6 text-chart-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3h18v18H3z" />
              <path d="M3 9h18" />
              <path d="M3 15h18" />
              <path d="M12 3v18" />
            </svg>
          ) : (
            // Default Line, Area, Combo, Heatmap, Threshold, MinMax
            <svg className="w-6 h-6 text-chart-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3v18h18" />
              <path d="m18.7 8-5.1 5.2-2.8-2.7L7 14.3" />
            </svg>
          )}
        </div>
        <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-1">
          Resizing visual...
        </div>
      </div>
      
      {/* Visual divider matching X axis */}
      {!isKpi && !isTable && (
        <>
          <div className="h-[1px] w-full bg-border/50 mt-1" />
          {/* Bottom simulated labels */}
          <div className="flex justify-between items-center mt-2 px-1">
            <div className="h-2 w-12 bg-border/40 rounded-sm" />
            <div className="h-2 w-8 bg-border/40 rounded-sm" />
          </div>
        </>
      )}
    </div>
  );
}

const GetMiniChart = memo(function GetMiniChart({ ws, uid, isDragging = false, isMini = false }) {
  const chartType = ws?.type?.toLowerCase() || ws?.chartType?.toLowerCase() || 'line';

  if (isDragging) {
    return <ChartSkeleton chartType={chartType} />;
  }

  switch (chartType) {
    case 'line':
      return <ModernLineWidget ws={ws} isMini={isMini} />;
    case 'area':
    case 'stacked_area':
      return <ModernAreaWidget ws={ws} isMini={isMini} />;
    case 'bar':
    case 'column':
      return <ModernBarWidget ws={ws} isMini={isMini} />;
    case 'combo':
      return <ModernComboWidget ws={ws} isMini={isMini} />;
    case 'gauge':
      return <ModernGaugeWidget ws={ws} isMini={isMini} />;
    case 'kpi':
    case 'kpi_card':
      return <ModernKpiWidget ws={ws} isMini={isMini} />;
    case 'table':
      return <ModernTableWidget ws={ws} isMini={isMini} />;
    case 'heatmap':
      return <ModernHeatmapWidget ws={ws} isMini={isMini} />;
    case 'threshold_line':
      return <ModernThresholdWidget ws={ws} uid={uid} isMini={isMini} />;
    case 'min_max_band':
      return <ModernMinMaxBandWidget ws={ws} isMini={isMini} />;
    default:
      return <div className="p-4 text-xs font-bold text-text-muted">Please Select a Chart Type</div>;
  }
});

export default GetMiniChart;
