'use client';

/**
 * KGModals — the create/edit node modal, connect-nodes modal, the two delete
 * confirmations, and the floating KG toast. Reads all state/handlers from
 * context. The reusable PropertyFields handles both node + relationship props.
 */
import React from 'react';
import { useValidateContext } from '@/src/app/(admin)/admin/domain-configuration/pnid/validate/_context/ValidateContext';
import { PlusCircle, Link2, Plus, Trash, Trash2, X } from 'lucide-react';
import { Modal } from '@/src/components/ui/Modal';
import { Select } from '@/src/components/ui/Select';

const NODE_LABELS = ['Equipment', 'Subsystem', 'Plant', 'Pipe', 'Valve', 'Instrument', 'WorkOrder', 'RCA', 'SOP', 'LOPC', 'GLOC', 'UPD', 'Vibration', 'Thermography', 'AIF', 'Pump', 'Vessel', 'Exchanger', 'Tank'];
const REL_TYPES = ['CONNECTED_TO', 'PART_OF', 'HAS_FIELD', 'HAS_PLATFORM', 'HAS_LOPC', 'HAS_GLOC', 'HAS_UPD', 'HAS_TAG', 'HAS_VIBRATION_DATA', 'HAS_THERMOGRAPHY', 'HAS_AIF'];

const inputCls = 'w-full px-4 py-2.5 bg-surface-2 border border-border rounded-xl text-sm font-semibold outline-none focus:bg-surface focus:border-brand transition-colors text-text-secondary';
// Thin wrapper over the shared Modal so all four KG dialogs get the portal,
// enter/exit animation, Escape and backdrop-close behavior in one place.
const ModalShell = ({ children, onClose }) => (
    <Modal open onClose={onClose} size="lg" className="border border-border overflow-hidden flex flex-col max-h-[90vh]">
        {children}
    </Modal>
);

function PropertyFields({ mode, list }) {
    const { addPropertyField, removePropertyField, handlePropertyChange } = useValidateContext();
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-border pb-2">
                <label className="text-label font-black text-text-subtle uppercase tracking-widest">{mode === 'node' ? 'Custom Metadata & Properties' : 'Connection Properties & KPIs'}</label>
                <button type="button" onClick={() => addPropertyField(mode)} className="flex items-center gap-1 text-label font-bold text-brand hover:text-brand-hover transition-colors cursor-pointer">
                    <Plus className="w-3.5 h-3.5" /> Add Field
                </button>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {list.map((prop, idx) => (
                    <div key={prop.id} className="flex gap-2 items-center">
                        <input type="text" placeholder="Property Key" value={prop.key} onChange={(e) => handlePropertyChange(mode, idx, 'key', e.target.value)} className="flex-1 px-3 py-2 bg-surface-2 border border-border rounded-lg text-xs font-semibold outline-none focus:bg-surface focus:border-brand transition-colors text-text-secondary" />
                        <input type="text" placeholder="Value" value={prop.value} onChange={(e) => handlePropertyChange(mode, idx, 'value', e.target.value)} className="flex-1 px-3 py-2 bg-surface-2 border border-border rounded-lg text-xs font-semibold outline-none focus:bg-surface focus:border-brand transition-colors text-text-secondary" />
                        <button type="button" onClick={() => removePropertyField(mode, idx)} aria-label="Remove property" className="p-2 text-text-subtle hover:text-danger hover:bg-danger/10 rounded-lg transition-all cursor-pointer"><Trash className="w-3.5 h-3.5" /></button>
                    </div>
                ))}
                {list.length === 0 && <p className="text-center py-4 text-xs font-semibold text-text-subtle italic">No custom properties defined yet.</p>}
            </div>
        </div>
    );
}

