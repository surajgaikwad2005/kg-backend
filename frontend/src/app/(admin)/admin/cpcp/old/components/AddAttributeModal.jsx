'use client';

import React, { useState } from 'react';
import { Tags } from 'lucide-react';
import { Modal, ModalBody, ModalFooter } from '@/src/components/ui/Modal';
import { Button } from '@/src/components/ui/Button';

/**
 * Modal to register a new ontology attribute column. Submits the raw label; the
 * hook derives a snake_case key and rejects duplicates. Mounted fresh by the
 * parent on each open, so initial state doubles as the reset.
 */
export function AddAttributeModal({ onClose, onSubmit }) {
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [pending, setPending] = useState(false);

    const submit = async () => {
        const trimmed = name.trim();
        if (!trimmed) {
            setError('Attribute name is required.');
            return;
        }
        setPending(true);
        setError('');
        try {
            await onSubmit(trimmed);
            onClose();
        } catch (err) {
            setError(err?.message || 'Failed to add attribute.');
            setPending(false);
        }
    };

    return (
        <Modal
            open
            onClose={pending ? undefined : onClose}
            title="Add Ontology Attribute"
            size="md"
            className="animate-in fade-in zoom-in-95 duration-200"
        >
            <ModalBody>
                <div className="flex items-start gap-4">
                    <div className="shrink-0 w-10 h-10 rounded-full bg-brand-muted flex items-center justify-center text-brand">
                        <Tags className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <label
                            htmlFor="ontology-attr-name"
                            className="text-[11px] uppercase tracking-wider font-bold text-text-muted block mb-1.5"
                        >
                            Attribute name
                        </label>
                        <input
                            id="ontology-attr-name"
                            autoFocus
                            type="text"
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                if (error) setError('');
                            }}
                            onKeyDown={(e) => e.key === 'Enter' && submit()}
                            placeholder="e.g. has_interlock"
                            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-border bg-surface text-text-secondary placeholder:text-text-subtle focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all"
                        />
                        <p className="mt-2 text-xs text-text-subtle leading-relaxed">
                            Stored as a snake_case key (e.g. <code className="text-text-muted">has_interlock</code>). Each
                            equipment row gets a Y / N flag for it.
                        </p>
                        {error && <p className="mt-2 text-xs font-semibold text-danger">{error}</p>}
                    </div>
                </div>
            </ModalBody>
            <ModalFooter>
                <Button variant="ghost" size="sm" onClick={onClose} disabled={pending} className="cursor-pointer">
                    Cancel
                </Button>
                <Button variant="primary" size="sm" onClick={submit} isPending={pending} className="cursor-pointer">
                    Add Attribute
                </Button>
            </ModalFooter>
        </Modal>
    );
}
