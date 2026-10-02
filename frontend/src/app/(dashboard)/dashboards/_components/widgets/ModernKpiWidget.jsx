import React from 'react';

export default function ModernKpiWidget({ ws }) {
  const chartPayload = ws?.chartData || ws?.data || ws || {};
  const datasets = chartPayload?.datasets || [];

  if (datasets.length > 1) {
    return (
      <div className="grid grid-cols-2 gap-3.5 p-3.5 h-full w-full bg-transparent overflow-y-auto min-h-0 [container-type:inline-size]">
        {datasets.map((dataset, idx) => {
          const totalPoints = dataset?.data || dataset?.values || [];
          const activeValue = totalPoints[totalPoints.length - 1] ?? 'N/A';
          const labelText = dataset?.label || 'KPI Metric';
          return (
            <div key={idx} className="flex flex-col items-center justify-center p-3 bg-surface-2/40 rounded-xl border border-border/50 shadow-[0_0_10px_rgba(0,0,0,0.3)] min-w-0">
              <span className="w-full truncate text-center font-black uppercase tracking-widest text-text-muted text-[9px]" title={labelText}>
                {labelText}
              </span>
              <span className="mt-1 font-black text-chart-1 truncate max-w-full text-lg drop-shadow-[0_0_8px_var(--color-chart-1)]">
                {typeof activeValue === 'number' ? activeValue.toFixed(2) : activeValue}
              </span>
              <span className="mt-1.5 text-[8.5px] rounded bg-chart-1/10 border border-chart-1/30 px-1.5 py-0.5 font-bold uppercase text-chart-1 truncate max-w-[90%]">
                {dataset?.label || 'no tag'}
              </span>
            </div>
          );
        })}
      </div>
    );
  }

  const dataset = datasets[0];
  const totalPoints = dataset?.data || dataset?.values || [];
  const activeValue = chartPayload.value !== undefined
    ? chartPayload.value
    : (totalPoints[totalPoints.length - 1] ?? 'N/A');
  const labelText = chartPayload?.title || dataset?.label || 'KPI Metric';

  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-transparent p-4 [container-type:inline-size]">
      <span
        className="w-full truncate text-center font-black uppercase tracking-widest text-text-muted text-[clamp(0.6rem,4cqw,1rem)]"
        title={labelText}
      >
        {labelText}
      </span>

      <span
        className="mt-1.5 font-black leading-none tracking-tight text-chart-1 truncate max-w-full text-[clamp(2rem,15cqw,5rem)] drop-shadow-[0_0_12px_var(--color-chart-1)]"
      >
        {typeof activeValue === 'number' ? activeValue.toFixed(2) : activeValue}
      </span>

      <span
        className="mt-3 truncate rounded-md bg-chart-1/10 border border-chart-1/30 px-2 py-0.5 font-bold uppercase text-chart-1 max-w-[90%] text-[clamp(0.5rem,3cqw,0.8rem)]"
      >
        {chartPayload?.label || dataset?.label || 'no tag'}
      </span>
    </div>
  );
}
