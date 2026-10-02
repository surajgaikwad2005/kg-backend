'use client';
import React from 'react';
import { Settings } from 'lucide-react';
import { Modal, ModalBody, ModalFooter } from '@/src/components/ui/Modal';
import { Button } from '@/src/components/ui/Button';
import { Select } from '@/src/components/ui/Select';
import { cronToInterval, intervalToHuman, isValidInterval } from './activityUtils';

export function EditTriggersModal({ showEditTriggers, setShowEditTriggers, activeJobs, triggerEdits, updateEdit }) {
    const close = () => setShowEditTriggers(false);

    return (
        <Modal open={showEditTriggers} onClose={close} size="3xl" title="Edit Job Triggers" className="max-h-[80vh] flex flex-col">
            <ModalBody className="flex-1 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-border-strong">
                <div className="flex items-center gap-3 -mt-1 mb-2">
                    <div className="w-10 h-10 bg-brand/10 rounded-xl flex items-center justify-center text-brand">
                        <Settings size={20} />
                    </div>
                    <p className="text-xs text-text-muted">Configure trigger type and schedule for each pipeline job</p>
                </div>
                {activeJobs.map((job) => {
                    const edit = triggerEdits[job.jobId] || { trigger: job.trigger, interval: cronToInterval(job.schedule, job.trigger) };
                    const isScheduled = edit.trigger === 'Scheduled';
                    const humanLabel = intervalToHuman(edit.interval, edit.trigger);
                    const valid = isScheduled ? isValidInterval(edit.interval) : true;
                    return (
                        <div key={job.jobId} className="bg-surface-2 border border-border p-4 rounded-xl flex items-center gap-6">
                            <div className="flex-1 min-w-0">
                                <div className="font-bold text-brand text-sm">{job.jobId}</div>
                                <div className="text-label text-text-muted">{job.source} · {job.namespace}</div>
                                <div className={`text-xs mt-1 font-medium ${valid ? 'text-text-secondary' : 'text-danger'}`}>{humanLabel}</div>
                            </div>
                            <div className="flex items-end gap-4">
                                 <div className="space-y-1 w-28">
                                     <label htmlFor={`trigger-${job.jobId}`} className="text-2xs font-bold text-text-muted uppercase tracking-widest">Trigger</label>
                                     <Select
                                         id={`trigger-${job.jobId}`}
                                         value={edit.trigger}
                                         onChange={(trigger) => updateEdit(job.jobId, { trigger })}
                                         options={['Scheduled', 'Manual', 'Webhook']}
                                     />
                                 </div>
                                {isScheduled && (
                                    <div className="space-y-1">
                                        <label htmlFor={`interval-${job.jobId}`} className="text-2xs font-bold text-text-muted uppercase tracking-widest">Interval <span className="normal-case text-text-secondary">(DD:HH:MM)</span></label>
                                        <input id={`interval-${job.jobId}`} type="text" value={edit.interval}
                                            onChange={(e) => updateEdit(job.jobId, { interval: e.target.value })}
                                            placeholder="00:01:00"
                                            className={`bg-surface border rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none w-28 font-mono tracking-widest ${valid ? 'border-border focus:border-brand' : 'border-danger/50 focus:border-danger'}`} />
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </ModalBody>
            <ModalFooter>
                <Button variant="ghost" onClick={close}>Cancel</Button>
                <button onClick={close}
                    className="px-5 py-2.5 bg-brand hover:bg-brand-hover text-white rounded-xl text-xs font-bold shadow-lg shadow-brand/20 transition-all cursor-pointer">
                    Save Triggers
                </button>
            </ModalFooter>
        </Modal>
    );
}
