'use client';

import React, { useMemo, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Database } from 'lucide-react';
import PageHeader from '@/src/app/(admin)/admin/domain-configuration/pnid/_components/ui/PageHeader';
import LoadingState from '@/src/app/(admin)/admin/domain-configuration/pnid/_components/ui/LoadingState';
import { PNID_ROUTES } from '@/src/app/(admin)/admin/domain-configuration/pnid/_lib/routes';
import { getCategoryFiles } from '@/src/app/(admin)/admin/domain-configuration/pnid/_lib/domainConfigUtils';
import { useManageFiles } from '@/src/app/(admin)/admin/domain-configuration/pnid/manage-files/_hooks/useManageFiles';
import { useProcessConfig } from '@/src/app/(admin)/admin/domain-configuration/pnid/manage-files/_hooks/useProcessConfig';
import { usePnidPipeline } from '@/src/app/(admin)/admin/domain-configuration/pnid/manage-files/_queries/usePnidPipeline';
import ActionBar from '@/src/app/(admin)/admin/domain-configuration/pnid/manage-files/_components/ActionBar';
import FileCategoryList from '@/src/app/(admin)/admin/domain-configuration/pnid/manage-files/_components/FileCategoryList';
import ProcessConfigModal from '@/src/app/(admin)/admin/domain-configuration/pnid/manage-files/_components/ProcessConfigModal';
import CombinedPipelineProgress from '@/src/app/(admin)/admin/domain-configuration/pnid/manage-files/_components/CombinedPipelineProgress';

import { useToast } from '@/src/components/ui/Toast';
import { useDomainConfig } from '@/src/context/domain-config/DomainConfigContext';

