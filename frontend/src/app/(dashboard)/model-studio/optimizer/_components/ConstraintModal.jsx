'use client';
import { Modal, ModalBody, ModalFooter } from '@/src/components/ui/Modal';
import { KeyValueEditor } from '@/src/components/ui/KeyValueEditor';

export function ConstraintModal({ isEditMode, form, setForm, isSaving, onClose, onSave }) {
    return (
        <Modal open onClose={onClose} title={isEditMode ? 'Modify Constraints' : 'Add Constraints'} size="lg">
            <ModalBody className="space-y-5 max-h-[65vh] overflow-y-auto">
                <p className="text-body-sm text-text-muted -mt-1">Equality/inequality constraint expressions used by optimizer experiments.</p>

                <div>
                    <label className="block text-body-sm font-semibold text-text-primary mb-1.5">Equality Constraints</label>
                    <KeyValueEditor
                        rows={form.equalityRows} onChange={rows => setForm(f => ({ ...f, equalityRows: rows }))}
                        valueType="text" keyPlaceholder="e.g. eq1" valuePlaceholder="e.g. x1 + x2 = 100"
                        addLabel="Add equality constraint" emptyLabel="No equality constraints added yet."
                    />
                </div>

                <div>
                    <label className="block text-body-sm font-semibold text-text-primary mb-1.5">Inequality Constraints</label>
                    <KeyValueEditor
                        rows={form.inequalityRows} onChange={rows => setForm(f => ({ ...f, inequalityRows: rows }))}
                        valueType="text" keyPlaceholder="e.g. ineq1" valuePlaceholder="e.g. x1 <= 50"
                        addLabel="Add inequality constraint" emptyLabel="No inequality constraints added yet."
                    />
                </div>

                <div>
                    <label htmlFor="constr-desc" className="block text-body-sm font-semibold text-text-primary mb-1">Description</label>
                    <textarea
                        id="constr-desc" rows={2} value={form.description}
                        onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                        placeholder="Initial optimizer constraints"
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
