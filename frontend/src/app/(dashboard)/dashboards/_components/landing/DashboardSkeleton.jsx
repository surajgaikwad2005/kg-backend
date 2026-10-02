'use client';

import React from 'react';
import { Skeleton } from '@/src/components/ui/Skeleton';

export function SkeletonDashboardCard() {
  return (
    <div className="bg-surface border border-border rounded-xl p-5 flex flex-col justify-between h-[265px] overflow-hidden shadow-sm relative">
      {/* Icon + actions line */}
      <div className="flex items-start justify-between mb-3">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <Skeleton className="w-5 h-5 rounded-md" />
      </div>

      {/* Title */}
      <div className="flex flex-col gap-2 mb-2">
        <Skeleton className="h-5 w-3/4 rounded-lg" />
        <Skeleton className="h-3 w-1/3 rounded" />
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1.5 mb-4">
        <Skeleton className="h-3.5 w-full rounded" />
        <Skeleton className="h-3.5 w-2/3 rounded" />
      </div>

      {/* Sparkline graphic */}
      <Skeleton className="h-[42px] w-full rounded-lg mt-auto" />
    </div>
  );
}

export function SkeletonDashboardGrid({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonDashboardCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonStatsStrip() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-surface border border-border rounded-xl p-4 flex items-center gap-3.5 shadow-sm">
          <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
          <div className="flex flex-col gap-2 flex-1">
            <Skeleton className="h-6 w-16 rounded" />
            <Skeleton className="h-3 w-24 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonDashboardDetail() {
  return (
    <div className="w-full flex flex-col min-h-screen bg-app text-text-primary p-8 space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-56 rounded-lg" />
          <Skeleton className="h-4 w-40 rounded" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-24 rounded-lg" />
          <Skeleton className="h-9 w-28 rounded-lg" />
        </div>
      </div>

      {/* Visual cards grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-surface border border-border rounded-xl p-5 h-80 flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <Skeleton className="h-5 w-40 rounded" />
              <Skeleton className="h-5 w-16 rounded" />
            </div>
            <Skeleton className="flex-1 my-4 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
