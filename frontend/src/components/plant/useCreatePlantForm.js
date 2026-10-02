'use client';
import { useState, useCallback } from 'react';
import { usePlants } from '@/src/context/PlantsContext';
import { toBackendIndustry } from '@/src/lib/industry';

const PLANT_ID_PATTERN = /^[A-Za-z0-9_-]+$/;

/**
 * Shared "create a new plant" form state + validation + submit, backed by
 * the app-wide PlantsContext so a plant created from any dropdown is
 * immediately visible in every other one.
 */
export function useCreatePlantForm(onCreated) {
    const { createPlant } = usePlants();
    const [value, setValue] = useState('');
    const [industry, setIndustry] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const reset = useCallback(() => {
        setValue('');
        setIndustry('');
        setError('');
    }, []);

    const submit = useCallback(async () => {
        const trimmed = value.trim();
        if (!trimmed) {
            setError('Plant ID is required');
            return;
        }
        if (!PLANT_ID_PATTERN.test(trimmed)) {
            setError('Only letters, numbers, hyphens and underscores allowed');
            return;
        }
        if (!industry) {
            setError('Industry is required');
            return;
        }
        setSubmitting(true);
        setError('');
        try {
            const created = await createPlant(trimmed, trimmed, toBackendIndustry(industry));
            reset();
            onCreated?.(created);
        } catch (e) {
            setError(e.message || 'Failed to create plant ID');
        } finally {
            setSubmitting(false);
        }
    }, [value, industry, createPlant, reset, onCreated]);

    return { value, setValue, industry, setIndustry, submitting, error, setError, submit, reset };
}
