'use client';
import React from 'react';
import { X, Play, Save, CheckCircle, AlertCircle, Clock, Code, ArrowLeft } from 'lucide-react';
import { Modal } from '@/src/components/ui/Modal';
import { Spinner } from '@/src/components/ui/Spinner';

export function FunctionCodeBuilderModal({
    isOpen,
    onClose,
    editingFunction,
    onBack,
    name,
    setName,
    description,
    setDescription,
    createdBy,
    setCreatedBy,
    code,
    setCode,
    testInputsStr,
    setTestInputsStr,
    jsonError,
    setJsonError,
    onRunTestClick,
    onSubmit,
    testResult,
    testingCode,
    actionLoading,
}) {
    const validation = testResult?.data?.validation || testResult?.validation;
    const output = testResult?.data?.output !== undefined ? testResult.data.output : testResult?.output;
    const executionTime = testResult?.data?.execution_time_ms ?? testResult?.execution_time_ms;

    return (
        <Modal open={isOpen} onClose={onClose} size="2xl" className="overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-canvas/40">
                <div className="flex items-center gap-3">
                    {!editingFunction && (
                        <button
                            type="button"
                            onClick={onBack}
                            className="p-1.5 text-text-subtle hover:text-text-primary hover:bg-surface rounded-lg transition-colors cursor-pointer"
                            title="Back to configuration"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </button>
                    )}
                    <div className="p-2 bg-brand/10 text-brand rounded-lg">
                        <Code className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-text-primary">
                            {editingFunction ? `Edit Function: ${name}` : `Code Builder: ${name}`}
                        </h3>
                        <p className="text-xs text-text-muted">
                            Write Python code, configure test inputs, and validate execution.
                        </p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="text-text-subtle hover:text-text-primary p-1.5 rounded-lg hover:bg-canvas transition-colors cursor-pointer"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            <form onSubmit={onSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">
                            Function Name <span className="text-danger">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. multi_tag_with_windows"
                            className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">
                            Created By
                        </label>
                        <input
                            type="text"
                            value={createdBy}
                            onChange={(e) => setCreatedBy(e.target.value)}
                            placeholder="e.g. Priyanka Kapse"
                            className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">
                        Description
                    </label>
                    <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Brief summary of function operation..."
                        className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                    />
                </div>

                <div>
                    <div className="flex justify-between items-center mb-1.5">
                        <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider">
                            Python Code <span className="text-danger">*</span>
                        </label>
                        <span className="text-xs text-text-subtle font-mono">Python 3.x</span>
                    </div>
                    <textarea
                        required
                        rows={7}
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="w-full p-3 font-mono text-xs bg-canvas text-text-primary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand leading-relaxed"
                        placeholder="def function_name(...):"
                    />
                </div>

                <div>
                    <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">
                        Test Inputs (JSON)
                    </label>
                    <textarea
                        rows={3}
                        value={testInputsStr}
                        onChange={(e) => {
                            setTestInputsStr(e.target.value);
                            setJsonError(null);
                        }}
                        className="w-full p-3 font-mono text-xs bg-canvas text-text-primary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                    />
                    {jsonError && <p className="text-xs text-danger mt-1">{jsonError}</p>}
                </div>

                {testResult && (
                    <div className="p-4 rounded-xl border border-border bg-canvas/60 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                {(testResult.success || testResult.data?.success) ? (
                                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                                ) : (
                                    <AlertCircle className="w-5 h-5 text-rose-500" />
                                )}
                                <span className="font-semibold text-sm text-text-primary">
                                    {testResult.message || (testResult.success ? 'Function executed successfully' : 'Execution failed')}
                                </span>
                            </div>
                            {executionTime !== undefined && (
                                <div className="flex items-center gap-1.5 text-xs text-text-muted font-mono bg-surface px-2.5 py-1 rounded-md border border-border">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>{executionTime} ms</span>
                                </div>
                            )}
                        </div>

                        {output !== undefined && (
                            <div className="text-xs">
                                <span className="text-text-muted font-semibold">Returned Output:</span>
                                <pre className="mt-1 p-2 bg-surface border border-border rounded-md font-mono text-text-primary overflow-x-auto">
                                    {typeof output === 'object' ? JSON.stringify(output, null, 2) : String(output)}
                                </pre>
                            </div>
                        )}

                        {validation && (
                            <div className="pt-2 border-t border-border/60">
                                <p className="text-xs font-semibold text-text-muted uppercase mb-2">Validation Pipeline Status</p>
                                <div className="flex flex-wrap gap-2 text-xs">
                                    {Object.entries(validation).map(([key, status]) => (
                                        <div key={key} className="flex items-center gap-1 bg-surface px-2.5 py-1 rounded-md border border-border">
                                            <span className="capitalize text-text-muted">{key.replace('_', ' ')}:</span>
                                            <span className={`font-mono font-bold ${status === 'PASS' ? 'text-emerald-600' : status === 'SKIP' ? 'text-text-subtle' : 'text-rose-600'}`}>
                                                {status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-border">
                    <button
                        type="button"
                        onClick={onRunTestClick}
                        disabled={testingCode}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-brand text-brand hover:bg-brand/10 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                    >
                        {testingCode ? <Spinner size="sm" /> : <Play className="w-4 h-4" />}
                        Run & Test Code
                    </button>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium border border-border text-text-muted hover:bg-canvas rounded-lg transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={actionLoading || !name.trim()}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-brand text-white hover:bg-brand-hover rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                        >
                            {actionLoading ? <Spinner size="sm" /> : <Save className="w-4 h-4" />}
                            {editingFunction ? 'Update Function' : 'Save Function'}
                        </button>
                    </div>
                </div>
            </form>
        </Modal>
    );
}
