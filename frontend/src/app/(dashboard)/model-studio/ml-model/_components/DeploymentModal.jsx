'use client';
import React from 'react';
import { Rocket, X, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Modal } from '@/src/components/ui/Modal';
import { Select } from '@/src/components/ui/Select';
import { CRON_LABELS, getCronDescriptionAndNextRun } from '../_lib/cronUtils';

export function DeploymentModal({
    isOpen,
    onClose,
    isEditMode,
    formData,
    setFormData,
    expOptions,
    cronValidation,
    isSaving,
    onSubmit,
}) {
    const cronFields = (formData.cronSchedule || '* * * * *').trim().split(/\s+/);
    while (cronFields.length < 5) cronFields.push('*');

    const handleCronFieldChange = (index, val) => {
        const updated = [...cronFields];
        updated[index] = val?.trim() || '*';
        setFormData(prev => ({ ...prev, cronSchedule: updated.join(' ') }));
    };

    const cronInfo = getCronDescriptionAndNextRun(formData.cronSchedule);

    return (
        <Modal open={isOpen} onClose={onClose} size="lg" className="overflow-hidden flex flex-col">
            <form onSubmit={onSubmit}>
                {/* Header */}
                <div className="p-6 border-b border-border flex justify-between items-start">
                    <div>
                        <h3 className="text-[22px] font-bold text-text-primary">
                            {isEditMode ? `Modify Deployment #${formData.deploymentId || ''}` : 'Deploy Model'}
                        </h3>
                        <p className="text-[16px] text-text-muted mt-1">
                            {isEditMode
                                ? 'Update target environment, schedule, or operational status.'
                                : 'Configure deployment schedule and target environment for trained experiment.'}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="text-text-subtle hover:text-text-secondary p-1 cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
                    {/* Experiment Selection */}
                    <div>
                        <label className="block text-[15px] font-medium text-text-primary mb-1.5">
                            Select Experiment <span className="text-danger">*</span>
                        </label>
                        {expOptions.length > 0 ? (
                            <Select
                                value={formData.experimentId}
                                onChange={val => setFormData(prev => ({ ...prev, experimentId: val }))}
                                placeholder="Choose trained experiment"
                                options={expOptions}
                            />
                        ) : (
                            <input
                                type="number"
                                value={formData.experimentId}
                                onChange={e => setFormData(prev => ({ ...prev, experimentId: e.target.value }))}
                                placeholder="Enter Experiment ID (e.g. 5)"
                                className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text-primary focus:outline-none focus:border-brand"
                            />
                        )}
                    </div>

                    {/* Environment Selection */}
                    <div>
                        <label className="block text-[15px] font-medium text-text-primary mb-1.5">
                            Environment <span className="text-danger">*</span>
                        </label>
                        <Select
                            value={formData.environment}
                            onChange={val => setFormData(prev => ({ ...prev, environment: val }))}
                            placeholder="Select Environment"
                            options={[
                                { label: 'Production (prod)', value: 'prod' },
                                { label: 'Development (dev)', value: 'dev' },
                            ]}
                        />
                    </div>

                    {/* Visual 5-Box Cron Schedule Picker */}
                    <div className="space-y-2">
                        <label className="block text-[15px] font-medium text-text-primary">
                            Cron Schedule <span className="text-danger">*</span>
                        </label>

                        <div className="flex gap-2">
                            {CRON_LABELS.map((label, idx) => (
                                <div key={label} className="flex flex-col items-center flex-1">
                                    <input
                                        type="text"
                                        value={cronFields[idx] || '*'}
                                        onChange={e => handleCronFieldChange(idx, e.target.value)}
                                        className="w-full text-center px-2 py-2.5 bg-surface border border-border rounded-xl text-text-primary text-[15px] font-bold focus:ring-4 focus:ring-brand/10 focus:border-brand transition-all font-mono"
                                    />
                                    <span className="text-[10px] font-bold text-text-subtle mt-1.5 uppercase tracking-wider text-center">
                                        {label}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Cron Validation Banner */}
                        {cronValidation?.isLoading ? (
                            <div className="flex items-center gap-2 text-text-muted text-xs pl-1 font-bold mt-2">
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-brand" />
                                <span>Validating cron schedule...</span>
                            </div>
                        ) : cronValidation && !cronValidation.isValid && cronValidation.error ? (
                            <div className="mt-2 p-3 bg-danger/10 border border-danger/20 text-danger rounded-xl text-xs font-medium flex items-start gap-2 animate-in fade-in">
                                <XCircle className="w-4 h-4 text-danger mt-0.5 shrink-0" />
                                <span>{cronValidation.error}</span>
                            </div>
                        ) : (
                            <div className="mt-2 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex flex-col gap-0.5 animate-in fade-in">
                                <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                    <span>{cronValidation?.description || cronInfo.desc}</span>
                                </div>
                                {(cronValidation?.nextRun || cronInfo.nextRun) && (
                                    <span className="text-[11px] text-emerald-700/80 font-bold uppercase tracking-wider pl-6 mt-0.5">
                                        NEXT RUN: {cronValidation?.nextRun ? new Date(cronValidation.nextRun).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'medium' }) : cronInfo.nextRun}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>


                </div>

                {/* Footer */}
                <div className="p-4 border-t border-border flex justify-end gap-3 bg-canvas">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 border border-border text-text-primary bg-surface rounded-lg hover:bg-canvas font-medium text-[16px] cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSaving || (cronValidation && !cronValidation.isValid)}
                        className={`flex items-center gap-2 px-4 py-2 text-white rounded-lg font-medium text-[16px] cursor-pointer transition-all ${
                            isSaving || (cronValidation && !cronValidation.isValid)
                                ? 'bg-surface-2 text-text-subtle cursor-not-allowed border border-border'
                                : 'bg-brand hover:bg-brand-hover'
                        }`}
                    >
                        <Rocket className="w-4 h-4" />
                        <span>{isSaving ? 'Saving...' : isEditMode ? 'Update Deployment' : 'Deploy Model'}</span>
                    </button>
                </div>
            </form>
        </Modal>
    );
}
