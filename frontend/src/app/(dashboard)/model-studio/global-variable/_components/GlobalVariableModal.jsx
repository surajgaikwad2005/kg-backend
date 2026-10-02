'use client';
import React, { useState, useEffect } from 'react';
import { Modal, ModalBody, ModalFooter } from '@/src/components/ui/Modal';
import { Spinner } from '@/src/components/ui/Spinner';
import { X } from 'lucide-react';

export function GlobalVariableModal({
    open,
    onClose,
    editingVariable,
    onSubmit,
    actionLoading,
}) {
    const [varName, setVarName] = useState('');
    const [value, setValue] = useState('');
    const [description, setDescription] = useState('');

    const [keyError, setKeyError] = useState('');
    const [valueError, setValueError] = useState('');
    const [apiError, setApiError] = useState('');

    useEffect(() => {
        if (editingVariable) {
            setVarName(editingVariable.var || editingVariable.key || '');
            setValue(editingVariable.value ?? '');
            setDescription(editingVariable.description || '');
        } else {
            setVarName('');
            setValue('');
            setDescription('');
        }
        setKeyError('');
        setValueError('');
        setApiError('');
    }, [editingVariable, open]);

    const handleSubmit = (e) => {
        e.preventDefault();
        let valid = true;

        if (!varName.trim()) {
            setKeyError('Key is required');
            valid = false;
        } else {
            setKeyError('');
        }

        if (!value.trim()) {
            setValueError('Value is required');
            valid = false;
        } else {
            setValueError('');
        }

        if (!valid) return;

        setApiError('');
        onSubmit({
            varName: varName.trim(),
            value: value.trim(),
            description: description.trim(),
        });
    };

    const isEdit = Boolean(editingVariable);

    return (
        <Modal
            open={open}
            onClose={onClose}
            size="lg"
            closeOnBackdrop={!actionLoading}
        >
            <form onSubmit={handleSubmit} className="overflow-hidden rounded-2xl">
                {/* Modal Header */}
                <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-border">
                    <div>
                        <h2 className="text-xl font-bold text-text-primary tracking-tight">
                            {isEdit ? 'Edit Global Variable' : 'Add Global Variable'}
                        </h2>
                        <p className="text-sm text-text-muted mt-1 font-normal">
                            {isEdit
                                ? 'Modify the details of this shared global variable.'
                                : 'Define a new shared global variable.'}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={actionLoading}
                        className="text-text-muted hover:text-text-primary transition-colors p-1.5 rounded-lg hover:bg-canvas cursor-pointer -mr-1"
                        aria-label="Close modal"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Modal Body */}
                <ModalBody className="space-y-3.5 px-6 py-5">
                    {apiError && (
                        <div className="p-3 text-xs bg-danger/10 text-danger border border-danger/20 rounded-xl font-medium">
                            {apiError}
                        </div>
                    )}

                    {/* Field 1: Key */}
                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-1">
                            Key <span className="text-danger">*</span>
                        </label>
                        <input
                            type="text"
                            value={varName}
                            onChange={(e) => {
                                setVarName(e.target.value);
                                if (keyError) setKeyError('');
                            }}
                            placeholder="e.g. MAX_ITERATIONS"
                            disabled={actionLoading}
                            className={`w-full px-4 py-2.5 text-sm bg-surface border rounded-xl focus:outline-none transition-all placeholder:text-text-subtle/60 ${
                                keyError
                                    ? 'border-danger focus:ring-2 focus:ring-danger/20'
                                    : 'border-border focus:ring-2 focus:ring-brand focus:border-transparent'
                            }`}
                        />
                        {keyError && (
                            <p className="text-[13px] text-danger mt-1 font-normal">
                                {keyError}
                            </p>
                        )}
                    </div>

                    {/* Field 2: Value */}
                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-1">
                            Value <span className="text-danger">*</span>
                        </label>
                        <input
                            type="text"
                            value={value}
                            onChange={(e) => {
                                setValue(e.target.value);
                                if (valueError) setValueError('');
                            }}
                            placeholder="e.g. 1000"
                            disabled={actionLoading}
                            className={`w-full px-4 py-2.5 text-sm bg-surface border rounded-xl focus:outline-none transition-all placeholder:text-text-subtle/60 font-mono ${
                                valueError
                                    ? 'border-danger focus:ring-2 focus:ring-danger/20'
                                    : 'border-border focus:ring-2 focus:ring-brand focus:border-transparent'
                            }`}
                        />
                        {valueError && (
                            <p className="text-[13px] text-danger mt-1 font-normal">
                                {valueError}
                            </p>
                        )}
                    </div>

                    {/* Field 3: Description */}
                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-1">
                            Description <span className="text-text-muted font-normal">(optional)</span>
                        </label>
                        <textarea
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe what this variable is used for..."
                            disabled={actionLoading}
                            className="w-full px-4 py-2.5 text-sm bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all resize-none placeholder:text-text-subtle/60"
                        />
                    </div>
                </ModalBody>

                {/* Modal Footer */}
                <ModalFooter className="px-6 py-4 bg-canvas/40 border-t border-border flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={actionLoading}
                        className="px-5 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary bg-canvas hover:bg-surface border border-border rounded-xl transition-all cursor-pointer disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={actionLoading}
                        className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium bg-brand text-white hover:bg-brand-hover rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50"
                    >
                        {actionLoading && <Spinner size="sm" />}
                        {isEdit ? 'Save Changes' : 'Save Variable'}
                    </button>
                </ModalFooter>
            </form>
        </Modal>
    );
}
