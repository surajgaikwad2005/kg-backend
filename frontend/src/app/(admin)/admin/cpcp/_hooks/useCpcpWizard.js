'use client';

import { useCallback, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { generateId } from '@/src/lib/utils';
import { useToast } from '@/src/components/ui/Toast';
import { addTemplate } from '../_lib/templateStore';
import {
    EMPTY_FORM_DATA,
    SEED_ASSET_MAPPINGS,
    SEED_REPAIR_ASSUMPTIONS,
    SEED_EMERGENCY_ROUTES,
    SEED_RULE_CONFIGURATIONS,
} from '../_lib/constants';

const withIds = (rows) => rows.map((row) => ({ ...row, id: generateId() }));

/**
 * Owns every piece of state for the CPCP Template Setup wizard: the current
 * step (mirrored in the URL so it's shareable/bookmarkable per CLAUDE.md #38),
 * the identity/outcome form, the chosen path method, and the three editable
 * matrices (asset mapping, topology knowledge, rule configuration). No
 * backend calls yet — completing or saving a draft writes to the local
 * template store and returns to the list.
 */
export function useCpcpWizard() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const toast = useToast();
    const step = searchParams.get('step') || 'setup';

    const goToStep = useCallback((nextStep) => {
        router.push(`/admin/cpcp?action=new&step=${nextStep}`);
    }, [router]);

    const [selectedPathType, setSelectedPathType] = useState(null);
    const [formData, setFormData] = useState(EMPTY_FORM_DATA);
    const [ontologyFrom, setOntologyFrom] = useState('');
    const [ontologyTo, setOntologyTo] = useState('');

    const [assetMappings, setAssetMappings] = useState([]);
    const [repairAssumptions, setRepairAssumptions] = useState(() => withIds(SEED_REPAIR_ASSUMPTIONS));
    const [emergencyRoutes, setEmergencyRoutes] = useState(() => withIds(SEED_EMERGENCY_ROUTES));
    const [ruleConfigurations, setRuleConfigurations] = useState([]);
    const [ruleColumns, setRuleColumns] = useState([]);

    const handleFormChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    }, []);

    const handleAssetMappingChange = useCallback((id, field, value) => {
        setAssetMappings((prev) => prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
    }, []);

    const handleRepairAssumptionChange = useCallback((id, field, value) => {
        setRepairAssumptions((prev) => prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
    }, []);

    const handleEmergencyRouteChange = useCallback((id, field, value) => {
        setEmergencyRoutes((prev) => prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
    }, []);

    const handleRuleConfigurationChange = useCallback((id, field, value) => {
        setRuleConfigurations((prev) => prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
    }, []);

    const handleRuleConfigurationsSet = useCallback((newRows) => {
        setRuleConfigurations(newRows);
    }, []);

    const handleRuleColumnsChange = useCallback((newColumns) => {
        setRuleColumns(newColumns);
    }, []);

    const persistAndExit = useCallback((defaultStatus) => {
        if (formData.cpcpName.trim()) {
            addTemplate({
                id: generateId(),
                cpcpName: formData.cpcpName.trim(),
                createdBy: formData.owner.trim() || 'Current User',
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                status: formData.status?.trim() || defaultStatus,
            });
            toast.success('Template Saved', 'The template was successfully saved.');
        }
        router.push('/admin/cpcp');
    }, [formData, router, toast]);

    const saveDraft = useCallback(() => persistAndExit('Draft'), [persistAndExit]);
    const completeSetup = useCallback(() => persistAndExit('Active'), [persistAndExit]);

    return {
        step,
        goToStep,
        selectedPathType,
        setSelectedPathType,
        formData,
        handleFormChange,
        ontologyFrom,
        setOntologyFrom,
        ontologyTo,
        setOntologyTo,
        assetMappings,
        setAssetMappings,
        handleAssetMappingChange,
        repairAssumptions,
        handleRepairAssumptionChange,
        emergencyRoutes,
        handleEmergencyRouteChange,
        ruleConfigurations,
        ruleColumns,
        handleRuleConfigurationChange,
        handleRuleConfigurationsSet,
        handleRuleColumnsChange,
        saveDraft,
        completeSetup,
    };
}
