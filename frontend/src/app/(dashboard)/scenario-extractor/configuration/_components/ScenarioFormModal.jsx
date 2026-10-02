'use client';
import React, { useState, useEffect } from 'react';
import { useCreateScenario, useModifyScenario } from '../../_queries/useScenarioQueries';
import { Modal, ModalBody, ModalFooter } from '@/src/components/ui/Modal';
import { Input } from '@/src/components/ui/Input';
import { Select } from '@/src/components/ui/Select';
import { MultiSelectDropdown } from '@/src/components/ui/MultiSelectDropdown';
import { Button } from '@/src/components/ui/Button';

const ASSET_OPTIONS = [
    { value: 'U1300', label: 'U1300' },
    { value: 'Pump A', label: 'Pump A' },
    { value: 'Compressor B', label: 'Compressor B' },
    { value: 'Turbine C', label: 'Turbine C' }
];

const TAG_OPTIONS = [
    { value: '1300FI005.pv', label: '1300FI005.pv' },
    { value: '1300FFI007.pv', label: '1300FFI007.pv' },
    { value: '2300FC312A.PV', label: '2300FC312A.PV' },
    { value: '2300FC312B.PV', label: '2300FC312B.PV' }
];

export default function ScenarioFormModal({ isOpen, onClose, scenario }) {
    const isEdit = !!scenario;
    const createMutation = useCreateScenario();
    const modifyMutation = useModifyScenario();

    const formatToLocalDatetime = (str) => {
        if (!str) return '';
        return str.replace(' ', 'T').slice(0, 16);
    };

    const formatToDbDatetime = (str) => {
        if (!str) return '';
        let formatted = str.replace('T', ' ');
        if (formatted.length === 16) {
            formatted += ':00';
        }
        return formatted;
    };

    const [name, setName] = useState('');
    const [asset, setAsset] = useState('U1300');
    const [selectedTags, setSelectedTags] = useState([]);
    const [startTime, setStartTime] = useState('2025-12-01T10:00');
    const [endTime, setEndTime] = useState('2025-12-01T15:00');
    const [threshold, setThreshold] = useState(70);
    const [error, setError] = useState('');

    useEffect(() => {
        if (scenario) {
            setName(scenario.scenario_name || '');
            setAsset(scenario.asset || 'U1300');
            setSelectedTags(scenario.tags || []);
            setStartTime(formatToLocalDatetime(scenario.start_time)  );
            setEndTime(formatToLocalDatetime(scenario.end_time) );
            setThreshold(scenario.similarity_threshold || 70);
        } else {
            setName('');
            setAsset('U1300');
            setSelectedTags([]);
            setStartTime('2025-12-01T10:00');
            setEndTime('2025-12-01T15:00');
            setThreshold(70);
        }
        setError('');
    }, [scenario, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) return setError('Scenario Name is required');
        if (selectedTags.length === 0) return setError('At least one tag must be selected');

        const payload = {
            scenario_name: name,
            asset,
            tags: selectedTags,
            start_time: formatToDbDatetime(startTime),
            end_time: formatToDbDatetime(endTime),
            similarity_threshold: Number(threshold)
        };

        try {
            if (isEdit) {
                await modifyMutation.mutateAsync({
                    ...payload,
                    scenario_id: scenario.scenario_id
                });
            } else {
                await createMutation.mutateAsync(payload);
            }
            onClose();
        } catch (err) {
            setError(err.message || 'An error occurred while saving the scenario');
        }
    };

    const isPending = createMutation.isPending || modifyMutation.isPending;

    return (
        <Modal
            open={isOpen}
            onClose={onClose}
            title={
                <div className="flex flex-col gap-1 pr-6">
                    <span className="block text-sm font-semibold text-text-primary">
                        {isEdit ? 'Modify Scenario' : 'Create Scenario'}
                    </span>
                    <span className="block text-xs font-normal text-text-muted">
                        {isEdit 
                            ? 'Update the similarity target, threshold level, and historical time boundaries for this scenario profile.' 
                            : 'Configure a similarity scenario profile to monitor target tags, select asset sources, and match historical episodes.'}
                    </span>
                </div>
            }
            size="lg"
            closeOnBackdrop={!isPending}
            className="!overflow-visible"
        >
            <form onSubmit={handleSubmit} className="flex flex-col min-h-0 overflow-visible">
                <ModalBody className="space-y-5 overflow-visible pt-6">
                    {error && (
                        <div className="p-3 bg-danger/10 border border-danger/20 rounded-lg text-xs font-bold text-danger">
                            {error}
                        </div>
                    )}

                    <Input
                        label="Scenario Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. High Flow Scenario"
                        size="sm"
                        disabled={isPending}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Select
                            label="Asset"
                            value={asset}
                            onChange={setAsset}
                            options={ASSET_OPTIONS}
                            size="sm"
                            disabled={isPending}
                        />

                        <div className="flex flex-col space-y-1">
                            <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">
                                Similarity Threshold (%)
                            </label>
                            <input
                                type="number"
                                min="50"
                                max="100"
                                value={threshold}
                                onChange={(e) => setThreshold(Number(e.target.value))}
                                className="w-full border py-2 px-3 text-sm rounded-lg bg-surface border-border focus:outline-none focus:border-brand transition-all text-text-primary"
                                disabled={isPending}
                            />
                        </div>
                    </div>

                    <MultiSelectDropdown
                        label="Tags"
                        options={TAG_OPTIONS}
                        value={selectedTags}
                        onChange={setSelectedTags}
                        placeholder="Select target tags..."
                        searchable
                        disabled={isPending}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Start Time"
                            type="datetime-local"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            size="sm"
                            disabled={isPending}
                        />

                        <Input
                            label="End Time"
                            type="datetime-local"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            size="sm"
                            disabled={isPending}
                        />
                    </div>
                </ModalBody>

                <ModalFooter>
                    <Button variant="secondary" onClick={onClose} disabled={isPending}>
                        Cancel
                    </Button>
                    <Button type="submit" isPending={isPending}>
                        {isEdit ? 'Save Changes' : 'Create'}
                    </Button>
                </ModalFooter>
            </form>
        </Modal>
    );
}
