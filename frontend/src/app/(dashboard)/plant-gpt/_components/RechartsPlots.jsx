import React from 'react';
import {
  AreaChart, Area,
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Line
} from 'recharts';

function formatTimestamp(ts) {
  const d = new Date(ts);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function formatShortTimestamp(ts) {
  const d = new Date(ts);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
}

export function TimeseriesChart({ plotKey, data }) {
  const chartData = data.x.map((x, i) => ({
    time: x,
    value: data.y[i],
    min: data.min?.[i],
    max: data.max?.[i],
  }));

  const hasMinMax = data.min && data.max && data.min.some((v, i) => v !== data.max[i]);
  const tickCount = Math.min(8, chartData.length);
  const step = Math.floor(chartData.length / tickCount);
  const ticks = chartData.filter((_, i) => i % step === 0).map(d => d.time);

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={chartData} margin={{ top: 8, right: 12, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id={`grad-${plotKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-info)" stopOpacity={hasMinMax ? 0.25 : 0.3} />
            <stop offset="95%" stopColor="var(--color-info)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
        <XAxis dataKey="time" ticks={ticks} tickFormatter={formatShortTimestamp} tick={{ fill: 'var(--color-text-subtle)', fontSize: 10 }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fill: 'var(--color-text-subtle)', fontSize: 10 }} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{ background: 'var(--color-surface)', border: `1px solid var(--color-border)`, borderRadius: 10, fontSize: 11 }}
          labelFormatter={formatTimestamp}
          formatter={(v) => [typeof v === 'number' ? v.toFixed(2) : v]}
        />
        {hasMinMax ? (
          <>
            <Area type="monotone" dataKey="max" stroke="transparent" fill={`url(#grad-${plotKey})`} name="Max" />
            <Area type="monotone" dataKey="min" stroke="transparent" fill="var(--color-surface)" name="Min" fillOpacity={1} />
            <Line type="monotone" dataKey="value" stroke="var(--color-info)" strokeWidth={2} dot={false} name="Value" />
          </>
        ) : (
          <Area type="monotone" dataKey="value" stroke="var(--color-info)" strokeWidth={2} fill={`url(#grad-${plotKey})`} dot={false} name="Value" />
        )}
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function HistogramChart({ data }) {
  const chartData = data.bins.map((bin, i) => ({
    bin: typeof bin === 'number' ? bin.toFixed(2) : bin,
    count: data.counts[i],
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={chartData} margin={{ top: 8, right: 12, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="hist-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-success)" stopOpacity={0.9} />
            <stop offset="100%" stopColor="var(--color-success)" stopOpacity={0.5} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
        <XAxis dataKey="bin" tick={{ fill: 'var(--color-text-subtle)', fontSize: 10 }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fill: 'var(--color-text-subtle)', fontSize: 10 }} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip
          contentStyle={{ background: 'var(--color-surface)', border: `1px solid var(--color-border)`, borderRadius: 10, fontSize: 11 }}
          formatter={(v) => [v, 'Count']}
        />
        <Bar dataKey="count" fill="url(#hist-grad)" radius={[4, 4, 0, 0]} name="Count" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ComparisonBarChart({ data }) {
  const chartData = data.x.map((x, i) => ({
    time: x,
    value: data.y[i],
  }));

  const tickCount = Math.min(8, chartData.length);
  const step = Math.floor(chartData.length / tickCount);
  const ticks = chartData.filter((_, i) => i % step === 0).map(d => d.time);

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={chartData} margin={{ top: 8, right: 12, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="bar-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-highlight)" stopOpacity={0.9} />
            <stop offset="100%" stopColor="var(--color-highlight)" stopOpacity={0.5} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
        <XAxis dataKey="time" ticks={ticks} tickFormatter={formatShortTimestamp} tick={{ fill: 'var(--color-text-subtle)', fontSize: 10 }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fill: 'var(--color-text-subtle)', fontSize: 10 }} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{ background: 'var(--color-surface)', border: `1px solid var(--color-border)`, borderRadius: 10, fontSize: 11 }}
          labelFormatter={formatTimestamp}
          formatter={(v) => [typeof v === 'number' ? v.toFixed(2) : v, 'Value']}
        />
        <Bar dataKey="value" fill="url(#bar-grad)" radius={[4, 4, 0, 0]} name="Value" />
      </BarChart>
    </ResponsiveContainer>
  );
}
