'use client';

/**
 * EntityFormModal — create / edit a knowledge-graph entity node.
 * Controlled component: all field state lives in the parent (see
 * useKnowledgeGraphMutations). Composes the shared Modal + Button primitives so
 * it stays consistent with the rest of the app's dialogs.
 */
import React from 'react';
import { PlusCircle, Pencil } from 'lucide-react';
import { Modal, ModalBody, ModalFooter } from '@/src/components/ui/Modal';
import { Button } from '@/src/components/ui/Button';
import EntityFormContent from './EntityFormContent';

export const NODE_LABELS = [
    'Equipment', 'Subsystem', 'Plant', 'Pipe', 'Valve', 'Instrument', 'WorkOrder',
    'RCA', 'SOP', 'LOPC', 'GLOC', 'UPD', 'Vibration', 'Thermography', 'AIF',
    'Pump', 'Vessel', 'Exchanger', 'Tank',
];

export default function EntityFormModal({
    open,
    mode = 'create',
    onClose,
    nodeKey,
    onNodeKeyChange,
    nodeLabel,
    onNodeLabelChange,
    properties,
    onPropertiesChange,
    onSubmit,
    isPending = false,
    labels = NODE_LABELS,
}) {
    const isEdit = mode === 'edit';

    return (
        <Modal open={open} onClose={onClose} size="lg" closeOnBackdrop={!isPending} className="overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface-2/50">
                <h2 className="text-sm font-extrabold uppercase tracking-tight text-text-primary flex items-center gap-2">
                    {isEdit ? <Pencil className="w-5 h-5 text-brand" /> : <PlusCircle className="w-5 h-5 text-brand" />}
                    {isEdit ? 'Edit Entity Properties' : 'Create New Entity'}
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
                    <EntityFormContent
                        isEdit={isEdit}
                        nodeKey={nodeKey}
                        onNodeKeyChange={onNodeKeyChange}
                        nodeLabel={nodeLabel}
                        onNodeLabelChange={onNodeLabelChange}
                        properties={properties}
                        onPropertiesChange={onPropertiesChange}
                        labels={labels}
                    />
                </ModalBody>

                <ModalFooter>
                    <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isPending}>
                        Cancel
                    </Button>
                    <Button type="submit" variant="primary" size="sm" isPending={isPending}>
                        Save Changes
                    </Button>
                </ModalFooter>
            </form>
        </Modal>
    );
}
