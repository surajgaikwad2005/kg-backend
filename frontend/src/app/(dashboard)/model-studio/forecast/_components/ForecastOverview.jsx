'use client';
import React from 'react';
import { BrainCircuit, GitBranch, FlaskConical, Activity, TrendingUp } from 'lucide-react';

// Keyed by the stable metric_name enum so icon assignment survives the backend
// reordering/adding entries — falls back to index rotation for unknown keys.
const ICON_BY_METRIC = {
    no_of_models: BrainCircuit,
    no_of_pipelines: GitBranch,
    no_of_experiments: FlaskConical,
};
const DEFAULT_ICONS = [BrainCircuit, GitBranch, FlaskConical, Activity];
const COLORS = [
    { bg: 'bg-brand-muted', text: 'text-brand' },
    { bg: 'bg-success/10', text: 'text-success' },
    { bg: 'bg-chart-5/10', text: 'text-chart-5' },
    { bg: 'bg-warning/10', text: 'text-warning' },
];

export function ForecastOverview({ kpis }) {
    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-12">
            <div>
                <h2 className="text-[24px] font-bold text-text-primary">Forecast Studio</h2>
                <p className="text-[15px] text-text-muted mt-1">Time-series forecasting models, pipelines, and experiments.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.isArray(kpis) && kpis.length > 0 ? (
                    kpis.map((kpi, idx) => {
                        const Icon = ICON_BY_METRIC[kpi.metric_name] || DEFAULT_ICONS[idx % DEFAULT_ICONS.length];
                        const c = COLORS[idx % COLORS.length];
                        const { name, counts, info } = kpi.value || {};
                        return (
                            <div key={kpi.metric_name} className="bg-surface rounded-xl border border-border p-6 flex flex-col shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-[14px] text-text-muted font-medium mb-1">{name}</p>
                                        <h3 className="text-[32px] font-bold text-text-primary leading-none">{counts ?? '-'}</h3>
                                    </div>
                                    <div className={`p-3 rounded-xl ${c.bg} ${c.text}`}>
                                        <Icon className="w-6 h-6" />
                                    </div>
                                </div>
                                {info && (
                                    <div className="mt-4 flex items-center gap-2 text-[13px] font-medium text-text-muted">
                                        <TrendingUp className="w-4 h-4 text-success" />
                                        <span>{info}</span>
                                    </div>
                                )}
                            </div>
                        );
                    })
                ) : (
                    [1, 2, 3].map(i => (
                        <div key={i} className="bg-surface rounded-xl border border-border p-6 flex flex-col shadow-sm animate-pulse">
                            <div className="flex justify-between items-start">
                                <div className="h-16 w-32 bg-surface-2 rounded" />
                                <div className="h-10 w-10 bg-canvas rounded-lg" />
                            </div>
                            <div className="mt-4 h-5 w-24 bg-surface-2 rounded" />
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