export default function KGModals() {
    const ctx = useValidateContext();
    const {
        isNodeModalOpen, setIsNodeModalOpen, nodeModalMode, nodeKey, setNodeKey, nodeLabel, setNodeLabel, nodeProperties, handleUpsertNodeSubmit,
        isRelModalOpen, setIsRelModalOpen, relSrcId, setRelSrcId, relTgtId, setRelTgtId, relType, setRelType, relProperties, nodeOptions, handleUpsertRelationshipSubmit,
        isDeleteNodeConfirmOpen, setIsDeleteNodeConfirmOpen, nodeToDelete, handleDeleteNodeSubmit,
        isDeleteRelConfirmOpen, setIsDeleteRelConfirmOpen, relToDelete, handleDeleteRelationshipSubmit,
        kgToast, setKgToast,
    } = ctx;

    return (
        <>
            {/* Node modal */}
            {isNodeModalOpen && (
                <ModalShell onClose={() => setIsNodeModalOpen(false)}>
                    <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-surface-2/50">
                        <h3 id="kg-node-modal-title" className="font-extrabold text-text-primary tracking-tight flex items-center gap-2 text-base uppercase">
                            <PlusCircle className="w-5 h-5 text-brand" /> {nodeModalMode === 'create' ? 'Create New Entity Node' : 'Edit Entity Properties'}
                        </h3>
                        <button onClick={() => setIsNodeModalOpen(false)} aria-label="Close" className="p-1 text-text-subtle hover:text-text-secondary rounded-lg hover:bg-surface-2 transition-colors cursor-pointer"><X className="w-5 h-5" /></button>
                    </div>
                    <form onSubmit={handleUpsertNodeSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-label font-black text-text-subtle uppercase tracking-widest block">Unique Key Identifier</label>
                            <input type="text" required placeholder="e.g. PUMP-101" value={nodeKey} onChange={(e) => setNodeKey(e.target.value)} disabled={nodeModalMode === 'edit'} className={`${inputCls} disabled:opacity-60 disabled:cursor-not-allowed`} />
                            {nodeModalMode === 'edit' && <span className="text-2xs font-medium text-text-subtle block italic leading-none">Primary identifier key cannot be modified.</span>}
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-label font-black text-text-subtle uppercase tracking-widest block">Entity Classification Label</label>
                            <Select value={nodeLabel} onChange={setNodeLabel} options={NODE_LABELS} />
                        </div>
                        <PropertyFields mode="node" list={nodeProperties} />
                        <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
                            <button type="button" onClick={() => setIsNodeModalOpen(false)} className="px-4 py-2 border border-border hover:bg-surface-2 rounded-xl text-xs font-bold text-text-muted transition-colors cursor-pointer">Cancel</button>
                            <button type="submit" className="px-4 py-2 bg-brand hover:bg-brand-hover text-white rounded-xl text-xs font-bold transition-colors shadow-sm cursor-pointer">Save Changes</button>
                        </div>
                    </form>
                </ModalShell>
            )}

            {/* Relationship modal */}
            {isRelModalOpen && (
                <ModalShell onClose={() => setIsRelModalOpen(false)}>
                    <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-surface-2/50">
                        <h3 id="kg-rel-modal-title" className="font-extrabold text-text-primary tracking-tight flex items-center gap-2 text-base uppercase"><Link2 className="w-5 h-5 text-success" /> Connect Entities</h3>
                        <button onClick={() => setIsRelModalOpen(false)} aria-label="Close" className="p-1 text-text-subtle hover:text-text-secondary rounded-lg hover:bg-surface-2 transition-colors cursor-pointer"><X className="w-5 h-5" /></button>
                    </div>
                    <form onSubmit={handleUpsertRelationshipSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-label font-black text-text-subtle uppercase tracking-widest block">Source Entity Node</label>
                                <Select
                                    value={relSrcId}
                                    onChange={setRelSrcId}
                                    placeholder="-- Choose Node --"
                                    searchable
                                    searchPlaceholder="Search nodes..."
                                    options={nodeOptions.map((o) => ({ value: o.dbId, label: `${o.label} (${o.classification})` }))}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-label font-black text-text-subtle uppercase tracking-widest block">Target Entity Node</label>
                                <Select
                                    value={relTgtId}
                                    onChange={setRelTgtId}
                                    placeholder="-- Choose Node --"
                                    searchable
                                    searchPlaceholder="Search nodes..."
                                    options={nodeOptions.map((o) => ({ value: o.dbId, label: `${o.label} (${o.classification})` }))}
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-label font-black text-text-subtle uppercase tracking-widest block">Relationship Connection Type</label>
                            <Select value={relType} onChange={setRelType} options={REL_TYPES} />
                        </div>
                        <PropertyFields mode="rel" list={relProperties} />
                        <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
                            <button type="button" onClick={() => setIsRelModalOpen(false)} className="px-4 py-2 border border-border hover:bg-surface-2 rounded-xl text-xs font-bold text-text-muted transition-colors cursor-pointer">Cancel</button>
                            <button type="submit" className="px-4 py-2 bg-success hover:bg-success/90 text-white rounded-xl text-xs font-bold transition-colors shadow-sm cursor-pointer">Establish Connection</button>
                        </div>
                    </form>
                </ModalShell>
            )}

            {/* Delete node confirm */}
            {isDeleteNodeConfirmOpen && nodeToDelete && (
                <ModalShell onClose={() => setIsDeleteNodeConfirmOpen(false)}>
                    <div className="p-6 space-y-5">
                        <div className="flex items-center gap-3.5 text-danger">
                            <div className="p-2 bg-danger/10 border border-danger/30 rounded-2xl"><Trash2 className="w-6 h-6" /></div>
                            <div>
                                <h3 id="kg-delete-node-modal-title" className="font-extrabold text-text-primary text-[15px] uppercase tracking-wide">Delete Entity Node?</h3>
                                <p className="text-caption font-bold text-text-subtle uppercase tracking-widest leading-none mt-1">Label: {nodeToDelete.labels?.[0] || 'Node'}</p>
                            </div>
                        </div>
                        <p className="text-xs font-medium leading-relaxed text-text-muted">Delete entity <strong className="text-text-secondary">{nodeToDelete.properties?.name || nodeToDelete.id}</strong>? All its relationships are removed too.</p>
                        <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
                            <button type="button" onClick={() => setIsDeleteNodeConfirmOpen(false)} className="px-4 py-2 border border-border hover:bg-surface-2 rounded-xl text-xs font-bold text-text-muted transition-colors cursor-pointer">Cancel</button>
                            <button onClick={handleDeleteNodeSubmit} className="px-4 py-2 bg-danger hover:bg-danger/90 text-white rounded-xl text-xs font-bold transition-colors shadow-sm cursor-pointer">Permanently Delete</button>
                        </div>
                    </div>
                </ModalShell>
            )}

            {/* Delete relationship confirm */}
            {isDeleteRelConfirmOpen && relToDelete && (
                <ModalShell onClose={() => setIsDeleteRelConfirmOpen(false)}>
                    <div className="p-6 space-y-5">
                        <div className="flex items-center gap-3.5 text-danger">
                            <div className="p-2 bg-danger/10 border border-danger/30 rounded-2xl"><Trash2 className="w-6 h-6" /></div>
                            <div>
                                <h3 id="kg-delete-rel-modal-title" className="font-extrabold text-text-primary text-[15px] uppercase tracking-wide">Delete Connection?</h3>
                                <p className="text-caption font-bold text-text-subtle uppercase tracking-widest leading-none mt-1">Relationship: {relToDelete.type}</p>
                            </div>
                        </div>
                        <p className="text-xs font-medium leading-relaxed text-text-muted">Remove the connection between <strong className="text-text-secondary">{relToDelete.source}</strong> and <strong className="text-text-secondary">{relToDelete.target}</strong>? Entity nodes are not deleted.</p>
                        <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
                            <button type="button" onClick={() => setIsDeleteRelConfirmOpen(false)} className="px-4 py-2 border border-border hover:bg-surface-2 rounded-xl text-xs font-bold text-text-muted transition-colors cursor-pointer">Cancel</button>
                            <button onClick={handleDeleteRelationshipSubmit} className="px-4 py-2 bg-danger hover:bg-danger/90 text-white rounded-xl text-xs font-bold transition-colors shadow-sm cursor-pointer">Remove Connection</button>
                        </div>
                    </div>
                </ModalShell>
            )}

            {/* Toast */}
            {kgToast && (
                <div className={`fixed bottom-6 right-6 z-[60] flex items-center gap-3 px-5 py-3.5 border rounded-2xl shadow-modal font-bold text-xs uppercase tracking-wider animate-in fade-in slide-in-from-bottom-5 duration-300 ${kgToast.type === 'success' ? 'bg-success/10 border-success/30 text-success' : 'bg-danger/10 border-danger/30 text-danger'}`}>
                    <span className={`w-2 h-2 rounded-full ${kgToast.type === 'success' ? 'bg-success' : 'bg-danger'}`} />
                    {kgToast.message}
                    <button onClick={() => setKgToast(null)} aria-label="Dismiss notification" className="ml-2 hover:opacity-70 transition-opacity cursor-pointer"><X className="w-3.5 h-3.5" /></button>
                </div>
            )}
        </>
    );
}
