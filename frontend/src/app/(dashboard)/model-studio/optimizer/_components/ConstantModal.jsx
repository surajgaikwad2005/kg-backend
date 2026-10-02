'use client';
import { Modal, ModalBody, ModalFooter } from '@/src/components/ui/Modal';
import { KeyValueEditor } from '@/src/components/ui/KeyValueEditor';

export function ConstantModal({ isEditMode, form, setForm, isSaving, onClose, onSave }) {
    return (
        <Modal open onClose={onClose} title={isEditMode ? 'Modify Constants' : 'Add Constants'} size="lg">
            <ModalBody className="space-y-5 max-h-[60vh] overflow-y-auto">
                <p className="text-body-sm text-text-muted -mt-1">Named numeric constants used by optimizer experiments (e.g. k1, k2).</p>

                <div>
                    <label className="block text-body-sm font-semibold text-text-primary mb-1.5">Constants</label>
                    <KeyValueEditor
                        rows={form.constantsRows} onChange={rows => setForm(f => ({ ...f, constantsRows: rows }))}
                        valueType="number" keyPlaceholder="e.g. k1" valuePlaceholder="e.g. 1.25"
                        addLabel="Add constant" emptyLabel="No constants added yet."
                    />
                </div>

                <div>
                    <label htmlFor="const-desc" className="block text-body-sm font-semibold text-text-primary mb-1">Description</label>
                    <textarea
                        id="const-desc" rows={2} value={form.description}
                        onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                        placeholder="Initial optimizer constants"
                        className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand text-body-sm text-text-secondary resize-y"
                    />
                </div>


            </ModalBody>
            <ModalFooter>
                <button onClick={onClose} className="px-4 py-2 border border-transparent text-text-muted hover:text-text-secondary font-medium text-body-sm transition-colors cursor-pointer">Cancel</button>
                <button
                    onClick={onSave} disabled={isSaving} aria-busy={isSaving}
                    className={`px-4 py-2 text-white rounded-lg font-medium text-body-sm transition-colors cursor-pointer ${isSaving ? 'bg-brand/50 cursor-not-allowed' : 'bg-brand hover:bg-brand-hover'}`}
                >
                    {isSaving ? (isEditMode ? 'Updating…' : 'Creating…') : (isEditMode ? 'Update' : 'Create')}
                </button>
            </ModalFooter>
        </Modal>
    );
}
