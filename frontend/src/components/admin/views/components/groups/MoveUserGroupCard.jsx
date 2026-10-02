'use client';
import React, { useState } from 'react';
import { Repeat } from 'lucide-react';
import { Input } from '@/src/components/ui/Input';
import { useToast } from '@/src/components/ui/Toast';
import { useUpdateUserGroup } from '@/src/components/admin/_queries/useUserRegistryQueries';
import { GroupActionCard } from './GroupActionCard';

export function MoveUserGroupCard() {
    const toast = useToast();
    const [email, setEmail] = useState('');
    const [oldGroup, setOldGroup] = useState('');
    const [newGroup, setNewGroup] = useState('');
    const [error, setError] = useState('');
    const { mutateAsync: updateUserGroupAsync, isPending } = useUpdateUserGroup();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email.trim() || !oldGroup.trim() || !newGroup.trim()) {
            setError('Email, current group, and new group are all required.');
            return;
        }
        setError('');
        try {
            const res = await updateUserGroupAsync({ email: email.trim(), old_group: oldGroup.trim(), new_group: newGroup.trim() });
            const data = res?.data || {};
            toast.success('Group updated', `${data.email || email} moved from "${data.oldGroup || oldGroup}" to "${data.newGroup || newGroup}".`);
            setEmail('');
            setOldGroup('');
            setNewGroup('');
        } catch {
            // Surfaced by the global mutation-error toast (meta.errorTitle: 'Could not update group').
        }
    };

    return (
        <GroupActionCard
            icon={Repeat}
            title="Move User's Group"
            description="Reassign a user from their current group to a new one."
            onSubmit={handleSubmit}
            isSubmitting={isPending}
            submitLabel="Move"
            error={error}
        >
            <Input
                size="sm" id="move-user-email" type="email" label="User Email"
                placeholder="john.doe@example.com" autoComplete="email"
                value={email} onChange={(e) => setEmail(e.target.value)} disabled={isPending}
            />
            <div className="grid grid-cols-2 gap-3">
                <Input
                    size="sm" id="move-old-group" label="Current Group"
                    placeholder="Engineering"
                    value={oldGroup} onChange={(e) => setOldGroup(e.target.value)} disabled={isPending}
                />
                <Input
                    size="sm" id="move-new-group" label="New Group"
                    placeholder="AI Team"
                    value={newGroup} onChange={(e) => setNewGroup(e.target.value)} disabled={isPending}
                />
            </div>
        </GroupActionCard>
    );
}
