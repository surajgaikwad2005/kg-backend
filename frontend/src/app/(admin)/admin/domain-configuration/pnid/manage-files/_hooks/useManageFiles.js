'use client';

/**
 * useManageFiles — file selection state for the Manage Files page.
 *
 * plantCode, clientFiles, and isLoading now come from DomainConfigContext
 * (populated from useApp().plantCode) — no localStorage reads.
 * This hook only owns the local selection Set and the toggle helpers.
 */
import { useState, useEffect, useCallback } from 'react';
import { useDomainConfig } from '@/src/context/domain-config/DomainConfigContext';
import { pnidService } from '@/src/services/domain-configuration/pnid/pnidService';
import { useToast } from '@/src/components/ui/Toast';

export function useManageFiles(onClientLoaded) {
  const { plantCode, clientFiles, isLoadingFiles: isLoading } = useDomainConfig();
  const { warning: warningToast } = useToast();
  const [selectedFiles, setSelectedFiles] = useState(new Set());
  const [extractedFiles, setExtractedFiles] = useState(new Set());

  // Fetch extraction status to tag extracted files. Exposed as
  // refreshExtractedFiles so callers (e.g. the manage-files page, once the
  // OCR/Extract/Compare pipeline finishes) can re-fetch it without a full
  // remount — the mount-only effect below left the "extracted" badge stale
  // until a page refresh, since the pipeline's own post-compare
  // checkExtractionFiles call only feeds usePipeline's canValidateDirectly,
  // not this hook's extractedFiles set.
  const refreshExtractedFiles = useCallback(async (plant) => {
    const target = plant ?? plantCode;
    if (!target) return;
    try {
      const data = await pnidService.checkExtractionFiles(target);
      const extracted = new Set();
      const items = Array.isArray(data) ? data : (data?.data ? data.data : (data?.exists ? [data] : []));
      items.forEach(item => {
          if (item.file_name) {
              extracted.add(item.file_name.toLowerCase());
              extracted.add(item.file_name.replace(/\.[^/.]+$/, '').toLowerCase());
          }
          const folder = item.images_folde || item.images_folder;
          if (folder) {
              const folderBase = folder.split('/').pop().replace(/_+$/g, '').toLowerCase();
              extracted.add(folderBase);
              extracted.add(`${folderBase}.pdf`);
          }
      });
      setExtractedFiles(extracted);
    } catch { /* keep previous extractedFiles on failure */ }
  }, [plantCode]);

  // Notify caller when plant is known (e.g. usePipeline.checkDirectValidation).
  // Reactive to plantCode changing — no page navigation required.
  useEffect(() => {
    if (plantCode) {
      onClientLoaded?.(plantCode);
      refreshExtractedFiles(plantCode);
    }
  }, [plantCode]); // eslint-disable-line react-hooks/exhaustive-deps

  const isFileExtracted = useCallback((path) => {
    if (!extractedFiles || extractedFiles.size === 0) return false;
    const fileName = path.split('/').pop();
    const nameLower = fileName.toLowerCase();
    const baseName = fileName.replace(/\.[^/.]+$/, '').toLowerCase();
    return extractedFiles.has(nameLower) || extractedFiles.has(baseName);
  }, [extractedFiles]);

  const toggleFile = useCallback((path) => {
    // If already selected -> uncheck it unconditionally
    if (selectedFiles.has(path)) {
      setSelectedFiles((prev) => {
        const next = new Set(prev);
        next.delete(path);
        return next;
      });
      return;
    }

    // Check selection mismatch if selection is not empty
    if (selectedFiles.size > 0) {
      const firstSelectedPath = Array.from(selectedFiles)[0];
      const currentIsExtracted = isFileExtracted(firstSelectedPath);
      const targetIsExtracted = isFileExtracted(path);

      if (currentIsExtracted !== targetIsExtracted) {
        if (currentIsExtracted && !targetIsExtracted) {
          setTimeout(() => {
            warningToast(
              'Selection Mismatch',
              'Cannot select unextracted files alongside extracted files. Uncheck extracted files first.'
            );
          }, 0);
        } else {
          setTimeout(() => {
            warningToast(
              'Selection Mismatch',
              'Cannot select extracted files alongside unextracted files. Uncheck unextracted files first.'
            );
          }, 0);
        }
        return;
      }
    }

    setSelectedFiles((prev) => {
      const next = new Set(prev);
      next.add(path);
      return next;
    });
  }, [selectedFiles, isFileExtracted, warningToast]);

  const toggleCategory = useCallback((files) => {
    const allSelected = files.every((f) => selectedFiles.has(f.path));
    if (allSelected) {
      setSelectedFiles((prev) => {
        const next = new Set(prev);
        files.forEach((f) => next.delete(f.path));
        return next;
      });
      return;
    }

    const filesToSelect = files.filter((f) => !selectedFiles.has(f.path));
    if (filesToSelect.length === 0) return;

    if (selectedFiles.size === 0) {
      const extractedInCat = files.filter((f) => isFileExtracted(f.path));
      const unextractedInCat = files.filter((f) => !isFileExtracted(f.path));

      if (extractedInCat.length > 0 && unextractedInCat.length > 0) {
        const next = new Set();
        extractedInCat.forEach((f) => next.add(f.path));
        setSelectedFiles(next);
        setTimeout(() => {
          warningToast(
            'Mixed Category Selection',
            `Selected ${extractedInCat.length} extracted file(s). ${unextractedInCat.length} unextracted file(s) skipped to prevent mixed selection.`
          );
        }, 0);
        return;
      }

      const next = new Set();
      files.forEach((f) => next.add(f.path));
      setSelectedFiles(next);
      return;
    }

    const firstSelectedPath = Array.from(selectedFiles)[0];
    const currentIsExtracted = isFileExtracted(firstSelectedPath);

    const matchingFiles = filesToSelect.filter(
      (f) => isFileExtracted(f.path) === currentIsExtracted
    );
    const skippedFiles = filesToSelect.filter(
      (f) => isFileExtracted(f.path) !== currentIsExtracted
    );

    if (skippedFiles.length > 0) {
      setTimeout(() => {
        warningToast(
          'Selection Mismatch',
          `Skipped ${skippedFiles.length} file(s) with different extraction status from your current selection.`
        );
      }, 0);
    }

    if (matchingFiles.length === 0) return;

    setSelectedFiles((prev) => {
      const next = new Set(prev);
      matchingFiles.forEach((f) => next.add(f.path));
      return next;
    });
  }, [selectedFiles, isFileExtracted, warningToast]);

  const deleteSelectedFiles = useCallback(async () => {
    if (!plantCode || selectedFiles.size === 0) return;
    const pathsToDelete = Array.from(selectedFiles);
    await Promise.all(pathsToDelete.map((path) => pnidService.deleteFile(plantCode, path)));
    setSelectedFiles(new Set());
  }, [plantCode, selectedFiles]);

  return { plantCode, clientFiles, isLoading, selectedFiles, toggleFile, toggleCategory, extractedFiles, deleteSelectedFiles, refreshExtractedFiles };
}
