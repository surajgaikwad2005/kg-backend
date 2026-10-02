'use client';

/**
 * ConnectionFormModal — create a relationship (edge) between two existing
 * knowledge-graph nodes. Controlled component; field state lives in the parent
 * (see useKnowledgeGraphMutations).
 *
 * @param {{ id: string|number, label: string, classification: string }[]} nodeOptions
 */
import React from 'react';
import { Link2 } from 'lucide-react';
import { Modal, ModalBody, ModalFooter } from '@/src/components/ui/Modal';
import { Button } from '@/src/components/ui/Button';
import ConnectionFormContent from './ConnectionFormContent';

export const REL_TYPES = [
    'CONNECTED_TO', 'PART_OF', 'HAS_FIELD', 'HAS_PLATFORM', 'HAS_LOPC', 'HAS_GLOC',
    'HAS_UPD', 'HAS_TAG', 'HAS_VIBRATION_DATA', 'HAS_THERMOGRAPHY', 'HAS_AIF',
];

export default function ConnectionFormModal({
    open,
    onClose,
    nodeOptions = [],
    srcId,
    onSrcIdChange,
    tgtId,
    onTgtIdChange,
    relType,
    onRelTypeChange,
    properties,
    onPropertiesChange,
    onSubmit,
    isPending = false,
    relTypes = REL_TYPES,
    isEdit = false,
}) {
    return (
        <Modal open={open} onClose={onClose} size="lg" closeOnBackdrop={!isPending} className="overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface-2/50">
                <h2 className="text-sm font-extrabold uppercase tracking-tight text-text-primary flex items-center gap-2">
                    <Link2 className="w-5 h-5 text-success" /> Connect Entities
                </h2>
                <button
                    onClick={onClose}
                    aria-label="Close"
                    className="text-text-muted hover:text-text-primary transition-colors rounded-lg p-1 cursor-pointer"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                    </svg>
                </button>
            </div>

            <form onSubmit={onSubmit}>
                <ModalBody className="max-h-[65vh] overflow-y-auto thin-scrollbar pt-5 pb-5">
                    <ConnectionFormContent
                        nodeOptions={nodeOptions}
                        srcId={srcId}
                        onSrcIdChange={onSrcIdChange}
                        tgtId={tgtId}
                        onTgtIdChange={onTgtIdChange}
                        relType={relType}
                        onRelTypeChange={onRelTypeChange}
                        properties={properties}
                        onPropertiesChange={onPropertiesChange}
                        relTypes={relTypes}
                        isEdit={isEdit}
                    />
                </ModalBody>

                <ModalFooter>
                    <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isPending}>
                        Cancel
                    </Button>
                    <Button type="submit" variant="primary" size="sm" isPending={isPending}>
                        Establish Connection
                    </Button>
                </ModalFooter>
            </form>
        </Modal>
    );
}
