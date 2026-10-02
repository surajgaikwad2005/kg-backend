'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, AlertTriangle, Plus, CheckCircle2 } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import CreateGroupModal from '@/src/components/admin/modals/CreateGroupModal';
import { AssignUserToGroupCard } from './components/groups/AssignUserToGroupCard';
import { MoveUserGroupCard } from './components/groups/MoveUserGroupCard';

export function GroupsView() {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [sessionGroups, setSessionGroups] = useState([]);

    const handleGroupCreated = (group) => {
        setSessionGroups((prev) => [group, ...prev]);
    };

    return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-brand rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand/20">
                        <Layers size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-text-primary">Groups Management</h2>
                        <p className="text-text-muted text-sm">Create groups and manage user membership</p>
                    </div>
                </div>
                <Button variant="primary" size="sm" onClick={() => setIsCreateModalOpen(true)}>
                    <Plus size={16} />
                    <span>Create Group</span>
                </Button>
            </div>

            <div className="bg-warning/10 border border-warning/20 rounded-xl p-4 flex items-start gap-4">
                <div className="p-2 bg-warning/20 rounded-lg text-warning shrink-0">
                    <AlertTriangle size={18} />
                </div>
                <div>
                    <h4 className="text-sm font-bold text-warning">Warning</h4>
                    <p className="text-sm text-warning/80">Be careful. Group and membership changes take effect immediately and can affect access.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AssignUserToGroupCard />
                <MoveUserGroupCard />
            </div>

            <div className="space-y-4">
                <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest">Groups Created This Session</h3>
                {sessionGroups.length === 0 ? (
                    <div className="bg-surface border border-dashed border-border rounded-2xl p-8 text-center">
                        <p className="text-sm text-text-muted">No groups created yet. Use "Create Group" to get started.</p>
                    </div>
                ) : (
                    <div className="flex flex-wrap gap-3">
                        <AnimatePresence initial={false}>
                            {sessionGroups.map((group) => (
                                <motion.div
                                    key={`${group.name}-${group.createdBy || ''}`}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="flex items-center gap-2 bg-success/10 border border-success/30 text-success rounded-full pl-3 pr-4 py-2 text-sm font-medium"
                                >
                                    <CheckCircle2 size={14} />
                                    <span className="text-text-primary">{group.name}</span>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            <CreateGroupModal
                open={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onCreated={handleGroupCreated}
            />
        </motion.div>
    );
}
