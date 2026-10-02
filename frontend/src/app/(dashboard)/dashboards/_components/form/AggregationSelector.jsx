import React from 'react';

export default function AggregationSelector({ aggregation, setAggregation }) {
  return (
    <div className="py-2 border-b border-border/50">
      <label className="block text-[10px] font-bold text-text-subtle tracking-[0.12em] uppercase mb-2">Aggregation</label>
      <div className="flex flex-wrap gap-1.5">
        {['avg', 'min', 'max', 'sum', 'count', 'last'].map(ag => {
          const isActive = aggregation === ag;
          return (
            <button
              key={ag}
              onClick={() => setAggregation(ag)}
              className={`h-7 px-2.5 rounded-full border-[1.5px] text-[10.5px] font-bold transition-colors cursor-pointer ${isActive ? 'border-brand bg-brand/10 text-brand shadow-sm shadow-brand/10' : 'border-border bg-surface text-text-secondary hover:bg-surface-2'}`}
            >
              {ag.toUpperCase()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
