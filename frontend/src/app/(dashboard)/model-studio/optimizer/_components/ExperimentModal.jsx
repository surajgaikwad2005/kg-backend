'use client';
import { Modal, ModalBody, ModalFooter } from '@/src/components/ui/Modal';
import { Select } from '@/src/components/ui/Select';

const SOLVER_SUGGESTIONS = ['SLSQP', 'COBYLA', 'Nelder-Mead', 'Powell', 'CG', 'BFGS', 'L-BFGS-B', 'TNC', 'trust-constr'];

export function ExperimentModal({ isEditMode, form, setForm, objectiveFunctions, constraints, constants, isSaving, onClose, onSave }) {
    return (
        <Modal open onClose={onClose} title={isEditMode ? 'Modify Experiment' : 'Add Experiment'} size="lg">
            <ModalBody className="space-y-5 max-h-[65vh] overflow-y-auto">
                <p className="text-body-sm text-text-muted -mt-1">Link an objective function, optional constraints/constants, and a solver into a runnable experiment.</p>

                <div>
                    <label htmlFor="exp-of" className="block text-body-sm font-semibold text-text-primary mb-1">Objective Function <span className="text-danger">*</span></label>
                    <Select
                        id="exp-of"
                        value={form.optimizerFunctionId}
                        onChange={(v) => setForm(f => ({ ...f, optimizerFunctionId: v }))}
                        placeholder="Select objective function"
                        searchable
                        searchPlaceholder="Search objective functions..."
                        options={objectiveFunctions.map(fn => ({ value: fn.optimizer_function_id, label: `#${fn.optimizer_function_id} — ${fn.function?.expression || fn.description || fn.type}` }))}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="exp-constraint" className="block text-body-sm font-semibold text-text-primary mb-1">Constraint</label>
                        <Select
                            id="exp-constraint"
                            value={form.constraintId}
                            onChange={(v) => setForm(f => ({ ...f, constraintId: v }))}
                            options={[{ value: '', label: 'None' }, ...constraints.map(c => ({ value: c.constraint_id, label: `#${c.constraint_id} — ${c.description || 'Constraint'}` }))]}
                        />
                    </div>
                    <div>
                        <label htmlFor="exp-constants" className="block text-body-sm font-semibold text-text-primary mb-1">Constants</label>
                        <Select
                            id="exp-constants"
                            value={form.constantsId}
                            onChange={(v) => setForm(f => ({ ...f, constantsId: v }))}
                            options={[{ value: '', label: 'None' }, ...constants.map(c => ({ value: c.constant_id, label: `#${c.constant_id} — ${c.description || 'Constants'}` }))]}
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="exp-solver" className="block text-body-sm font-semibold text-text-primary mb-1">{isEditMode ? 'Solver' : <span>Solver <span className="text-danger">*</span></span>}</label>
                    <Select
                        id="exp-solver"
                        value={form.solver}
                        onChange={(v) => setForm(f => ({ ...f, solver: v }))}
                        placeholder="e.g. SLSQP"
                        searchable
                        searchPlaceholder="Search solvers..."
                        options={SOLVER_SUGGESTIONS.map(s => ({ value: s, label: s }))}
                    />
                </div>

                <div>
                    <label htmlFor="exp-desc" className="block text-body-sm font-semibold text-text-primary mb-1">Description</label>
                    <textarea
                        id="exp-desc" rows={2} value={form.description}
                        onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                        placeholder="Baseline experiment run"
                        className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand text-body-sm text-text-secondary resize-y"
                    />
                </div>


            </ModalBody>
            <ModalFooter>
                <button onClick={onClose} className="px-4 py-2 border border-transparent text-text-muted hover:text-text-secondary font-medium text-body-sm transition-colors cursor-pointer">Cancel</button>
                <button
                    onClick={onSave} disabled={isSaving || !form.optimizerFunctionId || (!isEditMode && !form.solver.trim())} aria-busy={isSaving}
                    className={`px-4 py-2 text-white rounded-lg font-medium text-body-sm transition-colors cursor-pointer ${isSaving || !form.optimizerFunctionId || (!isEditMode && !form.solver.trim()) ? 'bg-brand/50 cursor-not-allowed' : 'bg-brand hover:bg-brand-hover'}`}
                >
                    {isSaving ? (isEditMode ? 'Updating…' : 'Creating…') : (isEditMode ? 'Update' : 'Create')}
                </button>
            </ModalFooter>
        </Modal>
    );
}
