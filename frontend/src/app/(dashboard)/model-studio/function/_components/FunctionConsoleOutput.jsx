'use client';
import React from 'react';
import { X, Terminal, CheckCircle2, XCircle, Play } from 'lucide-react';
import { Spinner } from '@/src/components/ui/Spinner';

export function FunctionConsoleOutput({
    testResult,
    testingCode,
    onClear,
    functionName = 'function',
}) {
    const data = testResult?.data || testResult;
    const validation = data?.validation || {};
    const output = data?.output !== undefined ? data.output : testResult?.output;
    const isSuccess = testResult?.success || data?.success;

    const getTimeString = () => {
        return new Date().toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
        });
    };

    // Helper to format validation badge key to display name
    const formatKey = (key) => {
        const k = key.toLowerCase();
        if (k.includes('compile')) return 'COMPILE';
        if (k.includes('exec')) return 'EXECUTION';
        if (k.includes('sdk')) return 'SDK';
        if (k.includes('tag')) return 'TAGS';
        if (k.includes('output')) return 'OUTPUT';
        if (k.includes('perf')) return 'PERF';
        return key.toUpperCase();
    };

    return (
        <div className="flex flex-col shrink-0 h-full w-full bg-surface">
            {/* Console Header Bar */}
            <div className="flex items-center justify-between px-6 py-2.5 border-b border-border bg-background">
                <div className="flex items-center gap-2 text-[13px] font-bold tracking-wider text-text">
                    <span className="text-[14px]">{'>'}_</span>
                    <span>CONSOLE OUTPUT</span>
                </div>
                <div className="flex items-center gap-4 text-xs font-medium">
                    {testResult && (
                        <button
                            type="button"
                            onClick={onClear}
                            className="transition-colors cursor-pointer text-text-muted hover:text-text"
                        >
                            Clear
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={onClear}
                        className="p-0.5 rounded transition-colors cursor-pointer text-text-muted hover:text-text"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Console Body */}
            <div className="flex-1 font-mono overflow-y-auto p-5 text-xs">
                {testingCode ? (
                    <div className="flex items-center gap-3 py-2 text-blue-400">
                        <Spinner size="sm" />
                        <span>[{getTimeString()}] ▶ Running function &ldquo;{functionName}&rdquo;...</span>
                    </div>
                ) : !testResult ? (
                    <p className="text-text-muted text-[13px] italic">
                        No output to display. Run a test to see results.
                    </p>
                ) : (
                    <div className="space-y-4">
                        {/* VALIDATION STATUS section */}
                        {Object.keys(validation).length > 0 && (
                            <div>
                                <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-2.5">
                                    VALIDATION STATUS
                                </p>
                                <div className="flex flex-wrap items-center gap-2">
                                    {Object.entries(validation).map(([key, status]) => {
                                        const isPass = status === 'PASS';
                                        const isSkip = status === 'SKIP';

                                        let badgeClasses = '';
                                        let iconElement;
                                        if (isPass) {
                                            badgeClasses = 'bg-green-900/20 text-green-400 border-green-800/50';
                                            iconElement = <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />;
                                        } else if (isSkip) {
                                            badgeClasses = 'bg-gray-800 text-gray-400 border-gray-700';
                                            iconElement = <span className="w-3.5 h-3.5 text-center leading-none text-gray-400">-</span>;
                                        } else {
                                            badgeClasses = 'bg-red-900/20 text-red-400 border-red-800/50';
                                            iconElement = <XCircle className="w-3.5 h-3.5 text-red-500" />;
                                        }

                                        return (
                                            <div
                                                key={key}
                                                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${badgeClasses}`}
                                            >
                                                {iconElement}
                                                <span>{formatKey(key)}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Console Log Stream */}
                        <div className="space-y-1.5 pt-2 border-t border-border">
                            <div className="flex items-center gap-2 font-mono text-[13px] text-blue-400">
                                <span className="text-text-muted">[{getTimeString()}]</span>
                                <Play className="w-3 h-3 fill-blue-500" />
                                <span>Running function &ldquo;{functionName}&rdquo;...</span>
                            </div>

                            {isSuccess ? (
                                <div className="flex items-center gap-2 font-mono text-[13px] text-green-400">
                                    <span className="text-text-muted">[{getTimeString()}]</span>
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>{testResult.message || 'Function ran successfully'}</span>
                                    {output !== undefined && (
                                        <span className="text-text font-bold ml-1">➔ {JSON.stringify(output)}</span>
                                    )}
                                </div>
                            ) : (
                                <div className="flex flex-col gap-1.5">
                                    <div className="flex items-center gap-2 font-mono text-[13px] text-red-400">
                                        <span className="text-text-muted">[{getTimeString()}]</span>
                                        <span className="text-[14px]">✕</span>
                                        <span>{testResult.message || data?.message || 'Execution error encountered'}</span>
                                    </div>
                                    {(data?.errors || testResult?.errors || []).length > 0 && (
                                        <div className="ml-[108px] pl-3 border-l-2 border-red-500/30 space-y-1">
                                            {(data?.errors || testResult?.errors || []).map((err, i) => (
                                                <div key={i} className="text-[12px] text-red-400 font-mono">
                                                    {err.field ? <span className="font-bold">[{err.field}]</span> : null} {err.message}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
