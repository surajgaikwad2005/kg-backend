'use client';
import React from 'react';
import { Modal, ModalBody, ModalFooter } from '@/src/components/ui/Modal';

const TEMPLATE_CLASSES = ['demo', 'pca', 'anomaly_detection', 'classification'];

export default function CreateTemplateModal({
    templateName,
    setTemplateName,
    templateClass,
    setTemplateClass,
    onConfirm,
    onClose,
    visible,
}) {
    // const canSubmit = templateName.trim() && templateClass.trim();
    const canSubmit = templateName.trim();

    return (
        <Modal open={visible} onClose={onClose} size="md" title="Create New Template">
            <ModalBody className="space-y-5">
                <div>
                    <label htmlFor="dt-template-name" className="block text-sm font-semibold text-text-primary mb-1.5">
                        Template Name
                    </label>
                    <input
                        id="dt-template-name"
                        type="text"
                        placeholder="e.g. anomaly_workflow"
                        value={templateName}
                        onChange={(e) => setTemplateName(e.target.value)}
                        className="w-full px-4 py-2.5 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand text-sm font-medium text-text-primary transition-all placeholder:text-text-secondary"
                        autoFocus
                    />
                </div>
                <div>
                    <label htmlFor="dt-template-class" className="block text-sm font-semibold text-text-primary mb-1.5">
                        Template Class <span className="text-text-secondary font-normal text-xs ml-1">(optional)</span>
                    </label>
                    <input
                        id="dt-template-class"
                        list="dt-template-classes"
                        placeholder="e.g. demo, pca, anomaly_detection"
                        value={templateClass}
                        onChange={(e) => setTemplateClass(e.target.value)}
                        className="w-full px-4 py-2.5 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand text-sm font-medium text-text-primary transition-all placeholder:text-text-secondary"
                    />
                    <datalist id="dt-template-classes">
                        {TEMPLATE_CLASSES.map((cls) => <option key={cls} value={cls} />)}
                    </datalist>
                    <p className="mt-1.5 text-xs text-text-secondary">
                        Suggested: {TEMPLATE_CLASSES.join(', ')}
                    </p>
                </div>
            </ModalBody>

            <ModalFooter>
                <button
                    onClick={onClose}
                    className="px-4 py-2 font-semibold text-text-secondary hover:bg-border/50 bg-border/30 rounded-lg transition-colors text-sm cursor-pointer"
                >
                    Cancel
                </button>
                <button
                    onClick={onConfirm}
                    disabled={!canSubmit}
                    className="px-4 py-2 font-semibold text-white bg-brand hover:bg-brand-hover disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors text-sm cursor-pointer"
                >
                    Save &amp; Continue
                </button>
            </ModalFooter>
        </Modal>
    );
}
