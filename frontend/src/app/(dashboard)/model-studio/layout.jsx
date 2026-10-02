'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BrainCircuit, LineChart, FileCode, Workflow, Activity, Globe } from 'lucide-react';
import { PageHeader } from '@/src/components/layout/PageHeader';

const tabs = [
    { name: 'ML Model', path: '/model-studio/ml-model', icon: Activity },
    { name: 'Expression', path: '/model-studio/expression', icon: FileCode },
    { name: 'Optimizer', path: '/model-studio/optimizer', icon: Workflow },
    { name: 'Forecast', path: '/model-studio/forecast', icon: LineChart },
    { name: 'Function', path: '/model-studio/function', icon: BrainCircuit },
    { name: 'Global Variable', path: '/model-studio/global-variable', icon: Globe },
];

export default function ModelStudioLayout({ children }) {
    const pathname = usePathname();

    return (
        <>
            <PageHeader />

            {/* Top Navigation for Model Studio */}
            <div className="bg-surface border-b border-border shrink-0 px-8 z-10">
                <nav className="flex items-center gap-8 overflow-x-auto no-scrollbar">
                    {tabs.map((tab) => {
                        const isActive = pathname === tab.path || pathname.startsWith(tab.path + '/');
                        return (
                            <Link
                                key={tab.name}
                                href={tab.path}
                                className={`flex items-center gap-2 py-4 border-b-2 text-body font-medium whitespace-nowrap transition-colors ${isActive
                                    ? 'border-brand text-brand'
                                    : 'border-transparent text-text-muted hover:text-text-primary hover:border-border-strong'}`}
                            >
                                <tab.icon className={`w-4 h-4 ${isActive ? 'text-brand' : 'text-text-subtle'}`} />
                                {tab.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Sub-page Content */}
            <div className="flex-1 overflow-hidden relative">
                {children}
            </div>
        </>
    );
}