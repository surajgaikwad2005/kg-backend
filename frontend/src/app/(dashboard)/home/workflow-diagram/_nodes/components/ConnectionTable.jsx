import React, { useRef, useEffect } from 'react';
import { Table, X, ChevronDown, Plus, Edit2, Check, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function ConnectionTable({
    showTable,
    setShowTable,
    localConnections,
    setLocalConnections,
    showCPCPColumn,
    setShowCPCPColumn,
    editingCell,
    setEditingCell,
    cellValue,
    setCellValue,
    showCPCPDropdown,
    setShowCPCPDropdown,
    isNamingCustom,
    setIsNamingCustom,
    customCPCPName,
    setCustomCPCPName,
    saveCellEdit,
    handleCellKeyDown,
    applyCPCPValue,
    componentType,
    normalizedType
}) {
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowCPCPDropdown(false);
                setIsNamingCustom(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [setShowCPCPDropdown, setIsNamingCustom]);

    if (!showTable || localConnections.length === 0) return null;

    const startCellEdit = (rowIdx, field, value) => {
        setEditingCell({ rowIdx, field });
        setCellValue(value || '');
    };

    return (
        <motion.div
            drag dragMomentum={false}
            role="dialog" aria-modal="true" aria-labelledby="conn-table-title"
            className="absolute top-10 left-0 min-w-[420px] bg-surface border border-border rounded-xl shadow-2xl z-[100] nodrag cursor-default overflow-visible"
            onClick={(e) => e.stopPropagation()}
        >
            <div className="bg-surface-2 px-3 py-2 border-b border-border flex items-center justify-between cursor-move rounded-t-xl">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Table className="w-3.5 h-3.5 text-brand" />
                        <h4 id="conn-table-title" className="text-label font-black uppercase tracking-widest text-text-primary">Connection Mapping</h4>
                    </div>
                    <div className="relative" ref={dropdownRef}>
                        <button onClick={() => setShowCPCPDropdown(!showCPCPDropdown)} className="flex items-center gap-1.5 px-3 py-1 bg-surface border border-border rounded-md shadow-sm hover:border-brand hover:text-brand transition-all text-[9.5px] font-black text-text-secondary cursor-pointer">
                            CPCP <ChevronDown className={`w-3 h-3 transition-transform ${showCPCPDropdown ? 'rotate-180' : ''}`} />
                        </button>
                        <AnimatePresence>
                            {showCPCPDropdown && (
                                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} className="absolute top-full left-0 mt-1 w-36 bg-surface border border-border rounded-lg shadow-xl py-1.5 z-[110]">
                                    {['CPCP1', 'CPCP2', 'CPCP3', 'CPCP4'].map((name) => (
                                        <button key={name} onClick={() => applyCPCPValue(name)} className="w-full px-3 py-1.5 text-left text-label font-bold text-text-secondary hover:bg-brand/10 hover:text-brand flex items-center gap-2 cursor-pointer transition-colors">
                                            <Plus className="w-2.5 h-2.5" /> {name}
                                        </button>
                                    ))}
                                    <div className="h-px bg-border my-1" />
                                    {!isNamingCustom ? (
                                        <button onClick={() => setIsNamingCustom(true)} className="w-full px-3 py-1.5 text-left text-label font-black text-brand hover:bg-brand/10 flex items-center gap-2 cursor-pointer transition-colors">
                                            <Edit2 className="w-2.5 h-2.5" /> CUSTOM CPCP
                                        </button>
                                    ) : (
                                        <div className="px-2 py-1 flex items-center gap-1">
                                            <input
                                                autoFocus
                                                className="w-full bg-surface-2 border border-border focus:border-brand rounded px-1.5 py-1 text-[9px] font-bold outline-none text-text-primary"
                                                placeholder="Enter Name"
                                                value={customCPCPName}
                                                onChange={(e) => setCustomCPCPName(e.target.value)}
                                                onKeyDown={(e) => { if (e.key === 'Enter') applyCPCPValue(customCPCPName.toUpperCase()); }}
                                                aria-label="Custom CPCP name"
                                            />
                                            <button onClick={() => applyCPCPValue(customCPCPName.toUpperCase())} className="p-1 bg-brand text-white rounded hover:bg-brand-hover cursor-pointer transition-colors" aria-label="Apply custom CPCP">
                                                <Check className="w-3 h-3" />
                                            </button>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
                <button onClick={() => setShowTable(false)} className="text-text-muted hover:text-danger transition-colors cursor-pointer" aria-label="Close">
                    <X className="w-3.5 h-3.5" />
                </button>
            </div>

            <div className="max-h-[400px] overflow-auto plant-scrollbar">
                <table className="w-full text-label border-collapse">
                    <thead className="sticky top-0 bg-surface-2 z-10 shadow-sm border-b border-border">
                        <tr className="text-text-muted font-bold uppercase tracking-tighter">
                            <th className="px-3 py-2 text-left border-r border-border text-[9px] w-1/4">From</th>
                            <th className="px-3 py-2 text-left border-r border-border text-[9px] w-1/4">To</th>
                            <th className="px-3 py-2 text-left border-r border-border text-[9px] w-1/4">Corrosion Loop</th>
                            {showCPCPColumn && (
                                <th className="px-3 py-2 text-left text-[9px] min-w-[100px] bg-brand/10 text-brand">
                                    <div className="flex items-center justify-between group">
                                        CPCP
                                        <button aria-label="Remove CPCP column" onClick={() => { setShowCPCPColumn(false); localStorage.setItem(`show_cpcp_${componentType}`, 'false'); }} className="opacity-0 group-hover:opacity-100 hover:text-danger transition-all cursor-pointer">
                                            <X className="w-2.5 h-2.5" />
                                        </button>
                                    </div>
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {localConnections.map((conn, idx) => (
                            <tr key={conn.from + '-' + conn.to + '-' + idx} className="hover:bg-surface-2 transition-colors group/row bg-surface">
                                {['from', 'to', 'loop'].map(field => (
                                    <td key={field} className="px-3 py-2.5 font-bold text-text-primary border-r border-border cursor-text relative min-w-[100px]" onClick={() => startCellEdit(idx, field, conn[field])}>
                                        {editingCell?.rowIdx === idx && editingCell?.field === field ? (
                                            <input autoFocus className="w-full bg-surface-2 text-text-primary outline-none border border-brand focus:ring-1 focus:ring-brand rounded p-1 m-0 -ml-1" value={cellValue} onChange={(e) => setCellValue(e.target.value)} onBlur={saveCellEdit} onKeyDown={handleCellKeyDown} aria-label={`Edit ${field}`} />
                                        ) : (
                                            <span className={`${field === 'loop' ? 'bg-brand/10 text-brand px-1.5 py-0.5 rounded-full font-black text-[8px] uppercase ring-1 ring-brand/20' : 'group-hover/row:text-brand'} transition-colors`}>{conn[field]}</span>
                                        )}
                                    </td>
                                ))}
                                {showCPCPColumn && (
                                    <td className="px-3 py-2.5 font-bold text-brand border-l border-border cursor-text relative min-w-[100px]" onClick={() => startCellEdit(idx, 'cpcp', conn['cpcp'])}>
                                        {editingCell?.rowIdx === idx && editingCell?.field === 'cpcp' ? (
                                            <input autoFocus className="w-full bg-surface-2 text-text-primary outline-none border border-brand focus:ring-1 focus:ring-brand rounded p-1 m-0 -ml-1" value={cellValue} onChange={(e) => setCellValue(e.target.value)} onBlur={saveCellEdit} onKeyDown={handleCellKeyDown} aria-label="Edit CPCP" />
                                        ) : (
                                            <span className="group-hover/row:text-brand-hover">{conn['cpcp'] || '-'}</span>
                                        )}
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="bg-brand/5 px-4 py-2 border-t border-brand/20 flex justify-between items-center rounded-b-xl">
                <p className="text-[8px] font-bold text-brand uppercase tracking-tighter italic">* Auto-saved to cache</p>
                <button onClick={() => setShowTable(false)} className="flex items-center gap-1.5 px-4 py-1.5 bg-brand hover:bg-brand-hover text-white rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-all text-label font-black uppercase tracking-widest cursor-pointer">
                    <Save className="w-3 h-3" /> Save Changes
                </button>
            </div>
        </motion.div>
    );
}
