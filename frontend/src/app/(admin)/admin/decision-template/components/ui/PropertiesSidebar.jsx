'use client';
import React from 'react';
import { X, Settings2 } from 'lucide-react';
import { ConfigFieldRenderer } from '@/src/components/config-fields/ConfigFieldRenderer';
import { useNodeProperties } from '../../hooks/useNodeProperties';

export const PropertiesSidebar = ({ selectedNode, setSelectedNode, setNodes }) => {
    const { updateConfigValue } = useNodeProperties({ selectedNode, setSelectedNode, setNodes });

    if (!selectedNode) return null;

    return (
        <div className="w-72 sm:w-80 h-full bg-surface border-l border-border flex flex-col z-10 shrink-0 overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                    <Settings2 className="w-4 h-4 text-text-secondary" />
                    <h3 className="text-xs font-black text-text-secondary uppercase tracking-widest">
                        Properties
                    </h3>
                </div>
                <button
                    onClick={() => setSelectedNode(null)}
                    aria-label="Close"
                    className="text-text-secondary hover:text-text-primary hover:bg-border/50 p-1 rounded-md transition-colors cursor-pointer"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            <div className="px-4 py-3 border-b border-border bg-border/10 shrink-0">
                <p className="text-sm font-semibold text-text-primary truncate">{selectedNode.data.label}</p>
                <p className="text-xs text-text-secondary mt-0.5">{selectedNode.data.type}</p>
            </div>

            <div className="flex-1 overflow-y-auto thin-scrollbar p-4 space-y-4">
                {Array.isArray(selectedNode.data.configurations) && selectedNode.data.configurations.length > 0 ? (
                    selectedNode.data.configurations.map((config, index) => (
                        <ConfigFieldRenderer
                            key={config.name}
                            config={config}
                            value={config.userValue}
                            onChange={(newValue) => updateConfigValue(index, newValue)}
                        />
                    ))
                ) : (
                    <div className="text-sm text-text-secondary italic bg-border/20 border border-border rounded-lg p-4 text-center">
                        No configurations available.
                    </div>
                )}
            </div>
        </div>
    );
};
