'use client';
import React from 'react';
import { useScenarioList } from '../_queries/useScenarioQueries';
import { Eye, TrendingUp, ShieldAlert, Layers } from 'lucide-react';
import { Spinner } from '@/src/components/ui/Spinner';

export default function ScenarioOverviewPage() {
    const { data: scenarios = [], isLoading } = useScenarioList();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Spinner size="lg" />
            </div>
        );
    }

    // Mock summary stats
    const stats = [
        { name: 'Total Scenarios', value: scenarios.length, icon: Layers, color: 'text-brand bg-brand/10 border-brand/20' },
        { name: 'Active Matches', value: 18, icon: TrendingUp, color: 'text-success bg-success/10 border-success/20' },
        { name: 'High Similarity Alerts', value: 4, icon: ShieldAlert, color: 'text-warning bg-warning/10 border-warning/20' }
    ];

    return (
        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-canvas">
            <div className="w-full space-y-8">
                <div>
                    <h1 className="text-xl font-bold text-text-primary">Scenario Overview</h1>
                    <p className="text-body text-text-muted mt-1">
                        High-level summary of operational patterns and matching alerts.
                    </p>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {stats.map((stat) => (
                        <div key={stat.name} className="bg-surface rounded-xl border border-border p-6 shadow-2xs hover:shadow-sm transition-all duration-200">
                            <div className="flex items-center justify-between">
                                <span className="text-body font-medium text-text-secondary">{stat.name}</span>
                                <div className={`p-2 rounded-lg border ${stat.color}`}>
                                    <stat.icon className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="mt-4">
                                <span className="text-3xl font-black text-text-primary tracking-tight">{stat.value}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Recent Detections Grid */}
                <div className="bg-surface rounded-xl border border-border p-6 shadow-2xs">
                    <h3 className="text-body font-bold text-text-primary mb-4 flex items-center gap-2">
                        <Eye className="w-4 h-4 text-brand" />
                        Recent Model Detections
                    </h3>
                    <div className="space-y-4">
                        {scenarios.slice(0, 3).map((sc) => (
                            <div key={sc.scenario_id} className="flex items-center justify-between p-4 rounded-lg border border-border bg-canvas/30 hover:bg-canvas/60 transition-colors">
                                <div>
                                    <h4 className="text-body font-bold text-text-primary">{sc.scenario_name}</h4>
                                    <p className="text-caption text-text-muted mt-0.5">Asset: {sc.asset} | Created at: {new Date(sc.created_at).toLocaleDateString()}</p>
                                </div>
                                <span className="text-caption font-semibold px-2.5 py-1 rounded-full bg-success/10 text-success border border-success/20">
                                    Normal
                                </span>
                            </div>
                        ))}
                        {scenarios.length === 0 && (
                            <p className="text-body text-text-muted text-center py-6">No scenarios configured yet.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
