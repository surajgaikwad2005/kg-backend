'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, BarChart2, Activity, Grid3x3, ChevronDown, ChevronUp } from 'lucide-react';
import { HeatmapChart } from './HeatmapChart';
import { TimeseriesChart, HistogramChart, ComparisonBarChart } from './RechartsPlots';

function humanizeKey(key) {
  return key
    .replace(/_vs_time$/, '')
    .replace(/_distribution$/, ' Distribution')
    .replace(/_comparison$/, ' Comparison')
    .replace(/_heatmap$/, ' Heatmap')
    .replace(/_correlation$/, ' Correlation')
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function SinglePlot({ plotKey, plotData, mode, isDark, index }) {
  const [collapsed, setCollapsed] = useState(false);

  const title = humanizeKey(plotKey);

  const iconMap = {
    timeseries: <Activity className="w-3.5 h-3.5" />,
    histogram:  <BarChart2 className="w-3.5 h-3.5" />,
    bar:        <TrendingUp className="w-3.5 h-3.5" />,
    heatmap:    <Grid3x3 className="w-3.5 h-3.5" />,
    correlation:<Grid3x3 className="w-3.5 h-3.5" />,
  };

  const accentMap = {
    timeseries:  { text: 'text-info', bg: 'bg-info/10', badgeBg: 'bg-info/15' },
    histogram:   { text: 'text-success', bg: 'bg-success/10', badgeBg: 'bg-success/15' },
    bar:         { text: 'text-highlight', bg: 'bg-highlight/10', badgeBg: 'bg-highlight/15' },
    heatmap:     { text: 'text-warning', bg: 'bg-warning/10', badgeBg: 'bg-warning/15' },
    correlation: { text: 'text-warning', bg: 'bg-warning/10', badgeBg: 'bg-warning/15' },
  };

  const accent = accentMap[mode] || accentMap.timeseries;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: [0.4, 0, 0.2, 1] }}
      className="rounded-2xl overflow-hidden mt-2.5 bg-surface border border-border"
    >
      {/* Chart header */}
      <div
        className={`flex items-center justify-between px-3.5 py-2.5 cursor-pointer ${collapsed ? '' : 'border-b border-border'} ${accent.bg}`}
        onClick={() => setCollapsed(c => !c)}
      >
        <div className="flex items-center gap-2">
          <div className={accent.text}>{iconMap[mode] || iconMap.timeseries}</div>
          <span className="text-[12px] font-bold text-text-primary tracking-tight">{title}</span>
          <span className={`text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full ${accent.text} ${accent.badgeBg}`}>
            {mode}
          </span>
        </div>
        <button className="bg-transparent border-none cursor-pointer flex items-center text-text-subtle">
          {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
      </div>

      {!collapsed && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.25 }}
          className="pt-3 pr-2 pb-3 pl-0"
        >
          {mode === 'timeseries'              && <TimeseriesChart plotKey={plotKey} data={plotData} />}
          {mode === 'histogram'               && <HistogramChart data={plotData} />}
          {mode === 'bar'                     && <ComparisonBarChart data={plotData} />}
          {(mode === 'heatmap' || mode === 'correlation') && <HeatmapChart data={plotData} isDark={isDark} />}
        </motion.div>
      )}
    </motion.div>
  );
}

export function PlotRenderer({ plots, metadata, isDark }) {
  if (!plots || Object.keys(plots).length === 0) return null;

  const mode = metadata?.mode || 'timeseries';

  return (
    <div className="flex flex-col gap-1 w-full">
      {Object.entries(plots).map(([key, data], i) => (
        <SinglePlot
          key={key}
          plotKey={key}
          plotData={data}
          mode={mode}
          isDark={isDark}
          index={i}
        />
      ))}
    </div>
  );
}
