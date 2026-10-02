'use client';
import React from 'react';
import { Skeleton } from '@/src/components/ui/Skeleton';

/**
 * Loading placeholder that mirrors the layout of <RuleCard /> so the library
 * grid keeps its shape while backend rule tables are being fetched.
 */
export function RuleCardSkeleton() {
  return (
    <div className="bg-surface rounded-3xl border-2 border-border p-6 md:p-7 h-60 flex flex-col justify-between overflow-hidden">
      <div className="flex flex-col h-full">
        {/* Icon tile */}
        <div className="flex items-start justify-between mb-5">
          <Skeleton className="w-12 h-12 rounded-2xl" />
        </div>
        {/* Title + date */}
        <div className="flex-1 min-w-0 space-y-2.5">
          <Skeleton className="h-4 w-3/5 rounded-lg" />
          <Skeleton className="h-2.5 w-2/5 rounded-md" />
        </div>
      </div>
      {/* Footer */}
      <div className="flex items-center justify-between mt-3">
        <Skeleton className="h-2.5 w-16 rounded-md" />
        <Skeleton className="w-8 h-8 rounded-full" />
      </div>
    </div>
  );
}
