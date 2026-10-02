'use client';
import React, { useState } from 'react';
import { useScenarioList } from '../_queries/useScenarioQueries';
import { Plus, Search } from 'lucide-react';
import { Spinner } from '@/src/components/ui/Spinner';
import { Input } from '@/src/components/ui/Input';
import ScenarioTable from './_components/ScenarioTable';
import ScenarioFormModal from './_components/ScenarioFormModal';
import ScenarioDetailsModal from './_components/ScenarioDetailsModal';

export default function ScenarioConfigurationPage() {
    const { data: scenarios = [], isLoading } = useScenarioList();
    const [searchQuery, setSearchQuery] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingScenario, setEditingScenario] = useState(null);
    const [detailsScenarioId, setDetailsScenarioId] = useState(null);

    const handleCreateClick = () => {
        setEditingScenario(null);
        setIsFormOpen(true);
    };

    const handleEditClick = (scenario) => {
        setEditingScenario(scenario);
        setIsFormOpen(true);
    };

    const handleDetailsClick = (scenarioId) => {
        setDetailsScenarioId(scenarioId);
    };

    const filteredScenarios = scenarios.filter((sc) =>
        sc.scenario_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sc.asset.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(sc.scenario_id).includes(searchQuery)
    );

    return (
        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-canvas">
            <div className="w-full space-y-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4   pb-4">
                    <div>
                        <h1 className="text-xl font-bold text-text-primary">Scenario Configurations</h1>
                        <p className="text-body text-text-muted mt-1">
                            Manage and configure similarity profiles for historical pattern matching.
                        </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                        <Input
                            placeholder="Search by scenario name, asset, or ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            icon={Search}
                            size="sm"
                            wrapperClassName="w-64 md:w-80 space-y-0"
                        />
                        <button
                            onClick={handleCreateClick}
                            className="bg-brand hover:bg-brand-hover text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors shadow-sm cursor-pointer whitespace-nowrap text-xs h-[38px] uppercase tracking-wider shrink-0"
                        >
                            <Plus className="w-4 h-4" />
                            Create Scenario
                        </button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Spinner size="lg" />
                    </div>
                ) : (
                    <div className="bg-surface rounded-xl border border-border shadow-2xs overflow-hidden">
                        <ScenarioTable
                            scenarios={filteredScenarios}
                            onEdit={handleEditClick}
                            onViewDetails={handleDetailsClick}
                        />
                    </div>
                )}
            </div>

            {isFormOpen && (
                <ScenarioFormModal
                    isOpen={isFormOpen}
                    onClose={() => setIsFormOpen(false)}
                    scenario={editingScenario}
                />
            )}

            {detailsScenarioId && (
                <ScenarioDetailsModal
                    scenarioId={detailsScenarioId}
                    onClose={() => setDetailsScenarioId(null)}
                />
            )}
        </div>
    );
}
