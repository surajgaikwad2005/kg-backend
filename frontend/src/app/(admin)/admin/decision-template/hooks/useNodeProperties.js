'use client';
import { useCallback } from 'react';

export function useNodeProperties({ selectedNode, setSelectedNode, setNodes }) {
    const updateConfigValue = useCallback(
        (index, newValue) => {
            if (!selectedNode) return;

            setNodes((nds) =>
                nds.map((n) => {
                    if (n.id !== selectedNode.id) return n;
                    const updatedConfigs = [...n.data.configurations];
                    updatedConfigs[index] = { ...updatedConfigs[index], userValue: newValue };
                    return { ...n, data: { ...n.data, configurations: updatedConfigs } };
                })
            );

            setSelectedNode((prev) => {
                if (!prev || prev.id !== selectedNode.id) return prev;
                const updatedConfigs = [...prev.data.configurations];
                updatedConfigs[index] = { ...updatedConfigs[index], userValue: newValue };
                return { ...prev, data: { ...prev.data, configurations: updatedConfigs } };
            });
        },
        [selectedNode, setNodes, setSelectedNode]
    );

    return { updateConfigValue };
}
