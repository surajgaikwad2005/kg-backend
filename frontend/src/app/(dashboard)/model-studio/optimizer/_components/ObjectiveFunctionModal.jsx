'use client';
import { Modal, ModalBody, ModalFooter } from '@/src/components/ui/Modal';
import { Select } from '@/src/components/ui/Select';
import { KeyValueEditor } from '@/src/components/ui/KeyValueEditor';

export function ObjectiveFunctionModal({ isEditMode, form, setForm, isSaving, onClose, onSave }) {
    return (
        <Modal open onClose={onClose} title={isEditMode ? 'Modify Objective Function' : 'Add Objective Function'} size="lg">
            <ModalBody className="space-y-5 max-h-[65vh] overflow-y-auto">
                <p className="text-body-sm text-text-muted -mt-1">Define a max/min objective expression with decision variables and optional bounds.</p>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="of-type" className="block text-body-sm font-semibold text-text-primary mb-1">Type</label>
                        <Select
                            id="of-type"
                            value={form.type}
                            onChange={(v) => setForm(f => ({ ...f, type: v }))}
                            options={[{ value: 'min', label: 'Minimize' }, { value: 'max', label: 'Maximize' }]}
                        />
                    </div>
                    <div>
                        <label htmlFor="of-expr" className="block text-body-sm font-semibold text-text-primary mb-1">Expression</label>
                        <input
                            id="of-expr" type="text" value={form.expression}
                            onChange={e => setForm(f => ({ ...f, expression: e.target.value }))}
                            placeholder="e.g. 3*x1 + 2*x2"
                            className="w-full px-3 py-2 border border-border rounded-lg font-mono text-body-sm text-text-secondary focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-body-sm font-semibold text-text-primary mb-1.5">Decision Variables</label>
                    <KeyValueEditor
                        rows={form.decisionVariableRows} onChange={rows => setForm(f => ({ ...f, decisionVariableRows: rows }))}
                        valueType="text" keyPlaceholder="e.g. x1" valuePlaceholder="e.g. flow_rate_1"
                        addLabel="Add decision variable" emptyLabel="No decision variables added yet."
                    />
                </div>

                <div>
                    <label className="block text-body-sm font-semibold text-text-primary mb-1.5">Bounds (optional)</label>
                    <KeyValueEditor
                        rows={form.boundsRows} onChange={rows => setForm(f => ({ ...f, boundsRows: rows }))}
                        valueType="range" keyPlaceholder="e.g. x1"
                        addLabel="Add bound" emptyLabel="No bounds added yet."
                    />
                </div>

                <div>
                    <label htmlFor="of-desc" className="block text-body-sm font-semibold text-text-primary mb-1">Description</label>
                    <textarea
                        id="of-desc" rows={2} value={form.description}
                        onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                        placeholder="Maximize throughput"
                        className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand text-body-sm text-text-secondary resize-y"
                    />
                </div>


            </ModalBody>
            <ModalFooter>
                <button onClick={onClose} className="px-4 py-2 border border-transparent text-text-muted hover:text-text-secondary font-medium text-body-sm transition-colors cursor-pointer">Cancel</button>
                <button
                    onClick={onSave} disabled={isSaving || !form.expression} aria-busy={isSaving}
                    className={`px-4 py-2 text-white rounded-lg font-medium text-body-sm transition-colors cursor-pointer ${isSaving || !form.expression ? 'bg-brand/50 cursor-not-allowed' : 'bg-brand hover:bg-brand-hover'}`}
                >
                    {isSaving ? (isEditMode ? 'Updating…' : 'Creating…') : (isEditMode ? 'Update' : 'Create')}
                </button>
            </ModalFooter>
        </Modal>
    );
}
