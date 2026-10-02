'use client';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { RotateCcw } from 'lucide-react';
import { PIPELINE_LOG_LABELS } from '@/src/types/admin';
import { useLogTail } from '@/src/components/admin/_queries/useLogManagementQueries';
import { useApp } from '@/src/context/AppContext';
export function PipelineLogsViewer() {
    const { plantCode } = useApp();
    const [selectedKey, setSelectedKey] = useState('docs_pipeline');
    const [autoRefresh, setAutoRefresh] = useState(false);
    const logEndRef = useRef(null);

    const { data, isLoading, isFetching, error, refetch } = useLogTail(plantCode, selectedKey, 500, { autoRefresh });
    // Memoized so the scroll-into-view effect below only re-runs when the log
    // lines actually change, not on every unrelated re-render (CLAUDE.md rule 23).
    const lines = useMemo(() => data?.lines || [], [data]);
    const totalLines = data?.total_lines || 0;

    useEffect(() => {
        if (lines.length > 0)
            logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [lines]);
    const getLineColor = (line) => {
        if (line.includes('ERROR') || line.includes('FAILED') || line.includes('EXCEPTION'))
            return 'text-danger';
        if (line.includes('WARNING') || line.includes('WARN'))
            return 'text-warning';
        if (line.includes('COMPLETE') || line.includes('SUCCESS') || line.includes('✅'))
            return 'text-success';
        if (line.includes('━━━') || line.includes('STEP') || line.includes('START'))
            return 'text-info font-semibold';
        return 'text-text-muted';
    };
    return (<div className="space-y-4">
      {/* Log file selector */}
      <div className="flex items-center gap-3 flex-wrap">
        {Object.keys(PIPELINE_LOG_LABELS).map(key => (<button key={key} onClick={() => setSelectedKey(key)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedKey === key
                ? 'bg-brand text-surface'
                : 'bg-surface border border-border text-text-secondary hover:border-brand'}`}>
            {PIPELINE_LOG_LABELS[key]}
          </button>))}
        <div className="ml-auto flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-text-muted cursor-pointer">
            <input type="checkbox" checked={autoRefresh} onChange={e => setAutoRefresh(e.target.checked)} className="rounded border-border"/>
            Auto-refresh (5s)
          </label>
          <button onClick={() => refetch()} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-surface border border-border text-text-secondary hover:border-brand transition-all">
            <RotateCcw size={12} className={isFetching ? 'animate-spin' : ''}/>
            Refresh
          </button>
        </div>
      </div>

      {/* Info bar */}
      <div className="flex items-center justify-between text-xs text-text-subtle px-1">
        <span>{PIPELINE_LOG_LABELS[selectedKey]} log — last 500 lines of {totalLines} total</span>
        {autoRefresh && <span className="text-brand font-medium">● Live</span>}
      </div>

      {/* Log viewer */}
      <div className="bg-surface-2 rounded-xl overflow-hidden border border-border-strong">
        <div className="h-[520px] overflow-y-auto p-4 font-mono text-xs leading-relaxed">
          {isLoading ? (<div className="text-text-muted text-center py-20">Loading log…</div>) : error ? (<div className="text-danger text-center py-20">{error.message || 'Failed to load log'}</div>) : lines.length === 0 ? (<div className="text-text-muted text-center py-20">
              No log content yet — run a pipeline first.
            </div>) : (lines.map((line, i) => (<div key={i} className={`whitespace-pre-wrap break-all ${getLineColor(line)}`}>
                {line || <span className="opacity-0">_</span>}
              </div>)))}
          <div ref={logEndRef}/>
        </div>
      </div>
    </div>);
}
