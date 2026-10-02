'use client';

import { useState } from 'react';
import { Save, Loader2, Plus } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useApp } from '@/src/context/AppContext';
import { useToast } from '@/src/components/ui/Toast';
import { DerivedPathMetricsTable } from './DerivedPathMetricsTable';
import { getElementTypes, getEquipments, getParallelGroups, saveSeriesCapacityChain, } from '@/src/services/cpcp/cpcpService';

export function SeriesCapacityChainTable({ onSaved }) {
    const { plantCode } = useApp();
    const toast = useToast();

    const [inputRows, setInputRows] = useState(
        Array(5).fill(null).map((_, i) => ({ element: '', element_type: '', order: i + 1 }))
    );
    const [isSaved, setIsSaved] = useState(false);
    const [computedData, setComputedData] = useState(null);
    const [containmentAsset, setContainmentAsset] = useState('');

    const { data: derivedPathMetricsData, isFetching: isFetchingMetrics } = useQuery({
        queryKey: ['derivedPathMetrics', plantCode, containmentAsset],
        queryFn: () => fetchDerivedPathMetrics(plantCode, { containment_asset: containmentAsset }),
        enabled: !!plantCode && !!containmentAsset && isSaved,
        refetchOnWindowFocus: false,
    });
    const derivedMetricsList = derivedPathMetricsData?.metrics || derivedPathMetricsData?.data?.metrics || [];

    const getMetricColorClass = (metricName) => {
        if (['Delivered now', 'Headroom'].includes(metricName)) return 'text-green-600 font-bold';
        if (['Bottleneck element', 'Capacity after next credible failure', 'Exposed volume'].includes(metricName)) return 'text-red-600 font-bold';
        if (['Groups exposed'].includes(metricName)) return 'text-orange-600 font-bold';
        if (['PaR over horizon'].includes(metricName)) return 'text-orange-700 font-bold';
        if (['Path capacity now', 'Path capacity post-switchover'].includes(metricName)) return 'text-brand font-bold';
        if (['Load - wells routed and online', 'Wells received', 'Deferment now'].includes(metricName)) return 'font-bold';
        return '';
    };

    const { data: elementTypesData } = useQuery({
        queryKey: ['elementTypes', plantCode],
        queryFn: () => getElementTypes(plantCode),
        enabled: !!plantCode,
        refetchOnWindowFocus: false,
    });
    const elementTypesOptions = Array.isArray(elementTypesData)
        ? elementTypesData
        : (elementTypesData?.element_types || elementTypesData?.data?.element_types || []);

    const { data: equipmentsData } = useQuery({
        queryKey: ['equipments', plantCode],
        queryFn: () => getEquipments(plantCode),
        enabled: !!plantCode,
        refetchOnWindowFocus: false,
    });

    // equipment might be array of strings or { equipments: [] }
    const rawEquipmentOptions = Array.isArray(equipmentsData)
        ? equipmentsData
        : (equipmentsData?.equipments || equipmentsData?.data?.equipments || []);

    const equipmentOptions = Array.from(new Set([...rawEquipmentOptions, 'SEPARATOR_A']));

    const { data: parallelGroupsData } = useQuery({
        queryKey: ['parallelGroups', plantCode],
        queryFn: () => getParallelGroups(plantCode),
        enabled: !!plantCode,
        refetchOnWindowFocus: false,
    });
    const groupsList = parallelGroupsData?.groups || parallelGroupsData?.data?.groups || [];
    const groupOptions = groupsList.map(g => g.group);

    const saveMutation = useMutation({
        mutationFn: saveSeriesCapacityChain,
        onSuccess: (data) => {
            toast.success('Series Capacity Chain Saved', data?.message || 'Configuration saved successfully.');
            
            const responseData = data?.data || data || {};
            
            setComputedData({
                elements: responseData.elements || [],
                path_capacity_now: responseData.path_capacity_now,
                path_capacity_post_switchover: responseData.path_capacity_post_switchover
            });
            setIsSaved(true);
            if (onSaved) onSaved(true);
        },
        onError: (error) => {
            toast.error('Save Failed', error.message || 'An error occurred.');
        }
    });

    const handleRowChange = (index, field, value) => {
        setInputRows(prev => {
            const newRows = [...prev];
            newRows[index] = { ...newRows[index], [field]: value };
            return newRows;
        });
    };

    const addRow = () => {
        setInputRows(prev => [
            ...prev,
            { element: '', element_type: '', order: prev.length + 1 }
        ]);
    };

    const handleSave = () => {
        // filter out rows that don't have both element and element_type selected
        const validElements = inputRows
            .filter(r => r.element && r.element_type)
            .map((r, i) => ({
                element: r.element,
                element_type: r.element_type,
                order: i + 1
            }));

        const payload = {
            plant_code_id: plantCode,
            elements: validElements
        };
        saveMutation.mutate(payload);
    };

    const isSaving = saveMutation.isPending;

    return (
        <>
            {/* SERIES CAPACITY CHAIN */}
            <div className="bg-surface rounded-2xl shadow-sm border border-border/60 overflow-hidden mb-8">
                <div className="flex items-center justify-between bg-[#1a2332] text-white px-4 py-2">
                    <span className="text-xs font-bold tracking-wider">
                        SERIES CAPACITY CHAIN
                    </span>
                    {!isSaved && (
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex items-center gap-2 px-3 py-1.5 bg-brand hover:bg-brand-hover text-white rounded-lg text-[11px] font-bold tracking-wider uppercase transition-all disabled:opacity-50 cursor-pointer"
                        >
                            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                            Save Configuration
                        </button>
                    )}
                </div>
                <div className="overflow-x-auto thin-scrollbar p-1">
                    <table className="w-full text-left border-collapse min-w-max">
                        <thead>
                            <tr className="border-b border-border text-xs font-semibold text-text-muted">
                                <th className="px-4 py-3 whitespace-nowrap">Element</th>
                                <th className="px-4 py-3 whitespace-nowrap">Element type</th>
                                <th className="px-4 py-3 whitespace-nowrap">Order</th>
                                {isSaved && (
                                    <>
                                        <th className="px-4 py-3 whitespace-nowrap">Base capacity now</th>
                                        <th className="px-4 py-3 whitespace-nowrap">Base capacity post-switchover</th>
                                        <th className="px-4 py-3 whitespace-nowrap">Limit cap</th>
                                        <th className="px-4 py-3 whitespace-nowrap text-brand">Effective now (MMscfd)</th>
                                        <th className="px-4 py-3 whitespace-nowrap text-text-secondary">Effective post (MMscfd)</th>
                                        <th className="px-4 py-3 whitespace-nowrap">Bottleneck?</th>
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60 text-sm">
                            {!isSaved ? (
                                inputRows.map((row, idx) => (
                                    <tr key={idx} className="hover:bg-surface-2/60 transition-colors">
                                        <td className="px-2 py-1.5 border-r border-border/40">
                                            <select
                                                value={row.element}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    const type = groupOptions.includes(val) ? 'Group' : 'Role';
                                                    handleRowChange(idx, 'element_type', type);
                                                    handleRowChange(idx, 'element', val);
                                                }}
                                                className="w-full bg-transparent border-none outline-none px-2 py-1 focus:bg-surface-2/50 rounded transition-colors text-sm"
                                            >
                                                <option value="" disabled>Select element...</option>
                                                {groupOptions.map(opt => (
                                                    <option key={opt} value={opt}>{opt}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-2 py-1.5 border-r border-border/40">
                                            <select
                                                value={row.element_type}
                                                disabled
                                                className="w-full bg-transparent border-none outline-none px-2 py-1 rounded transition-colors text-sm opacity-60 cursor-not-allowed"
                                            >
                                                <option value="" disabled>Select type...</option>
                                                {elementTypesOptions.map(opt => (
                                                    <option key={opt} value={opt}>{opt}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-4 py-2.5">{idx + 1}</td>
                                    </tr>
                                ))
                            ) : (
                                computedData?.elements?.map((row, idx) => {
                                    const isBottleneck = row["Bottleneck?"] === "BOTTLENECK";
                                    return (
                                        <tr key={idx} className={`hover:bg-surface-2/60 transition-colors ${isBottleneck ? 'bg-red-50/50' : ''}`}>
                                            <td className={`px-4 py-2.5 font-medium ${isBottleneck ? 'font-bold text-red-600' : ''}`}>{row["Element"] ?? row["element"]}</td>
                                            <td className={`px-4 py-2.5 ${isBottleneck ? 'text-red-600' : ''}`}>{row["Element type"] ?? row["element_type"]}</td>
                                            <td className={`px-4 py-2.5 ${isBottleneck ? 'text-red-600' : ''}`}>{row["Order"] ?? row["order"]}</td>
                                            <td className={`px-4 py-2.5 font-semibold ${isBottleneck ? 'font-bold text-red-600' : ''}`}>{row["Base capacity now"] ?? '-'}</td>
                                            <td className={`px-4 py-2.5 font-semibold ${isBottleneck ? 'font-bold text-red-600' : 'text-text-muted'}`}>{row["Base capacity post-switchover"] ?? '-'}</td>
                                            <td className={`px-4 py-2.5 ${isBottleneck ? 'text-red-600' : 'text-text-muted'}`}>{row["Limit cap"] ?? '-'}</td>
                                            <td className={`px-4 py-2.5 font-semibold ${isBottleneck ? 'font-bold text-red-600' : 'text-brand'}`}>{row["Effective now (MMscfd)"] ?? '-'}</td>
                                            <td className={`px-4 py-2.5 font-semibold ${isBottleneck ? 'font-bold text-red-600' : 'text-text-secondary'}`}>{row["Effective post (MMscfd)"] ?? '-'}</td>
                                            <td className="px-4 py-2.5">
                                                {isBottleneck ? <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs font-bold">BOTTLENECK</span> : '-'}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
                {!isSaved && (
                    <div className="p-3 border-t border-border/60 bg-surface-2/30 flex justify-center">
                        <button
                            onClick={addRow}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-brand hover:bg-brand/10 rounded transition-colors"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            Add Row
                        </button>
                    </div>
                )}
            </div>

            {/* DERIVED PATH METRICS */}
            <DerivedPathMetricsTable plantCode={plantCode} equipmentOptions={equipmentOptions} isSaved={isSaved} />
        </>
    );
}
