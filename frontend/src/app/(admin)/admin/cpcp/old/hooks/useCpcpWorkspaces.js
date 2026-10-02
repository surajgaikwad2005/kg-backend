'use client';

import { useApp } from '@/src/context/AppContext';
import { useCallback } from 'react';

export function useCpcpWorkspaces() {
    const { plantId, setPlantId } = useApp();
    const clientName = plantId?.id ?? '';
    
    // For now we don't have a dedicated API to fetch available workspaces here,
    // so we return empty array or what context has if needed.
    const availableWorkspaces = [];

    const switchWorkspace = useCallback((id) => {
        setPlantId({ id });
    }, [setPlantId]);

    return { clientName, availableWorkspaces, switchWorkspace };
}
