'use client';

import React from 'react';
import { PlusCircle } from 'lucide-react';

export default function GroupCardAdd({ onClick }) {
  return (
    <div
      onClick={onClick}
      className="dashboard-card-add border-2 border-dashed border-border hover:border-brand bg-transparent hover:bg-surface rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-250 h-full min-h-[265px] group"
    >
      <PlusCircle
        size={36}
        className="text-text-light/70 group-hover:text-brand group-hover:scale-115 transition-all duration-250 mb-3"
      />
      <div className="text-[14px] font-bold text-text-primary mb-1">New Dashboard</div>
      <div className="text-[12px] text-text-muted max-w-[180px] leading-relaxed">
        Create a new dashboard to organize your visuals
      </div>
    </div>
  );
}

export const DashboardCardAdd = GroupCardAdd;
