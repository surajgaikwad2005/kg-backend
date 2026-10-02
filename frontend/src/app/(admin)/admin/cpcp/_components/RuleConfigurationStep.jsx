'use client';

import { useCallback } from 'react';
import { Check, Plus, Trash2, X } from 'lucide-react';
import { WizardStepHeader } from './WizardStepHeader';
import { generateId } from '@/src/lib/utils';

const HeaderEditor = ({ col, idx, ruleColumns, onRuleColumnsChange }) => {
    return (
        <div className="flex items-center gap-2 group">
            <input
                value={col.name}
                onChange={(e) => {
                    const newCols = [...ruleColumns];
                    newCols[idx] = { ...newCols[idx], name: e.target.value };
                    onRuleColumnsChange(newCols);
                }}
                placeholder="Column name"
                className="flex-1 bg-transparent border-none outline-none text-xs font-semibold text-text-muted uppercase min-w-[120px]"
            />
            <button
                onClick={() => {
                    onRuleColumnsChange(ruleColumns.filter((_, i) => i !== idx));
                }}
                className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-danger transition-all cursor-pointer"
                title="Remove column"
            >
                <X className="w-3.5 h-3.5" />
            </button>
        </div>
    );
};

export function RuleConfigurationStep({
    ruleConfigurations,
    ruleColumns,
    onChange,
    onRuleConfigurationsSet,
    onRuleColumnsChange,
    onBack,
    onComplete,
}) {
    const addColumn = useCallback(() => {
        const newColId = generateId();
        onRuleColumnsChange([...ruleColumns, { id: newColId, name: '' }]);
    }, [ruleColumns, onRuleColumnsChange]);

    const addRow = useCallback(() => {
        onRuleConfigurationsSet([...ruleConfigurations, { id: generateId() }]);
    }, [ruleConfigurations, onRuleConfigurationsSet]);

    return (
        <div className="w-full max-w-7xl mx-auto">
            <WizardStepHeader
                onBack={onBack}
                backLabel="Back to Topology Knowledge"
                title="Rule Configuration"
                subtitle="Define business rules and relationships dynamically."
            />

            <div className="bg-surface rounded-2xl shadow-sm border border-border/60 overflow-hidden">
                <div className="flex items-center justify-between bg-[#1a2332] text-white px-4 py-2">
                    <span className="text-xs font-bold tracking-wider uppercase">DYNAMIC RULES</span>
                    <button
                        onClick={addColumn}
                        className="flex items-center gap-2 px-3 py-1.5 bg-brand hover:bg-brand-hover text-white rounded-lg text-[11px] font-bold tracking-wider uppercase transition-all cursor-pointer"
                    >
                        <Plus className="w-3.5 h-3.5" /> Add Column
                    </button>
                </div>

                <div className="overflow-x-auto thin-scrollbar p-1">
                    {ruleColumns.length === 0 ? (
                        <div className="py-20 text-center">
                            <p className="text-sm font-bold text-text-muted uppercase tracking-widest">
                                Click "Add Column" to define your table structure
                            </p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-canvas/60 border-b border-border">
                                    {ruleColumns.map((col, idx) => (
                                        <th key={col.id} className="px-4 py-3 border-r border-border/50 last:border-r-0">
                                            <HeaderEditor
                                                col={col}
                                                idx={idx}
                                                ruleColumns={ruleColumns}
                                                onRuleColumnsChange={onRuleColumnsChange}
                                            />
                                        </th>
                                    ))}
                                    <th className="px-4 py-3 text-xs font-semibold text-text-muted uppercase w-16 text-center">
                                        Del
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/60">
                                {ruleConfigurations.length > 0 ? (
                                    ruleConfigurations.map((row) => (
                                        <tr key={row.id} className="hover:bg-warning/5 transition-colors">
                                            {ruleColumns.map((col) => (
                                                <td key={col.id} className="px-4 py-2.5 border-r border-border/50 last:border-r-0 align-top">
                                                    <textarea
                                                        value={row[col.id] || ''}
                                                        onChange={(e) => onChange(row.id, col.id, e.target.value)}
                                                        placeholder="—"
                                                        rows={1}
                                                        className="w-full bg-transparent border-none outline-none text-sm font-medium text-text-primary placeholder:text-text-subtle focus:text-brand transition-colors resize-none overflow-hidden"
                                                        onInput={(e) => {
                                                            e.target.style.height = 'inherit';
                                                            e.target.style.height = `${e.target.scrollHeight}px`;
                                                        }}
                                                    />
                                                </td>
                                            ))}
                                            <td className="px-4 py-2.5 align-middle text-center">
                                                <button
                                                    onClick={() => {
                                                        onRuleConfigurationsSet(
                                                            ruleConfigurations.filter((r) => r.id !== row.id)
                                                        );
                                                    }}
                                                    className="p-1.5 text-text-primary hover:text-danger transition-all cursor-pointer"
                                                    title="Delete row"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={ruleColumns.length + 1} className="px-4 py-8 text-center text-text-muted text-sm">
                                            No rows added yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                {ruleColumns.length > 0 && (
                    <div className="p-3 border-t border-border/60 bg-[#1a2332]/5 flex justify-center">
                        <button
                            onClick={addRow}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-brand hover:bg-brand/10 rounded transition-colors cursor-pointer"
                        >
                            <Plus className="w-3.5 h-3.5" /> Add Row
                        </button>
                    </div>
                )}
            </div>

            <div className="flex items-center justify-end gap-4 mt-8 pt-6 border-t border-border">
                <button
                    onClick={onComplete}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand hover:bg-brand-hover text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-brand/20 focus:outline-none focus:ring-4 focus:ring-brand/20 active:scale-95 cursor-pointer"
                >
                    <Check className="w-4 h-4" />
                    Complete Setup
                </button>
            </div>
        </div>
    );
}
