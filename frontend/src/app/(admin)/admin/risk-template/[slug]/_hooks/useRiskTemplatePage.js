'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    useRiskTemplateMarkdown,
    useUpdateDynamic,
    useDeleteData,
    useSeedRiskTemplateMarkdown,
} from '../../_queries/useRiskTemplate';
import { useApp } from '@/src/context/AppContext';
import { useToast } from '@/src/components/ui/Toast';
import {
    formatMarkdownForMarkmap,
    extractNodeKeyVal,
    findExactNodeIndex,
    buildMarkdownTraceback,
    deleteMarkdownNodeLocal,
    renameMarkdownNodeLocal,
} from '../../_lib/markdownUtils';

const INITIAL_LAYOUTS = {
    lg: [{ i: 'markmap', x: 0, y: 0, w: 12, h: 7.5, static: true }],
    md: [{ i: 'markmap', x: 0, y: 0, w: 10, h: 8, static: true }],
};

export { INITIAL_LAYOUTS };

export function useRiskTemplatePage() {
    const { slug } = useParams();
    const router = useRouter();
    const { plantCode } = useApp();
    const toast = useToast();
    const templateName = decodeURIComponent(slug);
    const dropdownRef = useRef(null);

    const markdownQuery = useRiskTemplateMarkdown(plantCode, templateName);
    const seedTemplateMarkdown = useSeedRiskTemplateMarkdown(plantCode);
    const { mutateAsync: updateDynamicAsync } = useUpdateDynamic(plantCode, templateName);
    const { mutateAsync: deleteDataAsync } = useDeleteData(plantCode, templateName);

    const [markdown,          setMarkdown]          = useState('');
    const [originalMarkdown,  setOriginalMarkdown]  = useState('');
    const [layouts,           setLayouts]           = useState(INITIAL_LAYOUTS);
    const [isEditing,         setIsEditing]         = useState(false);
    const [tempMarkdown,      setTempMarkdown]      = useState('');
    const [resetKey,          setResetKey]          = useState(0);
    const [loadingNodeOp,     setLoadingNodeOp]     = useState(false);
    const [localViewMode,     setLocalViewMode]     = useState('details');
    const [createTemplateName,setCreateTemplateName]= useState('');
    const [showUploadModal,   setShowUploadModal]   = useState(false);
    const [showCreateModal,   setShowCreateModal]   = useState(false);
    const [showRulesDropdown, setShowRulesDropdown] = useState(false);
    const [showEquipmentModal,setShowEquipmentModal]= useState(false);
    const [equipmentModalData,setEquipmentModalData]= useState(null);

    useEffect(() => {
        setLocalViewMode('details');
        setIsEditing(false);
    }, [templateName, plantCode]);

    useEffect(() => {
        if (markdownQuery.isPending) return;
        const md = markdownQuery.data || '*System synchronized risk template base.*';
        const final = formatMarkdownForMarkmap(md, templateName);
        setMarkdown(final);
        setOriginalMarkdown(final);
    }, [markdownQuery.data, markdownQuery.isPending, templateName]);

    useEffect(() => {
        if (!showRulesDropdown) return;
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowRulesDropdown(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [showRulesDropdown]);

    const resetToDefault = () => {
        setMarkdown(originalMarkdown);
        setResetKey(prev => prev + 1);
        setIsEditing(false);
        toast.info('View reset', 'Restored original mind map structure.');
    };

    const handleEditToken = () => {
        if (!isEditing) {
            setTempMarkdown(markdown);
            setIsEditing(true);
        } else {
            setMarkdown(tempMarkdown);
            setIsEditing(false);
            setResetKey(prev => prev + 1);
            toast.success('Knowledge updated', 'Direct edits synchronized.');
        }
    };

    const forgeUpdateNode = (idx, val) => {
        const lines = tempMarkdown.split('\n');
        const prefixMatch = lines[idx].match(/^([#\s-]*)/);
        const prefix = prefixMatch ? prefixMatch[0] : '';
        lines[idx] = `${prefix}${val}`;
        setTempMarkdown(lines.join('\n'));
    };

    const forgeAddNode = (idx) => {
        const lines = tempMarkdown.split('\n');
        const currentLine = lines[idx];
        const headingMatch = currentLine.match(/^#+/);
        const level = headingMatch ? headingMatch[0].length : 1;
        const indent = '  '.repeat(level);
        lines.splice(idx + 1, 0, `${indent}- New Branch Logic`);
        setTempMarkdown(lines.join('\n'));
    };

    const forgeDeleteNode = (idx) => {
        const lines = tempMarkdown.split('\n');
        lines.splice(idx, 1);
        setTempMarkdown(lines.join('\n'));
    };

    const handleDeleteNode = async (nodeContent, ancestorPath) => {
        setLoadingNodeOp(true);
        try {
            const context = buildMarkdownTraceback(markdown, nodeContent, ancestorPath);
            if (context?.filters && Object.keys(context.filters).length > 0) {
                await deleteDataAsync(context.filters);
            }
            setMarkdown(prev => deleteMarkdownNodeLocal(prev, nodeContent, ancestorPath));
            toast.success('Node deleted', `Removed "${nodeContent}"`);
        } catch (err) {
            toast.error('Deletion failed', err?.message || 'Could not sync deletion with server');
        } finally {
            setLoadingNodeOp(false);
        }
    };

    const handleRenameNode = async (oldContent, newContent, ancestorPath) => {
        setLoadingNodeOp(true);
        try {
            const context = buildMarkdownTraceback(markdown, oldContent, ancestorPath);
            const { newMarkdown, updateValueForBackend } = renameMarkdownNodeLocal(
                markdown,
                oldContent,
                newContent,
                ancestorPath
            );

            if (context?.filters && Object.keys(context.filters).length > 0 && context.update_column) {
                await updateDynamicAsync({
                    filters: context.filters,
                    update_column: context.update_column,
                    update_value: updateValueForBackend,
                });
            }

            setMarkdown(newMarkdown);
            toast.success('Renamed', `"${oldContent}" → "${newContent}"`);
        } catch (err) {
            toast.error('Rename failed', err?.message || 'Could not save changes to server');
            throw err;
        } finally {
            setLoadingNodeOp(false);
        }
    };

    const applyNewTemplate = (name, md) => {
        setShowUploadModal(false);
        setShowEquipmentModal(false);
        setEquipmentModalData(null);
        seedTemplateMarkdown(name, md);
        router.push(`/admin/risk-template/${encodeURIComponent(name)}`);
    };

    const handleUploadConfig = (tableName, tableData, file) => {
        setShowUploadModal(false);
        setEquipmentModalData({ tableName, tableData, file: file || null });
        setShowEquipmentModal(true);
    };

    const handleCreateConfirm = (name) => {
        setShowCreateModal(false);
        setCreateTemplateName(name);
        setLocalViewMode('create');
    };

    const handleStoreKnowledge = () => {
        router.push(`/admin/risk-template/${encodeURIComponent(createTemplateName || templateName)}`);
    };

    const backAction = () => {
        if (localViewMode === 'create') setLocalViewMode('details');
        else router.push('/admin/risk-template');
    };

    return {
        templateName,
        ruleName: templateName,
        markdown,
        setMarkdown,
        layouts,
        setLayouts,
        isEditing,
        tempMarkdown,
        resetKey,
        loadingNodeOp,
        isGenerating: markdownQuery.isLoading,
        localViewMode,
        createTemplateName,
        createRuleName: createTemplateName,
        showUploadModal,
        setShowUploadModal,
        showCreateModal,
        setShowCreateModal,
        showRulesDropdown,
        setShowRulesDropdown,
        showEquipmentModal,
        setShowEquipmentModal,
        equipmentModalData,
        dropdownRef,
        resetToDefault,
        handleEditToken,
        forgeUpdateNode,
        forgeAddNode,
        forgeDeleteNode,
        handleDeleteNode,
        handleRenameNode,
        applyNewRule: applyNewTemplate,
        applyNewTemplate,
        handleUploadConfig,
        handleCreateConfirm,
        handleStoreKnowledge,
        backAction,
    };
}
