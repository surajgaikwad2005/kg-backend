'use client';
import React from 'react';
import { X, Plus } from 'lucide-react';
import { Modal } from '@/src/components/ui/Modal';

export function FunctionStep1Modal({
    isOpen,
    onClose,
    name,
    setName,
    description,
    setDescription,
    onOpenCodeBuilder,
}) {
    return (
        <Modal open={isOpen} onClose={onClose} size="lg" className="overflow-hidden flex flex-col">
            <div className="p-6 border-b border-border flex justify-between items-start">
                <div>
                    <h3 className="text-[22px] font-bold text-text-primary">New Function</h3>
                    <p className="text-[16px] text-text-muted mt-1">
                        Create and configure a new custom Python function.
                    </p>
                </div>
                <button
                    onClick={onClose}
                    aria-label="Close"
                    className="text-text-subtle hover:text-text-secondary p-1 cursor-pointer"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            <form onSubmit={onOpenCodeBuilder} className="flex flex-col flex-1">
                <div className="p-6 space-y-6 overflow-y-auto">
                    <div>
                        <label className="block text-[16px] font-medium text-text-primary mb-1">
                            Function Name *
                        </label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., multi_tag_with_windows"
                            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand text-[16px] text-text-secondary"
                        />
                    </div>

                    <div>
                        <label className="block text-[16px] font-medium text-text-primary mb-1">
                            Description <span className="text-text-muted font-normal">(Optional)</span>
                        </label>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Briefly describe what this function does"
                            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand text-[16px] text-text-secondary"
                        />
                    </div>
                </div>

                <div className="p-4 border-t border-border flex justify-end gap-3 bg-canvas">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 border border-border text-text-secondary bg-surface rounded-lg hover:bg-canvas font-medium text-[16px] transition-colors cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={!name.trim()}
                        className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-hover font-medium text-[16px] transition-colors cursor-pointer disabled:opacity-50"
                    >
                        <Plus className="w-4 h-4" /> Open Code Builder
                    </button>
                </div>
            </form>
        </Modal>
    );
}
