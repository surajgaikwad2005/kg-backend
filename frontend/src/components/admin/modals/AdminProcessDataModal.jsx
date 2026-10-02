'use client';
import React, { useMemo, useCallback } from 'react';
import { useAdminNav, useAdminEntities } from '@/src/components/admin/AdminPanelContext';
import { ProcessDataConfirmModal } from '@/src/components/admin/views/ProcessDataConfirmModal';
import { useRunPipeline } from '@/src/components/admin/views/hooks/useRunPipeline';

export default function AdminProcessDataModal() {
    const { isProcessModalOpen, setIsProcessModalOpen } = useAdminNav();
    const { configuredSources } = useAdminEntities();
    const { runPipeline } = useRunPipeline();

    const configuredTypes = useMemo(() => configuredSources.map(s => s.type), [configuredSources]);

    const handleClose = useCallback(() => {
        setIsProcessModalOpen(false);
    }, [setIsProcessModalOpen]);

    const handleConfirm = useCallback(() => {
        setIsProcessModalOpen(false);
        runPipeline(configuredTypes);
    }, [setIsProcessModalOpen, runPipeline, configuredTypes]);

    return (
        <ProcessDataConfirmModal
            isOpen={isProcessModalOpen}
            configuredSources={configuredSources}
            configuredTypes={configuredTypes}
            onClose={handleClose}
            onConfirm={handleConfirm}
        />
    );
}
