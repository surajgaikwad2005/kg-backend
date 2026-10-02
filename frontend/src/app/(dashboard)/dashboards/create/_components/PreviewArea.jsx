import React from 'react';
import { DashboardChart } from '@/src/components/charts/DashboardChart';

export function PreviewArea({ chartData, isLoadingData, chartType, showGrid, showLegend, showLabels, crosshair, leftAxis, rightAxis, scaleMode, lineThickness, fillOpacity, colors, thresholds, stats, metricALabel, metricBLabel, interval }) {

  return (
    <main className="flex-1 bg-canvas p-[18px_22px_120px] overflow-y-auto min-w-0">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 mb-3.5">
        <div className="flex items-center gap-1.5">
          {[
            <svg key="1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><circle cx="11" cy="11" r="7" /><line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>,
            <svg key="2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><circle cx="11" cy="11" r="7" /><line x1="8" y1="11" x2="14" y2="11" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>,
          ].map((icon, i) => (
            <button key={i} className="w-8 h-8 grid place-items-center bg-surface border border-border rounded-lg text-text-muted cursor-pointer hover:bg-surface-2 transition-colors">{icon}</button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-[11.5px] text-text-muted">
          {!isLoadingData && chartData.length > 0 && (
            <>
              <span className="inline-flex items-center gap-1.5 h-[26px] px-2.5 bg-success/10 text-success rounded-full text-[10.5px] font-bold tracking-[0.06em]">
                <span className="w-1.5 h-1.5 rounded-full bg-success shadow-[0_0_0_3px_rgba(16,185,129,0.20)]" />
                Live
              </span>
              <span>·</span>
              <span><b className="text-text-secondary font-semibold">{chartData.length}</b> points · binned at {interval}</span>
            </>
          )}
        </div>
      </div>

      {/* Chart card */}
      <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">
        {/* Card header */}
        <div className="flex items-start justify-between gap-4 p-[16px_20px_4px]">
          <div>
            <div className="text-[15px] font-bold text-text-primary tracking-[-0.01em]">
              {metricALabel || 'Select a metric'}{metricBLabel ? ` vs. ${metricBLabel}` : ''}
            </div>
            <div className="text-[11.5px] text-text-muted mt-0.5">
              {stats?.a && <><b className="text-text-secondary font-semibold">avg {stats.a.avg}</b> · <b className="text-text-secondary font-semibold">peak {stats.a.max}</b> · interval {interval}</>}
            </div>
          </div>
          {stats?.a && (
            <span className="inline-flex items-center gap-1.5 h-6 px-2.5 bg-success/10 text-success rounded-full text-[10px] font-extrabold tracking-[0.10em] uppercase shrink-0">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className="w-2.5 h-2.5"><polyline points="4 12 10 18 20 6" /></svg>
              {chartData.length} samples
            </span>
          )}
        </div>

        {/* Chart */}
        <div className="p-[10px_16px_6px]">
          <DashboardChart
            data={chartData}
            isLoading={isLoadingData}
            chartType={chartType}
            showGrid={showGrid}
            showLegend={showLegend}
            showLabels={showLabels}
            crosshair={crosshair}
            leftAxis={leftAxis}
            rightAxis={rightAxis}
            scaleMode={scaleMode}
            lineThickness={lineThickness}
            fillOpacity={fillOpacity}
            colors={colors}
            thresholds={thresholds}
            stats={stats}
            metricALabel={metricALabel}
            metricBLabel={metricBLabel}
            interval={interval}
          />
        </div>

        {/* Legend strip */}
        {chartData.length > 0 && (
          <div className="flex items-center gap-4.5 p-[8px_20px_14px] border-t border-border mt-1 text-[11.5px]">
            <span className="inline-flex items-center gap-2 text-text-secondary">
              <span className="w-4.5 h-[3px] rounded-[2px] shrink-0" style={{ background: colors.a }} />
              {metricALabel || 'Series A'}
              {stats?.a && <small className="text-text-muted font-mono text-[10.5px] font-medium ml-1">avg {stats.a.avg} · peak {stats.a.max}</small>}
              <span className="font-mono text-[9.5px] font-bold tracking-[0.06em] text-text-subtle bg-surface-2 px-1.5 py-px rounded ml-0.5">L-AXIS</span>
            </span>
            {metricBLabel && stats?.b && (
              <span className="inline-flex items-center gap-2 text-text-secondary">
                <span className="w-4.5 h-[3px] rounded-[2px] shrink-0" style={{ background: colors.b }} />
                {metricBLabel}
                <small className="text-text-muted font-mono text-[10.5px] font-medium ml-1">avg {stats.b.avg} · peak {stats.b.max}</small>
                <span className="font-mono text-[9.5px] font-bold tracking-[0.06em] text-text-subtle bg-surface-2 px-1.5 py-px rounded ml-0.5">R-AXIS</span>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Preview data table */}
      {chartData.length > 0 && (
        <div className="mt-3.5 bg-surface border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between p-[12px_16px] border-b border-border">
            <div className="flex items-center gap-2">
              <span className="text-[12.5px] font-bold text-text-primary">Preview Data</span>
              <span className="text-[11px] text-text-subtle font-semibold bg-surface-2 px-2 py-0.5 rounded-full">5 of {chartData.length}</span>
            </div>
          </div>
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr>
                {['Timestamp', 'Value A', 'Value B', 'Min A', 'Max A'].map((h, i) => (
                  <th key={h} className={`text-[10px] font-bold tracking-[0.10em] uppercase text-text-subtle p-[9px_16px] bg-surface-2 border-b border-border ${i > 0 ? 'text-right' : 'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {chartData.slice(-5).reverse().map((row, i) => (
                <tr key={i} className="bg-surface hover:bg-surface-2 transition-colors">
                  <td className="p-[9px_16px] border-b border-border font-mono text-[11.5px] text-text-secondary">{row.label}</td>
                  <td className="p-[9px_16px] border-b border-border text-right font-semibold" style={{ color: colors.a }}>{row.a?.toFixed(2)}</td>
                  <td className="p-[9px_16px] border-b border-border text-right font-semibold" style={{ color: colors.b }}>{row.b?.toFixed(2) ?? '—'}</td>
                  <td className="p-[9px_16px] border-b border-border text-right text-text-secondary">{row.min_a?.toFixed(2)}</td>
                  <td className="p-[9px_16px] border-b border-border text-right text-text-secondary">{row.max_a?.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
