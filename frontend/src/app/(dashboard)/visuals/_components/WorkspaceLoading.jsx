'use client';

import React from 'react';

export function WorkspaceLoading() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3.5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/Aivee_timer.gif" alt="Loading..." className="w-30 h-30 object-contain" />
    </div>
  );
}
