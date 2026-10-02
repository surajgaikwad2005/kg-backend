'use client';
import React from 'react';
import { ConfirmDialog } from '@/src/components/ui/ConfirmDialog';
import { useAdminEntities } from '@/src/components/admin/AdminPanelContext';

export default function DeleteConfirmDialog() {
  const { deleteConfirm, setDeleteConfirm } = useAdminEntities();
  const close = () => setDeleteConfirm(prev => ({ ...prev, open: false }));

  return (
    <ConfirmDialog
      open={deleteConfirm.open}
      onClose={close}
      onConfirm={deleteConfirm.onConfirm}
      title={deleteConfirm.title}
      description={deleteConfirm.message}
      confirmLabel={deleteConfirm.confirmLabel || "Delete"}
      cancelLabel={deleteConfirm.cancelLabel || "Cancel"}
      intent={deleteConfirm.intent || "danger"}
    />
  );
}
