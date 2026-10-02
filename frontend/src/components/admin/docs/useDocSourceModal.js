'use client';
import { useState } from 'react';
import { useAdminNav, useAdminEntities, useDocsForm } from '@/src/components/admin/AdminPanelContext';
import { updateUserConfig } from '@/src/services/domain-configuration/common';
import * as common from '@/src/services/domain-configuration/common';
import { generateId } from '@/src/lib/utils';
import { hasActiveDocSubtype } from '@/src/components/admin/domainSources';
import { usePollConnectorJob } from '@/src/components/admin/_queries/useConnectorJob';
import { useInvalidateConnectorState } from '@/src/components/admin/_queries/useDsiQueries';

export function useDocSourceModal() {
  const { setIsConfigModalOpen, setConfigStep } = useAdminNav();
  const { setConfiguredSources, configuredSources, markSourceFailed, selectedPlantId } = useAdminEntities();
  const pollConnectorJob = usePollConnectorJob(selectedPlantId?.id);
  const invalidateConnectorState = useInvalidateConnectorState(selectedPlantId?.id);
  const {
    selectedDocDef, docTab, docFiles, setDocFiles, docCloudType, docCloudConfig,
    docExtraFields, setDocExtraFields, setDocNewFieldName, setDocNewFieldDesc,
    setUploadedDocSubtypes, setDocUploading, setDocUploadProgress, setDocJobId,
    setDocJobStatus, setDocSourceModal, setUploadedDocFileNames,
    docActiveCategory, allDocCategories,
    docFileLabels, setDocFileLabels,
  } = useDocsForm();

  const [expandedFiles, setExpandedFiles] = useState(new Set());
  const [newFieldInputs, setNewFieldInputs] = useState({});
  const [cloudExtraFields, setCloudExtraFields] = useState([]);
  const [cloudNewFieldName, setCloudNewFieldName] = useState('');
  const [cloudNewFieldDesc, setCloudNewFieldDesc] = useState('');
  const [editableFields, setEditableFields] = useState([]);
  const [editingFieldIdx, setEditingFieldIdx] = useState(null);
  const [editFieldDraft, setEditFieldDraft] = useState({ name: '', desc: '' });
  const [editingCloudIdx, setEditingCloudIdx] = useState(null);
  const [editCloudDraft, setEditCloudDraft] = useState({ name: '', desc: '' });

  const docTypeKey = selectedDocDef?.key;
  const [lastDocTypeKey, setLastDocTypeKey] = useState(docTypeKey);
  if (lastDocTypeKey !== docTypeKey) {
    setLastDocTypeKey(docTypeKey);
    setEditableFields(selectedDocDef?.fields ? [...selectedDocDef.fields] : []);
    setEditingFieldIdx(null);
    setEditFieldDraft({ name: '', desc: '' });
  }

  const reconcileUploadedDocSubtype = (sources, docType, docLabel, excludeId) => {
    if (!hasActiveDocSubtype(sources, docLabel, excludeId)) {
      setUploadedDocSubtypes(prev => prev.filter(sub => sub.key !== docType));
    }
  };

  const resetDocModalState = () => {
    setDocExtraFields({});
    setExpandedFiles(new Set());
    setNewFieldInputs({});
    setCloudExtraFields([]);
    setCloudNewFieldName('');
    setCloudNewFieldDesc('');
    setEditingFieldIdx(null);
    setEditingCloudIdx(null);
  };

  const toggleFile = (filename) => {
    setExpandedFiles(prev => {
      const next = new Set(prev);
      if (next.has(filename)) next.delete(filename); else next.add(filename);
      return next;
    });
  };

  const addFieldToFile = (filename) => {
    const inputs = newFieldInputs[filename] || { name: '', desc: '' };
    if (!inputs.name.trim()) return;
    setDocExtraFields(prev => ({
      ...prev,
      [filename]: [...(prev[filename] || []), { name: inputs.name.trim(), desc: inputs.desc.trim() }],
    }));
    setNewFieldInputs(prev => ({ ...prev, [filename]: { name: '', desc: '' } }));
  };

  const removeFieldFromFile = (filename, fieldIdx) => {
    setDocExtraFields(prev => ({
      ...prev,
      [filename]: (prev[filename] || []).filter((_, i) => i !== fieldIdx),
    }));
  };

  const saveFieldEdit = (idx) => {
    if (!editFieldDraft.name.trim()) return;
    setEditableFields(prev => prev.map((f, i) => i === idx ? { name: editFieldDraft.name.trim(), desc: editFieldDraft.desc.trim() } : f));
    setEditingFieldIdx(null);
  };

  const saveCloudEdit = (idx) => {
    if (!editCloudDraft.name.trim()) return;
    setCloudExtraFields(prev => prev.map((f, i) => i === idx ? { name: editCloudDraft.name.trim(), desc: editCloudDraft.desc.trim() } : f));
    setEditingCloudIdx(null);
  };

  const handleDocSubmit = async () => {
    if (!selectedDocDef) return;
    const docType = selectedDocDef.key;
    const docLabel = selectedDocDef.label;
    const categoryLabel = allDocCategories?.[docActiveCategory] || '';
    const currentSubtypeFiles = docFiles.filter(f => f.docType === docType);
    const fieldsForSave = docTab === 'device' ? currentSubtypeFiles.flatMap(f => docExtraFields[f.name] || []) : cloudExtraFields;

    if (fieldsForSave.length > 0) {
      try {
        await updateUserConfig({
          document_processing: {
            document_types: {
              [docType]: { document_type: docLabel, source_columns: [...new Set(fieldsForSave.map(f => f.name))] },
            },
          },
        }, selectedPlantId?.id);
      } catch (e) {
      }
    }

    const fileNames = docTab === 'device'
      ? currentSubtypeFiles.map(f => f.name)
      : [`${docCloudType}://${docCloudConfig.bucket || docCloudConfig.account_name || docCloudConfig.project_id || ''}/${docCloudConfig.prefix || ''}`];

    if (docTab === 'device' && fileNames.length > 0) {
      setUploadedDocFileNames(prev => ({
        ...prev,
        [docType]: Array.from(new Set([...(prev[docType] || []), ...fileNames]))
      }));
    }
    if (docTab === 'device' && currentSubtypeFiles.length === 0) return;

    const ts = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const sourceId = generateId();
    const sourceName = docTab === 'device' ? `${currentSubtypeFiles.length} ${docLabel} file(s)` : `${docLabel} (${docCloudType.toUpperCase()})`;
    const newSource = {
      id: sourceId, type: 'Documents', name: sourceName, timestamp: ts,
      method: docTab, cloudProvider: docTab === 'cloud' ? docCloudType : undefined,
      status: 'running', progress: 0,
      logs: [`Starting ${docTab === 'device' ? 'upload' : 'connection'} for ${docLabel}...`, `${fileNames.length} file(s) queued`],
      errors: [],
      category: categoryLabel || undefined,
      subtype: docLabel,
      filesMeta: docTab === 'device'
        ? currentSubtypeFiles.map(f => {
            const rawLabel = docFileLabels[f.name];
            const labelStr = Array.isArray(rawLabel) ? rawLabel.join(',') : (rawLabel || '');
            return { name: f.name, size: f.size, mimeType: f.type, subtype: docLabel, label: labelStr };
          })
        : [],
    };

    setConfiguredSources(prev => [newSource, ...prev]);
    setUploadedDocSubtypes(prev => prev.some(s => s.key === docType) ? prev : [...prev, { key: docType, label: docLabel }]);
    setDocSourceModal(false);
    setIsConfigModalOpen(false);
    setConfigStep(1);

    try {
      let jobId = '';
      if (docTab === 'device') {
        const formData = new FormData();
        formData.append('document_type', docType);
        currentSubtypeFiles.forEach(f => formData.append('files', f));
        if (selectedPlantId?.id) formData.append('plant_code_id', selectedPlantId.id);
        const labelFields = common.buildUploadLabelFields(currentSubtypeFiles, docFileLabels);
        if (labelFields) {
          formData.append('labels', labelFields.labels);
          formData.append('files_meta', labelFields.files_meta);
        }
        setConfiguredSources(prev => prev.map(s => s.id === sourceId ? { ...s, progress: 30, logs: [...s.logs, 'Uploading files...'] } : s));
        const data = await common.uploadConnectorFile('documents', formData, selectedPlantId?.id);
        jobId = data.job_id;
        setConfiguredSources(prev => prev.map(s => s.id === sourceId ? { ...s, progress: 60, logs: [...s.logs, 'Files uploaded, processing...'] } : s));
      } else if (docTab === 'cloud') {
        const body = { cloud_type: docCloudType, ...docCloudConfig, ...(selectedPlantId?.id ? { plant_code_id: selectedPlantId.id } : {}) };
        setConfiguredSources(prev => prev.map(s => s.id === sourceId ? { ...s, progress: 30, logs: [...s.logs, `Connecting to ${docCloudType.toUpperCase()}...`] } : s));
        const data = await common.connectConnectorCloud('documents', body, { document_type: docType }, selectedPlantId?.id);
        jobId = data.job_id;
        setConfiguredSources(prev => prev.map(s => s.id === sourceId ? { ...s, progress: 60, logs: [...s.logs, 'Connected, syncing files...'] } : s));
      }

      if (jobId) {
        (async () => {
          try {
            const jd = await pollConnectorJob({ connector: 'documents', jobId });
            setConfiguredSources(prev => {
              const updated = prev.map(s => s.id === sourceId ? {
                ...s, status: jd.status,
                progress: jd.status === 'completed' ? 100 : s.progress,
                logs: [...s.logs, jd.status === 'completed' ? 'Processing completed successfully' : 'Processing failed'],
                errors: jd.status === 'failed' ? [...s.errors, 'Job failed — check logs'] : s.errors,
              } : s);
              if (jd.status === 'failed') reconcileUploadedDocSubtype(updated, docType, docLabel, null);
              return updated;
            });
            invalidateConnectorState();
          } catch {
            markSourceFailed(sourceId, 'Document job status check failed — check logs');
            reconcileUploadedDocSubtype(configuredSources, docType, docLabel, sourceId);
          }
        })();
      }
    } catch {
      markSourceFailed(sourceId, 'Document upload failed — backend unreachable');
      reconcileUploadedDocSubtype(configuredSources, docType, docLabel, sourceId);
    }

    setDocFiles(prev => prev.filter(f => f.docType !== docType));
    setDocFileLabels(prev => {
      const next = { ...prev };
      currentSubtypeFiles.forEach(f => { delete next[f.name]; });
      return next;
    });
    setDocUploading(false);
    setDocUploadProgress([]);
    setDocJobId(null);
    setDocJobStatus('');
    setDocNewFieldName('');
    setDocNewFieldDesc('');
    resetDocModalState();
  };

  return {
    expandedFiles, newFieldInputs, setNewFieldInputs,
    cloudExtraFields, setCloudExtraFields, cloudNewFieldName, setCloudNewFieldName,
    cloudNewFieldDesc, setCloudNewFieldDesc, editableFields, setEditableFields,
    editingFieldIdx, setEditingFieldIdx, editFieldDraft, setEditFieldDraft,
    editingCloudIdx, setEditingCloudIdx, editCloudDraft, setEditCloudDraft,
    resetDocModalState, toggleFile, addFieldToFile, removeFieldFromFile,
    saveFieldEdit, saveCloudEdit, handleDocSubmit,
  };
}
