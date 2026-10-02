import React from 'react';
import { Toggle, TogRow, SliderRow, SegControl, Field } from '@/src/components/ui/FormAtoms';
import { Select } from '@/src/components/ui/Select';
import { MetricInput } from './MetricInput';
import { CHART_TYPES } from './constants';

export function ConfigPanel({ chartType, setChartType, aggregation, setAggregation, interval, setInterval, metricA, onMetricAChange, metricB, onMetricBChange, metricsList }) {
  const selectedType = CHART_TYPES.find(t => t.id === chartType) || CHART_TYPES[0];
  
  return (
    <aside className="w-[280px] bg-surface border-r border-border overflow-y-auto shrink-0 custom-scrollbar">
      <div className="p-4 pt-[18px] pb-3 border-b border-border">
        <div className="flex items-center gap-2 text-[11px] font-extrabold tracking-[0.14em] uppercase text-text-primary">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-[13px] h-[13px] text-brand"><path d="M3 12h4l3-8 4 16 3-8h4" /></svg>
          Chart Settings
        </div>
        <div className="text-[11px] font-medium text-text-muted mt-1.5">Configure source, time and visualization</div>
      </div>

      {/* Chart type grid */}
      <div className="px-[18px] py-[14px] border-b border-border">
        <div className="text-[10px] font-bold tracking-[0.14em] uppercase text-text-subtle mb-2.5">Visualization Type</div>
        <div className="bg-surface border-[1.5px] border-brand rounded-lg shadow-[0_4px_16px_rgba(37,99,235,0.10),_0_0_0_4px_rgba(37,99,235,0.06)] overflow-hidden">
          <div className="flex items-center gap-2.5 px-3 py-2.5 border-b border-border bg-gradient-to-b from-surface-2 to-surface">
            <div className="w-7 h-7 rounded-md bg-brand-muted/20 text-brand flex items-center justify-center shrink-0">{selectedType.icon}</div>
            <div className="flex-1">
              <div className="text-[12.5px] font-bold text-text-primary">{selectedType.label}</div>
              <div className="text-[10.5px] font-medium text-text-muted mt-[1px]">Selected visualization</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-1.5 p-2">
            {CHART_TYPES.map(ct => (
              <button key={ct.id} onClick={() => setChartType(ct.id)} 
                className={`flex items-center gap-2 px-[9px] py-2 rounded-[7px] border transition-colors cursor-pointer text-left
                  ${chartType === ct.id ? 'border-brand/30 bg-brand/10' : 'border-transparent bg-transparent hover:bg-surface-2'}`}>
                <span className={`w-[22px] h-[22px] rounded-md flex items-center justify-center shrink-0 transition-colors
                  ${chartType === ct.id ? 'bg-brand text-white' : 'bg-surface-2 text-text-muted'}`}>{ct.icon}</span>
                <span className={`text-[11.5px] font-semibold leading-[1.2] transition-colors
                  ${chartType === ct.id ? 'text-brand' : 'text-text-secondary'}`}>{ct.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Data source */}
      <div className="px-[18px] py-[14px] border-b border-border">
        <div className="text-[10px] font-bold tracking-[0.14em] uppercase text-text-subtle mb-2.5">Data Source</div>

        <Field label="Series A" note="primary">
          <MetricInput value={metricA} onChange={onMetricAChange} metricsList={metricsList} placeholder="Search metric…" />
        </Field>

        <Field label="Series B" note="optional">
          <MetricInput value={metricB} onChange={onMetricBChange} metricsList={metricsList} placeholder="Add second metric…" />
        </Field>

        <Field label="Aggregation">
          <SegControl options={['avg', 'min', 'max', 'sum', 'count']} value={aggregation} onChange={setAggregation} />
        </Field>
      </div>

      {/* Time settings */}
      <div className="px-[18px] py-[14px]">
        <div className="text-[10px] font-bold tracking-[0.14em] uppercase text-text-subtle mb-2.5">Time Settings</div>

        <Field label="Interval" note="bucket size">
          {[['1m', '5m', '10m', '15m', '30m'], ['1h', '6h', '12h', '1d']].map((row, ri) => (
            <div key={ri} className={`flex flex-wrap gap-1.5 ${ri === 0 ? 'mb-1.5' : ''}`}>
              {row.map(iv => (
                <button key={iv} onClick={() => setInterval(iv)} 
                  className={`h-[26px] px-2.5 rounded-full font-mono text-[11px] font-semibold cursor-pointer transition-all
                    ${interval === iv 
                      ? 'bg-text-primary border-text-primary text-surface shadow-[0_2px_6px_rgba(15,23,42,0.22)]' 
                      : 'bg-surface border-border text-text-secondary hover:border-text-subtle border'}`}>
                  {iv}
                </button>
              ))}
            </div>
          ))}
        </Field>

        <Field label="Timezone">
          <Select
            options={['UTC +05:30 · IST', 'UTC ±00:00 · GMT', 'UTC −05:00 · EST', 'UTC −08:00 · PST']}
          />
        </Field>
      </div>
    </aside>
  );
}
