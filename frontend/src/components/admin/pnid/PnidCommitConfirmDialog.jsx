'use client';
import React from 'react';
import { ConfirmDialog } from '@/src/components/ui/ConfirmDialog';
import { useAdminEntities, usePnidForm } from '@/src/components/admin/AdminPanelContext';

export function PnidCommitConfirmDialog() {
  const { commitPidContext } = useAdminEntities();
  const { pnidCommitConfirm, setPnidCommitConfirm, equipmentPidData, equipmentConnectivityData, pidData } = usePnidForm();

  return (
    <ConfirmDialog
      open={pnidCommitConfirm}
      onClose={() => setPnidCommitConfirm(false)}
      onConfirm={() => { setPnidCommitConfirm(false); commitPidContext(); }}
      title="Confirm Context Configuration"
      description={
        <>
          Are you sure you want to commit this P&amp;ID connectivity data to the database?{' '}
          <strong className="text-text-primary">Once done, this action cannot be reverted.</strong>
        </>
      }
      confirmLabel="Yes, Commit to Database"
      intent="danger"
    >
      <div className="bg-surface-2 rounded-lg p-3 text-xs text-text-secondary space-y-1 border border-border">
        <div>Equipment tags: <strong className="text-text-primary">{equipmentPidData.length}</strong></div>
        <div>Connectivity rows: <strong className="text-text-primary">{equipmentConnectivityData.length || pidData.length}</strong></div>
      </div>
    </ConfirmDialog>
  );
}
export default PnidCommitConfirmDialog;
