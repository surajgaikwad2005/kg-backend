'use client';

import { useState } from 'react';
import { Save, Loader2, Plus } from 'lucide-react';
import { useToast } from '@/src/components/ui/Toast';
import { useApp } from '@/src/context/AppContext';
import { useMutation } from '@tanstack/react-query';
import { saveAlternateRoutes } from '@/src/services/cpcp/cpcpService';

/** "Alternate / Emergency Routes" matrix within the Topology Knowledge step. */
export function EmergencyRoutesTable({ onSaved }) {
    const toast = useToast();
    const { plantCode } = useApp();

    const [rows, setRows] = useState(
        Array(5).fill(null).map(() => ({ route: '', registered: 'No', capacity: '', allowedDuration: '' }))
    );

    const saveMutation = useMutation({
        mutationFn: (data) => saveAlternateRoutes(plantCode, data),
        onSuccess: (data) => {
            toast.success('Routes Saved', data?.message || 'Alternate routes saved successfully.');
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
        setRows(prev => [...prev, { route: '', registered: 'No', capacity: '', allowedDuration: '' }]);
    };

    const handleSave = () => {
        // Filter out empty rows
        const validRows = rows.filter(r => r.route);
        
        if (validRows.length === 0) {
            toast.error('Validation Error', 'Please add at least one alternate route.');
            return;
        }

        const payload = {
            routes: validRows.map(r => ({
                route: r.route,
                registered: r.registered,
                capacity_mmscfd: r.capacity === '' ? null : Number(r.capacity),
                allowed_duration_h: r.allowedDuration === '' ? null : Number(r.allowedDuration)
            }))
        };
        saveMutation.mutate(payload);
    };

    const isSaving = saveMutation.isPending;

    return (
        <div className="bg-surface rounded-2xl shadow-sm border border-border/60 overflow-hidden mb-8">
            <div className="flex items-center justify-between bg-[#1a2332] text-white px-4 py-2">
                <span className="text-xs font-bold tracking-wider">ALTERNATE / EMERGENCY ROUTES</span>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-3 py-1.5 bg-brand hover:bg-brand-hover text-white rounded-lg text-[11px] font-bold tracking-wider uppercase transition-all disabled:opacity-50 cursor-pointer"
                >
                    {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    Save Routes
                </button>
            </div>
            
            <div className="overflow-x-auto thin-scrollbar p-1">
                <table className="w-full text-left border-collapse min-w-max bg-warning/5">
                    <thead>
                        <tr className="border-b border-border text-xs font-semibold text-text-muted">
                            <th className="px-4 py-3 whitespace-nowrap">Route</th>
                            <th className="px-4 py-3 whitespace-nowrap">Registered?</th>
                            <th className="px-4 py-3 whitespace-nowrap">Capacity (MMscfd)</th>
                            <th className="px-4 py-3 whitespace-nowrap">Allowed duration (h)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60 text-sm">
                        {rows.map((item, index) => (
                            <tr key={index} className="hover:bg-warning/10 transition-colors">
                                <td className="px-2 py-1.5 border-r border-border/40">
                                    <input
                                        type="text"
                                        value={item.route}
                                        onChange={(e) => handleRowChange(index, 'route', e.target.value)}
                                        placeholder="Enter route..."
                                        className="w-full bg-transparent border-none outline-none px-2 py-1 focus:bg-surface-2/50 rounded transition-colors placeholder:text-text-muted/40 font-medium"
                                    />
                                </td>
                                <td className="px-2 py-1.5 border-r border-border/40">
                                    <select
                                        value={item.registered}
                                        onChange={(e) => handleRowChange(index, 'registered', e.target.value)}
                                        className="w-full bg-transparent border-none outline-none px-2 py-1 focus:bg-surface-2/50 rounded transition-colors text-sm"
                                    >
                                        <option value="Yes">Yes</option>
                                        <option value="No">No</option>
                                    </select>
                                </td>
                                <td className="px-2 py-1.5 border-r border-border/40">
                                    <input
                                        type="number"
                                        value={item.capacity}
                                        onChange={(e) => handleRowChange(index, 'capacity', e.target.value)}
                                        placeholder="—"
                                        className="w-full bg-transparent border-none outline-none px-2 py-1 focus:bg-surface-2/50 rounded transition-colors placeholder:text-text-muted/40"
                                    />
                                </td>
                                <td className="px-2 py-1.5 border-r border-border/40">
                                    <input
                                        type="number"
                                        value={item.allowedDuration}
                                        onChange={(e) => handleRowChange(index, 'allowedDuration', e.target.value)}
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
