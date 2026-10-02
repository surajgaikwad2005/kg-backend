'use client';

/**
 * ConnectionSidebar — source label, KG action, search, and the connection list:
 * an editable table or a read-only verifiable table, regardless of highlight
 * source (structured or OCR-derived). Collapsible for tablet viewports.
 */
import React, { useState } from 'react';
import { useValidateContext } from '@/src/app/(admin)/admin/domain-configuration/pnid/validate/_context/ValidateContext';
import { Loader2, Search, Trash2, Check, XCircle, ArrowLeftRight, CheckCheck, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ConnectionSidebar() {
    const {
        highlightSource, connections, filteredConnections, searchQuery, setSearchQuery,
        activeConnection, isLoading, isEditingList, isSavingList, isVerifyingAll, verifyAllProgress,
        editableConnections,
        handleSelectConnection, handleVerifyAll, handleStartEditing, handleCancelEditing,
        handleSaveEditing,
        handleEditCell, handleDeleteConnection, handleAddConnection, handleSwapConnection,
    } = useValidateContext();

    const [isOpen, setIsOpen] = useState(true);
    const unverifiedCount = connections.filter((c) => !c.verified && !c.wrong).length;

    return (
        <div className={`relative shrink-0 overflow-hidden bg-surface border-r border-border flex flex-col transition-all duration-300 ease-in-out ${isOpen ? 'w-55 md:w-60 lg:w-[270px] xl:w-[310px] 2xl:w-95' : 'w-10'}`}>

            {/* Toggle button — pinned top-right, always visible within sidebar bounds */}
            <button
                onClick={() => setIsOpen((v) => !v)}
                className="absolute top-4 right-2 z-20 p-1.5 rounded-lg hover:bg-surface-2 transition-colors cursor-pointer text-text-subtle"
                title={isOpen ? 'Collapse connection list' : 'Expand connection list'}
            >
                {isOpen ? <ChevronLeft size={13} /> : <ChevronRight size={13} />}
            </button>

            {/* Collapsed state — vertical label */}
            {!isOpen && (
                <div className="flex-1 flex items-center justify-center pt-14 pb-4">
                    <span
                        className="text-2xs font-black text-text-subtle uppercase tracking-[0.25em] select-none [writing-mode:vertical-rl] rotate-180"
                    >
                        Connections
                    </span>
                </div>
            )}

            {/* Full content — only when open */}
            {isOpen && (
                <>
                    {/* Source + management */}
                    <div className="px-4 py-4 border-b border-border flex flex-col gap-2.5 bg-surface-2/50">
                        <div className="flex items-center justify-between pr-7">
                            <span className="text-label font-black uppercase tracking-wider text-text-subtle truncate">Connection Source</span>
                            {highlightSource && (
                                <span className="px-2 py-0.5 text-2xs font-black uppercase rounded-full border border-brand/30 bg-brand-muted text-brand shrink-0 ml-1">{highlightSource}</span>
                            )}
                        </div>

                        {highlightSource && (
                            <div className="flex items-center justify-between border-t border-border pt-2.5 mt-1 select-none">
                                <span className="text-label font-black text-text-secondary uppercase">Manage</span>
                                <div className="flex items-center gap-1.5">
                                    {!isEditingList && !isVerifyingAll && (
                                        <button
                                            onClick={handleVerifyAll}
                                            disabled={unverifiedCount === 0}
                                            title="Auto-verify all unverified connections"
                                            className="px-2.5 py-1.5 bg-success hover:bg-success/80 disabled:opacity-40 disabled:cursor-not-allowed text-white text-label font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer shadow-sm flex items-center gap-1"
                                        >
                                            <CheckCheck size={11} />
                                            {verifyAllProgress ? `${verifyAllProgress.done}/${verifyAllProgress.total}` : 'Verify All'}
                                        </button>
                                    )}
                                    {isVerifyingAll && (
                                        <span className="px-2.5 py-1.5 bg-success/10 text-success text-label font-black uppercase tracking-wider rounded-lg flex items-center gap-1 border border-success/20">
                                            <Loader2 size={10} className="animate-spin" />
                                            {verifyAllProgress ? `${verifyAllProgress.done}/${verifyAllProgress.total}` : '...'}
                                        </span>
                                    )}
                                    {!isEditingList ? (
                                        <button onClick={handleStartEditing} className="px-3 py-1.5 bg-text-primary hover:bg-brand text-surface hover:text-white text-label font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer shadow-sm">
                                            Edit List
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleSaveEditing}
                                            disabled={isSavingList}
                                            className="px-3 py-1.5 bg-success hover:bg-success/80 disabled:opacity-50 text-white text-label font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer shadow-sm flex items-center gap-1"
                                        >
                                            {isSavingList ? <Loader2 size={11} className="animate-spin" /> : null}
                                            <span>{isSavingList ? 'Saving...' : 'Save'}</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Search — filters filteredConnections */}
                    {!isEditingList && (
                        <div className="p-4 border-b border-border">
                            <div className="relative">
                                <Search size={14} className="absolute left-3 top-3 text-text-subtle" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search tags..."
                                    className="w-full pl-9 pr-4 py-2 border border-border rounded-xl text-xs font-bold outline-none bg-surface text-text-primary focus:border-brand focus:ring-1 focus:ring-brand/20"
                                />
                            </div>
                        </div>
                    )}

                    {/* List */}
                    <div className="flex-1 overflow-y-auto">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-12 gap-3">
                                <Loader2 size={20} className="animate-spin text-text-subtle" />
                                <span className="text-label font-black text-text-subtle uppercase tracking-wider">Loading Options...</span>
                            </div>
                        ) : isEditingList ? (
                            <div className="w-full">
                                <div className="border-x border-b border-border">
                                    <table className="w-full border-collapse text-left text-caption table-fixed">
                                        <thead className="bg-surface-2 sticky top-0 border-b border-border z-10 select-none">
                                            <tr className="divide-x divide-border">
                                                <th className="w-[40%] px-3 py-2 text-label font-black text-text-muted uppercase tracking-wider">From</th>
                                                <th className="w-[40%] px-3 py-2 text-label font-black text-text-muted uppercase tracking-wider">To</th>
                                                <th className="w-[20%] px-3 py-2 text-center text-label font-black text-text-muted uppercase tracking-wider">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {editableConnections.map((conn, i) => (
                                                <tr key={`${conn.from}-${conn.to}-${i}`} className="divide-x divide-border bg-surface hover:bg-surface-2/40">
                                                    <td className="p-0 relative group/td">
                                                        <input type="text" value={conn.from} onChange={(e) => handleEditCell(i, 'from', e.target.value)} className="w-full px-3 py-2 text-xs font-mono font-bold outline-none border-0 bg-transparent focus:bg-brand-muted/30 text-text-secondary uppercase" placeholder="V-101" />
                                                        {conn.from && (
                                                            <span className="absolute left-1 top-full mt-0.5 hidden group-focus-within/td:block group-hover/td:block z-50 bg-overlay-hover text-white text-[10px] py-1 px-2 rounded-md shadow-xl whitespace-nowrap border border-white/10 pointer-events-none">
                                                                {conn.from}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="p-0 relative group/td">
                                                        <input type="text" value={conn.to} onChange={(e) => handleEditCell(i, 'to', e.target.value)} className="w-full px-3 py-2 text-xs font-mono font-bold outline-none border-0 bg-transparent focus:bg-brand-muted/30 text-text-secondary uppercase" placeholder="P-101" />
                                                        {conn.to && (
                                                            <span className="absolute left-1 top-full mt-0.5 hidden group-focus-within/td:block group-hover/td:block z-50 bg-overlay-hover text-white text-[10px] py-1 px-2 rounded-md shadow-xl whitespace-nowrap border border-white/10 pointer-events-none">
                                                                {conn.to}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-1 py-1 text-center">
                                                        <button onClick={() => handleDeleteConnection(i)} className="p-1 text-text-subtle hover:text-danger rounded transition-colors cursor-pointer inline-flex items-center justify-center" title="Delete row">
                                                            <Trash2 size={13} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="p-3 bg-surface-2 border-t border-border">
                                    <button onClick={handleAddConnection} className="w-full py-2.5 border border-dashed border-border-strong hover:border-brand text-text-muted hover:text-brand text-xs font-bold uppercase rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer bg-surface shadow-sm">
                                        + Add Connection
                                    </button>
                                </div>
                            </div>
                        ) : filteredConnections.length > 0 ? (
                            <div className="w-full">
                                <div className="border-x border-b border-border">
                                    <table className="w-full border-collapse text-left text-caption table-fixed">
                                        <thead className="bg-surface-2 sticky top-0 border-b border-border z-10 select-none">
                                            <tr className="divide-x divide-border">
                                                <th className="w-[40%] px-3 py-2 text-label font-black text-text-muted uppercase tracking-wider">From</th>
                                                <th className="w-[40%] px-3 py-2 text-label font-black text-text-muted uppercase tracking-wider">To</th>
                                                <th className="w-[20%] px-3 py-2 text-center text-label font-black text-text-muted uppercase tracking-wider">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {filteredConnections.map((conn, i) => {
                                                const isActive = activeConnection?.from === conn.from && activeConnection?.to === conn.to;
                                                return (
                                                    <tr
                                                        key={i}
                                                        onClick={() => handleSelectConnection(conn)}
                                                        className={`divide-x divide-border transition-colors cursor-pointer text-xs font-mono group ${isActive ? 'bg-brand-muted/70 text-brand font-black' : 'bg-surface text-text-secondary hover:bg-surface-2'}`}
                                                    >
                                                        <td className="px-3 py-2.5 truncate uppercase relative group/td">
                                                            {conn.from || '---'}
                                                            {conn.from && (
                                                                <span className="absolute left-2 top-full mt-0.5 hidden group-hover/td:block z-50 bg-overlay-hover text-white text-[10px] py-1 px-2 rounded-md shadow-xl whitespace-nowrap border border-white/10 pointer-events-none font-sans">
                                                                    {conn.from}
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-3 py-2.5 truncate uppercase relative group/td">
                                                            {conn.to || '---'}
                                                            {conn.to && (
                                                                <span className="absolute left-2 top-full mt-0.5 hidden group-hover/td:block z-50 bg-overlay-hover text-white text-[10px] py-1 px-2 rounded-md shadow-xl whitespace-nowrap border border-white/10 pointer-events-none font-sans">
                                                                    {conn.to}
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-1 py-2.5 text-center">
                                                            <div className="flex items-center justify-center gap-1.5">
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); handleSwapConnection(conn); }}
                                                                    title="Swap FROM ↔ TO"
                                                                    aria-label={`Swap FROM and TO for ${conn.from} to ${conn.to}`}
                                                                    className={`p-1 rounded-md transition-all cursor-pointer ${isActive ? 'text-brand hover:text-brand-hover opacity-100' : 'text-text-subtle hover:text-brand opacity-0 group-hover:opacity-100'}`}
                                                                >
                                                                    <ArrowLeftRight size={13} strokeWidth={2.5} />
                                                                </button>
                                                                {conn.verified ? (
                                                                    <span className="w-5 h-5 rounded-full bg-success/10 text-success border border-success/20 flex items-center justify-center shadow-sm shrink-0"><Check size={11} strokeWidth={3.5} /></span>
                                                                ) : conn.wrong ? (
                                                                    <span className="w-5 h-5 rounded-full bg-danger/10 text-danger border border-danger/20 flex items-center justify-center shadow-sm shrink-0"><XCircle size={12} strokeWidth={2.5} /></span>
                                                                ) : (
                                                                    <span className="w-2 h-2 rounded-full bg-border-strong shrink-0" />
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            <div className="p-8 text-center text-text-subtle text-xs italic font-bold">No connections matched search.</div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}