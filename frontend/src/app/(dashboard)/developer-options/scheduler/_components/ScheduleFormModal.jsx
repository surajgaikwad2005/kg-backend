'use client';
import { useEffect, useState } from 'react';
import { Modal, ModalBody, ModalFooter } from '@/src/components/ui/Modal';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { Select } from '@/src/components/ui/Select';
import { CronScheduleInput } from './CronScheduleInput';
import { CRON_DEFAULT_FIELDS } from '../_lib/cron';

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
const FIELD_LABEL = 'text-xs font-bold text-text-muted uppercase tracking-wider mb-2 block';
const TEXTAREA =
    'w-full px-4 py-3 rounded-lg bg-canvas border border-border text-text-primary text-sm font-mono focus:outline-none focus:border-brand transition-colors resize-none';

function isValidJson(text) {
    if (!text.trim()) return true;
    try {
        JSON.parse(text);
        return true;
    } catch {
        return false;
    }
}

/** Splits a cron_expression string into 5 fields; falls back to defaults if the shape is unexpected (e.g. a 6-field seconds-prefixed value) rather than misaligning fields. */
function splitCron(expr) {
    const parts = (expr || '').trim().split(/\s+/).filter(Boolean);
    return parts.length === 5 ? parts : CRON_DEFAULT_FIELDS;
}

/** Create or edit a scheduled job — passing `schedule` switches the form into edit mode. */
export function ScheduleFormModal({ open, onClose, onSubmit, schedule = null }) {
    const isEdit = Boolean(schedule);
    const [jobName, setJobName] = useState('');
    const [cronFields, setCronFields] = useState(CRON_DEFAULT_FIELDS);
    const [method, setMethod] = useState('POST');
    const [url, setUrl] = useState('');
    const [payloadText, setPayloadText] = useState('{}');
    const [headersText, setHeadersText] = useState('{}');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!open) return;
        setJobName(schedule?.job_name ?? '');
        setCronFields(splitCron(schedule?.cron_expression));
        setMethod(schedule?.method ?? 'POST');
        setUrl(schedule?.url ?? '');
        setPayloadText(schedule?.payload ? JSON.stringify(schedule.payload, null, 2) : '{}');
        setHeadersText(schedule?.headers ? JSON.stringify(schedule.headers, null, 2) : '{}');
        setIsSubmitting(false);
    }, [open, schedule]);

    const handleCronChange = (i, value) => {
        setCronFields((prev) => prev.map((f, idx) => (idx === i ? value : f)));
    };

    const payloadValid = isValidJson(payloadText);
    const headersValid = isValidJson(headersText);
    const canSubmit = jobName.trim() && url.trim() && payloadValid && headersValid && !isSubmitting;

    const handleSubmit = async () => {
        if (!canSubmit) return;
        setIsSubmitting(true);
        try {
            await onSubmit({
                jobName: jobName.trim(),
                cronExpression: cronFields.join(' '),
                method,
                url: url.trim(),
                payload: payloadText.trim() ? JSON.parse(payloadText) : {},
                headers: headersText.trim() ? JSON.parse(headersText) : {},
            });
            onClose();
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Schedule' : 'Create Schedule'} size="lg" closeOnBackdrop={!isSubmitting}>
            <ModalBody className="space-y-5">
                <p className="text-xs text-text-muted -mt-3">
                    {isEdit ? 'Update this cron-based scheduled job' : 'Configure a new cron-based scheduled job'}
                </p>

                <Input
                    id="schedule-job-name"
                    label="Job Name"
                    size="sm"
                    value={jobName}
                    onChange={(e) => setJobName(e.target.value)}
                    placeholder="e.g. Model101_Retrain"
                />

                <div>
                    <span className={FIELD_LABEL}>Cron Schedule *</span>
                    <CronScheduleInput fields={cronFields} onFieldChange={handleCronChange} />
                </div>

                <div className="grid grid-cols-[120px_1fr] gap-3">
                    <div>
                        <label className={FIELD_LABEL} htmlFor="schedule-method">Method</label>
                        <Select
                            id="schedule-method"
                            value={method}
                            onChange={setMethod}
                            options={METHODS.map((m) => ({ value: m, label: m }))}
                        />
                    </div>
                    <Input
                        id="schedule-url"
                        label="URL"
                        size="sm"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://example.com/api/endpoint"
                    />
                </div>

                <div>
                    <label className={FIELD_LABEL} htmlFor="schedule-payload">Payload (JSON)</label>
                    <textarea
                        id="schedule-payload"
                        rows={4}
                        value={payloadText}
                        onChange={(e) => setPayloadText(e.target.value)}
                        className={TEXTAREA}
                        aria-invalid={!payloadValid}
                    />
                    {!payloadValid && <p className="text-xs text-danger font-semibold mt-1">Invalid JSON</p>}
                </div>

                <div>
                    <label className={FIELD_LABEL} htmlFor="schedule-headers">Headers (JSON)</label>
                    <textarea
                        id="schedule-headers"
                        rows={3}
                        value={headersText}
                        onChange={(e) => setHeadersText(e.target.value)}
                        className={TEXTAREA}
                        aria-invalid={!headersValid}
                    />
                    {!headersValid && <p className="text-xs text-danger font-semibold mt-1">Invalid JSON</p>}
                </div>
            </ModalBody>

            <ModalFooter>
                <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
                <Button variant="primary" onClick={handleSubmit} disabled={!canSubmit} isPending={isSubmitting}>
                    {isEdit ? 'Save Changes' : 'Create'}
                </Button>
            </ModalFooter>
        </Modal>
    );
}
