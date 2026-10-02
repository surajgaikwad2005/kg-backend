'use client';
import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Play, Code2 } from 'lucide-react';
import { Spinner } from '@/src/components/ui/Spinner';
import { PythonCodeEditor } from './PythonCodeEditor';
import { FunctionConsoleOutput } from './FunctionConsoleOutput';

export function FunctionCodeBuilderView({
    name,
    editingFunction,
    code,
    setCode,
    onBack,
    onRunTestClick,
    onSubmit,
    testResult,
    testingCode,
    actionLoading,
    onClearConsole,
}) {
    const [consoleHeight, setConsoleHeight] = useState(250);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isDragging || !containerRef.current) return;
            const containerRect = containerRef.current.getBoundingClientRect();
            const newHeight = containerRect.bottom - e.clientY;
            
            const minHeight = 45; // Height of just the header
            const maxHeight = containerRect.height - 150;
            
            setConsoleHeight(Math.max(minHeight, Math.min(newHeight, maxHeight)));
        };

        const handleMouseUp = () => {
            if (isDragging) {
                setIsDragging(false);
            }
        };

        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'row-resize';
            document.body.style.userSelect = 'none';
        } else {
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };
    }, [isDragging]);

    return (
        <div
            ref={containerRef}
            className="flex flex-col overflow-hidden bg-surface border border-border rounded-xl shadow-sm"
            style={{ height: 'calc(100vh - 120px)' }}
        >
            {/* Top Header Bar */}
            <div
                className="flex items-center justify-between shrink-0 px-6 py-3.5 border-b border-border bg-surface"
            >
                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        onClick={onBack}
                        className="flex items-center justify-center p-2 border border-border rounded-lg bg-transparent text-text-muted hover:bg-background hover:text-text transition-all duration-150 cursor-pointer"
                        title="Back to Functions List"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2.5">
                            <h2 className="text-xl font-bold text-text m-0">
                                Custom Function Builder
                            </h2>
                            <span className="bg-blue-900/30 text-blue-400 border border-blue-800/50 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                                EXPERIMENTAL
                            </span>
                        </div>
                        <p className="flex items-center gap-1.5 text-[13px] text-text-muted mt-0.5">
                            <Code2 className="w-3.5 h-3.5 text-blue-500" />
                            <span>Custom Python Scripting for Function Logic</span>
                            {name && <span className="font-semibold text-text">({name})</span>}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={onRunTestClick}
                        disabled={testingCode}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-border rounded-lg bg-transparent text-text hover:bg-background transition-all duration-150 cursor-pointer disabled:opacity-50"
                    >
                        {testingCode ? <Spinner size="sm" /> : <Play className="w-4 h-4 text-blue-500 fill-blue-900/50" />}
                        <span>Test Run</span>
                    </button>

                    <button
                        type="button"
                        onClick={onSubmit}
                        disabled={actionLoading || !code.trim()}
                        className="flex items-center gap-2 px-5 py-2 text-sm font-medium border-none rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all duration-150 shadow-sm shadow-blue-900/30 cursor-pointer disabled:opacity-50"
                    >
                        {actionLoading ? <Spinner size="sm" /> : null}
                        <span>{editingFunction ? 'Update Function' : 'Save Function'}</span>
                    </button>
                </div>
            </div>

            {/* Python Code Editor */}
            <div className="flex-1 flex overflow-hidden">
                <PythonCodeEditor code={code} setCode={setCode} name={name} />
            </div>

            {/* Draggable Divider */}
            <div
                onMouseDown={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                }}
                className={`shrink-0 relative z-10 h-1 cursor-row-resize transition-colors duration-150 ease-in-out ${isDragging ? 'bg-blue-500' : 'bg-border hover:bg-blue-400/50'}`}
            />

            {/* Console Output Section */}
            <div style={{ height: `${consoleHeight}px` }} className="shrink-0 flex flex-col">
                <FunctionConsoleOutput
                    functionName={name || 'test'}
                    testResult={testResult}
                    testingCode={testingCode}
                    onClear={onClearConsole}
                />
            </div>
        </div>
    );
}
