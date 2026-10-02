import React from 'react';

export default function ModernTableWidget({ ws }) {
  const chartPayload = ws?.chartData || ws?.data || ws;

  if (Array.isArray(chartPayload?.columns) && Array.isArray(chartPayload?.rows)) {
    const cols = chartPayload.columns;
    const rows = chartPayload.rows;
    return (
      <div className="flex h-full w-full min-h-0 min-w-0 flex-col p-1">
        <div className="h-full w-full overflow-auto rounded-xl border border-border bg-surface shadow-sm">
          <table className="w-full border-collapse text-left">
            <thead className="sticky top-0 z-10 bg-surface-2 border-b border-border">
              <tr>
                {cols.map((col, idx) => (
                  <th key={col.key || col.id || idx} className={`p-2.5 text-[10px] font-bold tracking-wider text-text-muted uppercase ${idx === 0 ? 'pl-4 text-left' : 'pr-4 text-right'}`}>
                    {col.label || col.key || 'Column'}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 font-mono text-text-primary">
              {rows.map((row, rIdx) => (
                <tr key={rIdx} className="transition-colors hover:bg-surface-2/50">
                  {cols.map((col, cIdx) => {
                    const rowData = row?.data || row || {};
                    const val = rowData[col.key];
                    return (
                      <td key={col.key || cIdx} className={`whitespace-nowrap p-2.5 text-[11px] font-semibold text-text-primary ${cIdx === 0 ? 'pl-4 text-left font-medium text-text-muted' : 'pr-4 text-right'}`}>
                        {typeof val === 'number' ? val.toFixed(2) : (val ?? '—')}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  const timestamps = chartPayload?.labels?.x?.values || [];
  const datasets = chartPayload?.datasets || [];

  return (
    <div className="flex h-full w-full min-h-0 min-w-0 flex-col p-1">
      <div className="h-full w-full overflow-auto rounded-xl border border-border bg-surface shadow-sm">
        <table className="w-full border-collapse text-left">
          <thead className="sticky top-0 z-10 bg-surface-2 border-b border-border">
            <tr>
              <th className="p-2.5 pl-4 text-[10px] font-bold tracking-wider text-text-muted uppercase">
                Time
              </th>
              {datasets.map((ds, idx) => (
                <th key={idx} className="p-2.5 pr-4 text-right text-[10px] font-bold tracking-wider text-text-muted uppercase">
                  {ds.label || ds.tag} {ds.unit ? `(${ds.unit})` : ''}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-border/50 font-mono text-text-primary">
            {timestamps.map((time, tIdx) => (
              <tr key={tIdx} className="transition-colors hover:bg-surface-2/50">
                <td className="whitespace-nowrap p-2.5 pl-4 text-[11px] font-medium text-text-muted">
                  {time}
                </td>
                 {datasets.map((ds, dIdx) => {
                   const cellData = ds.data || ds.values || [];
                   const val = cellData[tIdx];
                   return (
                     <td key={dIdx} className="whitespace-nowrap p-2.5 pr-4 text-right text-[11px] font-semibold text-text-primary">
                       {typeof val === 'number' ? val.toFixed(2) : '—'}
                     </td>
                   );
                 })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
