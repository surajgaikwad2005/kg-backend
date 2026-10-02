'use client';
import React, { useState } from 'react';
import { Modal, ModalBody, ModalFooter } from '@/src/components/ui/Modal';
import { Button } from '@/src/components/ui/Button';
import { useAdminEntities } from '@/src/components/admin/AdminPanelContext';
import { useToast } from '@/src/components/ui/Toast';
import { useSignupUser } from '@/src/components/admin/_queries/useUserRegistryQueries';

const PERMISSIONS = ['admin', 'user'];

export default function AddUserModal() {
  const { isAddUserModalOpen, setIsAddUserModalOpen } = useAdminEntities();
  const toast = useToast();
  const { mutateAsync: signupAsync, isPending } = useSignupUser();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user',
    group: ''
  });

  const close = () => {
    setIsAddUserModalOpen(false);
    setFormData({ username: '', email: '', password: '', role: 'user', group: '' });
  };

  const handleSave = async () => {
    if (!formData.username || !formData.email || !formData.password) {
      toast.error('Validation Error', 'Username, email, and password are required.');
      return;
    }

    try {
      await signupAsync({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        group: formData.group || null,
      });
      toast.success('User Created', `Successfully created user ${formData.username}.`);
      close();
    } catch {
      // Surfaced by the global mutation-error toast (meta.errorTitle: 'Could not create user').
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  return (
    <Modal open={isAddUserModalOpen} onClose={close} title="Add User" size="md">
      <ModalBody className="space-y-4 max-h-[65vh] overflow-y-auto scrollbar-thin scrollbar-thumb-border-strong">
        <div>
          <label htmlFor="username" className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Username</label>
          <input id="username" type="text" placeholder="johndoe" value={formData.username} onChange={handleChange} disabled={isPending}
            className="w-full bg-surface border border-border rounded-lg px-4 py-2 text-sm text-text-primary focus:outline-none focus:border-brand transition-colors" />
        </div>
        <div>
          <label htmlFor="email" className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Email</label>
          <input id="email" type="email" placeholder="john@example.com" value={formData.email} onChange={handleChange} disabled={isPending}
            className="w-full bg-surface border border-border rounded-lg px-4 py-2 text-sm text-text-primary focus:outline-none focus:border-brand transition-colors" />
        </div>
        <div>
          <label htmlFor="password" className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Password</label>
          <input id="password" type="password" placeholder="Password@123" value={formData.password} onChange={handleChange} disabled={isPending}
            className="w-full bg-surface border border-border rounded-lg px-4 py-2 text-sm text-text-primary focus:outline-none focus:border-brand transition-colors" />
        </div>
        <div>
          <label htmlFor="group" className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Group</label>
          <input id="group" type="text" placeholder="Engineering" value={formData.group} onChange={handleChange} disabled={isPending}
            className="w-full bg-surface border border-border rounded-lg px-4 py-2 text-sm text-text-primary focus:outline-none focus:border-brand transition-colors" />
        </div>
        
        <div className="space-y-3">
          <label className="block text-xs font-bold text-text-muted uppercase tracking-wider">Role</label>
          <div className="flex gap-3">
            {PERMISSIONS.map((perm) => (
              <label key={perm} className="flex items-center gap-2 bg-surface border border-border rounded-lg px-3 py-2 cursor-pointer hover:bg-surface-2 transition-colors">
                <input type="radio" name="role" value={perm} checked={formData.role === perm} onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))} disabled={isPending} className="w-4 h-4 rounded-full border-border bg-surface text-brand focus:ring-brand" />
                <span className="text-xs text-text-secondary capitalize">{perm}</span>
              </label>
            ))}
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="ghost" onClick={close} disabled={isPending}>Cancel</Button>
        <Button variant="primary" onClick={handleSave} disabled={isPending}>
            {isPending ? 'Saving...' : 'Save'}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
