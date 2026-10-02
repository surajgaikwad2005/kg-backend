'use client';
import { useState, useEffect } from 'react';
import { getModelDetail } from '@/src/services/model-studio/ml-model/modelRegistryService';
import { useApp } from '@/src/context/AppContext';
import {
    useCreateModelMutation,
    useModifyModelMutation,
    useDeleteModelMutation,
    useMLAssetTagsQuery,
} from '../_queries/useMLModelQueries';

const EMPTY_FORM = { name: '', modelType: '', modelTypeCategory: '', equipment: '', description: '', targetTag: '' };

export function useModelsTab({ modelsList, modelOptions, onRefresh }) {
    const { plantCode } = useApp();

    const createMutation = useCreateModelMutation();
    const modifyMutation = useModifyModelMutation();
    const deleteMutation = useDeleteModelMutation();

    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
    const [isModifyMode, setIsModifyMode] = useState(false);
    const [editingModel, setEditingModel] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [modelToDelete, setModelToDelete] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [openMenuIdx, setOpenMenuIdx] = useState(null);
    const [menuPosition, setMenuPosition] = useState(null);
    const [newModelForm, setNewModelForm] = useState(EMPTY_FORM);
    const [selectedTags, setSelectedTags] = useState([]);
    const [isTagsDropdownOpen, setIsTagsDropdownOpen] = useState(false);
    const [saveError, setSaveError] = useState(null);

    const assetTagsQuery = useMLAssetTagsQuery(plantCode, newModelForm.equipment);
    const availableTagsForAsset = Array.isArray(assetTagsQuery.data) ? assetTagsQuery.data : [];
    const tagsLoading = assetTagsQuery.isLoading;

    const isSaving = createMutation.isPending || modifyMutation.isPending;
    const isDeleting = deleteMutation.isPending;

    /* ── View Details drawer ── */
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [modelToView, setModelToView] = useState(null);
    const [detailModel, setDetailModel] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detailError, setDetailError] = useState(null);

    const showTargetTag = newModelForm.modelTypeCategory && newModelForm.modelTypeCategory !== 'unsupervised';



    const filteredModels = (modelsList || []).filter(model => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
            String(model.model_id || '').toLowerCase().includes(q) ||
            String(model.model_name || '').toLowerCase().includes(q) ||
            String(model.description || '').toLowerCase().includes(q) ||
            (Array.isArray(model.tags) ? model.tags.some(t => String(t).toLowerCase().includes(q)) : String(model.tags || '').toLowerCase().includes(q)) ||
            (Array.isArray(model.assets) ? model.assets.some(a => String(a).toLowerCase().includes(q)) : String(model.assets || '').toLowerCase().includes(q))
        );
    });

    const resetForm = () => {
        setNewModelForm(EMPTY_FORM);
        setSelectedTags([]); setSaveError(null);
    };

    useEffect(() => {
        if (modelOptions.length > 0 && !newModelForm.modelType) {
            const first = modelOptions[0];
            setNewModelForm(prev => ({ ...prev, modelType: prev.modelType || first.value, modelTypeCategory: prev.modelTypeCategory || first.model_type || '' }));
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [modelOptions]);

    /** Selecting a model option also resets Target Tag — it only applies to non-unsupervised types. */
    const handleModelTypeChange = (value) => {
        const opt = modelOptions.find(o => o.value === value);
        setNewModelForm(prev => ({ ...prev, modelType: value, modelTypeCategory: opt?.model_type || '', targetTag: '' }));
    };

    const handleRegisterSubmit = async () => {
        if (!newModelForm.name || !newModelForm.equipment || !newModelForm.modelType) return;
        setSaveError(null);
        try {
            const modelPayload = {
                modelSelection: newModelForm.modelType,
                modelType: newModelForm.modelTypeCategory,
                equipment: newModelForm.equipment,
                description: newModelForm.description,
                tags: selectedTags,
                targetTag: showTargetTag ? (newModelForm.targetTag || null) : null,
            };
            if (isModifyMode && editingModel) {
                await modifyMutation.mutateAsync({ plantCode, payload: { modelId: editingModel.model_id, ...modelPayload } });
            } else {
                await createMutation.mutateAsync({ plantCode, payload: { name: newModelForm.name, ...modelPayload } });
            }
            onRefresh?.(); setIsRegisterModalOpen(false); setIsModifyMode(false); setEditingModel(null); setMenuPosition(null); resetForm();
        } catch (e) { setSaveError(e.message || 'Network error'); }
    };

    const handleDeleteModel = async () => {
        if (!modelToDelete) return;
        try {
            await deleteMutation.mutateAsync({ plantCode, modelId: modelToDelete.model_id });
            onRefresh?.(); setIsDeleteModalOpen(false); setModelToDelete(null);
        } catch { }
    };

    const openEditModal = (model) => {
        setIsModifyMode(true); setEditingModel(model);
        setNewModelForm({
            name: model.model_name,
            modelType: model.model_selection,
            modelTypeCategory: model.model_type || '',
            equipment: model.assets?.[0] || '',
            description: model.description || '',
            targetTag: model.target_tag || '',
        });
        setSelectedTags(model.tags || []); setIsRegisterModalOpen(true); setOpenMenuIdx(null); setMenuPosition(null);
    };

    const openDeleteModal = (model) => { setModelToDelete(model); setIsDeleteModalOpen(true); setOpenMenuIdx(null); setMenuPosition(null); };

    const openNewModal = () => { setIsModifyMode(false); setEditingModel(null); resetForm(); setIsRegisterModalOpen(true); };

    const closeRegisterModal = () => { setIsRegisterModalOpen(false); setIsModifyMode(false); setEditingModel(null); resetForm(); };

    const closeDeleteModal = () => { setIsDeleteModalOpen(false); setModelToDelete(null); };

    const openDetailModal = (model) => {
        setModelToView(model); setIsDetailModalOpen(true); setOpenMenuIdx(null); setMenuPosition(null);
        setDetailLoading(true); setDetailError(null); setDetailModel(null);
        getModelDetail(plantCode, model?.model_id)
            .then(setDetailModel)
            .catch(e => setDetailError(e.message || 'Failed to load model detail'))
            .finally(() => setDetailLoading(false));
    };

    const closeDetailModal = () => { setIsDetailModalOpen(false); setModelToView(null); setDetailModel(null); setDetailError(null); };

    return {
        isRegisterModalOpen, isModifyMode, editingModel, isDeleteModalOpen, modelToDelete,
        openMenuIdx, setOpenMenuIdx, menuPosition, setMenuPosition,
        searchQuery, setSearchQuery, filteredModels,
        newModelForm, setNewModelForm, handleModelTypeChange, showTargetTag,
        selectedTags, setSelectedTags,
        isTagsDropdownOpen, setIsTagsDropdownOpen, availableTagsForAsset, tagsLoading,
        isSaving, isDeleting, saveError,
        resetForm, handleRegisterSubmit, handleDeleteModel,
        openEditModal, openDeleteModal, openNewModal, closeRegisterModal, closeDeleteModal,
        /* View Details */
        isDetailModalOpen, modelToView, detailModel, detailLoading, detailError,
        openDetailModal, closeDetailModal,
    };
}

