'use client';
import React, { useState, useMemo } from 'react';
import { PageHeader } from '@/src/components/layout/PageHeader';
import { Activity, Plus, FolderOpen, FileSpreadsheet, TrendingUp, X, Trash2 } from 'lucide-react';
import { Spinner, SpinnerOverlay } from '@/src/components/ui/Spinner';
import { Modal } from '@/src/components/ui/Modal';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useWorkspaceList, useCreateWorkspace, useDeleteWorkspace } from './_queries/useWorkspaceQueries';

function getCleanUsername() {
    if (typeof window === 'undefined') return 'user';
    const email = localStorage.getItem('username') || '';
    if (!email) return 'user';
    return email.split('@')[0].split('.')[0];
}

export default function WorkspaceListPage() {
    const router = useRouter();
    const username = getCleanUsername();

    const { data: res, isLoading: loading } = useWorkspaceList(username);
    const createMutation = useCreateWorkspace();
    const deleteMutation = useDeleteWorkspace();

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newWorkspaceName, setNewWorkspaceName] = useState('');

    // Custom UI Dialog States
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);

    const workspacesList = useMemo(() => {
        const workspacesArray = res?.success && Array.isArray(res?.data?.workspaces) ? res.data.workspaces : [];
        const icons = [TrendingUp, Activity, FileSpreadsheet];
        const colors = ['text-danger', 'text-warning', 'text-success', 'text-brand'];
        const bgs = ['bg-danger/10', 'bg-warning/10', 'bg-success/10', 'bg-brand/10'];
        return workspacesArray.map((name, index) => ({
            id: name,
            name,
            icon: icons[index % icons.length],
            color: colors[index % colors.length],
            bg: bgs[index % bgs.length],
        }));
    }, [res]);

    const isCreating = createMutation.isPending;
    const isDeleting = deleteMutation.isPending;

    const handleCreateWorkspace = async (e) => {
        e.preventDefault();
        const trimmedName = newWorkspaceName.trim().replace(/\s+/g, '_');
        if (!trimmedName || isCreating) return;

        createMutation.mutate(
            { username, workspaceName: trimmedName },
            {
                onSuccess: () => {
                    setShowCreateModal(false);
                    setNewWorkspaceName('');
                    router.push(`/workspace/${trimmedName}`);
                },
                onError: (err) => {
                    setErrorMsg(err?.data?.details || err?.message || 'Failed to create workspace. Try another name.');
                },
            }
        );
    };

    const handleDeleteClick = (e, workspaceName) => {
        e.preventDefault();
        e.stopPropagation();
        setDeleteTarget(workspaceName);
    };

    const handleConfirmDelete = async () => {
        if (!deleteTarget || isDeleting) return;

        deleteMutation.mutate(
            { username, workspaceName: deleteTarget },
            {
                onSuccess: () => {
                    setDeleteTarget(null);
                },
                onError: (err) => {
                    setErrorMsg(err?.data?.details || err?.message || 'Failed to delete workspace.');
                },
            }
        );
    };

    return (<>

                <PageHeader showDateRange title="Workspace" subtitle="Saved Workspaces & History" />

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <div className="mb-8 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-surface-2 flex items-center justify-center shadow-md">
                                <FolderOpen className="w-5 h-5 text-text-primary" />
                            </div>
                            <div>
                                <h2 className="text-[20px] font-bold text-text-primary leading-tight">My Workspaces</h2>
                                <p className="text-[14px] text-text-muted font-medium">Pick up where you left off or create a new session.</p>
                            </div>
                        </div>
                        {workspacesList.length > 0 && <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-4 py-2 bg-brand hover:bg-brand-hover text-white rounded-xl text-[14px] font-bold transition-all shadow-lg shadow-brand/20 active:scale-95 cursor-pointer">
                            <Plus className="w-4 h-4" /> New Workspace
                        </button>}
                    </div>

                    {loading ? (
                        <SpinnerOverlay label="Loading Workspaces…" />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {workspacesList.map(workspace => (
                                <Link href={`/workspace/${workspace.id}`} key={workspace.id} className="group bg-surface border border-border hover:border-brand/30 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-brand/5 flex flex-col cursor-pointer">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`p-3 rounded-xl ${workspace.bg} ${workspace.color}`}>
                                            <workspace.icon className="w-6 h-6" />
                                        </div>
                                        <button className="p-2 text-text-subtle hover:text-danger hover:bg-danger/10 rounded-lg transition-colors z-10 cursor-pointer" onClick={e => handleDeleteClick(e, workspace.name)} title="Delete Workspace" aria-label={`Delete workspace ${workspace.name}`}>
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <h3 className="text-[18px] font-bold text-text-primary mb-2 group-hover:text-brand transition-colors break-words">{workspace.name}</h3>
                                </Link>
                            ))}
                            {workspacesList.length === 0 && (
                                <button onClick={() => setShowCreateModal(true)} className="bg-surface/50 border-2 border-dashed border-border hover:border-brand hover:bg-brand/10 rounded-2xl p-6 transition-all duration-300 flex flex-col items-center justify-center min-h-[220px] group cursor-pointer">
                                    <div className="w-12 h-12 rounded-full bg-surface border border-border group-hover:border-brand/30 group-hover:bg-brand/20 flex items-center justify-center mb-4 transition-colors shadow-sm">
                                        <Plus className="w-6 h-6 text-text-subtle group-hover:text-brand transition-colors" />
                                    </div>
                                    <h3 className="text-[16px] font-bold text-text-secondary group-hover:text-brand-hover mb-1 transition-colors">Create New Workspace</h3>
                                    <p className="text-[13px] text-text-muted">Start a new canvas</p>
                                </button>
                            )}
                        </div>
                    )}
                </div>

            {/* Create Workspace Modal */}
            <Modal
                open={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                size="md"
                className="rounded-3xl overflow-hidden"
            >
                <div className="bg-surface-2 px-6 py-4 flex items-center justify-between text-text-primary">
                    <div className="flex items-center gap-2">
                        <FolderOpen className="w-5 h-5 text-brand" />
                        <span id="create-workspace-title" className="font-black text-[15px] uppercase tracking-wider">New Workspace</span>
                    </div>
                    <button onClick={() => setShowCreateModal(false)} className="p-1 text-text-subtle hover:text-text-primary rounded-lg transition-colors cursor-pointer" aria-label="Close">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <form onSubmit={handleCreateWorkspace} className="p-6 space-y-4">
                    <div>
                        <label htmlFor="new-workspace-name" className="text-label font-black text-text-subtle uppercase tracking-widest block mb-2">Workspace Name</label>
                        <input id="new-workspace-name" type="text" value={newWorkspaceName} onChange={e => setNewWorkspaceName(e.target.value)} placeholder="e.g. cement_workspace" required className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-body font-bold text-text-primary outline-none focus:border-brand transition-all shadow-inner" />
                        <p className="text-caption text-text-subtle mt-2">Spaces will be automatically formatted to underscores.</p>
                    </div>
                    <div className="flex gap-3 justify-end pt-4 border-t border-border">
                        <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 border border-border hover:bg-surface-2 text-text-secondary rounded-xl text-body-sm font-bold transition-colors cursor-pointer">
                            Cancel
                        </button>
                        <button type="submit" disabled={isCreating || !newWorkspaceName.trim()} aria-busy={isCreating} className="flex items-center gap-2 px-5 py-2 bg-brand hover:bg-brand-hover disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-body-sm font-bold transition-all shadow-lg shadow-brand/20 cursor-pointer">
                            {isCreating ? <><Spinner size="xs" /> Creating…</> : <><Plus className="w-4 h-4" /> Create</>}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Custom UI Delete Workspace Confirmation Modal */}
            <Modal
                open={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                size="sm"
            >
                <div className="p-6">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-danger/10 flex items-center justify-center text-danger">
                            <Trash2 className="w-5 h-5" />
                        </div>
                        <div className="pt-1">
                            <h3 className="text-[16px] font-bold text-text-primary mb-1">Delete Workspace</h3>
                            <p className="text-[13px] text-text-secondary font-medium leading-relaxed">
                                Are you sure you want to delete workspace <strong className="text-text-primary break-all">"{deleteTarget}"</strong>? This action cannot be undone.
                            </p>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
                        <button
                            type="button"
                            onClick={() => setDeleteTarget(null)}
                            disabled={isDeleting}
                            className="px-4 py-2 border border-border hover:bg-surface-2 text-text-secondary rounded-xl text-[13px] font-bold transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleConfirmDelete}
                            disabled={isDeleting}
                            className="flex items-center gap-2 px-5 py-2 bg-danger hover:bg-danger/90 disabled:opacity-50 text-white rounded-xl text-[13px] font-bold transition-all shadow-lg shadow-danger/20 active:scale-95 cursor-pointer"
                        >
                            {isDeleting ? <><Spinner size="xs" /> Deleting…</> : "Delete"}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Custom UI Error Alert Modal */}
            <Modal
                open={!!errorMsg}
                onClose={() => setErrorMsg(null)}
                size="sm"
            >
                <div className="p-6">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-danger/10 flex items-center justify-center text-danger">
                            <X className="w-5 h-5" />
                        </div>
                        <div className="pt-1">
                            <h3 className="text-[16px] font-bold text-text-primary mb-1">Error</h3>
                            <p className="text-[13px] text-text-secondary font-medium leading-relaxed">{errorMsg}</p>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
                        <button
                            type="button"
                            onClick={() => setErrorMsg(null)}
                            className="px-5 py-2 bg-text-primary hover:opacity-90 text-surface rounded-xl text-[13px] font-bold transition-all shadow-md active:scale-95 cursor-pointer"
                        >
                            OK
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
}
