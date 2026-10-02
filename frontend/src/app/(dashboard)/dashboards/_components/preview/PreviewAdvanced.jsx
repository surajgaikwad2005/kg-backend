import React from 'react';
import { PreviewGauge } from './PreviewGauge';
import { PreviewHeatmap } from './PreviewHeatmap';

export function PreviewAdvanced({ chartType, data, datasets, seriesKeys, chartColors, chartData }) {
  switch (chartType) {
    case 'kpi':
    case 'kpi_card': {
      const chartPayload = chartData || {};
      if (datasets.length > 1) {
        return (
          <div className="grid grid-cols-2 gap-3.5 p-2 h-full w-full overflow-y-auto">
            {datasets.map((ds, index) => {
              const activeValue = ds?.data && ds.data.length > 0 ? ds.data[ds.data.length - 1] : 0;
              const unit = ds?.unit || '';
              const label = ds?.label || ds?.tag || 'KPI Value';
              const color = chartColors[index % chartColors.length];
              return (
                <div key={index} className="flex items-center justify-center p-4 bg-canvas border border-border rounded-2xl shadow-sm">
                  <div className="text-center">
                    <div style={{ color }} className="text-[28px] font-extrabold leading-none">
                      {typeof activeValue === 'number' ? activeValue.toFixed(2) : activeValue}
                      <span className="text-[12px] font-medium text-text-muted"> {unit}</span>
                    </div>
                    <div className="text-[10px] text-text-muted mt-1.5">{label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        );
      }
      const ds = datasets[0];
      const activeValue = chartPayload.value !== undefined
        ? chartPayload.value
        : (ds?.data && ds.data.length > 0 ? ds.data[ds.data.length - 1] : 0);
      const unit = chartPayload.unit || ds?.unit || '';
      const label = chartPayload.label || chartPayload.title || ds?.label || 'KPI Value';
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div style={{ color: chartColors[0] }} className="text-[52px] font-extrabold leading-none">
              {typeof activeValue === 'number' ? activeValue.toFixed(2) : activeValue}
              <span className="text-[20px] font-medium text-text-muted"> {unit}</span>
            </div>
            <div className="text-[12px] text-text-muted mt-2">{label}</div>
          </div>
        </div>
      );
    }

    case 'gauge': {
      return <PreviewGauge datasets={datasets} chartColors={chartColors} chartData={chartData} />;
    }

    case 'table': {
      const chartPayload = chartData || {};
      if (Array.isArray(chartPayload.columns) && Array.isArray(chartPayload.rows)) {
        const cols = chartPayload.columns;
        const rows = chartPayload.rows;
        return (
          <div className="h-full overflow-y-auto text-[11px] border border-border rounded-lg">
            <table className="w-full border-collapse">
              <thead className="sticky top-0 z-[1]">
                <tr>
                  {cols.map((col, idx) => (
                    <th key={col.key || col.id || idx} className={`p-2 font-bold text-[9px] text-text-muted border-b border-border bg-canvas ${idx === 0 ? 'text-left' : 'text-right'}`}>
                      {col.label || col.key || 'Column'}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 35).map((row, rIdx) => {
                  const rowData = row?.data || row || {};
                  return (
                    <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-surface' : 'bg-canvas/50'}>
                      {cols.map((col, cIdx) => {
                        const val = rowData[col.key];
                        return (
                          <td key={col.key || cIdx} className={`p-2 border-b border-border/40 text-text-secondary ${cIdx === 0 ? 'text-left font-mono text-[9.5px]' : 'text-right'}`}>
                            {typeof val === 'number' ? val.toFixed(2) : (val ?? '—')}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      }

      const columns = ['Time', ...seriesKeys];
      return (
        <div className="h-full overflow-y-auto text-[11px] border border-border rounded-lg">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 z-[1]">
              <tr>
                {columns.map((col, idx) => (
                  <th key={col} className={`p-2 font-bold text-[9px] text-text-muted border-b border-border bg-canvas ${idx === 0 ? 'text-left' : 'text-right'}`}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.slice(0, 35).map((row, rIdx) => (
                <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-surface' : 'bg-canvas/50'}>
                  <td className="p-2 border-b border-border/40 text-left text-text-muted font-mono text-[9.5px]">
                    {row.time}
                  </td>
                  {seriesKeys.map((sk) => (
                    <td key={sk} className="p-2 border-b border-border/40 text-right text-text-secondary">
                      {typeof row[sk] === 'number' ? row[sk].toFixed(2) : (row[sk] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    case 'heatmap': {
      return (
        <PreviewHeatmap
          chartData={chartData}
          datasets={datasets}
          seriesKeys={seriesKeys}
          chartColors={chartColors}
        />
      );
    }

    default:
      return null;
  }
}
