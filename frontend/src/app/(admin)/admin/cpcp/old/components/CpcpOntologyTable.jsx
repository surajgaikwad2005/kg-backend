'use client';

import React, { useState } from 'react';
import { Plus, Tags, AlertCircle, X, Loader2, Search, Boxes, Sparkles } from 'lucide-react';
import { ConfirmDialog } from '@/src/components/ui/ConfirmDialog';
import { Select } from '@/src/components/ui/Select';
import { useCpcpOntology } from '../hooks/useCpcpOntology';
import { OntologyRow } from './OntologyRow';
import { AddAttributeModal } from './AddAttributeModal';
import { CpcpOntologySkeleton } from './CpcpOntologySkeleton';

export function CpcpOntologyTable() {
    const {
        columns,
        rows,
        filteredRows,
        loading,
        search,
        setSearch,
        addRow,
        updateField,
        setFlag,
        toggleEdit,
        saveRow,
        deleteRow,
        addColumn,
        removeColumn,
        clientName,
        availableWorkspaces,
        isAgentRunning,
        switchWorkspace,
        verifyRow,
        runAgent,
    } = useCpcpOntology();

    const [actionError, setActionError] = useState('');
    const [addAttrOpen, setAddAttrOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [removeColTarget, setRemoveColTarget] = useState(null);
    const [pending, setPending] = useState(false);

    const run = async (fn, fallback) => {
        try {
            setActionError('');
            await fn();
        } catch (err) {
            setActionError(err?.message || fallback);
            throw err;
        }
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        setPending(true);
        try {
            await run(() => deleteRow(deleteTarget.key), 'Failed to delete equipment.');
            setDeleteTarget(null);
        } catch {
            /* surfaced via banner */
        } finally {
            setPending(false);
        }
    };

    const confirmRemoveColumn = async () => {
        if (!removeColTarget) return;
        setPending(true);
        try {
            await run(() => removeColumn(removeColTarget.key), 'Failed to remove attribute.');
            setRemoveColTarget(null);
        } catch {
            /* surfaced via banner */
        } finally {
            setPending(false);
        }
    };

    const colCount = 4 + columns.length + (clientName ? 1 : 0);

    return (
        <div className="w-full flex flex-col gap-6 font-sans">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 px-1">
                <div>
                    <div className="flex items-center gap-3">
                        <h2 className="text-[22px] font-extrabold text-text-primary tracking-tight">
                            CPCP
                        </h2>
                        {/* Workspace Selector */}
                        <div className="min-w-56">
                            <Select
                                value={clientName || ''}
                                onChange={switchWorkspace}
                                placeholder="Select Workspace (Sandbox)"
                                options={availableWorkspaces.map((ws) => ({ value: ws, label: ws }))}
                            />
                        </div>
                    </div>
                    <p className="text-sm text-text-muted mt-1 font-medium">
                        Equipment tags and their ontology attributes
                    </p>
                </div>
                <div className="flex items-center gap-2.5">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-subtle pointer-events-none" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search tag…"
                            className="w-44 sm:w-56 pl-9 pr-3 py-2.5 text-[13px] rounded-xl border border-border bg-surface text-text-secondary placeholder:text-text-subtle focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                        />
                    </div>
                    {clientName && (
                        <button
                            onClick={() => run(runAgent, 'Failed to run CPCP Agent.')}
                            disabled={loading || isAgentRunning}
                            aria-busy={isAgentRunning}
                            className="bg-highlight hover:bg-highlight-hover disabled:opacity-50 text-white px-4 py-2.5 rounded-xl font-bold text-[12px] tracking-wider uppercase flex items-center gap-2 transition-all shadow-md shadow-highlight/20 hover:shadow-lg hover:shadow-highlight/30 active:scale-[0.98] cursor-pointer disabled:cursor-not-allowed"
                        >
                            {isAgentRunning ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Sparkles className="w-4 h-4" />
                            )}
                            {isAgentRunning ? 'Running Agent...' : 'Run CPCP Agent'}
                        </button>
                    )}
                    {!clientName && (
                        <button
                            onClick={() => setAddAttrOpen(true)}
                            disabled={loading}
                            className="bg-surface border border-border hover:border-border-strong hover:bg-surface-2 text-text-muted px-4 py-2.5 rounded-xl font-bold text-[12px] tracking-wider uppercase flex items-center gap-2 transition-all shadow-sm active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Tags className="w-4 h-4" strokeWidth={2.5} /> Add Attribute
                        </button>
                    )}
                    <button
                        onClick={addRow}
                        disabled={loading || isAgentRunning}
                        className="bg-brand hover:bg-brand-hover text-white px-5 py-2.5 rounded-xl font-bold text-[12px] tracking-wider uppercase flex items-center gap-2 transition-all shadow-md shadow-brand/20 hover:shadow-lg hover:shadow-brand/30 active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Plus className="w-4 h-4" strokeWidth={3} /> Add Equipment
                    </button>
                </div>
            </div>

            {/* Action error banner */}
            {actionError && (
                <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm animate-in fade-in slide-in-from-top-1 duration-200">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span className="flex-1">{actionError}</span>
                    <button onClick={() => setActionError('')} aria-label="Dismiss error" className="cursor-pointer hover:opacity-70 transition-opacity">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Table */}
            <div className="overflow-auto thin-scrollbar w-full max-h-[calc(100vh-14rem)] bg-surface rounded-2xl shadow-card border border-border/40 relative transition-colors duration-300">
                <table className="w-full text-left min-w-[900px] border-collapse">
                    <thead className="sticky top-0 z-20 bg-canvas/95 backdrop-blur-sm shadow-sm border-b border-border transition-colors duration-300">
                        <tr className="text-[11px] uppercase tracking-widest font-extrabold text-text-muted">
                            <th className="px-5 py-4 w-12 text-center">Sr.</th>
                            <th className="px-4 py-4 w-36">Tag</th>
                            {clientName && <th className="px-4 py-4 w-20">Page</th>}
                            <th className="px-4 py-4 min-w-[220px]">Equipment Description</th>
                            {columns.map((col) => (
                                <th key={col.key} className="px-3 py-4 min-w-[130px] text-center">
                                    <div className="group inline-flex items-center justify-center gap-1.5">
                                        <span className="normal-case tracking-normal font-bold text-[12px] text-text-muted">
                                            {col.label}
                                        </span>
                                        {!clientName && (
                                            <button
                                                onClick={() => setRemoveColTarget(col)}
                                                title={`Remove ${col.label}`}
                                                aria-label={`Remove ${col.label}`}
                                                className="opacity-0 group-hover:opacity-100 text-border-strong hover:text-danger transition-all cursor-pointer"
                                            >
                                                <X className="w-3.5 h-3.5" strokeWidth={2.5} />
                                            </button>
                                        )}
                                    </div>
                                </th>
                            ))}
                            <th className="px-5 py-4 w-36 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <CpcpOntologySkeleton columns={columns} clientName={clientName} />
                        ) : rows.length === 0 ? (
                            <tr>
                                <td colSpan={colCount} className="px-4 py-16 text-center">
                                    <div className="flex flex-col items-center gap-3 text-text-muted">
                                        <Boxes className="w-8 h-8 text-border-strong" />
                                        <span className="text-sm font-medium">No equipment yet.</span>
                                        <button
                                            onClick={addRow}
                                            className="mt-1 inline-flex items-center gap-2 bg-brand hover:bg-brand-hover text-white px-4 py-2 rounded-lg text-[12px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                                        >
                                            <Plus className="w-3.5 h-3.5" strokeWidth={3} /> Add Equipment
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ) : filteredRows.length === 0 ? (
                            <tr>
                                <td colSpan={colCount} className="px-4 py-16 text-center text-text-muted text-sm">
                                    No equipment matches “{search}”.
                                    <button onClick={() => setSearch('')} className="ml-2 text-brand hover:underline cursor-pointer font-semibold">
                                        Clear search
                                    </button>
                                </td>
                            </tr>
                        ) : (
                            filteredRows.map((row, index) => (
                                <OntologyRow
                                    key={row.key}
                                    row={row}
                                    index={index}
                                    columns={columns}
                                    clientName={clientName}
                                    onUpdateField={updateField}
                                    onSetFlag={setFlag}
                                    onToggleEdit={toggleEdit}
                                    onSave={(key) => run(() => saveRow(key), 'Failed to save equipment.').catch(() => { })}
                                    onDelete={setDeleteTarget}
                                    onVerify={verifyRow}
                                />
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modals */}
            {addAttrOpen && <AddAttributeModal onClose={() => setAddAttrOpen(false)} onSubmit={addColumn} />}

            <ConfirmDialog
                open={!!deleteTarget}
                onClose={() => !pending && setDeleteTarget(null)}
                onConfirm={confirmDelete}
                isPending={pending}
                title="Delete equipment?"
                description={deleteTarget ? `“${deleteTarget.tag || 'this row'}” will be removed from the ontology.` : ''}
                confirmLabel="Delete"
            />

            <ConfirmDialog
                open={!!removeColTarget}
                onClose={() => !pending && setRemoveColTarget(null)}
                onConfirm={confirmRemoveColumn}
                isPending={pending}
                title="Remove attribute?"
                description={
                    removeColTarget
                        ? `“${removeColTarget.label}” and its values across all equipment will be removed.`
                        : ''
                }
                confirmLabel="Remove"
            />
        </div>
    );
}
