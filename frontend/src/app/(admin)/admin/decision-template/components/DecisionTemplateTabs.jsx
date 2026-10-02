'use client';
import { LayoutTemplate, Library } from 'lucide-react';

const TABS = [
    { id: 'template', label: 'Template', icon: LayoutTemplate },
    { id: 'library', label: 'Library', icon: Library, badge: 'SOON' },
];

export function DecisionTemplateTabs({ activeTab, onTabChange }) {
    return (
        <div className="bg-surface border-b border-border shrink-0 px-8 z-10">
            <nav aria-label="Decision Template sections" className="flex items-center gap-8 overflow-x-auto no-scrollbar">
                {TABS.map(({ id, label, icon: Icon, badge }) => {
                    const isActive = activeTab === id;
                    return (
                        <button
                            key={id}
                            type="button"
                            onClick={() => onTabChange(id)}
                            aria-current={isActive ? 'page' : undefined}
                            className={`group flex items-center gap-2 py-4 border-b-2 text-sm font-medium whitespace-nowrap transition-all duration-200 cursor-pointer ${isActive
                                ? 'border-brand text-brand'
                                : 'border-transparent text-text-muted hover:text-text-primary hover:border-border-strong'}`}
                        >
                            <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-brand' : 'text-text-subtle group-hover:text-text-secondary'}`} />
                            <span>{label}</span>
                            {badge && (
                                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded-full transition-all duration-200 ${isActive
                                    ? 'bg-highlight text-white shadow-sm shadow-highlight/30 border border-highlight'
                                    : 'bg-highlight/10 text-highlight border border-highlight/20 group-hover:bg-highlight/20'}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white animate-pulse' : 'bg-highlight animate-pulse'}`} />
                                    {badge}
                                </span>
                            )}
                        </button>
                    );
                })}
            </nav>
        </div>
    );
}

