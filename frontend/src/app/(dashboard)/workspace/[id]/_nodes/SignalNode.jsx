'use client';
import React from 'react';
import { Activity, ChevronUp, ChevronDown, Trash2, Shield, Loader2 } from 'lucide-react';
import { useReactFlow, useNodes, NodeResizer, Handle, Position } from '@xyflow/react';
import dynamic from 'next/dynamic';

const HighchartsChart = dynamic(() => import('@/src/components/charts/HighchartsChart'), { ssr: false });

export const SignalNode = React.memo(({ id, data, selected }) => {
  const { setNodes } = useReactFlow();
  const nodes = useNodes();

  const globalUpper = nodes.filter(n => n.type === 'threshold' && n.data?.type === 'upper')[0]?.data?.value;
  const globalLower = nodes.filter(n => n.type === 'threshold' && n.data?.type === 'lower')[0]?.data?.value;
  const upperLimit = data.upperLimit ?? globalUpper;
  const lowerLimit = data.lowerLimit ?? globalLower;

  const options = {
    chart: { type: 'area', height: 110, margin: [2, 0, 2, 0], backgroundColor: 'transparent', spacing: [0, 0, 0, 0] },
    title: { text: '' },
    credits: { enabled: false },
    xAxis: { visible: false },
    yAxis: {
      visible: false,
      plotLines: [
        ...(upperLimit !== undefined ? [{ value: upperLimit, color: '#ef4444', dashStyle: 'shortdash', width: 1.5, zIndex: 5, label: { text: `H: ${upperLimit}`, align: 'left', style: { color: '#ef4444', fontSize: '7px', fontWeight: 'bold' } } }] : []),
        ...(lowerLimit !== undefined ? [{ value: lowerLimit, color: '#3b82f6', dashStyle: 'shortdash', width: 1.5, zIndex: 5, label: { text: `L: ${lowerLimit}`, align: 'left', style: { color: '#3b82f6', fontSize: '7px', fontWeight: 'bold' } } }] : []),
      ],
    },
    legend: { enabled: false },
    tooltip: { enabled: true, shared: true, valueDecimals: 2, headerFormat: '', pointFormat: '{point.y}' },
    plotOptions: { series: { lineWidth: 2.5, color: '#6366f1', fillOpacity: 0.08, marker: { enabled: false }, states: { hover: { lineWidth: 3 } } } },
    series: [{ data: data.trendData || [] }],
  };

  const isCurrentlyBreaching = data.trendData?.some(([, val]) =>
    (upperLimit !== undefined && val > upperLimit) || (lowerLimit !== undefined && val < lowerLimit)
  );

  return (
    <div className={`bg-surface border-2 rounded-[2rem] shadow-2xl overflow-hidden h-full flex flex-col min-w-[300px] min-h-[260px] transition-all duration-500 ${isCurrentlyBreaching ? 'border-danger ring-4 ring-danger/10 scale-[1.01]' : 'border-border'}`}>
      <NodeResizer color="#6366f1" isVisible={selected} minWidth={300} minHeight={260} handleStyle={{ width: 8, height: 8, borderRadius: '50%' }} />

      <div className={`px-5 py-4 border-b flex items-center justify-between shrink-0 ${isCurrentlyBreaching ? 'bg-danger/5 border-danger/20' : 'bg-surface-2 border-border'}`}>
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-2xl flex items-center justify-center ${isCurrentlyBreaching ? 'bg-danger text-white shadow-lg' : 'bg-brand text-white shadow-lg'}`}>
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[12px] font-black text-text-primary tracking-tight block max-w-[160px] truncate">{data.label}</span>
            <span className="text-[9px] font-bold text-text-subtle uppercase tracking-widest">{data.tagId}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isCurrentlyBreaching && (
            <div className="px-3 py-1 bg-danger rounded-full animate-bounce shadow-lg">
              <span className="text-[8px] font-black text-white uppercase tracking-widest">CRITICAL</span>
            </div>
          )}
          <button onClick={(e) => { e.stopPropagation(); setNodes(nds => nds.filter(n => n.id !== id)); }} className="p-1.5 bg-surface border border-border text-text-subtle hover:text-danger hover:border-danger/20 rounded-lg transition-all shadow-sm cursor-pointer" aria-label="Remove signal node">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="px-5 py-3 bg-surface border-b border-border flex items-center gap-4">
        <div className="flex-1">
          <label className="text-[8px] font-black text-text-subtle uppercase block mb-1">Max Limit</label>
          <div className="relative">
            <input type="number" placeholder="None" value={data.upperLimit ?? ''} onChange={(e) => { const val = e.target.value === '' ? undefined : parseFloat(e.target.value); setNodes(nds => nds.map(n => n.id === id ? { ...n, data: { ...n.data, upperLimit: val } } : n)); }} className="w-full bg-surface-2 border border-border rounded-xl px-2 py-1.5 text-[12px] font-black text-danger outline-none focus:border-danger/50 transition-all shadow-inner" />
            <ChevronUp className="w-2.5 h-2.5 absolute right-2 top-1/2 -translate-y-1/2 text-danger/50" />
          </div>
        </div>
        <div className="flex-1">
          <label className="text-[8px] font-black text-text-subtle uppercase block mb-1">Min Limit</label>
          <div className="relative">
            <input type="number" placeholder="None" value={data.lowerLimit ?? ''} onChange={(e) => { const val = e.target.value === '' ? undefined : parseFloat(e.target.value); setNodes(nds => nds.map(n => n.id === id ? { ...n, data: { ...n.data, lowerLimit: val } } : n)); }} className="w-full bg-surface-2 border border-border rounded-xl px-2 py-1.5 text-[12px] font-black text-info outline-none focus:border-info/50 transition-all shadow-inner" />
            <ChevronDown className="w-2.5 h-2.5 absolute right-2 top-1/2 -translate-y-1/2 text-info/50" />
          </div>
        </div>
      </div>

      <div className="flex-1 w-full p-3 min-h-0 relative">
        {data.trendData?.length > 1 ? (
          <HighchartsChart options={options} containerProps={{ style: { height: '100%', width: '100%' } }} />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-surface-2 rounded-2xl gap-2 border-2 border-dashed border-border">
            <Loader2 className="w-6 h-6 text-highlight animate-spin" />
          </div>
        )}
      </div>

      <div className="px-5 py-3 bg-surface-2 border-t border-border flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isCurrentlyBreaching ? 'bg-danger' : 'bg-success'}`} />
          <span className={`text-[10px] font-black uppercase tracking-widest ${isCurrentlyBreaching ? 'text-danger' : 'text-success'}`}>
            {isCurrentlyBreaching ? 'BREACH DETECTED' : 'OPERATING OK'}
          </span>
        </div>
        <div className="flex items-center gap-1.5 grayscale opacity-50">
          <Shield className="w-3 h-3 text-text-muted" />
          <span className="text-[9px] font-black text-text-muted">SECURE Node</span>
        </div>
      </div>

      <Handle type="source" position={Position.Right} className="w-2 h-2 opacity-0" />
      <Handle type="target" position={Position.Left} className="w-2 h-2 opacity-0" />
    </div>
  );
});
SignalNode.displayName = 'SignalNode';
