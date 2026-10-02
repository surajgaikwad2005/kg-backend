'use client';

import React, { Suspense } from 'react';
import { useApp } from '@/src/context/AppContext';
import { ConfirmDialog } from '@/src/components/ui/ConfirmDialog';
import LoadingState from '@/src/app/(admin)/admin/domain-configuration/pnid/_components/ui/LoadingState';
import WorkspaceDashboard from '@/src/app/(admin)/admin/domain-configuration/pnid/_components/domain/WorkspaceDashboard';
import WorkspaceSetup from '@/src/app/(admin)/admin/domain-configuration/pnid/_components/domain/WorkspaceSetup';
import FilePreviewModal from '@/src/app/(admin)/admin/domain-configuration/pnid/_components/domain/FilePreviewModal';
import { useWorkspace } from '@/src/app/(admin)/admin/domain-configuration/pnid/_hooks/useWorkspace';
import { useFilePreview } from '@/src/app/(admin)/admin/domain-configuration/pnid/_hooks/useFilePreview';
import {
  getCategoryFiles,
  FILE_CATEGORY_KEYS,
} from '@/src/app/(admin)/admin/domain-configuration/pnid/_lib/domainConfigUtils';
import {
  usePdfPageCounts,
  useSetPdfPageCount,
} from '@/src/app/(admin)/admin/domain-configuration/pnid/_queries/usePnidWorkspace';

function PnidHomePageContent() {
  const { plantCode } = useApp();
  const ws = useWorkspace();
  const { clientFiles, isLoadingFiles } = ws;

  const hasExistingFiles = !!clientFiles && FILE_CATEGORY_KEYS.some((k) => getCategoryFiles(clientFiles, k).length > 0);
  const showSetup = ws.isEnteringUploadMode || (!hasExistingFiles && !ws.hasJustUploaded);

  // PDF page counts (path → count), fetched in parallel and cached per plant.
  // This replaces a manual prefetch loop that tracked in-flight paths in a ref
  // Set and cleared that Set on every plant change: request deduping, retry,
  // cancellation and per-plant isolation are all properties of the query key now.
  const pageCountCache = usePdfPageCounts(plantCode, clientFiles);
  // The preview modal re-reads a PDF after deleting a page, so it already knows
  // the new count — write it straight into the cache instead of refetching.
  const updatePageCount = useSetPdfPageCount(plantCode);

  const preview = useFilePreview({ plantCode, onPageCountUpdate: updatePageCount });

  if (!plantCode) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-canvas text-text-secondary">
        <div className="bg-surface rounded-4xl border border-border p-12 text-center text-text-subtle shadow-card max-w-md">
          <p className="text-sm font-bold">Select a plant from the header to manage its P&ID data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full bg-canvas text-text-secondary overflow-hidden">
      <main className="flex-1 flex flex-col min-w-0 min-h-0 relative bg-canvas">
        {isLoadingFiles ? (
          <div className="flex-1 flex items-center justify-center">
            <LoadingState label="Loading Plant Workspace…" />
          </div>
        ) : showSetup ? (
          <WorkspaceSetup
            plantCode={plantCode}
            hasExistingFiles={hasExistingFiles}
            initialFiles={clientFiles}
            onUploadSuccess={ws.handleUploadSuccess}
          />
        ) : (
          <WorkspaceDashboard
            clientFiles={clientFiles}
            isLoadingFiles={isLoadingFiles}
            pageCountCache={pageCountCache}
            onRefresh={ws.refreshFiles}
            onUploadMore={ws.enterUploadMode}
            onFileClick={preview.openFile}
            onDeleteData={ws.requestDeleteData}
            onDeleteFile={ws.requestDeleteFile}
          />
        )}
      </main>

      <ConfirmDialog
        open={ws.isDeleteConfirmOpen}
        title="Clear Plant Data"
        intent="danger"
        confirmLabel="Clear Data"
        isPending={ws.isDeleting}
        onClose={ws.cancelDeleteData}
        onConfirm={ws.confirmDeleteData}
        description={`All uploaded files for "${plantCode}" will be permanently deleted. This action cannot be undone.`}
      />

      <ConfirmDialog
        open={!!ws.fileToDelete}
        title="Delete File"
        intent="danger"
        confirmLabel="Delete"
        isPending={ws.isDeletingFile}
        onClose={ws.cancelDeleteFile}
        onConfirm={ws.confirmDeleteFile}
        description={`"${ws.fileToDelete?.name}" will be permanently deleted. This action cannot be undone.`}
      />

      {preview.previewFile && (
        <FilePreviewModal
          plantCode={plantCode}
          previewFile={preview.previewFile}
          onClose={preview.closePreview}
          previewData={preview.previewData}
          isPreviewLoading={preview.isPreviewLoading}
          pdfDoc={preview.pdfDoc}
          pdfPageCount={preview.pdfPageCount}
          pdfVersion={preview.pdfVersion}
          selectedPageIndex={preview.selectedPageIndex}
          setSelectedPageIndex={preview.setSelectedPageIndex}
          isDeletingPage={preview.isDeletingPage}
          onDeletePage={preview.deletePage}
          blobUrl={preview.blobUrl}
          selectedPages={preview.selectedPages}
          onTogglePageSelection={preview.togglePageSelection}
          onDeleteSelectedPages={preview.deleteSelectedPages}
        />
      )}
    </div>
  );
}

export default function PnidHomePage() {
  return (
    <Suspense fallback={<div className="flex h-full w-full items-center justify-center bg-canvas"><LoadingState label="Loading Plant Workspace…" /></div>}>
      <PnidHomePageContent />
    </Suspense>
  );
}
