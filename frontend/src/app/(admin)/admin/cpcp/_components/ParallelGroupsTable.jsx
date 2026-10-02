'use client';

import { useState, useEffect } from 'react';
import { Save, Loader2 } from 'lucide-react';
import { useToast } from '@/src/components/ui/Toast';
import { useApp } from '@/src/context/AppContext';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
    getParallelGroups,
    saveParallelGroupsConfiguration,
    getDesignIntents,
    getLoadShareModels
} from '@/src/services/cpcp/cpcpService';

export function ParallelGroupsTable({ onSaved }) {
    const toast = useToast();
    const { plantCode } = useApp();
    
    const [parallelGroups, setParallelGroups] = useState([]);
    const [groupsSaved, setGroupsSaved] = useState(false);

    const { data: fetchedGroupsData, isLoading: isLoadingGroups } = useQuery({
        queryKey: ['parallelGroups', plantCode],
        queryFn: () => getParallelGroups(plantCode),
        enabled: !!plantCode,
        refetchOnWindowFocus: false,
    });

    useEffect(() => {
        if (fetchedGroupsData) {
            const groupsList = fetchedGroupsData?.groups || fetchedGroupsData?.data?.groups || [];
            const mappedGroups = groupsList.map(g => ({
                group: g.group,
                members: g.members,
                available: g.available,
                running: g.running,
                member_capacity_now: g.member_capacity_now,
                member_capacity_post_switchover: g.member_capacity_post_switchover,
                design_intent: g.design_intent || '',
                min_active: g.min_active || '',
                load_share_model: g.load_share_model || '',
                computed_capacity_now: null,
                computed_capacity_post: null,
                computed_min_active_met: null,
                computed_redundancy: null
            }));
            setParallelGroups(mappedGroups);
        }
    }, [fetchedGroupsData]);

    const { data: designIntentsData } = useQuery({
        queryKey: ['designIntents', plantCode],
        queryFn: () => getDesignIntents(plantCode),
        enabled: !!plantCode,
        refetchOnWindowFocus: false,
    });
    const designIntentsOptions = Array.isArray(designIntentsData)
        ? designIntentsData
        : (designIntentsData?.design_intents || designIntentsData?.data?.design_intents || []);

    const { data: loadShareModelsData } = useQuery({
        queryKey: ['loadShareModels', plantCode],
        queryFn: () => getLoadShareModels(plantCode),
        enabled: !!plantCode,
        refetchOnWindowFocus: false,
    });
    const loadShareModelsOptions = Array.isArray(loadShareModelsData)
        ? loadShareModelsData
        : (loadShareModelsData?.load_share_models || loadShareModelsData?.data?.load_share_models || []);

    const saveParallelGroupsMutation = useMutation({
        mutationFn: saveParallelGroupsConfiguration,
        onSuccess: (data) => {
            toast.success('Parallel Groups Saved', data?.message || 'Parallel groups configuration saved successfully.');
            setGroupsSaved(true);
            onSaved(true);

            const updatedGroups = [...parallelGroups];
            const returnedGroups = data?.groups || data?.data?.groups || [];

            returnedGroups.forEach((computedGroup, i) => {
                if (updatedGroups[i]) {
                    updatedGroups[i].computed_capacity_now = computedGroup["Capacity now (MMscfd)"];
                    updatedGroups[i].computed_capacity_post = computedGroup["Capacity post-switchover (MMscfd)"];
                    updatedGroups[i].computed_min_active_met = computedGroup["Min active met?"];
                    updatedGroups[i].computed_redundancy = computedGroup["Redundancy exposure"];
                }
            });
            setParallelGroups(updatedGroups);
        },
        onError: (error) => {
            toast.error('Save Failed', error.message || 'An error occurred.');
        }
    });

    const handleGroupChange = (index, field, value) => {
        setParallelGroups(prev => {
            const newGroups = [...prev];
            newGroups[index] = { ...newGroups[index], [field]: value };
            return newGroups;
        });
    };

    const handleSaveGroups = () => {
        const formatIntent = (intent) => {
            if (!intent) return intent;
            const stripped = intent.replace(/\s+/g, '');
            if (stripped === '2*100' || stripped === '2*100%') return '2 * 100%';
            if (stripped === '2*50' || stripped === '2*50%') return '2 * 50%';
            if (stripped === '3*50' || stripped === '3*50%') return '3 * 50%';
            return intent; // Fallback to whatever it was
        };

        const payload = {
            plant_code_id: plantCode,
            groups: parallelGroups.map(g => ({
                group: g.group,
                design_intent: formatIntent(g.design_intent),
                min_active: Number(g.min_active),
                load_share_model: g.load_share_model
            }))
        };
        saveParallelGroupsMutation.mutate(payload);
    };

    const isSavingGroups = saveParallelGroupsMutation.isPending;

    return (
        <div className="bg-surface rounded-2xl shadow-sm border border-border/60 overflow-hidden">
            <div className="flex items-center justify-between bg-[#1a2332] text-white px-4 py-2">
                <span className="text-xs font-bold tracking-wider">PARALLEL GROUPS</span>
                <button
                    onClick={handleSaveGroups}
                    disabled={isSavingGroups || isLoadingGroups}
                    className="flex items-center gap-2 px-3 py-1.5 bg-brand hover:bg-brand-hover text-white rounded-lg text-[11px] font-bold tracking-wider uppercase transition-all disabled:opacity-50 cursor-pointer"
                >
                    {isSavingGroups ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    Save Configuration
                </button>
            </div>
            <div className="overflow-x-auto thin-scrollbar p-1">
                <table className="w-full text-left border-collapse min-w-max">
                    <thead>
                        <tr className="border-b border-border text-xs font-semibold text-text-muted">
                            <th className="px-4 py-3 whitespace-nowrap">Group</th>
                            <th className="px-4 py-3 whitespace-nowrap">Design intent</th>
                            <th className="px-4 py-3 whitespace-nowrap">Min active</th>
                            <th className="px-4 py-3 whitespace-nowrap">Load-share model</th>
                            {groupsSaved && (
                                <>
                                    <th className="px-4 py-3 whitespace-nowrap">Members</th>
                                    <th className="px-4 py-3 whitespace-nowrap">Available</th>
                                    <th className="px-4 py-3 whitespace-nowrap">Running</th>
                                    <th className="px-4 py-3 whitespace-nowrap text-brand">Capacity now (MMscfd)</th>
                                    <th className="px-4 py-3 whitespace-nowrap text-text-secondary">Capacity post-switchover (MMscfd)</th>
                                    <th className="px-4 py-3 whitespace-nowrap">Min active met?</th>
                                    <th className="px-4 py-3 whitespace-nowrap">Redundancy</th>
                                </>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60 text-sm">
                        {isLoadingGroups ? (
                            <tr>
                                <td colSpan={groupsSaved ? 11 : 3} className="px-4 py-8 text-center text-text-muted">
                                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                                    Loading parallel groups...
                                </td>
                            </tr>
                        ) : parallelGroups.map((group, index) => (
                            <tr key={index} className="hover:bg-surface-2/60 transition-colors">
                                <td className="px-4 py-2.5 font-medium">{group.group}</td>
                                <td className="px-2 py-1.5 border-l border-border/40">
                                    <select
                                        value={group.design_intent}
                                        onChange={(e) => handleGroupChange(index, 'design_intent', e.target.value)}
                                        className="w-full bg-transparent border-none outline-none px-2 py-1 focus:bg-surface-2/50 rounded transition-colors text-sm"
                                    >
                                        <option value="" disabled>Select intent...</option>
                                        {designIntentsOptions.map(opt => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                </td>
                                <td className="px-2 py-1.5 border-l border-border/40">
                                    <input
                                        type="number"
                                        value={group.min_active}
                                        onChange={(e) => handleGroupChange(index, 'min_active', e.target.value)}
                                        placeholder="—"
                                        className="w-24 bg-transparent border-none outline-none px-2 py-1 focus:bg-surface-2/50 rounded transition-colors placeholder:text-text-muted/40"
                                    />
                                </td>
                                <td className="px-2 py-1.5 border-l border-border/40">
                                    <select
                                        value={group.load_share_model}
                                        onChange={(e) => handleGroupChange(index, 'load_share_model', e.target.value)}
                                        className="w-full bg-transparent border-none outline-none px-2 py-1 focus:bg-surface-2/50 rounded transition-colors text-sm"
                                    >
                                        <option value="" disabled>Select model...</option>
                                        {loadShareModelsOptions.map(opt => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                </td>
                                {groupsSaved && (
                                    <>
                                        <td className="px-4 py-2.5">{group.members}</td>
                                        <td className="px-4 py-2.5">{group.available}</td>
                                        <td className="px-4 py-2.5">{group.running}</td>
                                        <td className="px-4 py-2.5 text-brand font-semibold">
                                            {group.computed_capacity_now ?? '—'}
                                        </td>
                                        <td className="px-4 py-2.5 font-semibold text-text-secondary">
                                            {group.computed_capacity_post ?? '—'}
                                        </td>
                                        <td className="px-4 py-2.5">
                                            {group.computed_min_active_met ? (
                                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${group.computed_min_active_met === 'OK' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                    {group.computed_min_active_met}
                                                </span>
                                            ) : '—'}
                                        </td>
                                        <td className="px-4 py-2.5">
                                            {group.computed_redundancy ? (
                                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${group.computed_redundancy === 'OK' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                                    {group.computed_redundancy}
                                                </span>
                                            ) : '—'}
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
