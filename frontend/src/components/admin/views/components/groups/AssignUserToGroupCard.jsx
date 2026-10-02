'use client';
import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { Input } from '@/src/components/ui/Input';
import { useToast } from '@/src/components/ui/Toast';
import { useAssignUserToGroup } from '@/src/components/admin/_queries/useGroupManagementMutations';
import { GroupActionCard } from './GroupActionCard';

export function AssignUserToGroupCard() {
    const toast = useToast();
    const [email, setEmail] = useState('');
    const [group, setGroup] = useState('');
    const [error, setError] = useState('');
    const { mutateAsync: assignUserAsync, isPending } = useAssignUserToGroup();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email.trim() || !group.trim()) {
            setError('Email and group are both required.');
            return;
        }
        setError('');
        try {
            const res = await assignUserAsync({ email: email.trim(), group: group.trim() });
            const data = res?.data || {};
            toast.success('User assigned', `${data.email || email} added to "${data.group || group}".`);
            setEmail('');
            setGroup('');
        } catch {
            // Surfaced by the global mutation-error toast (meta.errorTitle: 'Assign failed').
        }
    };

    return (
        <GroupActionCard
            icon={UserPlus}
            title="Assign User to Group"
            description="Add an existing user to a group by email."
            onSubmit={handleSubmit}
            isSubmitting={isPending}
            submitLabel="Assign"
            error={error}
        >
            <Input
                size="sm" id="assign-user-email" type="email" label="User Email"
                placeholder="john.doe@example.com" autoComplete="email"
                value={email} onChange={(e) => setEmail(e.target.value)} disabled={isPending}
            />
            <Input
                size="sm" id="assign-user-group" label="Group"
                placeholder="Engineering"
                value={group} onChange={(e) => setGroup(e.target.value)} disabled={isPending}
            />
        </GroupActionCard>
    );
}
