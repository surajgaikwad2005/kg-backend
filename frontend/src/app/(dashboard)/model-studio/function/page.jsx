'use client';
import React, { useState } from 'react';
import { Plus, Search, Copy, Check, Edit2, Trash2, Code } from 'lucide-react';
import { Spinner } from '@/src/components/ui/Spinner';
import { ConfirmDialog } from '@/src/components/ui/ConfirmDialog';
import { DataTable } from '@/src/components/ui/DataTable';
import { ActionsMenuButton } from '@/src/components/ui/ActionsMenuButton';
import { useFunctionPage } from './_hooks/useFunctionPage';
import { FunctionStep1Modal } from './_components/FunctionStep1Modal';
import { FunctionCodeBuilderView } from './_components/FunctionCodeBuilderView';

const generateDefaultPythonCode = (name) => {
    let sanitized = (name || 'test').replace(/[^a-zA-Z0-9_]/g, '_');
    if (/^[0-9]/.test(sanitized)) sanitized = 'fn_' + sanitized;
    return `def ${sanitized}(data):
    # Your code here
    preprocess_data = data
    return preprocess_data`;
};

export default function CustomFunctionsPage() {
    const f = useFunctionPage();
    const [nameInput, setNameInput] = useState('');
    const [descInput, setDescInput] = useState('');
    const [code, setCode] = useState(generateDefaultPythonCode('test'));

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return dateStr;
            return date.toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
            });
        } catch {
            return dateStr;
        }
    };

    const truncateCode = (codeStr) => {
        if (!codeStr) return 'def test(data)...';
        const singleLine = codeStr.replace(/\s+/g, ' ').trim();
        return singleLine.length > 22 ? `${singleLine.slice(0, 20)}...` : singleLine;
    };

    const handleOpenBuilderSubmit = (e) => {
        e?.preventDefault();
        if (!nameInput.trim()) return;
        setCode(generateDefaultPythonCode(nameInput));
        f.openCodeBuilder(nameInput, descInput);
    };

    // Render Builder View inline when viewMode is 'builder'
    if (f.viewMode === 'builder') {
        const activeName = f.editingFunction?.name || f.builderName || nameInput || 'test';

        return (
            <div className="p-6 h-full">
                <FunctionCodeBuilderView
                    name={activeName}
                    editingFunction={f.editingFunction}
                    code={code}
                    setCode={setCode}
                    onBack={f.closeBuilder}
                    onRunTestClick={() =>
                        f.handleRunTest({
                            name: activeName,
                            code: code,
                            testInputs: {},
                        })
                    }
                    onSubmit={() =>
                        f.handleSaveOrUpdate({
                            name: activeName,
                            description: f.editingFunction?.description || f.builderDescription || descInput,
                            code: code,
                        })
                    }
                    testResult={f.testResult}
                    testingCode={f.testingCode}
                    actionLoading={f.actionLoading}
                    onClearConsole={f.clearTestResult}
                />
            </div>
        );
    }

    const columns = [
        { key: 'id', label: 'ID', render: r => <span className="font-bold text-text-primary">{r.function_id || r.id}</span> },
        { key: 'name', label: 'FUNCTION NAME', render: r => <span className="font-bold text-text-primary">{r.name}</span> },
        { key: 'description', label: 'DESCRIPTION', render: r => <span className="text-text-muted max-w-xs truncate">{r.description || '-'}</span> },
        { key: 'code', label: 'CODE PREVIEW', render: r => (
            <div className="inline-flex items-center gap-2">
                <div className="px-2.5 py-1 bg-canvas border border-border rounded-md font-mono text-[12px] text-text-primary">
                    {truncateCode(r.code)}
                </div>
                <button
                    onClick={(e) => { e.stopPropagation(); f.handleCopyCode(r.function_id || r.id, r.code); }}
                    title="Copy code"
                    className="p-1.5 hover:text-brand text-text-subtle hover:bg-canvas/80 rounded-md transition-colors cursor-pointer"
                >
                    {f.copiedId === (r.function_id || r.id) ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                        <Copy className="w-3.5 h-3.5" />
                    )}
                </button>
            </div>
        ) },
        { key: 'created_by', label: 'CREATED BY', render: r => <span className="text-text-muted">{r.created_by || 'System'}</span> },
        { key: 'created_at', label: 'CREATED AT', render: r => <span className="text-text-muted text-xs">{formatDate(r.created_at)}</span> },
        { key: 'actions', label: '', cellClassName: 'text-right', render: r => (
            <ActionsMenuButton actions={[
                { label: 'Modify', icon: <Edit2 className="w-4 h-4 text-text-subtle" />, onClick: () => {
                    setCode(r.code || generateDefaultPythonCode(r.name));
                    f.openEditModal(r);
                } },
                { label: 'Delete', icon: <Trash2 className="w-4 h-4 text-danger" />, danger: true, onClick: () => f.openDeleteModal(r) }
            ]} />
        ) }
    ];

    // Default Table List View
    return (
        <div className="max-w-7xl mx-auto space-y-6 p-8 pb-16">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-[26px] font-bold text-text-primary">Custom Functions</h1>
                    <p className="text-[15px] text-text-muted mt-1">
                        Build, test, and deploy custom Python functions for your data pipelines.
                    </p>
                </div>
                <button
                    onClick={() => {
                        setNameInput('');
                        setDescInput('');
                        f.openNewModal();
                    }}
                    className="flex items-center justify-center gap-2 bg-brand text-white hover:bg-brand-hover px-4 py-2.5 rounded-xl font-medium text-[15px] transition-colors shadow-sm cursor-pointer shrink-0"
                >
                    <Plus className="w-4 h-4" /> New Function
                </button>
            </div>

            {/* Functions List Section */}
            <div className="space-y-4">
                <h2 className="text-[18px] font-bold text-text-primary">Functions List</h2>

                {/* Search Input */}
                <div className="relative max-w-full">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-subtle" />
                    <input
                        type="text"
                        value={f.searchQuery}
                        onChange={(e) => f.setSearchQuery(e.target.value)}
                        placeholder="Search functions by name, ID, or description..."
                        className="w-full pl-10 pr-4 py-2.5 text-[15px] bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all shadow-xs"
                    />
                </div>

                {/* Table Container */}
                <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-xs">
                    <DataTable
                        columns={columns}
                        rows={f.functionsList}
                        loading={f.loading}
                        error={f.error}
                        onRetry={f.fetchFunctions}
                        emptyIcon={<Code className="w-12 h-12 text-text-subtle/50" />}
                        emptyTitle="No custom functions found"
                        emptyDescription={f.searchQuery ? 'Try adjusting your search query' : 'Click "New Function" to create your first Python custom function.'}
                    />
                </div>
            </div>

            {/* Step 1 Configuration Modal */}
            <FunctionStep1Modal
                isOpen={f.isModalOpen}
                onClose={f.closeModal}
                name={nameInput}
                setName={setNameInput}
                description={descInput}
                setDescription={setDescInput}
                onOpenCodeBuilder={handleOpenBuilderSubmit}
            />

            {/* Delete Confirmation Modal */}
            <ConfirmDialog
                open={f.isDeleteModalOpen}
                onClose={f.closeDeleteModal}
                onConfirm={f.handleDelete}
                title="Delete Custom Function"
                description={`Are you sure you want to delete function "${f.deletingFunction?.name}"? This action cannot be undone.`}
                confirmLabel="Delete"
                cancelLabel="Cancel"
                isPending={f.actionLoading}
                intent="danger"
            />
        </div>
    );
}
