'use client';
import React from 'react';
import {
    FileCode, Plus, Search, Settings, Archive, X,
    Loader2, CheckCircle2, XCircle, Pause, Play
} from 'lucide-react';
import { DataTable } from '@/src/components/ui/DataTable';
import { ActionsMenuButton } from '@/src/components/ui/ActionsMenuButton';
import { useExpressionPage } from './_hooks/useExpressionPage';

export default function ExpressionBuilder() {
    const p = useExpressionPage();

    const columns = [
        { key: 'expression_id', label: 'ID', render: r => <span className="font-bold text-text-primary tabular-nums">{r.expression_id}</span> },
        { key: 'expression_name', label: 'Expression Name', render: r => <span className="text-text-primary font-bold">{r.expression_name}</span> },
        { key: 'expression', label: 'Expression', render: r => <span className="text-text-muted font-mono text-body-sm max-w-50 truncate" title={r.expression}>{r.expression}</span> },
        { key: 'description', label: 'Description', render: r => <span className="text-text-muted max-w-[150px] truncate" title={r.description}>{r.description || '-'}</span> },
        { key: 'cron_schedule', label: 'Cron Schedule', render: r => (
            <span className="font-mono text-body-sm text-text-secondary">
                {r.cron_schedule ? <span className="bg-surface-2 px-2.5 py-1 rounded-lg text-text-secondary font-bold border border-border/60">{r.cron_schedule}</span> : <span className="text-text-subtle italic font-medium">None</span>}
            </span>
        ) },
        { key: 'created_by', label: 'Created By', render: r => <span className="text-text-muted font-bold">{r.created_by || '-'}</span> },
        { key: 'status', label: 'Status', render: r => (
            <span className={`px-2.5 py-1 text-body-sm font-bold rounded-full capitalize ${(r.status || '').toLowerCase() === 'active' ? 'text-success bg-success/10' : 'text-text-muted bg-surface-2'}`}>
                {r.status || 'Unknown'}
            </span>
        ) },
        { key: 'created_at', label: 'Created At', render: r => <span className="text-text-muted text-sm tabular-nums">{r.created_at ? new Date(r.created_at).toLocaleString() : '-'}</span> },
        { key: 'actions', label: '', cellClassName: 'text-right', render: r => (
            <ActionsMenuButton actions={[
                { label: 'Modify', icon: <Settings className="w-4 h-4 text-text-subtle" />, onClick: () => p.handleEditClick(r) },
                { label: (r.status || '').toLowerCase() === 'active' ? 'Pause' : 'Resume', icon: (r.status || '').toLowerCase() === 'active' ? <Pause className="w-4 h-4 text-text-subtle" /> : <Play className="w-4 h-4 text-text-subtle" />, onClick: () => p.handlePauseResume(r.expression_id, r.status || 'inactive') },
                { label: 'Delete', icon: <Archive className="w-4 h-4 text-danger" />, danger: true, onClick: () => p.handleDelete(r.expression_id) }
            ]} />
        ) }
    ];

    return (
        <div className="flex-1 overflow-y-auto relative bg-canvas/50 p-6 h-full">
            <div className="max-w-7xl mx-auto space-y-6 pb-12 animate-in fade-in duration-500">

                {/* Header */}
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-[26px] font-bold text-text-primary">Expressions</h2>
                        <p className="text-base text-text-muted mt-1">Configure mathematical expressions, dynamic logic, and rule-based models.</p>
                    </div>
                    <button onClick={p.handleCreateClick} className="flex items-center gap-2 bg-brand text-white px-5 py-2.5 rounded-lg hover:bg-brand-hover font-medium text-[15px] transition-all shadow-sm active:scale-95 cursor-pointer">
                        <Plus className="w-4 h-4" />
                        Configure Expression
                    </button>
                </div>

                {/* Expressions List */}
                <div className="pt-6">
                    <h3 className="text-[18px] font-bold text-text-primary mb-4">Expressions List</h3>

                    <div className="relative w-full mb-4">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle" />
                        <input type="text" placeholder="Search expressions by name or ID..." value={p.searchQuery} onChange={e => p.setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2.5 text-[15px] border border-border rounded-xl focus:outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand bg-surface shadow-sm transition-all font-medium" />
                    </div>

                    <div className="flex gap-2 bg-surface-2 p-1 rounded-lg w-max mb-6">
                        {p.filters.map(f => (
                            <button key={f.label} onClick={() => p.setActiveFilter(f.label)} className={`px-4 py-1.5 text-[15px] font-medium rounded-md transition-colors cursor-pointer ${p.activeFilter === f.label ? 'bg-surface text-text-primary shadow-sm' : 'text-text-muted hover:text-text-primary'}`}>
                                {f.label} ({f.count})
                            </button>
                        ))}
                    </div>

                    <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
                        <DataTable
                            columns={columns}
                            rows={p.filteredExpressions}
                            loading={p.isLoading}
                            emptyIcon={<FileCode className="w-12 h-12 text-border-strong" />}
                            emptyTitle="No expressions found"
                            emptyDescription="Try adjusting your search or create a new expression."
                            onRowClick={(r) => p.handleEditClick(r)}
                        />
                    </div>
                </div>
            </div>

            {/* Configure Expression Modal */}
            {p.isConfigureModalOpen && (
                <div className="fixed inset-0 bg-overlay/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div role="dialog" aria-modal="true" aria-labelledby="expression-modal-title" className="bg-surface rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-border/40 flex justify-between items-center bg-surface shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-brand-muted rounded-xl flex items-center justify-center"><FileCode className="w-5 h-5 text-brand" /></div>
                                <div>
                                    <h2 id="expression-modal-title" className="text-[18px] font-bold text-text-primary">{p.modalMode === 'create' ? 'Configure Expression' : 'Modify Expression'}</h2>
                                    <p className="text-body-sm text-text-muted font-medium">Create or update mathematical logic</p>
                                </div>
                            </div>
                            <button onClick={() => p.setIsConfigureModalOpen(false)} aria-label="Close" className="p-2 text-text-subtle hover:bg-surface-2 hover:text-text-muted rounded-lg transition-colors cursor-pointer"><X className="w-5 h-5" /></button>
                        </div>

                        <div className="p-6 overflow-y-auto bg-canvas/30 space-y-5 thin-scrollbar">
                            {p.isLoadingDetail ? (
                                <div className="space-y-5 animate-pulse" aria-busy="true" aria-label="Loading expression details">
                                    <div className="space-y-2"><div className="h-3.5 w-32 bg-surface-2 rounded" /><div className="h-10 w-full bg-surface-2 rounded-xl" /></div>
                                    <div className="space-y-2"><div className="h-3.5 w-24 bg-surface-2 rounded" /><div className="h-10 w-full bg-surface-2 rounded-xl" /></div>
                                    <div className="space-y-2"><div className="h-3.5 w-28 bg-surface-2 rounded" /><div className="h-10 w-full bg-surface-2 rounded-xl" /></div>
                                    <div className="space-y-2"><div className="h-3.5 w-40 bg-surface-2 rounded" /><div className="h-16 w-full bg-surface-2 rounded-xl" /></div>
                                </div>
                            ) : (
                            <>
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-text-secondary">Expression Name <span className="text-danger">*</span></label>
                                <input type="text" placeholder="e.g. Pump Failure Heuristic" className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-text-primary text-[15px] focus:ring-4 focus:ring-brand/10 focus:border-brand transition-all font-medium placeholder:text-text-subtle" value={p.newExpressionForm.name} onChange={e => p.setNewExpressionForm({ ...p.newExpressionForm, name: e.target.value })} />
                            </div>

                            <div className="space-y-2 relative">
                                <label className="block text-sm font-bold text-text-secondary">Expression <span className="text-danger">*</span></label>
                                <div className="relative">
                                    <input ref={p.expressionInputRef} type="text" placeholder="e.g. (Tag1+Tag2)/100" className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-text-primary text-[15px] focus:ring-4 focus:ring-brand/10 focus:border-brand transition-all font-mono placeholder:text-text-subtle placeholder:font-sans" value={p.newExpressionForm.expression} onChange={p.handleExpressionChange} onKeyUp={p.handleCursorActivity} onClick={p.handleCursorActivity} />
                                    {p.isSearchingTags && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-subtle animate-spin" />}
                                </div>
                                {p.tagSearchResults.length > 0 && (
                                    <div className="absolute z-[110] w-full mt-1 max-h-48 overflow-y-auto border border-border rounded-xl bg-surface shadow-xl divide-y divide-border/40 thin-scrollbar">
                                        {p.tagSearchResults.map((tag, i) => {
                                            const displayStr = typeof tag === 'string' ? tag : (tag.iotdb_tag_id && tag.description ? `${tag.description} (${tag.iotdb_tag_id})` : (tag.iotdb_tag_id || tag.tag_name || tag.name || JSON.stringify(tag)));
                                            return (
                                                <button key={tag.iotdb_tag_id ?? i} type="button" onClick={() => p.insertTag(tag)} className="w-full text-left px-4 py-2 hover:bg-brand-muted hover:text-brand text-body-sm font-mono text-text-muted transition-colors flex items-center justify-between group cursor-pointer">
                                                    <span className="truncate pr-2">{displayStr}</span>
                                                    <Plus className="w-4 h-4 opacity-0 group-hover:opacity-100" />
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-text-secondary">Cron Schedule <span className="text-danger">*</span></label>
                                <div className="flex gap-2">
                                    {['Minute', 'Hour', 'Day (Month)', 'Month', 'Day (Week)'].map((label, idx) => (
                                        <div key={label} className="flex flex-col items-center flex-1">
                                            <input type="text" value={p.cronBlocks[idx]} onChange={e => { const val = e.target.value; p.setCronBlocks(prev => { const next = [...prev]; next[idx] = val; return next; }); }} className="w-full text-center px-2 py-2 bg-surface border border-border rounded-xl text-text-secondary text-[15px] font-bold focus:ring-4 focus:ring-brand/10 focus:border-brand transition-all font-mono" />
                                            <span className="text-[10px] font-bold text-text-subtle mt-1 uppercase tracking-wider">{label}</span>
                                        </div>
                                    ))}
                                </div>
                                {p.cronValidation.isLoading ? (
                                    <div className="flex items-center gap-2 text-text-muted text-xs pl-1 font-bold mt-1"><Loader2 className="w-3.5 h-3.5 animate-spin" /><span>Validating cron schedule...</span></div>
                                ) : !p.cronValidation.isValid && p.cronValidation.error ? (
                                    <div className="mt-2 p-3 bg-danger/10 border border-danger/20 text-danger rounded-xl text-body-sm font-medium flex items-start gap-2 animate-in fade-in"><XCircle className="w-4 h-4 text-danger mt-0.5 shrink-0" /><span>{p.cronValidation.error}</span></div>
                                ) : p.cronValidation.isValid && p.cronValidation.description ? (
                                    <div className="mt-2 p-3 bg-success/10 border border-success/20 text-success rounded-xl text-body-sm font-medium flex flex-col gap-0.5 animate-in fade-in">
                                        <div className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-success mt-0.5 shrink-0" /><span className="font-bold">{p.cronValidation.description}</span></div>
                                        {p.cronValidation.nextRun && <span className="text-[11px] text-text-muted font-bold uppercase tracking-wider pl-6 mt-0.5">Next Run: {new Date(p.cronValidation.nextRun).toLocaleString()}</span>}
                                    </div>
                                ) : null}
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-text-secondary">Description <span className="text-text-subtle font-medium">(Optional)</span></label>
                                <textarea rows={3} placeholder="Briefly describe the purpose of this expression..." className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-text-primary text-sm focus:ring-4 focus:ring-brand/10 focus:border-brand transition-all resize-none placeholder:text-text-subtle font-medium" value={p.newExpressionForm.description} onChange={e => p.setNewExpressionForm({ ...p.newExpressionForm, description: e.target.value })} />
                            </div>

                            {p.testResult && (
                                <div className={`mt-4 p-4 rounded-xl border animate-in fade-in ${p.testResult.is_valid ? 'bg-success/10 border-success/20 text-success' : 'bg-danger/10 border-danger/20 text-danger'}`}>
                                    <div className="flex items-center gap-2 font-bold mb-2">
                                        {p.testResult.is_valid ? <CheckCircle2 className="w-5 h-5 text-success" /> : <XCircle className="w-5 h-5 text-danger" />}
                                        {p.testResult.is_valid ? 'Expression is Valid' : 'Invalid Expression'}
                                    </div>
                                    {p.testResult.message && !p.testResult.is_valid && <p className="text-body-sm font-mono mt-1 opacity-80">{p.testResult.message}</p>}
                                    {p.testResult.is_valid && p.testResult.tested_rows !== undefined && <p className="text-body-sm opacity-90 mb-3">Successfully evaluated <b>{p.testResult.success_rows}</b> out of <b>{p.testResult.tested_rows}</b> sample rows.</p>}
                                    {p.testResult.results?.length > 0 && (
                                        <div className="bg-surface rounded border border-black/10 overflow-hidden max-h-[150px] overflow-y-auto thin-scrollbar">
                                            <table className="w-full text-left text-xs">
                                                <thead className="bg-surface sticky top-0 z-10 shadow-sm border-b border-border"><tr><th className="px-3 py-2 font-bold text-text-secondary">Timestamp</th><th className="px-3 py-2 font-bold text-text-secondary">Result</th><th className="px-3 py-2 font-bold text-text-secondary">Message</th></tr></thead>
                                                <tbody className="divide-y divide-black/5">
                                                    {p.testResult.results.slice(0, 5).map((r, i) => (
                                                        <tr key={`result-${i}`}><td className="px-3 py-2 whitespace-nowrap text-text-muted">{new Date(r.timestamp).toLocaleTimeString()}</td><td className="px-3 py-2 font-mono font-bold">{r.result !== null ? Number(r.result).toFixed(2) : '-'}</td><td className="px-3 py-2">{r.message}</td></tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            )}
                            </>
                            )}
                        </div>

                        <div className="px-6 py-4 border-t border-border/40 flex justify-between gap-3 bg-surface shrink-0">
                            <button onClick={p.handleTest} disabled={p.isTesting || p.isLoadingDetail || !p.newExpressionForm.expression} aria-busy={p.isTesting} className="px-5 py-2.5 border border-border text-text-secondary bg-canvas rounded-xl hover:bg-surface-2 font-bold text-sm transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
                                {p.isTesting && <Loader2 className="w-4 h-4 animate-spin" />}Test Logic
                            </button>
                            <div className="flex gap-3">
                                <button onClick={() => p.setIsConfigureModalOpen(false)} className="px-5 py-2.5 border border-border text-text-muted bg-surface rounded-xl hover:bg-canvas font-bold text-sm transition-colors cursor-pointer">Cancel</button>
                                <button disabled={p.isLoadingDetail || !p.newExpressionForm.name || !p.newExpressionForm.expression || p.isSubmitting || !p.testResult?.is_valid || !p.cronValidation.isValid} onClick={p.handleSave} aria-busy={p.isSubmitting}
                                    className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 cursor-pointer ${(p.isLoadingDetail || !p.newExpressionForm.name || !p.newExpressionForm.expression || p.isSubmitting || !p.testResult?.is_valid || !p.cronValidation.isValid) ? 'bg-surface-2 text-text-subtle cursor-not-allowed border border-border' : 'bg-brand text-white hover:bg-brand-hover shadow-md active:scale-95'}`}>
                                    {p.isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {p.modalMode === 'create' ? 'Configure' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast */}
            {p.toast && (
                <div className="fixed bottom-6 right-6 z-[120] animate-in slide-in-from-bottom-5 fade-in duration-300">
                    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border ${p.toast.type === 'success' ? 'bg-success/10 border-success/20 text-success' : 'bg-danger/10 border-danger/20 text-danger'}`}>
                        {p.toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-success" /> : <XCircle className="w-5 h-5 text-danger" />}
                        <p className="font-bold text-sm">{p.toast.message}</p>
                        <button onClick={() => p.setToast(null)} aria-label="Dismiss" className="ml-2 text-text-subtle hover:text-text-muted cursor-pointer"><X className="w-4 h-4" /></button>
                    </div>
                </div>
            )}
        </div>
    );
}
