'use client';
import React from 'react';
import { X, Settings } from 'lucide-react';
import { Modal } from '@/src/components/ui/Modal';
import { Spinner } from '@/src/components/ui/Spinner';
import { Select } from '@/src/components/ui/Select';

export function ExperimentModal({
    isExpModifyMode, activeExpModalTab, setActiveExpModalTab,
    newExpForm, setNewExpForm, paramValues, setParamValues,
    fetchedParams, paramsLoading, paramsError,
    metricOptions, metricOptionsLoading,
    isSaving, modelsList, pipelinesList,
    onClose, onLaunch,
}) {
    const isBasicValid = newExpForm.name && newExpForm.modelName && newExpForm.pipelineName;
    const isLaunchValid = isBasicValid && newExpForm.startTime && newExpForm.endTime;

    return (
        <Modal open onClose={onClose} size="lg" className="overflow-hidden flex flex-col">
                <div className="p-6 border-b border-border flex justify-between items-start">
                    <div>
                        <h3 id="exp-modal-title" className="text-[22px] font-bold text-text-primary">{isExpModifyMode ? 'Modify Experiment' : 'Create New Experiment'}</h3>
                        <p className="text-base text-text-muted mt-1">{isExpModifyMode ? 'Update training parameters for your existing experiment.' : 'Configure training parameters and launch a new experiment run.'}</p>
                    </div>
                    <button onClick={onClose} aria-label="Close" className="text-text-subtle hover:text-text-secondary p-1 cursor-pointer"><X className="w-5 h-5" /></button>
                </div>

                <div className="p-6 space-y-5 overflow-y-auto">
                    <div className="flex bg-surface-2 p-1 rounded-lg">
                        {['Basic', 'Hyperparameters', 'Compute'].map(tab => (
                            <button key={tab} onClick={() => setActiveExpModalTab(tab)} className={`flex-1 text-base font-medium py-1.5 rounded-md transition-colors cursor-pointer ${activeExpModalTab === tab ? 'bg-surface shadow-sm text-text-primary' : 'text-text-secondary hover:text-text-primary'}`}>{tab}</button>
                        ))}
                    </div>

                    {activeExpModalTab === 'Basic' && (
                        <div className="space-y-4 pt-2">
                            <div>
                                <label htmlFor="exp-name" className="block text-base font-medium text-text-primary mb-1 mt-2">Experiment Name <span className="text-danger">*</span></label>
                                <input id="exp-name" type="text" value={newExpForm.name} onChange={e => setNewExpForm({ ...newExpForm, name: e.target.value })} placeholder="e.g., fraud-detector-v4-training" className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand text-base font-mono text-text-secondary" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="exp-model" className="block text-base font-medium text-text-primary mb-1">Base Model <span className="text-danger">*</span></label>
                                    <Select
                                        id="exp-model"
                                        value={newExpForm.modelName}
                                        onChange={(v) => setNewExpForm({ ...newExpForm, modelName: v })}
                                        placeholder="Select model"
                                        searchable
                                        searchPlaceholder="Search models..."
                                        options={modelsList.map(m => m.model_name)}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="exp-pipeline" className="block text-base font-medium text-text-primary mb-1">Base Pipeline <span className="text-danger">*</span></label>
                                    <Select
                                        id="exp-pipeline"
                                        value={newExpForm.pipelineName}
                                        onChange={(v) => setNewExpForm({ ...newExpForm, pipelineName: v })}
                                        placeholder="Select pipeline"
                                        searchable
                                        searchPlaceholder="Search pipelines..."
                                        options={pipelinesList.map(pipe => pipe.pipeline_name)}
                                    />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="exp-metric" className="block text-base font-medium text-text-primary mb-1">Primary Metric{metricOptionsLoading && <span className="text-body-sm text-brand ml-2">Loading...</span>}</label>
                                <div className="w-full sm:w-1/2">
                                    <Select
                                        id="exp-metric"
                                        value={newExpForm.metric}
                                        onChange={(v) => setNewExpForm({ ...newExpForm, metric: v })}
                                        disabled={!newExpForm.modelName || metricOptionsLoading}
                                        placeholder={newExpForm.modelName ? 'Select metric' : 'Select a model first'}
                                        options={metricOptions}
                                    />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="exp-notes" className="block text-base font-medium text-text-primary mb-1">Notes</label>
                                <textarea id="exp-notes" rows={3} value={newExpForm.notes} onChange={e => setNewExpForm({ ...newExpForm, notes: e.target.value })} placeholder="Experiment notes, hypothesis, expected outcomes..." className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand text-base text-text-secondary resize-y" />
                            </div>
                        </div>
                    )}

                    {activeExpModalTab === 'Hyperparameters' && (
                        <div className="space-y-4 pt-2 min-h-[300px]">
                            {paramsLoading ? (
                                <div className="flex flex-col items-center justify-center gap-3 py-12 text-text-muted"><Spinner size="lg" /><p className="text-body-sm">Loading hyperparameters…</p></div>
                            ) : paramsError ? (
                                <div className="p-4 bg-danger/10 border border-danger/20 rounded-lg text-danger text-center">{paramsError}</div>
                            ) : fetchedParams.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-text-subtle border-2 border-dashed border-border rounded-xl">
                                    <Settings className="w-12 h-12 mb-3 opacity-20" />
                                    <p className="font-medium text-text-muted">No parameters to configure</p>
                                    <p className="text-sm">Select a base model or pipeline first.</p>
                                </div>
                            ) : (
                                fetchedParams.map(param => (
                                    <div key={param.name}>
                                        <label htmlFor={`param-${param.name}`} className="block text-base font-medium text-text-primary mb-1 capitalize">
                                            {param.label || param.name.replace(/_/g, ' ')} {param.required && <span className="text-danger">*</span>}
                                        </label>
                                        {param.type === 'select' ? (
                                            <div className="w-full sm:w-2/3">
                                                <Select
                                                    id={`param-${param.name}`}
                                                    value={paramValues[param.name] || ''}
                                                    onChange={(v) => setParamValues({ ...paramValues, [param.name]: v })}
                                                    options={param.options || []}
                                                />
                                            </div>
                                        ) : param.type === 'boolean' ? (
                                            <div className="flex items-center gap-2 pt-1">
                                                <input id={`param-${param.name}`} type="checkbox" checked={!!paramValues[param.name]} onChange={e => setParamValues({ ...paramValues, [param.name]: e.target.checked })} className="w-4 h-4 rounded border-border-strong text-brand focus:ring-brand cursor-pointer" />
                                                <span className="text-sm text-text-secondary">Enable</span>
                                            </div>
                                        ) : (
                                            <input id={`param-${param.name}`} type={param.type === 'int' || param.type === 'float' ? 'number' : 'text'} step={param.type === 'float' ? '0.01' : '1'} placeholder={param.placeholder || ''} value={paramValues[param.name] ?? ''} onChange={e => { const val = e.target.value; setParamValues({ ...paramValues, [param.name]: val === '' ? (param.nullable ? null : 0) : param.type === 'float' ? parseFloat(val) : parseInt(val) }); }} className="w-full sm:w-2/3 px-3 py-2 border border-border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-brand text-text-secondary" />
                                        )}
                                        {param.hint && <p className="text-body-sm text-text-muted mt-1">{param.hint}</p>}
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {activeExpModalTab === 'Compute' && (
                        <div className="space-y-4 pt-2">
                            <div>
                                <label htmlFor="exp-start" className="block text-base font-medium text-text-primary mb-1">Start Time</label>
                                <input id="exp-start" type="datetime-local" value={newExpForm.startTime} onChange={e => setNewExpForm({ ...newExpForm, startTime: e.target.value })} className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand text-base text-text-secondary" />
                            </div>
                            <div>
                                <label htmlFor="exp-end" className="block text-base font-medium text-text-primary mb-1">End Time</label>
                                <input id="exp-end" type="datetime-local" value={newExpForm.endTime} onChange={e => setNewExpForm({ ...newExpForm, endTime: e.target.value })} className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand text-base text-text-secondary" />
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-border flex justify-end gap-3 bg-canvas">
                    {activeExpModalTab !== 'Basic' && (
                        <button onClick={() => setActiveExpModalTab(activeExpModalTab === 'Compute' ? 'Hyperparameters' : 'Basic')} className="px-4 py-2 border border-border text-text-secondary bg-surface rounded-lg hover:bg-canvas font-medium text-base transition-colors cursor-pointer">Back</button>
                    )}
                    <button onClick={onClose} className="px-4 py-2 border border-transparent text-text-muted hover:text-text-secondary font-medium text-base transition-colors cursor-pointer">Cancel</button>
                    {activeExpModalTab === 'Basic' ? (
                        <button onClick={() => setActiveExpModalTab('Hyperparameters')} disabled={!isBasicValid} className={`px-4 py-2 text-white rounded-lg font-medium text-base transition-colors cursor-pointer ${!isBasicValid ? 'bg-brand/50 cursor-not-allowed' : 'bg-brand hover:bg-brand-hover'}`}>Next: Hyperparameters</button>
                    ) : activeExpModalTab === 'Hyperparameters' ? (
                        <button onClick={() => setActiveExpModalTab('Compute')} className="px-4 py-2 bg-brand hover:bg-brand-hover text-white rounded-lg font-medium text-base transition-colors cursor-pointer">Next: Compute</button>
                    ) : (
                        <button onClick={onLaunch} disabled={isSaving || !isLaunchValid} aria-busy={isSaving} className={`px-4 py-2 text-white rounded-lg font-medium text-base transition-colors cursor-pointer ${isSaving || !isLaunchValid ? 'bg-brand/50 cursor-not-allowed' : 'bg-brand hover:bg-brand-hover'}`}>
                            {isSaving ? (isExpModifyMode ? 'Updating...' : 'Launching...') : (isExpModifyMode ? 'Update Experiment' : 'Launch Experiment')}
                        </button>
                    )}
                </div>
        </Modal>
    );
}
