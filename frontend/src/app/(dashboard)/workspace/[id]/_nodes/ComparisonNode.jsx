'use client';
import React from 'react';
import { TrendingUp, Trash2, Plus } from 'lucide-react';
import { useNodes, useReactFlow } from '@xyflow/react';
import dynamic from 'next/dynamic';

const HighchartsChart = dynamic(() => import('@/src/components/charts/HighchartsChart'), { ssr: false });

export const ComparisonNode = React.memo(({ id }) => {
  const nodes = useNodes();
  const { setNodes } = useReactFlow();

  const allSignals = nodes.flatMap(n => {
    if (n.type === 'signalNode') return [{ label: n.data.label, trendData: n.data.trendData }];
    if (n.type === 'rcaEvidence') return (n.data.signals || []).map(s => ({ label: s.label || s.name, trendData: s.trendData }));
    return [];
  }).filter(s => s.trendData?.length > 1);

  const options = {
    chart: {
      type: 'line',
      height: 380,
      backgroundColor: 'transparent',
      style: { fontFamily: 'inherit' },
      zoomType: 'x'
    },
    title: { text: '' },
    credits: { enabled: false },
    xAxis: {
      type: 'datetime',
      labels: { style: { color: '#64748b', fontSize: '9px', fontWeight: 'bold' } },
      lineColor: '#e2e8f0'
    },
    yAxis: {
      title: { text: '' },
      gridLineColor: '#f1f5f9',
      labels: { style: { color: '#64748b', fontSize: '9px', fontWeight: 'bold' } }
    },
    legend: {
      enabled: true,
      verticalAlign: 'top',
      align: 'right',
      itemStyle: { fontWeight: '900', fontSize: '10px', color: '#334155', textTransform: 'uppercase' },
      symbolRadius: 4
    },
    tooltip: {
      shared: true,
      crosshairs: true,
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderWidth: 1,
      borderColor: '#e2e8f0',
      shadow: true,
      style: { fontSize: '11px' }
    },
    plotOptions: {
      series: {
        lineWidth: 3,
        marker: { enabled: false, states: { hover: { enabled: true, radius: 5 } } },
        states: { hover: { lineWidth: 4 } }
      }
    },
    series: allSignals.map((s, i) => ({
      name: s.label,
      data: s.trendData,
      color: ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'][i % 6]
    }))
  };

  const removeNode = (e) => { e.stopPropagation(); setNodes(nds => nds.filter(n => n.id !== id)); };

  return (
    <div className="bg-surface border-2 border-brand rounded-[2.5rem] shadow-[0_30px_80px_rgba(37,99,235,0.15)] min-w-[800px] overflow-hidden group/compare">
      <div className="bg-gradient-to-r from-brand to-brand/80 px-8 py-5 flex items-center justify-between border-b border-white/20">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-white font-black text-[10px] uppercase tracking-[0.2em] block leading-none opacity-80">Advanced Analytics</span>
            <span className="text-white font-black text-[18px] mt-1 block tracking-tight">Multi-Signal Trend Overlay</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-1.5 bg-white/10 rounded-full border border-white/20">
            <span className="text-white font-black text-[11px] uppercase tracking-tighter">{allSignals.length} Parameters Matched</span>
          </div>
          <button onClick={removeNode} className="p-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl transition-all">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-8">
        {allSignals.length > 0 ? (
          <div className="bg-canvas/50 rounded-3xl p-4 border border-border">
            <HighchartsChart options={options} />
          </div>
        ) : (
          <div className="h-[340px] flex flex-col items-center justify-center gap-5 text-text-subtle">
            <div className="w-24 h-24 bg-surface-2 rounded-[2.5rem] flex items-center justify-center border-2 border-dashed border-border">
              <Plus className="w-10 h-10 text-text-subtle" />
            </div>
            <div className="text-center">
              <span className="text-[16px] font-black text-text-primary block">Compare Trends Side-by-Side</span>
              <span className="text-[12px] font-bold text-text-muted mt-2 block max-w-[280px] leading-relaxed">
                Drag multiple signals from the data drawer here to overlay them on a single synchronized timeline.
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="bg-canvas/80 px-8 py-4 border-t border-border flex items-center justify-between backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-brand shadow-[0_0_8px_rgba(37,99,235,0.5)]" />
          <span className="text-[10px] text-text-subtle font-black uppercase tracking-widest leading-none">High-DPI Visualization Engine Active</span>
        </div>
        <div className="text-[10px] text-text-subtle font-bold italic">Supports zoom, pan, and individual series toggle</div>
      </div>
    </div>
  );
});
ComparisonNode.displayName = 'ComparisonNode';
