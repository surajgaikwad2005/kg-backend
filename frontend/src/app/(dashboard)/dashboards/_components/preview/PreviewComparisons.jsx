import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { C } from '../constants';
import { useTheme } from '@/src/context/visuals/ThemeContext';

export function PreviewComparisons({ chartType, data, margin, tickInterval, xAxisLabelConfig, yAxisLabelConfig, datasets, chartColors, miniTooltip }) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const gridStroke = isDark ? '#334155' : '#EEF2F6';
  const tickColor = isDark ? '#64748B' : '#94A3B8';
  const axisStroke = isDark ? '#475569' : '#CBD5E1';

  switch (chartType) {
    case 'bar':
      return (
        <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1} initialDimension={{ width: 100, height: 100 }}>
          <BarChart data={data} layout="vertical" margin={{ top: 8, right: 16, left: 24, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
            <XAxis type="number" tick={{ fontFamily: C.fontMono, fontSize: 9, fill: tickColor }} axisLine={{ stroke: axisStroke }} tickLine={false} />
            <YAxis dataKey="label" type="category" width={50} tick={{ fontFamily: C.fontMono, fontSize: 9, fill: tickColor }} axisLine={false} tickLine={false} />
            <Tooltip content={miniTooltip} cursor={false} />
            {datasets.map((ds, index) => (
              <Bar
                key={`${ds.tag || ds.id}-${index}`}
                dataKey={ds.tag}
                name={ds.label || ds.tag}
                fill={chartColors[index % chartColors.length]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      );

    case 'column':
      return (
        <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1} initialDimension={{ width: 100, height: 100 }}>
          <BarChart data={data} margin={margin}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
            <XAxis dataKey="label" interval={tickInterval} tick={{ fontFamily: C.fontMono, fontSize: 9, fill: tickColor }} axisLine={{ stroke: axisStroke }} tickLine={false} label={xAxisLabelConfig} />
            <YAxis width={40} tick={{ fontFamily: C.fontMono, fontSize: 9, fill: tickColor }} axisLine={false} tickLine={false} label={yAxisLabelConfig} />
            <Tooltip content={miniTooltip} cursor={false} />
            {datasets.map((ds, index) => (
              <Bar
                key={`${ds.tag || ds.id}-${index}`}
                dataKey={ds.tag}
                name={ds.label || ds.tag}
                fill={chartColors[index % chartColors.length]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      );

    default:
      return null;
  }
}
