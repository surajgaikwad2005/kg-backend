'use client';

/**
 * useWorkspace — P&ID data lifecycle for the current globally-selected plant.
 *
 * One implicit workspace per plant (useApp().plantCode) — no more naming,
 * switching, or listing workspaces. "Delete" clears this plant's P&ID data on
 * the backend, it does not navigate away (there is nowhere else to go).
 *
 * Used by:
 *   - pnid/page.jsx (dashboard — clear data, upload mode)
 */
import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/src/components/ui/Toast';
import { useDomainConfig } from '@/src/context/domain-config/DomainConfigContext';
import {
  useDeleteClient,
  useDeleteWorkspaceFile,
} from '@/src/app/(admin)/admin/domain-configuration/pnid/_queries/usePnidWorkspace';

export function useWorkspace() {
  const { success: successToast, info: infoToast } = useToast();
  const {
    plantCode,
    clientFiles,
    isLoadingFiles,
    refreshFiles,
  } = useDomainConfig();

  // Both mutations invalidate the file list themselves, so the manual
  // refreshFiles() calls that used to follow each delete are gone. Errors are
  // toasted by the global MutationCache handler using each mutation's
  // meta.errorTitle — no per-call try/catch needed.
  const deleteClient = useDeleteClient(plantCode);
  const deleteWorkspaceFile = useDeleteWorkspaceFile(plantCode);
  // Destructured because useMutation returns a NEW object literal every render.
  // Depending on the whole result would give the callbacks below a fresh
  // identity each render and silently defeat their useCallback (rule 24);
  // mutateAsync is the observer's bound method and is stable.
  const { mutateAsync: deleteClientAsync } = deleteClient;
  const { mutateAsync: deleteWorkspaceFileAsync } = deleteWorkspaceFile;

  const hasActiveClient = !!plantCode;
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);
  const [isEnteringUploadMode, setIsEnteringUploadMode] = useState(false);
  // Set right after a successful upload so the dashboard shows immediately
  // instead of racing the background refetch (which may briefly still report
  // no files while the backend finishes indexing) and flickering back to the
  // "Initialize Session" screen. Reset whenever the plant changes.
  const [hasJustUploaded, setHasJustUploaded] = useState(false);

  useEffect(() => {
    setHasJustUploaded(false);
  }, [plantCode]);

  const handleUploadSuccess = useCallback(() => {
    setIsEnteringUploadMode(false);
    setHasJustUploaded(true);
    successToast('Ingestion Complete', 'Files uploaded successfully.');
    // Kept even though the upload mutation already invalidates on success:
    // useWorkspaceUpload calls onUploadSuccess() on FAILURE too (deliberately
    // preserved — see the note there), and on that path onSuccess never ran, so
    // nothing invalidated. Without this the dashboard would show a permanently
    // empty file list after a failed upload. The duplicate on the happy path is
    // deduplicated by the query cache; the missing one here would not be.
    refreshFiles();
  }, [refreshFiles, successToast]);

  // Show the upload/setup UI while staying on the same plant-scoped page.
  const enterUploadMode = useCallback(() => {
    setIsEnteringUploadMode(true);
    infoToast('Add Files Mode', 'Add more files for this plant.');
  }, [infoToast]);

  const exitUploadMode = useCallback(() => {
    setIsEnteringUploadMode(false);
  }, []);

  const requestDeleteData = useCallback(() => setIsDeleteConfirmOpen(true), []);
  const cancelDeleteData = useCallback(() => setIsDeleteConfirmOpen(false), []);

  const confirmDeleteData = useCallback(async () => {
    if (!plantCode) return;
    try {
      await deleteClientAsync();
      setHasJustUploaded(false);
      successToast('Plant Data Cleared', `Successfully cleared P&ID data for ${plantCode}.`);
    } catch {
      // Already surfaced by the global mutation-error toast.
    } finally {
      setIsDeleteConfirmOpen(false);
    }
  }, [plantCode, deleteClientAsync, successToast]);

  const requestDeleteFile = useCallback((file) => setFileToDelete(file), []);
  const cancelDeleteFile = useCallback(() => setFileToDelete(null), []);

  const confirmDeleteFile = useCallback(async () => {
    if (!plantCode || !fileToDelete) return;
    try {
      await deleteWorkspaceFileAsync(fileToDelete);
      successToast('File Deleted', `"${fileToDelete.name}" was deleted successfully.`);
    } catch {
      // Already surfaced by the global mutation-error toast.
    } finally {
      setFileToDelete(null);
    }
  }, [plantCode, fileToDelete, deleteWorkspaceFileAsync, successToast]);

  return {
    plantCode,
    hasActiveClient,
    clientFiles,
    isLoadingFiles,
    isDeleteConfirmOpen,
    isDeleting: deleteClient.isPending,
    isEnteringUploadMode,
    hasJustUploaded,
    fileToDelete,
    isDeletingFile: deleteWorkspaceFile.isPending,
    refreshFiles,
    handleUploadSuccess,
    enterUploadMode,
    exitUploadMode,
    requestDeleteData,
    cancelDeleteData,
    confirmDeleteData,
    requestDeleteFile,
    cancelDeleteFile,
    confirmDeleteFile,
  };
}
