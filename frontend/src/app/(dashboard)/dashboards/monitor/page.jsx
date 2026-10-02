'use client';
import React from 'react';
import { useDashboardMonitor } from './_hooks/useDashboardMonitor';
import { MonitorChart } from './_components/MonitorChart';
import { MonitorEditModal } from './_components/MonitorEditModal';
import { TIME_PRESETS, SCHEME_COLORS } from './_components/constants';

export default function MonitorPage() {
  const p = useDashboardMonitor();
  const colors = SCHEME_COLORS[p.colorScheme];

  return (
    <>
      <div className="flex flex-col h-screen font-sans bg-canvas text-text-primary text-sm leading-relaxed antialiased">
        {/* Header */}
        <header className="flex items-center justify-between h-[60px] px-7 bg-surface border-b border-border shrink-0">
          <div className="flex items-center gap-2 text-[13px] text-text-secondary min-w-0 overflow-hidden">
            <button onClick={() => p.router.push('/home')} className="bg-transparent border-none text-text-secondary hover:text-text-primary cursor-pointer p-0 text-[13px] font-medium transition-colors shrink-0">Home</button>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} className="w-3 h-3 text-text-subtle shrink-0"><polyline points="9 18 15 12 9 6"/></svg>
            <button onClick={() => p.router.push('/dashboards')} className="bg-transparent border-none text-text-secondary hover:text-text-primary cursor-pointer p-0 text-[13px] font-medium transition-colors shrink-0">Dashboards</button>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} className="w-3 h-3 text-text-subtle shrink-0"><polyline points="9 18 15 12 9 6"/></svg>
            <span className="text-text-primary font-bold overflow-hidden text-ellipsis whitespace-nowrap">{p.title}</span>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <div className="flex items-center gap-[3px] bg-surface-2 rounded-full p-[3px_5px] border border-border">
              {TIME_PRESETS.map(tp => (
                <button key={tp} onClick={() => p.setTimePreset(tp)}
                  className={`h-[26px] px-2.5 rounded-full border-none text-[11px] font-semibold cursor-pointer transition-all duration-120 
                    ${p.timePreset === tp ? 'bg-text-primary text-surface' : 'bg-transparent text-text-secondary hover:text-text-primary'}`}>
                  {tp}
                </button>
              ))}
            </div>
            <button onClick={p.handleRefresh}
              className="inline-flex items-center gap-1.5 h-9 px-3 bg-surface hover:bg-surface-2 border border-border rounded-lg text-text-primary text-[12.5px] font-semibold cursor-pointer transition-colors">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16"/></svg>
              Refresh
            </button>
            <button onClick={() => p.setShowEditModal(true)}
              className="inline-flex items-center gap-1.5 h-9 px-4 bg-text-primary hover:opacity-90 border-none rounded-lg text-surface text-[12.5px] font-semibold cursor-pointer transition-opacity shadow-[0_2px_8px_rgba(15,23,42,0.22)]">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-[13px] h-[13px]"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Edit Dashboard
            </button>
          </div>
        </header>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-[20px_28px_40px] flex flex-col gap-4">

          {/* Chart card */}
          <div className="bg-surface border border-border rounded-[16px] shadow-[0_2px_8px_rgba(15,23,42,0.05)] overflow-hidden">
            <div className="flex items-start justify-between p-[16px_20px_4px]">
              <div>
                <div className="text-[17px] font-bold text-text-primary tracking-[-0.01em]">
                  {p.metricALabel || (p.metricA ? 'Loading…' : 'No metric')}{p.metricBLabel ? ` vs. ${p.metricBLabel}` : ''}
                </div>
                <div className="text-xs text-text-secondary mt-[3px]">
                  {p.stats?.a
                    ? <>avg <b className="text-text-primary">{p.stats.a.avg}</b> · peak <b className="text-text-primary">{p.stats.a.max}</b> · interval <b className="text-text-primary">{p.interval}</b> · <b className="text-text-primary">{p.stats.a.unit}</b></>
                    : p.isLoading ? 'Fetching data…' : 'No data loaded'}
                </div>
              </div>
              {p.chartData.length > 0 && (
                <span className="inline-flex items-center gap-1.5 h-[26px] px-2.5 bg-success/15 text-success rounded-full text-[10px] font-extrabold tracking-[0.10em] uppercase shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-success shadow-[0_0_0_3px_rgba(16,185,129,0.20)]" />
                  Live · {p.chartData.length} pts
                </span>
              )}
            </div>

            <div className="h-[420px] p-[8px_16px_12px]">
              <MonitorChart data={p.chartData} chartType={p.chartType} colors={colors} isLoading={p.isLoading}
                interval={p.interval} stats={p.stats} metricALabel={p.metricALabel} metricBLabel={p.metricBLabel} height={420} />
            </div>

            {p.chartData.length > 0 && (
              <div className="flex items-center gap-5 p-[8px_20px_14px] border-t border-border text-xs">
                <span className="inline-flex items-center gap-2 text-text-primary">
                  <span className="w-5 h-[3px] rounded-[2px]" style={{ background: colors.a }} />
                  {p.metricALabel || 'Series A'}
                  {p.stats?.a && <small className="text-text-secondary font-mono text-[10.5px] font-medium">avg {p.stats.a.avg} · peak {p.stats.a.max} · {p.stats.a.unit}</small>}
                </span>
                {p.metricBLabel && p.stats?.b && (
                  <span className="inline-flex items-center gap-2 text-text-primary">
                    <span className="w-5 h-[3px] rounded-[2px]" style={{ background: colors.b }} />
                    {p.metricBLabel}
                    <small className="text-text-secondary font-mono text-[10.5px] font-medium">avg {p.stats.b.avg} · peak {p.stats.b.max}</small>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Stats cards */}
          {p.stats?.a && (
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: 'Minimum',     value: p.stats.a.min?.toFixed(2), unit: p.stats.a.unit, colorClass: 'text-brand' },
                { label: 'Average',     value: p.stats.a.avg,               unit: p.stats.a.unit, colorClass: 'text-text-primary' },
                { label: 'Maximum',     value: p.stats.a.max?.toFixed(2), unit: p.stats.a.unit, colorClass: 'text-danger' },
                { label: 'Data Points', value: p.stats.a.count,            unit: 'points',     colorClass: 'text-text-primary' },
              ].map(s => (
                <div key={s.label} className="bg-surface border border-border rounded-xl p-[14px_18px]">
                  <div className="text-[9.5px] font-bold tracking-[0.12em] uppercase text-text-subtle mb-1.5">{s.label}</div>
                  <div className={`text-[28px] font-extrabold tabular-nums leading-none ${s.colorClass}`}>{s.value ?? '—'}</div>
                  <div className="text-[11px] text-text-secondary mt-1">{s.unit}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Edit modal */}
      {p.showEditModal && (
        <MonitorEditModal
          config={{ title: p.title, chartType: p.chartType, metricA: p.metricA, metricB: p.metricB, interval: p.interval, timePreset: p.timePreset, tags: p.tags }}
          metricsList={p.metricsList}
          onClose={() => p.setShowEditModal(false)}
          onSave={p.handleEditSave}
        />
      )}
    </>
  );
}
