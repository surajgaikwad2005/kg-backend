'use client';
import React, { useState } from 'react';
import { Play, Sparkles, Sliders } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';

export default function WhatIfPage() {
    const [similarity, setSimilarity] = useState(70);
    const [isSimulating, setIsSimulating] = useState(false);
    const [result, setResult] = useState(null);

    const handleRunSimulation = () => {
        setIsSimulating(true);
        setTimeout(() => {
            setIsSimulating(false);
            setResult({
                matchedCount: similarity > 80 ? 3 : similarity > 60 ? 12 : 28,
                confidence: similarity > 80 ? 'High' : similarity > 60 ? 'Medium' : 'Low',
                suggestedAction: 'Recommended checking bearings vibration frequency profile on U1300'
            });
        }, 1500);
    };

    return (
        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-canvas">
            <div className="w-full space-y-8">
                <div>
                    <h1 className="text-xl font-bold text-text-primary">What-If Analysis Sandbox</h1>
                    <p className="text-body text-text-muted mt-1">
                        Simulate threshold parameters to preview historical matches and adjust confidence targets.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Controls */}
                    <div className="md:col-span-1 bg-surface border border-border rounded-xl p-6 space-y-6 shadow-2xs">
                        <h3 className="text-body font-bold text-text-primary flex items-center gap-2">
                            <Sliders className="w-4 h-4 text-brand" />
                            Simulation Tuning
                        </h3>

                        <div className="space-y-2">
                            <label className="text-caption font-bold text-text-secondary">
                                Similarity Threshold ({similarity}%)
                            </label>
                            <input
                                type="range"
                                min="50"
                                max="95"
                                value={similarity}
                                onChange={(e) => setSimilarity(Number(e.target.value))}
                                className="w-full h-1.5 bg-border rounded-lg appearance-none cursor-pointer accent-brand"
                            />
                        </div>

                        <Button
                            onClick={handleRunSimulation}
                            isPending={isSimulating}
                            className="w-full flex items-center justify-center gap-2"
                        >
                            <Play className="w-4 h-4" /> Run Simulation
                        </Button>
                    </div>

                    {/* Simulation Results */}
                    <div className="md:col-span-2 bg-surface border border-border rounded-xl p-6 shadow-2xs flex flex-col min-h-64 justify-center">
                        {isSimulating ? (
                            <div className="flex flex-col items-center justify-center space-y-3">
                                <Sparkles className="w-8 h-8 text-brand animate-pulse" />
                                <span className="text-body text-text-muted">Simulating matches...</span>
                            </div>
                        ) : result ? (
                            <div className="space-y-6">
                                <h3 className="text-lg font-bold text-text-primary">Simulation Results</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 rounded-lg bg-canvas border border-border">
                                        <span className="text-caption text-text-muted block">Estimated Matches</span>
                                        <span className="text-2xl font-black text-text-primary mt-1 block">
                                            {result.matchedCount}
                                        </span>
                                    </div>
                                    <div className="p-4 rounded-lg bg-canvas border border-border">
                                        <span className="text-caption text-text-muted block">Confidence Rating</span>
                                        <span className={`text-2xl font-black mt-1 block ${
                                            result.confidence === 'High' ? 'text-success' : 'text-brand'
                                        }`}>
                                            {result.confidence}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-4 rounded-lg border border-brand/20 bg-brand/5">
                                    <span className="text-caption text-brand font-bold block">Insight</span>
                                    <p className="text-body text-text-secondary mt-1">{result.suggestedAction}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center text-text-muted">
                                <Play className="w-12 h-12 mx-auto text-text-subtle stroke-[1.5] mb-2" />
                                <p className="text-body">Adjust parameters and run the simulation to see predictions.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
