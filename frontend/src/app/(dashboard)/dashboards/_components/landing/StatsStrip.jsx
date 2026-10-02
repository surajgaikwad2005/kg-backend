'use client';

import React from 'react';
import { Layout, BarChart2, Star } from 'lucide-react';

export default function StatsStrip({ totalDashboards, totalGroups, totalVisuals, totalStarred }) {
  const count = totalDashboards !== undefined ? totalDashboards : (totalGroups || 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Total Dashboards */}
      <div className="bg-surface border border-border rounded-xl p-4 flex items-center gap-3.5 shadow-sm hover:shadow-md transition-shadow">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-brand/10 text-brand">
          <Layout size={18} />
        </div>
        <div>
          <div className="text-2xl font-extrabold text-text-primary leading-none">{count}</div>
          <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mt-1">Total Dashboards</div>
        </div>
      </div>

      {/* Total Visuals */}
      <div className="bg-surface border border-border rounded-xl p-4 flex items-center gap-3.5 shadow-sm hover:shadow-md transition-shadow">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-success/10 text-success">
          <BarChart2 size={18} />
        </div>
        <div>
          <div className="text-2xl font-extrabold text-text-primary leading-none">{totalVisuals || 0}</div>
          <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mt-1">Total Visuals</div>
        </div>
      </div>

      {/* Starred */}
      <div className="bg-surface border border-border rounded-xl p-4 flex items-center gap-3.5 shadow-sm hover:shadow-md transition-shadow">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-warning/10 text-warning">
          <Star size={18} />
        </div>
        <div>
          <div className="text-2xl font-extrabold text-text-primary leading-none">{totalStarred || 0}</div>
          <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mt-1">Starred</div>
        </div>
      </div>
    </div>
  );
}
