'use client';
import React from 'react';
import ContextDoneCard         from './modals/ContextDoneCard';
import AddUserModal            from './modals/AddUserModal';
import DocSourceModal          from './modals/DocSourceModal';
import AddSapTableModal        from './modals/AddSapTableModal';
import IncrementalLoadModal    from './modals/IncrementalLoadModal';
import ProgressModal           from './modals/ProgressModal';
import DuplicateFilesDialog    from './modals/DuplicateFilesDialog';
import PnidCommitConfirmDialog from './modals/PnidCommitConfirmDialog';
import DeleteConfirmDialog     from './modals/DeleteConfirmDialog';
import AdminProcessDataModal   from './modals/AdminProcessDataModal';

export function AdminModals() {
  return (
    <>
      <ContextDoneCard />
      <DocSourceModal />
      <AddSapTableModal />
      <IncrementalLoadModal />
      <ProgressModal />
      <DuplicateFilesDialog />
      <PnidCommitConfirmDialog />
      <DeleteConfirmDialog />
      <AdminProcessDataModal />
    </>
  );
}
