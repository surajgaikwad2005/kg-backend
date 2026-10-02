'use client';
import React from 'react';

export function RiskTemplateCardSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading template"
      className="bg-surface rounded-3xl border-2 border-border p-6 md:p-7 h-60 flex flex-col justify-between animate-pulse"
    >
      <div className="flex items-start justify-between">
        <div className="w-12 h-12 bg-surface-2 rounded-2xl" />
        <div className="w-8 h-8 bg-surface-2 rounded-xl" />
      </div>
      <div className="space-y-2.5">
        <div className="h-5 bg-surface-2 rounded-lg w-3/4" />
        <div className="h-3 bg-surface-2 rounded-md w-1/3" />
      </div>
      <div className="flex items-center justify-between">
        <div className="h-3 bg-surface-2 rounded-md w-16" />
        <div className="w-8 h-8 rounded-full bg-surface-2" />
      </div>
    </div>
  );
}
