'use client';
import React from 'react';
import { BrainCircuit, GitBranch, FlaskConical } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar,
} from 'recharts';
// ⚠️ DEMO DATA — performance/resource charts render static fixtures because no
// backend metrics endpoint exists yet (overviewStats IS real, from the hook).
// Replace with a service call + delete the fixture import when the backend
// ships. Tracked as Phase 2 item in the frontend audit (2026-07-11).
// eslint-disable-next-line no-restricted-imports
import { performanceData, resourceData } from '@/src/__fixtures__/model-studio/staticData';

/**
 * Overview tab — stat cards + performance/resource charts.
 *
 * @param {{ overviewStats: object[] | null, isMounted: boolean }} props
 */
export function OverviewTab({ overviewStats, isMounted }) {
  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {Array.isArray(overviewStats)
          ? overviewStats.map((stat, idx) => {
              let Icon = BrainCircuit, bgColor = 'bg-brand-muted', textColor = 'text-brand';
              if (stat.name?.toLowerCase().includes('pipeline')) { Icon = GitBranch; bgColor = 'bg-success/10'; textColor = 'text-success'; }
              else if (stat.name?.toLowerCase().includes('experiment')) { Icon = FlaskConical; bgColor = 'bg-chart-5/10'; textColor = 'text-chart-5'; }
              return (
                <div key={idx} className="bg-surface rounded-xl border border-border p-6 flex flex-col shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[16px] font-medium text-text-muted">{stat.name}</p>
                      <h3 className="text-[32px] font-bold text-text-primary mt-2">{stat.counts}</h3>
                    </div>
                    <div className={`p-2 ${bgColor} ${textColor} rounded-lg`}><Icon className="w-5 h-5" /></div>
                  </div>
                  <div className="mt-4 flex items-center text-[16px]">
                    <span className={stat.info?.includes('+') ? 'text-success font-medium' : 'text-text-muted'}>{stat.info}</span>
                  </div>
                </div>
              );
            })
          : [1, 2, 3].map(i => (
              <div key={i} className="bg-surface rounded-xl border border-border p-6 flex flex-col shadow-sm animate-pulse">
                <div className="flex justify-between items-start">
                  <div className="h-20 w-32 bg-surface-2 rounded" />
                  <div className="h-10 w-10 bg-canvas rounded-lg" />
                </div>
                <div className="mt-4 h-5 w-24 bg-surface-2 rounded" />
              </div>
            ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Area Chart */}
        <div className="bg-surface rounded-xl border border-border p-6 shadow-sm flex flex-col">
          <h3 className="text-[20px] font-bold text-text-primary">Model Performance Trend</h3>
          <p className="text-[16px] text-text-muted mb-6">Accuracy Score over the last 1 month</p>
          <div className="h-72 w-full">
            {isMounted && (
              <ResponsiveContainer width="100%" height={288} minWidth={0}>
                <AreaChart data={performanceData} margin={{ top: 5, right: 30, left: -20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorAccuracy" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-brand)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--color-brand)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorF1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-success)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--color-success)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-subtle)', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-subtle)', fontSize: 12 }} domain={[0.8, 1]} dx={-10} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '14px' }} />
                  <Area type="monotone" dataKey="accuracy" name="Accuracy" stroke="var(--color-brand)" fillOpacity={1} fill="url(#colorAccuracy)" strokeWidth={2} activeDot={{ r: 6 }} />
                  <Area type="monotone" dataKey="f1" name="F1 Score" stroke="var(--color-success)" fillOpacity={1} fill="url(#colorF1)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-surface rounded-xl border border-border p-6 shadow-sm flex flex-col">
          <h3 className="text-[20px] font-bold text-text-primary">Resource Utilization</h3>
          <p className="text-[16px] text-text-muted mb-6">GPU, CPU, and Memory usage this week (%)</p>
          <div className="h-72 w-full">
            {isMounted && (
              <ResponsiveContainer width="100%" height={288} minWidth={0}>
                <BarChart data={resourceData} margin={{ top: 5, right: 30, left: -20, bottom: 5 }} barGap={2} barSize={8}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-subtle)', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-subtle)', fontSize: 12 }} domain={[0, 100]} dx={-10} />
                  <Tooltip cursor={{ fill: 'var(--color-surface-2)' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '14px' }} />
                  <Bar dataKey="gpu" name="GPU" fill="var(--color-brand)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="cpu" name="CPU" fill="var(--color-success)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="memory" name="Memory" fill="var(--color-highlight)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
