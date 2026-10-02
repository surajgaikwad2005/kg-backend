'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchDerivedPathMetrics } from '@/src/services/cpcp/cpcpService';

export function DerivedPathMetricsTable({ plantCode, equipmentOptions, isSaved }) {
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

    if (!isSaved) return null;

    return (
        <div className="bg-surface rounded-2xl shadow-sm border border-border/60 overflow-hidden mb-8">
            <div className="bg-[#1a2332] text-white px-4 py-2 text-xs font-bold tracking-wider">
                DERIVED PATH METRICS
            </div>
            <div className="overflow-x-auto thin-scrollbar p-1">
                <table className="w-full text-left border-collapse min-w-max">
                    <thead>
                        <tr className="border-b border-border text-xs font-semibold text-text-muted">
                            <th className="px-4 py-3 whitespace-nowrap">Metric</th>
                            <th className="px-4 py-3 whitespace-nowrap">Value</th>
                            <th className="px-4 py-3 whitespace-nowrap">UoM</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60 text-sm">
                        <tr className="hover:bg-surface-2/60 transition-colors">
                            <td className="px-4 py-2 font-medium">Containment asset</td>
                            <td className="px-2 py-1.5 border-l border-border/40">
                                <select
                                    value={containmentAsset}
                                    onChange={(e) => setContainmentAsset(e.target.value)}
                                    className="w-full bg-transparent border-none outline-none px-2 py-1 focus:bg-surface-2/50 rounded transition-colors text-sm font-semibold text-brand"
                                >
                                    <option value="" disabled>Select asset...</option>
                                    {equipmentOptions.map(opt => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                            </td>
                            <td className="px-4 py-2 text-text-muted">-</td>
                        </tr>

                        {isFetchingMetrics ? (
                            <tr>
                                <td colSpan={3} className="px-4 py-8 text-center text-text-muted">
                                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                                    Calculating derived metrics...
                                </td>
                            </tr>
                        ) : (
                            derivedMetricsList
                                .filter(m => m.Metric !== 'Containment asset')
                                .map((metric, index) => {
                                    const isPaR = metric.Metric === 'PaR over horizon';
                                    return (
                                        <tr key={index} className={`hover:bg-surface-2/60 transition-colors ${isPaR ? 'bg-orange-50/50' : ''}`}>
                                            <td className={`px-4 py-2 ${isPaR ? 'font-bold text-orange-700' : 'font-medium'}`}>
                                                {metric.Metric}
                                            </td>
                                            <td className={`px-4 py-2 ${getMetricColorClass(metric.Metric)}`}>
                                                {metric.Value}
                                            </td>
                                            <td className={`px-4 py-2 ${isPaR ? 'font-bold text-orange-700' : 'text-text-muted'}`}>
                                                {metric.UoM}
                                            </td>
                                        </tr>
                                    );
                                })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
