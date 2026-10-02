'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    useRuleMarkdown,
    useUpdateDynamic,
    useDeleteData,
    useSeedRuleMarkdown,
} from '../../_queries/useSymbolicAi';
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

export function useSymbolicAIPage() {
    const { slug } = useParams();
    const router = useRouter();
    const { plantCode } = useApp();
    const toast = useToast();
    const ruleName = decodeURIComponent(slug);
    const dropdownRef = useRef(null);

    // The markdown query. `enabled` covers the plantCode hydration race, and
    // Query's own in-flight deduplication replaces the `loadedKeyRef` guard that
    // existed purely to stop StrictMode's double-invoked effect firing two
    // identical generateMarkdown requests.
    const markdownQuery = useRuleMarkdown(plantCode, ruleName);
    const seedRuleMarkdown = useSeedRuleMarkdown(plantCode);
    const { mutateAsync: updateDynamicAsync } = useUpdateDynamic(plantCode, ruleName);
    const { mutateAsync: deleteDataAsync } = useDeleteData(plantCode, ruleName);

    const [markdown,          setMarkdown]          = useState('');
    const [originalMarkdown,  setOriginalMarkdown]  = useState('');
    const [layouts,           setLayouts]           = useState(INITIAL_LAYOUTS);
    const [isEditing,         setIsEditing]         = useState(false);
    const [tempMarkdown,      setTempMarkdown]      = useState('');
    const [resetKey,          setResetKey]          = useState(0);
    const [loadingNodeOp,     setLoadingNodeOp]     = useState(false);
    const [localViewMode,     setLocalViewMode]     = useState('details');
    const [createRuleName,    setCreateRuleName]    = useState('');
    const [showUploadModal,   setShowUploadModal]   = useState(false);
    const [showCreateModal,   setShowCreateModal]   = useState(false);
    const [showRulesDropdown, setShowRulesDropdown] = useState(false);
    const [showEquipmentModal,setShowEquipmentModal]= useState(false);
    const [equipmentModalData,setEquipmentModalData]= useState(null);

    // Reset view state when the rule changes. Fetching is now the query's job,
    // keyed on (plantCode, ruleName): `enabled` covers the plantCode hydration
    // race, and Query's in-flight deduplication replaces the loadedKeyRef guard
    // that existed only to stop StrictMode's double-invoked effect from firing
    // two identical requests.
    useEffect(() => {
        setLocalViewMode('details');
        setIsEditing(false);
    }, [ruleName, plantCode]);

    // Mirror fetched markdown into editable state. This stays an effect because
    // `markdown` is USER-EDITABLE — deriving it during render would discard
    // every keystroke on the next render. Keyed on the query's own data so it
    // re-seeds on rule change and after any refetch.
    useEffect(() => {
        if (markdownQuery.isPending) return;
        const md = markdownQuery.data || '*System synchronized rule base.*';
        // Always route through formatMarkdownForMarkmap so the diagram's root
        // node is the dashboard name, matching handleDeleteNode()/AiveeChat.
        const final = formatMarkdownForMarkmap(md, ruleName);
        setMarkdown(final);
        setOriginalMarkdown(final);
    }, [markdownQuery.data, markdownQuery.isPending, ruleName]);

    useEffect(() => {
        if (!showRulesDropdown) return;
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowRulesDropdown(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [showRulesDropdown]);

    /**
     * Re-read this rule from the backend.
     *
     * The pre-migration version also checked a module-level handoff stash
     * (takePendingMarkdown) for markdown generated moments earlier on the
     * library route. That stash is gone: the library route now writes straight
     * into this rule's cache entry, so arriving here after an INSERT finds the
     * data already present and issues no request at all.
     */
    const loadRule = () => markdownQuery.refetch();

    const handleEditToken = () => {
        if (isEditing) {
            setMarkdown(tempMarkdown);
            setIsEditing(false);
            toast.success('Knowledge saved', 'Your edits are now live on this rule base.');
        } else {
            setTempMarkdown(markdown);
            setIsEditing(true);
        }
    };

    const forgeUpdateNode = async (idx, newText) => {
        const lines = tempMarkdown.split('\n');
        const currentLine = lines[idx];
        const oldCleanContent = currentLine.replace(/^[#\s-]*/, '').replace(/\*\*/g, '').replace(/<!--.*-->/, '').trim();
        const traceback = buildMarkdownTraceback(tempMarkdown, oldCleanContent);
        const prefixMatch = currentLine.match(/^([#\s-]*) /) || currentLine.match(/^([#\s-]*)/);
        const prefix = prefixMatch ? prefixMatch[0] : '';
        const newLines = [...lines];
        newLines[idx] = prefix + newText;
        setTempMarkdown(newLines.join('\n'));
        if (traceback?.update_column && ruleName) {
            let valueToSync = newText.trim();
            const boldKey = new RegExp(`^\\*\\*${traceback.update_column}:\\*\\*\\s*`, 'i');
            const plainKey = new RegExp(`^${traceback.update_column}:\\s*`, 'i');
            if (boldKey.test(valueToSync)) valueToSync = valueToSync.replace(boldKey, '');
            else if (plainKey.test(valueToSync)) valueToSync = valueToSync.replace(plainKey, '');
            try {
                const res = await updateDynamicAsync({ filters: { 'Equipment Id': traceback.equipment_id, ...traceback.filters }, update_column: traceback.update_column, update_value: valueToSync.replace(/\.+$/, '') });
                toast.success('Updated', res.message);
            } catch (err) {
                toast.error('Update failed', err.message);
            }
        }
    };

    const forgeAddNode = (idx) => {
        const lines = tempMarkdown.split('\n');
        const currentLine = lines[idx];
        let prefix = '- ';
        if (currentLine.startsWith('#')) { const m = currentLine.match(/^#+/); prefix = (m ? m[0] : '') + '# '; }
        else if (currentLine.trim().startsWith('-')) { prefix = '  - '; }
        const newLines = [...lines];
        newLines.splice(idx + 1, 0, `${prefix}New Mechanism`);
        setTempMarkdown(newLines.join('\n'));
    };

    const forgeDeleteNode = async (idx) => {
        const lines = tempMarkdown.split('\n');
        if (lines.length <= 1) return;
        const currentLine = lines[idx];
        const oldCleanContent = currentLine.replace(/^[#\s-]*/, '').replace(/\*\*/g, '').replace(/<!--.*-->/, '').trim();
        const traceback = buildMarkdownTraceback(tempMarkdown, oldCleanContent);
        if (traceback && ruleName) {
            try {
                const deletionFilters = { ...traceback.filters };
                const nodeData = extractNodeKeyVal(currentLine, true);
                if (nodeData) deletionFilters[nodeData.key] = nodeData.value;
                const res = await deleteDataAsync({ 'Equipment Id': traceback.equipment_id, ...deletionFilters });
                toast.success('Deleted', res.message);
            } catch (err) {
                toast.error('Delete failed', err.message);
            }
        }
        setTempMarkdown(lines.filter((_, i) => i !== idx).join('\n'));
    };

    const handleDeleteNode = async (nodeContent, ancestorPath) => {
        const traceback = buildMarkdownTraceback(markdown, nodeContent, ancestorPath);
        if (traceback && ruleName) {
            try {
                const deletionFilters = { ...traceback.filters };
                const lines = markdown.split('\n');
                const targetIdx = findExactNodeIndex(lines, nodeContent, ancestorPath);
                if (targetIdx !== -1) {
                    const nodeData = extractNodeKeyVal(lines[targetIdx], true);
                    if (nodeData) deletionFilters[nodeData.key] = nodeData.value;
                }
                const res = await deleteDataAsync({ 'Equipment Id': traceback.equipment_id, ...deletionFilters });
                toast.success('Deleted', res.message);
                // The mutation invalidates this rule's markdown, so the refetch
                // is already in flight — await it rather than issuing a second,
                // manual fetchMarkdown call. The seeding effect above then
                // rewrites `markdown` from the canonical result.
                setLoadingNodeOp(true);
                const refreshed = await markdownQuery.refetch();
                setLoadingNodeOp(false);
                if (refreshed?.data) return;
            } catch (err) {
                toast.error('Delete failed', err.message);
            }
        }
        setMarkdown(deleteMarkdownNodeLocal(markdown, nodeContent, ancestorPath));
    };

    const handleRenameNode = async (oldContent, newContent, ancestorPath) => {
        const { newMarkdown, updateValueForBackend } = renameMarkdownNodeLocal(markdown, oldContent, newContent, ancestorPath);
        setMarkdown(newMarkdown);
        const traceback = buildMarkdownTraceback(markdown, oldContent, ancestorPath);
        if (traceback?.update_column && ruleName) {
            try {
                const res = await updateDynamicAsync({ filters: { 'Equipment Id': traceback.equipment_id, ...traceback.filters }, update_column: traceback.update_column, update_value: updateValueForBackend });
                toast.success('Renamed', res.message);
            } catch (err) {
                toast.error('Rename failed', err.message);
            }
        }
    };

    const resetToDefault = () => { setMarkdown(originalMarkdown); setIsEditing(false); setLayouts(INITIAL_LAYOUTS); setResetKey(k => k + 1); };

    const applyNewRule = (name, markdown) => {
        setShowUploadModal(false); setShowEquipmentModal(false); setEquipmentModalData(null);
        seedRuleMarkdown(name, markdown);
        router.push(`/symbolic-ai/${encodeURIComponent(name)}`);
    };

    const handleUploadConfig = (tableName, tableData, file) => {
        setShowUploadModal(false);
        setEquipmentModalData({ tableName, tableData, file: file || null });
        setShowEquipmentModal(true);
    };

    const handleCreateConfirm = (name) => { setCreateRuleName(name); setShowCreateModal(false); setLocalViewMode('create'); };

    const handleStoreKnowledge = () => router.push(`/symbolic-ai/${encodeURIComponent(createRuleName)}`);

    const backAction = localViewMode === 'create' ? () => setLocalViewMode('details') : () => router.push('/symbolic-ai');

    return {
        ruleName, dropdownRef,
        markdown, setMarkdown, originalMarkdown, isGenerating: markdownQuery.isPending, layouts, setLayouts,
        isEditing, tempMarkdown, resetKey, loadingNodeOp,
        localViewMode, createRuleName,
        showUploadModal, setShowUploadModal,
        showCreateModal, setShowCreateModal,
        showRulesDropdown, setShowRulesDropdown,
        showEquipmentModal, setShowEquipmentModal,
        equipmentModalData, setEquipmentModalData,
        loadRule, handleEditToken,
        forgeUpdateNode, forgeAddNode, forgeDeleteNode,
        handleDeleteNode, handleRenameNode,
        resetToDefault, applyNewRule, handleUploadConfig, handleCreateConfirm, handleStoreKnowledge,
        backAction,
    };
}