export default function ManageFilesPage() {
  const router = useRouter();
  const { warning: warningToast } = useToast();

  // plantCode comes from DomainConfigContext, which useManageFiles also reads.
  // Taken directly here so the pipeline hook can be constructed before
  // useManageFiles (which needs the pipeline's checkDirectValidation callback).
  const { plantCode } = useDomainConfig();
  const pipeline = usePnidPipeline(plantCode);
  const { clientFiles, isLoading, selectedFiles, toggleFile, toggleCategory, extractedFiles, deleteSelectedFiles, refreshExtractedFiles } =
    useManageFiles(pipeline.checkDirectValidation);
  const config = useProcessConfig();
  const [highlightProcess, setHighlightProcess] = React.useState(false);

  // Signal AdminPanel (via window event) when pipeline completes so other
  // data-source tabs unlock. PnidFlowModal listens for this event.
  const processedFiredRef = useRef(false);
  const processed = pipeline.canValidateDirectly || pipeline.compareStatus === 'done';
  useEffect(() => {
    if (processed && !processedFiredRef.current) {
      processedFiredRef.current = true;
      const files = clientFiles ? getCategoryFiles(clientFiles, 'pnid').map((f) => f.name) : [];
      window.dispatchEvent(
        new CustomEvent('pnid:processed', { detail: { plantCode, files } })
      );
    }
  }, [processed, plantCode, clientFiles]);

  // Re-tag "extracted" files once the pipeline's compare step finishes —
  // usePipeline's own post-compare checkExtractionFiles call only updates
  // its own canValidateDirectly flag, not this page's extractedFiles set,
  // so without this the "extracted"/"unextracted" badges stay stale until
  // a full page reload. Re-fires on every completed process run (not just
  // the first), unlike the `processed` effect above.
  useEffect(() => {
    if (pipeline.compareStatus === 'done') {
      refreshExtractedFiles();
    }
  }, [pipeline.compareStatus, refreshExtractedFiles]);

  const selectedIn = (key) =>
    getCategoryFiles(clientFiles, key).filter((f) => selectedFiles.has(f.path));
  const hasLineList = getCategoryFiles(clientFiles, 'line_list').length > 0;
  const totalSelected = selectedFiles.size;

  const unextractedSelectedFiles = useMemo(() => {
    const unextracted = [];
    selectedFiles.forEach((path) => {
      const fileName = path.split('/').pop();
      const baseName = fileName.replace(/\.[^/.]+$/, '').toLowerCase();
      const nameLower = fileName.toLowerCase();
      const isExtracted = extractedFiles?.has(nameLower) || extractedFiles?.has(baseName);
      if (!isExtracted) {
        unextracted.push(path);
      }
    });
    return unextracted;
  }, [selectedFiles, extractedFiles]);

  const isOCRActive = pipeline.jobStatus === 'queued' || pipeline.jobStatus === 'running';
  const isPipelineActive =
    isOCRActive || pipeline.extractStatus === 'running' || pipeline.compareStatus === 'running';
  const llmMode = config.processMode === 'llm';
  const stepCount = llmMode && !hasLineList ? 3 : 2;

  const handleOpenModal = () =>
    config.openModal({ plantCode, pnidFiles: selectedIn('pnid'), pfdFiles: selectedIn('pfd') });

  const handleStart = () => {
    config.closeModal();
    pipeline.start({
      plantCode,
      processMode: config.processMode,
      selectedLlm: config.selectedLlm,
      hasLineList,
      pnidFiles: selectedIn('pnid'),
      pfdFiles: selectedIn('pfd'),
      lineListFile: getCategoryFiles(clientFiles, 'line_list')[0],
      cropBoxCoordinates: config.cropBoxCoordinates,
    });
  };

  const handleValidate = React.useCallback(() => {
    if (selectedFiles.size > 0) {
      if (unextractedSelectedFiles.length > 0) {
        setTimeout(() => {
          warningToast(
            'Extraction Required for Selected File(s)',
            'One or more selected files have not been processed/extracted yet. Click "Process Selected" to run extraction first.'
          );
        }, 0);
        setHighlightProcess(true);
        setTimeout(() => setHighlightProcess(false), 3500);
        return;
      }
    } else {
      const hasAnyExtracted = pipeline.canValidateDirectly || (extractedFiles && extractedFiles.size > 0);
      if (!hasAnyExtracted) {
        setTimeout(() => {
          warningToast(
            'No Extracted Data Found',
            'Please select and process at least one diagram before validating results.'
          );
        }, 0);
        setHighlightProcess(true);
        setTimeout(() => setHighlightProcess(false), 3500);
        return;
      }
    }

    router.push(PNID_ROUTES.validateUrl());
  }, [selectedFiles.size, unextractedSelectedFiles.length, pipeline.canValidateDirectly, extractedFiles, warningToast, router]);

  const subtitle = useMemo(
    () => (
      <>
        {plantCode ? `Active Plant: ${plantCode}` : 'No plant selected'}
        {hasLineList && ' · Line List ✓'}
      </>
    ),
    [plantCode, hasLineList]
  );

  return (
    <div className="flex h-full w-full bg-canvas text-text-secondary overflow-hidden">
      <main className="flex-1 flex flex-col min-w-0 min-h-0 relative bg-canvas">
        <PageHeader
          title="MANAGE WORKSPACE FILES"
          subtitle={subtitle}
          onBack={() => router.push(PNID_ROUTES.homeUrl())}
        />

        <div className="flex-1 overflow-y-auto p-6 lg:p-10 space-y-8 bg-canvas">
          {isLoading ? (
            <LoadingState label="Loading Files…" />
          ) : !clientFiles ? (
            <div className="bg-surface rounded-[32px] border border-border p-12 text-center text-text-subtle shadow-card">
              <Database size={40} className="mx-auto text-text-subtle/50 mb-3" />
              <p className="text-sm font-bold">
                Failed to load workspace files. Select a plant to continue.
              </p>
            </div>
          ) : (
            <>
              <ActionBar
                totalSelected={totalSelected}
                unextractedSelectedCount={unextractedSelectedFiles.length}
                hasExtractedFiles={pipeline.canValidateDirectly || (extractedFiles && extractedFiles.size > 0)}
                isSubmitting={pipeline.isSubmitting}
                isPipelineActive={isPipelineActive}
                highlightProcess={highlightProcess}
                onProcess={handleOpenModal}
                onValidate={handleValidate}
                onDeleteSelected={deleteSelectedFiles}
              />

              {pipeline.jobStatus !== null && (
                <CombinedPipelineProgress
                  pipeline={pipeline}
                  stepCount={stepCount}
                  llmMode={llmMode}
                  hasLineList={hasLineList}
                />
              )}

              <FileCategoryList
                clientFiles={clientFiles}
                selectedFiles={selectedFiles}
                extractedFiles={extractedFiles}
                onToggleFile={toggleFile}
                onToggleCategory={toggleCategory}
              />
            </>
          )}
        </div>
      </main>

      <ProcessConfigModal
        open={config.open}
        onClose={config.closeModal}
        totalSelected={totalSelected}
        hasLineList={hasLineList}
        previewImageSrc={config.previewImageSrc}
        isPreviewLoading={config.isPreviewLoading}
        previewError={config.previewError}
        previewTargetFileName={config.previewTargetFileName}
        onRetryPreview={config.retryPreview}
        cropBoxCoordinates={config.cropBoxCoordinates}
        onCropChange={config.setCropBoxCoordinates}
        processMode={config.processMode}
        setProcessMode={config.setProcessMode}
        selectedLlm={config.selectedLlm}
        setSelectedLlm={config.setSelectedLlm}
        onStart={handleStart}
      />
    </div>
  );
}
