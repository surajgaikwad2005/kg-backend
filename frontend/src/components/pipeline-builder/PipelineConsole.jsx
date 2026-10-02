'use client';
import React, { useState, useEffect } from 'react';
import { Terminal, X } from 'lucide-react';

/**
 * PipelineConsole
 *
 * A resizable console panel that renders test-run output.
 *
 * Props
 * ─────
 * @param {boolean}  isOpen    Whether the panel is visible
 * @param {Function} onClose   Callback to hide the panel
 * @param {string}   output    Pre-formatted text output
 * @param {Function} onClear   Callback to clear the output
 */
export default function PipelineConsole({ isOpen, onClose, output, onClear }) {
  const [consoleHeight, setConsoleHeight] = useState(250);
  const [isResizingConsole, setIsResizingConsole] = useState(false);

  useEffect(() => {
    const onMove = (e) => {
      if (!isResizingConsole) return;
      const newHeight = window.innerHeight - e.clientY;
      if (newHeight > 100 && newHeight < window.innerHeight * 0.8) {
        setConsoleHeight(newHeight);
      }
    };
    const onUp = () => setIsResizingConsole(false);

    if (isResizingConsole) {
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    }
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
  }, [isResizingConsole]);

  if (!isOpen) return null;

  return (
    <div
      style={{ height: consoleHeight }}
      className="border-t border-border bg-white flex flex-col relative shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]"
    >
      {/* Drag-to-resize handle */}
      <div
        className="absolute top-0 left-0 right-0 h-1 cursor-row-resize hover:bg-brand transition-colors z-30"
        onMouseDown={(e) => { e.preventDefault(); setIsResizingConsole(true); }}
      />

      {/* Header */}
      <div className="px-4 py-2 bg-surface-2 border-b border-border flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-text-muted" />
          <span className="text-[12px] font-bold text-text-secondary uppercase tracking-wider">
            Console Output
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onClear}
            className="px-2 py-1 text-[11px] font-bold text-text-muted hover:text-text-primary hover:bg-surface-2 rounded transition-colors"
          >
            Clear
          </button>
          <button
            onClick={onClose}
            className="p-1 text-text-subtle hover:text-text-secondary rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Output */}
      <div className="flex-1 overflow-y-auto p-4 font-mono text-[13px] leading-relaxed scrollbar-thin scrollbar-thumb-border">
        {output ? (
          <div className="whitespace-pre-wrap break-words">
            {output.split('\n').map((line, i) => {
              let color = 'text-text-secondary';
              if (line.includes('❌') || line.toLowerCase().includes('error') || line.toLowerCase().includes('failed'))
                color = 'text-danger font-semibold';
              else if (line.includes('✅') || line.includes('successful') || line.includes('Success'))
                color = 'text-success font-semibold';
              else if (line.includes('Starting') || line.includes('Building'))
                color = 'text-brand font-medium';
              else if (line.includes('⚠️'))
                color = 'text-warning font-medium';
              else if (line.startsWith('──'))
                color = 'text-brand font-bold';

              return (
                <div key={i} className={color}>
                  {line || ' '}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-text-subtle italic">
            No output to display. Run a test to see results.
          </div>
        )}
      </div>
    </div>
  );
}
