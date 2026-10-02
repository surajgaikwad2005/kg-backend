'use client';

import { useState } from 'react';
import { Save, Loader2, Plus } from 'lucide-react';
import { useToast } from '@/src/components/ui/Toast';
import { useApp } from '@/src/context/AppContext';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getEquipments, saveRepairRestorationAssumptions } from '@/src/services/cpcp/cpcpService';

/** "Repair / Restoration Assumptions" matrix within the Topology Knowledge step. */
export function RepairAssumptionsTable({ onSaved }) {
    const toast = useToast();
    const { plantCode } = useApp();

    const [rows, setRows] = useState(
        Array(5).fill(null).map(() => ({ role: '', minDuration: '', maxDuration: '' }))
    );

    // Fetch equipments for the Role dropdown
    const { data: equipmentsData } = useQuery({
        queryKey: ['equipments', plantCode],
        queryFn: () => getEquipments(plantCode),
        enabled: !!plantCode,
        refetchOnWindowFocus: false,
    });
    const equipmentOptions = equipmentsData?.equipments || equipmentsData?.data?.equipments || [];

    const saveMutation = useMutation({
        mutationFn: (data) => saveRepairRestorationAssumptions(plantCode, data),
        onSuccess: (data) => {
            toast.success('Assumptions Saved', data?.message || 'Repair assumptions saved successfully.');
            if (onSaved) onSaved(true);
        },
        onError: (error) => {
            toast.error('Save Failed', error.message || 'An error occurred.');
        }
    });

    const handleRowChange = (index, field, value) => {
        setRows(prev => {
            const newRows = [...prev];
            newRows[index] = { ...newRows[index], [field]: value };
            return newRows;
        });
    };

    const addRow = () => {
        setRows(prev => [...prev, { role: '', minDuration: '', maxDuration: '' }]);
    };

    const handleSave = () => {
        // Filter out empty rows
        const validRows = rows.filter(r => r.role);
        
        if (validRows.length === 0) {
            toast.error('Validation Error', 'Please add at least one role assumption.');
            return;
        }

        const payload = {
            roles: validRows.map(r => ({
                role: r.role,
                min_duration_h: r.minDuration === '' ? null : Number(r.minDuration),
                max_duration_h: r.maxDuration === '' ? null : Number(r.maxDuration)
            }))
        };
        saveMutation.mutate(payload);
    };

    const isSaving = saveMutation.isPending;

    return (
        <div className="bg-surface rounded-2xl shadow-sm border border-border/60 overflow-hidden mb-8">
            <div className="flex items-center justify-between bg-[#1a2332] text-white px-4 py-2">
                <span className="text-xs font-bold tracking-wider">REPAIR / RESTORATION ASSUMPTIONS</span>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-3 py-1.5 bg-brand hover:bg-brand-hover text-white rounded-lg text-[11px] font-bold tracking-wider uppercase transition-all disabled:opacity-50 cursor-pointer"
                >
                    {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    Save Assumptions
                </button>
            </div>
            
            <div className="overflow-x-auto thin-scrollbar p-1">
                <table className="w-full text-left border-collapse min-w-max">
                    <thead>
                        <tr className="border-b border-border text-xs font-semibold text-text-muted">
                            <th className="px-4 py-3 whitespace-nowrap">Role</th>
                            <th className="px-4 py-3 whitespace-nowrap">Min duration (h)</th>
                            <th className="px-4 py-3 whitespace-nowrap">Max duration (h)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60 text-sm">
                        {rows.map((item, index) => (
                            <tr key={index} className="hover:bg-surface-2/60 transition-colors">
                                <td className="px-2 py-1.5 border-r border-border/40">
                                    <select
                                        value={item.role}
                                        onChange={(e) => handleRowChange(index, 'role', e.target.value)}
                                        className="w-full bg-transparent border-none outline-none px-2 py-1 focus:bg-surface-2/50 rounded transition-colors text-sm font-medium"
                                    >
                                        <option value="" disabled>Select equipment...</option>
                                        {equipmentOptions.map(opt => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                </td>
                                <td className="px-2 py-1.5 border-r border-border/40">
                                    <input
                                        type="number"
                                        value={item.minDuration}
                                        onChange={(e) => handleRowChange(index, 'minDuration', e.target.value)}
                                        placeholder="—"
                                        className="w-full bg-transparent border-none outline-none px-2 py-1 focus:bg-surface-2/50 rounded transition-colors placeholder:text-text-muted/40"
                                    />
                                </td>
                                <td className="px-2 py-1.5 border-r border-border/40">
                                    <input
                                        type="number"
                                        value={item.maxDuration}
                                        onChange={(e) => handleRowChange(index, 'maxDuration', e.target.value)}
                                        placeholder="—"
                                        className="w-full bg-transparent border-none outline-none px-2 py-1 focus:bg-surface-2/50 rounded transition-colors placeholder:text-text-muted/40"
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="p-3 border-t border-border/60 bg-surface-2/30 flex justify-center">
                <button
                    onClick={addRow}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-brand hover:bg-brand/10 rounded transition-colors"
                >
                    <Plus className="w-3.5 h-3.5" />
                    Add Row
                </button>
            </div>
        </div>
    );
}
