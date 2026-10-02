'use client';

/**
 * ProcessLog — terminal-style streaming log (reused by OCR + Extract panels).
 * Auto-scrolls to the latest entry; colourizes error/done lines.
 */
import React, { useRef, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

const lineColor = (msg = '') => {
    const m = msg.toLowerCase();
    if (m.includes('error')) return 'text-danger';
    if (m.includes('done') || m.includes('complete')) return 'text-success';
    return 'text-white/70';
};

export default function ProcessLog({ entries = [], running, emptyLabel = 'Waiting for log output…' }) {
    const endRef = useRef(null);
    useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [entries]);

    return (
        <div className="px-6 py-4 max-h-52 overflow-y-auto bg-[#020617] font-mono text-xs">
            {entries.length === 0 ? (
                <p className="text-text-subtle italic">{emptyLabel}</p>
            ) : (
                entries.map((e, i) => (
                    <div key={`${e.time ?? i}-${e.msg}`} className="flex gap-3 mb-1 leading-relaxed">
                        <span className="text-text-subtle shrink-0 select-none">
                            {e.time ? new Date(e.time).toLocaleTimeString() : ''}
                        </span>
                        <span className={lineColor(e.msg)}>{e.msg}</span>
                    </div>
                ))
            )}
            {running && (
                <div className="flex items-center gap-2 mt-2 text-brand">
                    <Loader2 size={11} className="animate-spin" /><span>Running…</span>
                </div>
            )}
            <div ref={endRef} />
        </div>
    );
}
