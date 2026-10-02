'use client';

import React from 'react';
import { Star } from 'lucide-react';

export default function GroupListView({
  dashboards,
  groups,
  starredDashboards,
  starredGroups,
  toggleStarDashboard,
  toggleStarGroup,
  setActiveDashboardId,
  setActiveGroupId,
}) {
  const items = dashboards || groups || [];
  const starred = starredDashboards || starredGroups || new Set();
  const toggleStar = toggleStarDashboard || toggleStarGroup;
  const setActiveId = setActiveDashboardId || setActiveGroupId;

  const badgeClasses = {
    blue: 'bg-blue-500/10 text-blue-500 border border-blue-500/20',
    red: 'bg-red-500/10 text-red-500 border border-red-500/20',
    green: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20',
    orange: 'bg-amber-500/10 text-amber-500 border border-amber-500/20',
    purple: 'bg-purple-500/10 text-purple-500 border border-purple-500/20'
  };

  return (
    <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="bg-surface-2 border-b border-border text-text-muted font-bold">
              <th className="p-3 w-16 text-center">Starred</th>
              <th className="p-3">Dashboard Name</th>
              <th className="p-3 w-28">Theme</th>
              <th className="p-3 w-40">Last Opened</th>
              <th className="p-3 w-28 text-center">Visuals</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-text-primary font-medium">
            {items.map((item, idx) => {
              const isStarred = starred.has(item.id);
              return (
                <tr
                  key={item.id}
                  onClick={() => setActiveId(item.id)}
                  className="hover:bg-surface-2 cursor-pointer transition-colors"
                >
                  <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => toggleStar(e, item.id)}
                      className="bg-transparent border-none cursor-pointer p-1 text-text-light hover:text-warning"
                      aria-label={isStarred ? "Remove Star" : "Star Dashboard"}
                    >
                      <Star
                        size={14}
                        className={isStarred ? 'fill-warning text-warning' : ''}
                      />
                    </button>
                  </td>
                  <td className="p-3 font-bold">{item.name}</td>
                  <td className="p-3">
                    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase ${badgeClasses[item.theme] || badgeClasses.blue}`}>
                      {item.theme}
                    </span>
                  </td>
                  <td className="p-3 text-text-muted font-semibold">
                    {idx === 0 ? (
                      <span className="inline-flex items-center gap-1 text-success font-semibold text-[11px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                        Active Now
                      </span>
                    ) : (
                      `${idx} hour${idx > 1 ? 's' : ''} ago`
                    )}
                  </td>
                  <td className="p-3 text-center font-bold text-brand text-sm">{item.total_visuals ?? item.visuals?.length ?? 0}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export const DashboardListView = GroupListView;
