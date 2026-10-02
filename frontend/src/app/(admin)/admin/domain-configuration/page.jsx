'use client';
import React from 'react';
import Link from 'next/link';
import { Box, Cpu, ArrowRight, LayoutGrid } from 'lucide-react';

const modules = [
    {
        title: 'Domain Configuration',
        description: 'Connect external industrial systems and data streams to build a unified data layer.',
        icon: Box,
        id: 'dsi',
        href: '/admin/domain-configuration/data-source-integration',
    },
    {
        title: 'Ontology Generator',
        description: 'Map process context and asset hierarchies to generate a domain ontology.',
        icon: Cpu,
        id: 'cm',
        href: '/admin/domain-configuration/data-source-integration/review?view=pid-review',
    },
];

export default function DataModelsPage() {
    const [isMounted, setIsMounted] = React.useState(false);
    React.useEffect(() => { setIsMounted(true); }, []);
    if (!isMounted) return null;

    return (
                <div className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-10 xl:p-12">

                    {/* Section label */}
                    <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <p className="text-label font-bold text-text-muted uppercase tracking-widest mb-1">
                            Configure
                        </p>
                        <h2 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight leading-tight">
                            Domain Ontology Modules
                        </h2>
                        <p className="mt-2 text-body-sm text-text-muted max-w-xl">
                            Select a module to configure your domain ontology. Set up data sources first, then generate the ontology graph.
                        </p>
                    </div>

                    {/* Module cards grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-6">
                        {modules.map((module) => (
                            <Link
                                key={module.id}
                                href={module.href}
                                className="group relative flex flex-col p-6 md:p-8 rounded-2xl bg-surface border border-border shadow-card hover:shadow-panel transition-all duration-300 hover:-translate-y-1 hover:border-brand/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
                            >
                                {/* Top accent line on hover */}
                                <span className="absolute top-0 left-6 right-6 h-px bg-brand opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full" />

                                {/* Icon */}
                                <div className="w-11 h-11 rounded-xl bg-surface-2 border border-border flex items-center justify-center mb-6 group-hover:bg-brand-muted group-hover:border-brand/20 transition-all duration-300 shrink-0">
                                    <module.icon className="w-5 h-5 text-text-muted group-hover:text-brand transition-colors duration-300" />
                                </div>

                                {/* Content */}
                                <div className="flex-1">
                                    <h3 className="text-body font-extrabold text-text-primary tracking-tight mb-2 group-hover:text-brand transition-colors duration-200">
                                        {module.title}
                                    </h3>
                                    <p className="text-body-sm text-text-muted leading-relaxed">
                                        {module.description}
                                    </p>
                                </div>

                                {/* CTA row */}
                                <div className="mt-6 pt-4 border-t border-border flex items-center gap-2 text-caption font-bold text-brand uppercase tracking-widest group-hover:gap-3 transition-all duration-200">
                                    Configure Module
                                    <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
    );
}
