'use client';

import { useState } from 'react';
import { Save, Loader2 } from 'lucide-react';
import { useToast } from '@/src/components/ui/Toast';
import { useApp } from '@/src/context/AppContext';
import { useMutation } from '@tanstack/react-query';
import { saveProductionRiskConfiguration } from '@/src/services/cpcp/cpcpService';

const paramDefs = [
    { key: 'minimum_stable_load', label: 'Minimum stable load', type: 'number', defaultUnit: '% of capacity' },
    { key: 'standby_switchover_time', label: 'Standby switchover time', type: 'number', defaultUnit: 'minutes' },
    { key: 'switchover_initiation', label: 'Switchover initiation', type: 'select', defaultUnit: '-' },
    { key: 'header_limit_equivalent_flow', label: 'Header limit equivalent flow', type: 'number', step: '0.1', defaultUnit: 'MMscfd' },
    { key: 'gas_price_table_version', label: 'Gas price table version', type: 'text', defaultUnit: '-' },
    { key: 'gas_value', label: 'Gas value', type: 'number', defaultUnit: '$ / MMscf' },
    { key: 'deferment_basis', label: 'Deferment basis', type: 'text', defaultUnit: '-' },
    { key: 'par_horizon', label: 'PaR horizon', type: 'number', defaultUnit: 'hours' },
    { key: 'trigger_urgency_window', label: 'Trigger urgency window', type: 'number', defaultUnit: 'hours' }
];

export function SiteParametersTable({ onSaved }) {
    const toast = useToast();
    const { plantCode } = useApp();

    const [params, setParams] = useState(() =>
        paramDefs.reduce((acc, def) => {
            acc[def.key] = { value: '', unit: def.defaultUnit || '' };
            return acc;
        }, {})
    );

    const saveRiskConfigMutation = useMutation({
        mutationFn: saveProductionRiskConfiguration,
        onSuccess: (data) => {
            toast.success('Configuration Saved', data?.message || 'Production risk configuration saved successfully.');
            onSaved(true);
        },
        onError: (error) => {
            toast.error('Save Failed', error.message || 'An error occurred.');
        }
    });

    const handleChange = (key, field, value) => {
        setParams(prev => ({
            ...prev,
            [key]: {
                ...prev[key],
                [field]: value
            }
        }));
    };

    const handleSave = () => {
        const payload = { plant_code_id: plantCode };
        paramDefs.forEach(def => {
            const row = params[def.key];
            const val = row.value === '' ? null : (def.type === 'number' ? Number(row.value) : row.value);
            payload[def.key] = val;
            payload[`${def.key}_unit`] = row.unit === '' ? null : row.unit;
        });
        saveRiskConfigMutation.mutate(payload);
    };

    const isSaving = saveRiskConfigMutation.isPending;

    return (
        <div className="bg-surface rounded-2xl shadow-sm border border-border/60 overflow-hidden">
            <div className="flex items-center justify-between bg-[#1a2332] text-white px-4 py-2">
                <span className="text-xs font-bold tracking-wider">SITE PARAMETERS</span>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-3 py-1.5 bg-brand hover:bg-brand-hover text-white rounded-lg text-[11px] font-bold tracking-wider uppercase transition-all disabled:opacity-50 cursor-pointer"
                >
                    {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    Save Configuration
                </button>
            </div>
            <div className="overflow-x-auto thin-scrollbar p-1">
                <table className="w-full text-left border-collapse min-w-max">
                    <thead>
                        <tr className="border-b border-border text-xs font-semibold text-text-muted">
                            <th className="px-4 py-3 whitespace-nowrap">Parameter</th>
                            <th className="px-4 py-3 whitespace-nowrap">Value</th>
                            <th className="px-4 py-3 whitespace-nowrap">UoM</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60 text-sm">
                        {paramDefs.map(({ key, label, type, step }) => (
                            <tr key={key} className="hover:bg-surface-2/60 transition-colors">
                                <td className="px-4 py-2 font-medium">{label}</td>
                                <td className="px-2 py-1.5 border-l border-border/40">
                                    {type === 'select' ? (
                                        <select
                                            value={params[key].value}
                                            onChange={(e) => handleChange(key, 'value', e.target.value)}
                                            className="w-full bg-transparent border-none outline-none px-2 py-1 focus:bg-surface-2/50 rounded transition-colors text-sm"
                                        >
                                            <option value="" disabled>Select...</option>
                                            <option value="manual">Manual</option>
                                            <option value="automatic">Automatic</option>
                                        </select>
                                    ) : (
                                        <input
                                            type={type}
                                            step={step}
                                            value={params[key].value}
                                            onChange={(e) => handleChange(key, 'value', e.target.value)}
                                            placeholder="—"
                                            className="w-full bg-transparent border-none outline-none px-2 py-1 focus:bg-surface-2/50 rounded transition-colors placeholder:text-text-muted/40"
                                        />
                                    )}
                                </td>
                                <td className="px-2 py-1.5 border-l border-border/40">
                                    <input
                                        type="text"
                                        value={params[key].unit}
                                        onChange={(e) => handleChange(key, 'unit', e.target.value)}
                                        placeholder="—"
                                        className="w-full bg-transparent border-none outline-none px-2 py-1 focus:bg-surface-2/50 rounded transition-colors placeholder:text-text-muted/40"
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
