'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, SlidersHorizontal, FlaskConical } from 'lucide-react';
import { PageHeader } from '@/src/components/layout/PageHeader';

const tabs = [
    { name: 'Overview', path: '/scenario-extractor/overview', icon: LayoutDashboard },
    { name: 'Configuration', path: '/scenario-extractor/configuration', icon: SlidersHorizontal },
    { name: 'What if', path: '/scenario-extractor/what-if', icon: FlaskConical },
];

export default function ScenarioExtractorLayout({ children }) {
    const pathname = usePathname();

    return (
        <>
            <PageHeader showBreadcrumb={false} />

            {/* Top Navigation for Scenario Extractor */}
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

            <div className="flex-1 flex flex-col overflow-hidden relative">
                {children}
            </div>
        </>
    );
}
