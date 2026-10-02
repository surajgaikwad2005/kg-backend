'use client';
import { Modal, ModalBody, ModalFooter } from '@/src/components/ui/Modal';
import { Select } from '@/src/components/ui/Select';
import { CheckCircle2 } from 'lucide-react';
import { CRON_LABELS, getCronDescriptionAndNextRun } from '../../ml-model/_lib/cronUtils';

const ENVIRONMENTS = ['development', 'staging', 'production'];

export function DeploymentModal({ isEditMode, form, setForm, experiments, isSaving, onClose, onSave }) {
    const cronFields = (form.cronSchedule || '* * * * *').trim().split(/\s+/);
    while (cronFields.length < 5) cronFields.push('*');

    const handleCronFieldChange = (index, val) => {
        const updated = [...cronFields];
        updated[index] = val?.trim() || '*';
        setForm(f => ({ ...f, cronSchedule: updated.join(' ') }));
    };

    const cronInfo = getCronDescriptionAndNextRun(form.cronSchedule);
    return (
        <Modal open onClose={onClose} title={isEditMode ? 'Modify Deployment' : 'Add Deployment'} size="lg">
            <ModalBody className="space-y-5 max-h-[65vh] overflow-y-auto">
                <p className="text-body-sm text-text-muted -mt-1">Schedule an optimizer experiment to run in an environment, optionally on a cron schedule.</p>

                <div>
                    <label htmlFor="dep-exp" className="block text-body-sm font-semibold text-text-primary mb-1">Experiment <span className="text-danger">*</span></label>
                    <Select
                        id="dep-exp"
                        value={form.experimentId}
                        onChange={(v) => setForm(f => ({ ...f, experimentId: v }))}
                        placeholder="Select experiment"
                        searchable
                        searchPlaceholder="Search experiments..."
                        options={experiments.map(exp => ({ value: exp.experiment_id, label: `#${exp.experiment_id} — ${exp.description || exp.solver || 'Experiment'}` }))}
                    />
                </div>

                <div className="grid grid-cols-1 gap-4">
                    <div>
                        <label htmlFor="dep-env" className="block text-body-sm font-semibold text-text-primary mb-1">Environment</label>
                        <Select
                            id="dep-env"
                            value={form.environment}
                            onChange={(v) => setForm(f => ({ ...f, environment: v }))}
                            options={ENVIRONMENTS.map(env => ({ value: env, label: env.charAt(0).toUpperCase() + env.slice(1) }))}
                        />
                    </div>
                    <div>
                        <label className="block text-body-sm font-semibold text-text-primary mb-1">Cron Schedule</label>
                        <div className="flex gap-2">
                            {CRON_LABELS.map((label, idx) => (
                                <div key={label} className="flex flex-col items-center flex-1">
                                    <input
                                        type="text"
                                        value={cronFields[idx] || '*'}
                                        onChange={e => handleCronFieldChange(idx, e.target.value)}
                                        className="w-full text-center px-2 py-2 bg-surface border border-border rounded-lg text-text-secondary text-body-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all font-mono"
                                    />
                                    <span className="text-[10px] font-bold text-text-subtle mt-1 uppercase tracking-wider text-center">
                                        {label}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className="mt-2 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex flex-col gap-0.5 animate-in fade-in">
                            <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                <span>{cronInfo.desc}</span>
                            </div>
                            {cronInfo.nextRun && (
                                <span className="text-[11px] text-emerald-700/80 font-bold uppercase tracking-wider pl-6 mt-0.5">
                                    NEXT RUN: {cronInfo.nextRun}
                                </span>
                            )}
                        </div>
                    </div>
                </div>


            </ModalBody>
            <ModalFooter>
                <button onClick={onClose} className="px-4 py-2 border border-transparent text-text-muted hover:text-text-secondary font-medium text-body-sm transition-colors cursor-pointer">Cancel</button>
                <button
                    onClick={onSave} disabled={isSaving || !form.experimentId} aria-busy={isSaving}
                    className={`px-4 py-2 text-white rounded-lg font-medium text-body-sm transition-colors cursor-pointer ${isSaving || !form.experimentId ? 'bg-brand/50 cursor-not-allowed' : 'bg-brand hover:bg-brand-hover'}`}
                >
                    {isSaving ? (isEditMode ? 'Updating…' : 'Creating…') : (isEditMode ? 'Update' : 'Create')}
                </button>
            </ModalFooter>
        </Modal>
    );
}
