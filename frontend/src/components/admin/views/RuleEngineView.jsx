'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Download, Upload, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { useAdminEntities } from '@/src/components/admin/AdminPanelContext';

export function RuleEngineView() {
    const { rules, handleAddRule, handleUpdateRule, handleDeleteRule, handleSaveRules } = useAdminEntities();

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-text-primary">Symbolic Rule Engine</h2>
                <div className="flex items-center gap-4">
                    <button className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-lg text-sm font-bold text-text-secondary hover:text-text-primary transition-all cursor-pointer">
                        <Download size={16} />
                        <span>Download Template</span>
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-lg text-sm font-bold text-text-secondary hover:text-text-primary transition-all cursor-pointer">
                        <Upload size={16} />
                        <span>Upload Excel</span>
                    </button>
                </div>
            </div>

            <div className="bg-success/10 border border-success/20 rounded-xl p-4 text-center">
                <p className="text-success text-sm font-medium">
                    User can fill out the excel sheet in the format given in the template and upload it
                </p>
            </div>

            <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-xl">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="text-text-muted border-b border-border bg-surface-2">
                            <th className="px-6 py-4 font-bold text-label uppercase tracking-widest">Equipment</th>
                            <th className="px-6 py-4 font-bold text-label uppercase tracking-widest">Issue</th>
                            <th className="px-6 py-4 font-bold text-label uppercase tracking-widest">Rule</th>
                            <th className="px-6 py-4 font-bold text-label uppercase tracking-widest">Cause</th>
                            <th className="px-6 py-4 font-bold text-label uppercase tracking-widest">Action</th>
                            <th className="px-6 py-4 w-12"></th>
                        </tr>
                    </thead>
                    <tbody className="text-text-secondary">
                        {rules.map((rule) => (
                            <tr key={rule.id} className="border-b border-border/50 hover:bg-surface-2 transition-colors">
                                <td className="px-4 py-4">
                                    <input type="text" value={rule.equipment} onChange={(e) => handleUpdateRule(rule.id, 'equipment', e.target.value)} className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand transition-colors" placeholder="Equipment name..." />
                                </td>
                                <td className="px-4 py-4">
                                    <input type="text" value={rule.issue} onChange={(e) => handleUpdateRule(rule.id, 'issue', e.target.value)} className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand transition-colors" placeholder="Issue description..." />
                                </td>
                                <td className="px-4 py-4">
                                    <input type="text" value={rule.rule} onChange={(e) => handleUpdateRule(rule.id, 'rule', e.target.value)} className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand transition-colors" placeholder="Rule logic..." />
                                </td>
                                <td className="px-4 py-4">
                                    <input type="text" value={rule.cause} onChange={(e) => handleUpdateRule(rule.id, 'cause', e.target.value)} className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand transition-colors" placeholder="Root cause..." />
                                </td>
                                <td className="px-4 py-4">
                                    <input type="text" value={rule.action} onChange={(e) => handleUpdateRule(rule.id, 'action', e.target.value)} className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand transition-colors" placeholder="Recommended action..." />
                                </td>
                                <td className="px-4 py-4 text-center">
                                    <button onClick={() => handleDeleteRule(rule.id)} className="text-text-secondary hover:text-danger transition-colors cursor-pointer" aria-label="Delete rule">
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="p-4 border-t border-border/50">
                    <button onClick={handleAddRule} className="text-brand hover:text-brand/70 text-sm font-bold flex items-center gap-2 transition-colors cursor-pointer">
                        <Plus size={16} />
                        <span>Add new rule manually</span>
                    </button>
                </div>
            </div>

            <div className="flex items-center justify-end pt-12">
                <button onClick={handleSaveRules} className="bg-brand hover:bg-brand-hover text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-brand/20 transition-all flex items-center gap-2 cursor-pointer">
                    <CheckCircle2 size={18} />
                    <span>Save and Close</span>
                </button>
            </div>
        </motion.div>
    );
}
