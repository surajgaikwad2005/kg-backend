'use client';
import React, { useState } from 'react';
import { Modal, ModalBody, ModalFooter } from '@/src/components/ui/Modal';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { useToast } from '@/src/components/ui/Toast';
import { useCreateGroup } from '@/src/components/admin/_queries/useGroupManagementMutations';

/**
 * Self-contained "Create Group" dialog — owns its own form/validation state
 * so it can be dropped anywhere without a shared context. Calls
 * `onCreated(group)` after a confirmed backend success.
 */
export default function CreateGroupModal({ open, onClose, onCreated }) {
    const toast = useToast();
    const [groupName, setGroupName] = useState('');
    const [error, setError] = useState('');
    const { mutateAsync: createGroupAsync, isPending } = useCreateGroup();

    const close = () => {
        if (isPending) return;
        setGroupName('');
        setError('');
        onClose?.();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const trimmed = groupName.trim();
        if (!trimmed) {
            setError('Group name is required.');
            return;
        }
        setError('');
        try {
            const res = await createGroupAsync({ group_name: trimmed });
            const data = res?.data || {};
            toast.success('Group created', `"${data.groupName || trimmed}" is ready to use.`);
            onCreated?.({ name: data.groupName || trimmed, createdBy: data.createdBy || null });
            setGroupName('');
            onClose?.();
        } catch {
            // Surfaced by the global mutation-error toast (meta.errorTitle: 'Create group failed').
        }
    };

    return (
        <Modal open={open} onClose={close} title="Create Group" size="sm">
            <form onSubmit={handleSubmit}>
                <ModalBody className="space-y-4">
                    <Input
                        size="sm"
                        id="new-group-name"
                        label="Group Name"
                        placeholder="e.g. AI Team"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        error={error}
                        disabled={isPending}
                        autoFocus
                    />
                </ModalBody>
                <ModalFooter>
                    <Button type="button" variant="ghost" onClick={close} disabled={isPending}>Cancel</Button>
                    <Button type="submit" variant="primary" isPending={isPending}>Create</Button>
                </ModalFooter>
            </form>
        </Modal>
    );
}
