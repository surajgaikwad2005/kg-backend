'use client';
import { useState, useEffect, useRef } from 'react';
import { useApp } from '@/src/context/AppContext';
import { useConfirm } from '@/src/components/ui/ConfirmModal';
import { getExpressionDetail } from '@/src/services/model-studio/expression/expressionService';
import {
    useExpressionsQuery,
    useCronValidationQuery,
    useTagSearchQuery,
    useCreateExpressionMutation,
    useModifyExpressionMutation,
    useDeleteExpressionMutation,
    usePauseResumeExpressionMutation,
    useTestExpressionMutation,
} from '../_queries/useExpressionQueries';

export function useExpressionPage() {
    const { plantCode } = useApp();
    const { openConfirm } = useConfirm();
    const { data: rawExpressions, isLoading, refetch: fetchExpressions } = useExpressionsQuery(plantCode);
    const expressionsList = Array.isArray(rawExpressions) ? rawExpressions : [];

    const createMutation = useCreateExpressionMutation();
    const modifyMutation = useModifyExpressionMutation();
    const deleteMutation = useDeleteExpressionMutation();
    const pauseResumeMutation = usePauseResumeExpressionMutation();
    const testMutation = useTestExpressionMutation();

    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');
    const expressionInputRef = useRef(null);
    const [cursorPosition, setCursorPosition] = useState(0);

    const [isConfigureModalOpen, setIsConfigureModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [currentEditId, setCurrentEditId] = useState(null);
    const [isLoadingDetail, setIsLoadingDetail] = useState(false);
    const [newExpressionForm, setNewExpressionForm] = useState({ name: '', expression: '', description: '' });

    const [testResult, setTestResult] = useState(null);
    const [tagSearchQuery, setTagSearchQuery] = useState('');

    const { data: tagSearchResultsData, isLoading: isSearchingTags } = useTagSearchQuery(plantCode, tagSearchQuery);
    const tagSearchResults = (tagSearchQuery.length >= 1 && Array.isArray(tagSearchResultsData)) ? tagSearchResultsData : [];

    const [openMenuIdx, setOpenMenuIdx] = useState(null);
    const [menuPosition, setMenuPosition] = useState(null);

    const [cronBlocks, setCronBlocks] = useState(['*', '*', '*', '*', '*']);
    const cronSchedule = cronBlocks.join(' ');
    const { data: cronData, isLoading: isCronLoading, error: cronError } = useCronValidationQuery(
        plantCode,
        cronSchedule,
        isConfigureModalOpen
    );

    const cronValidation = {
        isValid: !cronError,
        description: cronData?.description || (cronError ? undefined : 'Cron validated successfully'),
        nextRun: cronData?.next_run,
        isLoading: isCronLoading,
        error: cronError ? (cronError.message || 'Invalid cron schedule') : undefined,
    };

    const isSubmitting = createMutation.isPending || modifyMutation.isPending;
    const isTesting = testMutation.isPending;

    const [toast, setToast] = useState(null);
    const showToast = (message, type) => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleDelete = (id) => {
        openConfirm({
            title: 'Delete Expression',
            message: 'Are you sure you want to delete this expression? This action cannot be undone.',
            confirmLabel: 'Delete',
            variant: 'danger',
            onConfirm: async () => {
                try {
                    await deleteMutation.mutateAsync({ plantCode, expressionId: id });
                    showToast('Expression deleted successfully.', 'success');
                } catch { showToast('Failed to delete expression.', 'error'); }
                finally { setOpenMenuIdx(null); }
            }
        });
    };

    const handlePauseResume = (id, currentStatus) => {
        const action = currentStatus.toLowerCase() === 'active' ? 'pause' : 'resume';
        const actionCapitalized = action.charAt(0).toUpperCase() + action.slice(1);
        
        openConfirm({
            title: `${actionCapitalized} Expression`,
            message: `Are you sure you want to ${action} this expression?`,
            confirmLabel: actionCapitalized,
            variant: action === 'pause' ? 'warning' : 'success',
            onConfirm: async () => {
                try {
                    await pauseResumeMutation.mutateAsync({ plantCode, expressionId: id, action });
                    showToast(`Expression ${action}d successfully.`, 'success');
                } catch { showToast(`Failed to ${action} expression.`, 'error'); }
                finally { setOpenMenuIdx(null); }
            }
        });
    };

    const handleTest = async () => {
        if (!newExpressionForm.expression) return;
        try {
            setTestResult(null);
            const data = await testMutation.mutateAsync({ plantCode, expression: newExpressionForm.expression });
            setTestResult({ ...data, is_valid: data && data.success_rows > 0 });
        } catch (error) {
            setTestResult({ is_valid: false, message: error.message || 'Invalid expression or syntax error' });
        }
    };

    const handleSave = async () => {
        try {
            const created_by = typeof window !== 'undefined' ? (localStorage.getItem('username') || 'admin') : 'admin';
            if (modalMode === 'create') {
                await createMutation.mutateAsync({
                    plantCode,
                    payload: {
                        expression_name: newExpressionForm.name,
                        expression: newExpressionForm.expression,
                        description: newExpressionForm.description,
                        cron_schedule: cronBlocks.join(' '),
                        created_by,
                    },
                });
            } else if (modalMode === 'edit' && currentEditId !== null) {
                await modifyMutation.mutateAsync({
                    plantCode,
                    expressionId: currentEditId,
                    payload: {
                        expression_name: newExpressionForm.name,
                        expression: newExpressionForm.expression,
                        cron_schedule: cronBlocks.join(' '),
                        description: newExpressionForm.description,
                    },
                });
            }
            setIsConfigureModalOpen(false);
            showToast(`Expression ${modalMode === 'create' ? 'created' : 'updated'} successfully.`, 'success');
        } catch {
            showToast(`Failed to ${modalMode === 'create' ? 'create' : 'update'} expression.`, 'error');
        }
    };

    const handleSearchTags = (query) => {
        setTagSearchQuery(query);
    };

    const insertTag = (tag) => {
        const tagValue = typeof tag === 'string' ? tag : (tag.iotdb_tag_id || tag.tag_name || tag.name || tag.id || JSON.stringify(tag));
        const formattedTag = `'${tagValue}'`;
        const val = newExpressionForm.expression;
        const beforeCursor = val.slice(0, cursorPosition);
        const afterCursor  = val.slice(cursorPosition);
        const match = beforeCursor.match(/[a-zA-Z0-9_]+$/);
        if (match) {
            const startIdx = match.index;
            const newExpression = beforeCursor.slice(0, startIdx) + formattedTag + ' ' + afterCursor;
            setNewExpressionForm(prev => ({ ...prev, expression: newExpression }));
            setTimeout(() => {
                if (expressionInputRef.current) {
                    const newPos = startIdx + formattedTag.length + 1;
                    expressionInputRef.current.setSelectionRange(newPos, newPos);
                    expressionInputRef.current.focus();
                }
            }, 0);
        } else {
            setNewExpressionForm(prev => ({ ...prev, expression: prev.expression + (prev.expression.endsWith(' ') || prev.expression.length === 0 ? '' : ' ') + formattedTag + ' ' }));
        }
        setTestResult(null); setTagSearchQuery('');
    };

    const handleCursorActivity = (e) => {
        const cursor = e.target.selectionStart || 0;
        setCursorPosition(cursor);
        const val = e.target.value !== undefined ? e.target.value : (newExpressionForm.expression || '');
        const beforeCursor = val.slice(0, cursor);
        const match = beforeCursor.match(/[a-zA-Z0-9_]+$/);
        if (match && match[0].length >= 1) handleSearchTags(match[0]);
        else setTagSearchQuery('');
    };

    const handleExpressionChange = (e) => {
        const val = e.target.value;
        setNewExpressionForm({ ...newExpressionForm, expression: val });
        setTestResult(null);
        handleCursorActivity(e);
    };

    const handleCreateClick = () => {
        setModalMode('create'); setCurrentEditId(null);
        setNewExpressionForm({ name: '', expression: '', description: '' });
        setTestResult(null); setTagSearchQuery('');
        setCronBlocks(['*', '*', '*', '*', '*']);
        setIsConfigureModalOpen(true);
    };

    const handleEditClick = async (exp, e) => {
        e.stopPropagation();
        setModalMode('edit'); setCurrentEditId(exp.expression_id);
        setTestResult(null); setTagSearchQuery('');
        setIsConfigureModalOpen(true); setOpenMenuIdx(null);
        setIsLoadingDetail(true);
        setNewExpressionForm({ name: exp.expression_name || '', expression: exp.expression || '', description: '' });
        setCronBlocks(['*', '*', '*', '*', '*']);
        try {
            const detail = await getExpressionDetail(plantCode, exp.expression_id);
            setNewExpressionForm({ name: detail.expression_name || '', expression: detail.expression || '', description: detail.description || '' });
            const savedCron = detail.cron_schedule || '* * * * *';
            const blocks = savedCron.split(' ');
            while (blocks.length < 5) blocks.push('*');
            setCronBlocks(blocks.slice(0, 5));
        } catch {
            showToast('Failed to load expression details.', 'error');
        } finally {
            setIsLoadingDetail(false);
        }
    };

    const activeCount   = expressionsList.filter(e => (e.status || '').toLowerCase() === 'active').length;
    const inactiveCount = expressionsList.filter(e => (e.status || '').toLowerCase() === 'inactive').length;
    const filters = [
        { label: 'All',      count: expressionsList.length },
        { label: 'Active',   count: activeCount },
        { label: 'Inactive', count: inactiveCount },
    ];
    const filteredExpressions = expressionsList.filter(exp => {
        const matchesFilter = activeFilter === 'All' || (exp.status || 'inactive').toLowerCase() === activeFilter.toLowerCase();
        const nameMatch = (exp.expression_name || '').toLowerCase().includes(searchQuery.toLowerCase());
        const idMatch   = String(exp.expression_id || '').toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && (nameMatch || idMatch);
    });

    return {
        expressionsList, isLoading,
        searchQuery, setSearchQuery, activeFilter, setActiveFilter,
        expressionInputRef, setCursorPosition,
        isConfigureModalOpen, setIsConfigureModalOpen,
        modalMode, isLoadingDetail, newExpressionForm, setNewExpressionForm,
        isSubmitting, isTesting, testResult,
        tagSearchQuery, tagSearchResults, isSearchingTags,
        openMenuIdx, setOpenMenuIdx, menuPosition, setMenuPosition,
        cronBlocks, setCronBlocks, cronValidation,
        toast, setToast,
        filters, filteredExpressions,
        handleCreateClick, handleEditClick, handleDelete, handlePauseResume,
        handleTest, handleSave, insertTag, handleExpressionChange, handleCursorActivity,
    };
}

