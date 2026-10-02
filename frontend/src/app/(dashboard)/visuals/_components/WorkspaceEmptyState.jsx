'use client';

import React from 'react';
import { BarChart2 } from 'lucide-react';

export function WorkspaceEmptyState({ workspace }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3.5 text-text-subtle">
      <BarChart2 size={48} strokeWidth={1} />
      <div className="text-center">
        <div className="text-body font-black text-text-secondary uppercase tracking-widest">No Data Loaded</div>
        <div className="text-caption text-text-subtle mt-1.5">
          Click <strong>Fetch Data</strong> to visualize {workspace.tags.length} configured tag{workspace.tags.length !== 1 ? 's' : ''}.
        </div>
      </div>
    </div>
  );
}
