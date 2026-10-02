'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { useApp } from '@/src/context/AppContext';
import { decisionService } from '@/src/services/decision-template/decisionService';

const COLOR_MAP = {
    observe: { dot: 'bg-brand', border: 'hover:border-brand/30' },
    investigate: { dot: 'bg-warning', border: 'hover:border-warning/30' },
    diagnose: { dot: 'bg-success', border: 'hover:border-success/30' },
};

function TemplateSidebarSkeleton() {
    return (
        <div className="p-4 space-y-6">
            {[1, 2, 3].map((i) => (
                <div key={i}>
                    <div className="h-3 w-20 bg-surface-2 skeleton-shimmer rounded mb-3" />
                    <div className="space-y-2">
                        {[1, 2].map((j) => (
                            <div key={j} className="p-3 border border-border rounded-lg">
                                <div className="h-3.5 w-24 bg-surface-2 skeleton-shimmer rounded mb-1.5" />
                                <div className="h-2.5 w-36 bg-surface-2 skeleton-shimmer rounded" />
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

export const TemplateSidebar = ({ onDragStart }) => {
    const { plantCode } = useApp();
    const [templateOptions, setTemplateOptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchOptions = useCallback(() => {
        // No plant selected yet — nothing to fetch. Resolve loading immediately
        // instead of leaving the palette on its skeleton forever.
        if (!plantCode) {
            setTemplateOptions([]);
            setError(null);
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        decisionService
            .getTemplateOptions(plantCode)
            .then((data) => setTemplateOptions(Array.isArray(data) ? data : []))
            .catch((err) => {
                setTemplateOptions([]);
                setError(err?.message || 'Failed to load templates');
            })
            .finally(() => setLoading(false));
    }, [plantCode]);

    useEffect(() => {
        fetchOptions();
    }, [fetchOptions]);

    return (
        <div className="w-60 sm:w-64 h-full bg-surface border-r border-border flex flex-col z-10 overflow-hidden shrink-0">
            <div className="p-4 border-b border-border shrink-0">
                <h3 className="text-xs font-black text-text-secondary uppercase tracking-widest">
                    Available Templates
                </h3>
            </div>

            <div className="flex-1 overflow-y-auto thin-scrollbar">
                {loading ? (
                    <TemplateSidebarSkeleton />
                ) : error ? (
                    <div className="flex flex-col items-center justify-center h-full p-6 text-center gap-2">
                        <AlertCircle className="w-6 h-6 text-danger" />
                        <p className="text-sm font-semibold text-danger">Failed to load templates</p>
                        <p className="text-xs text-text-secondary wrap-break-word">{error}</p>
                        <button
                            type="button"
                            onClick={fetchOptions}
                            className="mt-1 flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-danger/10 text-danger hover:bg-danger/20 rounded-lg transition-colors cursor-pointer"
                        >
                            <RefreshCw className="w-3 h-3" /> Retry
                        </button>
                    </div>
                ) : templateOptions.length > 0 ? (
                    <div className="p-4 space-y-6">
                        {templateOptions.map((option, idx) => {
                            const key = (option.template || '').toLowerCase();
                            const colors = COLOR_MAP[key] || { dot: 'bg-text-subtle', border: 'hover:border-border' };
                            const categoryName = option.template
                                ? option.template.charAt(0).toUpperCase() + option.template.slice(1)
                                : '';

                            return (
                                <div key={option.template || `category-${idx}`}>
                                    <h4 className="text-sm font-bold text-text-primary mb-3 flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${colors.dot}`} />
                                        {categoryName}
                                    </h4>
                                    <div className="space-y-2">
                                        {Object.entries(option.features || {}).map(([featureKey, feature]) => (
                                            <div
                                                key={featureKey}
                                                title={feature.description}
                                                className={`p-3 bg-surface border border-border rounded-lg shadow-sm cursor-grab ${colors.border} transition-all hover:shadow-md active:shadow-sm active:scale-95`}
                                                onDragStart={(e) =>
                                                    onDragStart(
                                                        e,
                                                        'custom',
                                                        categoryName,
                                                        feature.name,
                                                        feature.configurations,
                                                        featureKey,
                                                        feature.description
                                                    )
                                                }
                                                draggable
                                            >
                                                <div className="text-sm font-semibold text-text-primary">{feature.name}</div>
                                                <div className="text-xs text-text-secondary truncate mt-0.5">{feature.description}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                        <p className="text-sm text-text-secondary">
                            {plantCode ? 'No templates available.' : 'Select a plant to view templates.'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
