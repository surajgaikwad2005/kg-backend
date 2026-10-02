'use client';
import React, { useState } from 'react';
import { Target, Lock, Anchor, Table2, Rocket } from 'lucide-react';

import { ObjectiveFunctionTab } from './_tabs/ObjectiveFunctionTab';
import { ConstraintsTab } from './_tabs/ConstraintsTab';
import { ConstantTab } from './_tabs/ConstantTab';
import { ExperimentTab } from './_tabs/ExperimentTab';
import { DeploymentTab } from './_tabs/DeploymentTab';

const NAV_ITEMS = [
    { name: 'Objective-Function', icon: Target,  Component: ObjectiveFunctionTab },
    { name: 'Constraints',        icon: Lock,    Component: ConstraintsTab },
    { name: 'Constant',           icon: Anchor,  Component: ConstantTab },
    { name: 'Experiment',         icon: Table2,  Component: ExperimentTab },
    { name: 'Deployment',         icon: Rocket,  Component: DeploymentTab },
];

export default function OptimizerStudio() {
    const [activeTab, setActiveTab] = useState('Objective-Function');
    const ActiveComponent = NAV_ITEMS.find(item => item.name === activeTab)?.Component;

    return (
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-canvas">
            <div className="px-8 pt-6 pb-4 bg-surface border-b border-border shrink-0">
                <h1 className="text-[22px] font-bold text-text-primary">Optimizer Studio</h1>
                <p className="text-body-sm text-text-muted mt-1">Design and run optimization algorithms (e.g. Genetic Algorithms, Linear Programming) on your operational parameters.</p>
            </div>

            <div className="bg-surface border-b border-border shrink-0 px-8">
                <nav className="flex items-center gap-8 overflow-x-auto no-scrollbar">
                    {NAV_ITEMS.map(item => (
                        <button
                            key={item.name} onClick={() => setActiveTab(item.name)}
                            className={`flex items-center gap-2 py-4 border-b-2 text-body-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${activeTab === item.name ? 'border-brand text-brand' : 'border-transparent text-text-muted hover:text-text-primary hover:border-border-strong'}`}
                        >
                            <item.icon className={`w-4 h-4 ${activeTab === item.name ? 'text-brand' : 'text-text-subtle'}`} />
                            {item.name}
                        </button>
                    ))}
                </nav>
            </div>

            <div className="flex-1 overflow-y-auto p-8 thin-scrollbar">
                {ActiveComponent && <ActiveComponent />}
            </div>
        </div>
    );
}
