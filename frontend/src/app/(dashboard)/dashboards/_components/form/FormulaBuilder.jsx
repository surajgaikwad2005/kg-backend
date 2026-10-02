import React from 'react';
import { useFormulaBuilder } from './_hooks/useFormulaBuilder';
import { useApp } from '@/src/context/AppContext';
import { useCronValidation } from '../../_queries/useDashboardQueries';

export default function FormulaBuilder({
  formulaSectionRef,
  formulaInputRef,
  editingLogicId,
  expressionName,
  setExpressionName,
  expressionDescription,
  setExpressionDescription,
  cronSchedule = '*/5 * * * *',
  setCronSchedule,
  isLive = true,
  setIsLive,
  formula,
  setFormula,
  availableTags = [],
  onSaveFormula
}) {
  const f = useFormulaBuilder({ editingLogicId, formula, setFormula, availableTags, formulaInputRef, onSaveFormula });

  const parseCronString = (str) => {
    const parts = (str || '*/5 * * * *').trim().split(/\s+/);
    while (parts.length < 5) parts.push('*');
    return parts.slice(0, 5);
  };

  const [cronFields, setCronFields] = React.useState(() => parseCronString(cronSchedule));

  React.useEffect(() => {
    if (cronSchedule) {
      setCronFields(parseCronString(cronSchedule));
    }
  }, [cronSchedule]);

  const { plantId } = useApp();
  const plantCode = plantId?.id || 'cdm_copy';
  const activeCronStr = cronFields.map(f => f.trim() === '' ? '*' : f).join(' ');

  const [debouncedCron, setDebouncedCron] = React.useState(activeCronStr);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedCron(activeCronStr);
    }, 400);
    return () => clearTimeout(timer);
  }, [activeCronStr]);

  const cronQuery = useCronValidation(plantCode, debouncedCron, { enabled: !!debouncedCron });

  const cronValidation = React.useMemo(() => {
    if (cronQuery.isFetching) {
      return { isLoading: true, isValid: true, description: 'Validating...' };
    }
    if (cronQuery.isError) {
      const err = cronQuery.error;
      return {
        isLoading: false,
        isValid: false,
        description: err?.response?.data?.message || err?.message || 'Invalid cron schedule',
      };
    }
    if (cronQuery.data) {
      const data = cronQuery.data?.data || cronQuery.data;
      return {
        isLoading: false,
        isValid: true,
        description: data?.description || data?.message || (data?.next_run ? `Next run: ${data.next_run}` : 'Cron is valid'),
      };
    }
    return { isLoading: false, isValid: true, description: 'Validating...' };
  }, [cronQuery.data, cronQuery.isError, cronQuery.error, cronQuery.isFetching]);

  const handleCronFieldChange = (idx, newVal) => {
    const nextFields = [...cronFields];
    nextFields[idx] = newVal;
    setCronFields(nextFields);

    const cronStr = nextFields.map(f => f.trim() === '' ? '*' : f).join(' ');
    if (setCronSchedule) setCronSchedule(cronStr);
  };

  const handlePresetClick = (presetValue) => {
    setCronFields(parseCronString(presetValue));
    if (setCronSchedule) setCronSchedule(presetValue);
  };


  const cronPresets = [
    { label: 'Every 5m', value: '*/5 * * * *' },
    { label: 'Every 10m', value: '*/10 * * * *' },
    { label: 'Every 15m', value: '*/15 * * * *' },
    { label: 'Hourly', value: '0 * * * *' },
  ];

  return (
    <div ref={formulaSectionRef} className="py-2 border-t border-border mt-2">
      <label className="block text-[10px] font-bold text-text-subtle tracking-[0.12em] uppercase mb-3">
        {editingLogicId ? `Updating Logic: ${editingLogicId}` : 'Create Advanced Logic'}
      </label>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className="block text-[10px] font-bold text-text-muted uppercase tracking-[0.12em] mb-2 flex items-center gap-1">
            Expression Name <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            value={expressionName}
            onChange={(e) => setExpressionName(e.target.value)}
            maxLength={50}
            className="w-full h-10 px-4 border-[1.5px] border-border rounded-xl text-[13px] font-semibold text-text-primary bg-canvas outline-none focus:border-brand focus:bg-surface focus:ring-[3.5px] focus:ring-brand/10 transition-all placeholder-text-subtle placeholder-normal"
            placeholder="e.g. Efficiency_Ratio"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-text-muted uppercase tracking-[0.12em] mb-2 flex items-center gap-1">
            Formula Expression <span className="text-danger">*</span>
          </label>
          <div className="relative w-full rounded-xl bg-canvas border-[1.5px] border-border focus-within:border-brand focus-within:bg-surface focus-within:ring-[3.5px] focus-within:ring-brand/10 transition-all group text-xs font-mono leading-relaxed tracking-normal">
            {/* Highlighted text layer (underneath) */}
            <div
              className="absolute inset-0 px-4 py-3 text-text-secondary whitespace-pre-wrap break-all pointer-events-none overflow-y-auto"
              style={{ 
                scrollbarWidth: 'none', 
                msOverflowStyle: 'none',
                fontFamily: 'inherit',
                fontSize: 'inherit',
                fontStyle: 'inherit',
                fontWeight: 'inherit',
                letterSpacing: 'inherit',
                lineHeight: 'inherit',
                textIndent: 'inherit',
                textRendering: 'inherit',
                textTransform: 'inherit'
              }}
              aria-hidden="true"
            >
              {!formula ? (
                <span className="text-text-subtle">Enter formula... (type to search tags)</span>
              ) : (
                formula.split(/([\s+\-*/(),]+)/g).map((part, i) => {
                  const tagIds = new Set(availableTags.map(t => typeof t === 'string' ? t : (t.id || t.value || t.label || '')));
                  if (tagIds.has(part)) {
                    return <span key={i} className="text-brand bg-brand/10 rounded">{part}</span>;
                  }
                  return part;
                })
              )}
            </div>

            {/* Actual textarea (transparent text on top) */}
            <textarea
              ref={formulaInputRef}
              value={formula}
              onChange={f.handleFormulaChange}
              onScroll={(e) => {
                if (e.target.previousElementSibling) {
                  e.target.previousElementSibling.scrollTop = e.target.scrollTop;
                  e.target.previousElementSibling.scrollLeft = e.target.scrollLeft;
                }
              }}
              className="w-full px-4 py-3 whitespace-pre-wrap break-all bg-transparent outline-none resize-y min-h-[96px] block border-none m-0 selection:text-transparent selection:bg-brand/20"
              style={{
                color: 'transparent',
                caretColor: 'var(--color-text-primary, #1e293b)',
                fontFamily: 'inherit',
                fontSize: 'inherit',
                fontStyle: 'inherit',
                fontWeight: 'inherit',
                letterSpacing: 'inherit',
                lineHeight: 'inherit',
                textIndent: 'inherit',
                textRendering: 'inherit',
                textTransform: 'inherit'
              }}
              spellCheck="false"
            />
            <div className="absolute bottom-2.5 right-3 text-[10px] text-text-subtle font-semibold bg-surface/70 px-1.5 py-0.5 rounded border border-border/40 pointer-events-none">
              {formula.length} chars
            </div>

            {f.currentTypingWord && f.currentTypingWord.length > 0 && (
              <div className="absolute top-full left-0 mt-2 w-full max-h-52 overflow-y-auto bg-surface border border-border rounded-xl shadow-2xl z-50 p-2 border-l-4 border-l-brand">
                <div className="text-2xs font-bold text-brand uppercase tracking-widest px-2.5 py-1.5 border-b border-border/40 bg-canvas/50 rounded-t-lg sticky top-0 backdrop-blur-sm">📌 Matching Tags</div>
                <div className="mt-1.5 space-y-0.5">
                  {f.formulaSuggestions.length > 0 ? f.formulaSuggestions.map(tag => {
                    const id = typeof tag === 'string' ? tag : (tag.id || tag.value || tag.label || '');
                    const label = typeof tag === 'string' ? '' : (tag.label || tag.description || '');
                    const unit = typeof tag === 'string' ? '' : (tag.unit || '');
                    return (
                      <button key={id} type="button" onClick={() => f.insertSuggestion(tag)} className="w-full text-left px-3.5 py-2.5 cursor-pointer border-b border-border/40 hover:bg-canvas transition-colors flex items-center justify-between group">
                        <div className="flex-1 min-w-0">
                          <div className="font-mono text-[11.5px] font-semibold text-brand">{id}</div>
                          <div className="text-[11px] text-text-muted mt-0.5 truncate max-w-full">
                            {label || ''}{unit && <>{` · `}<b className="font-bold text-text-secondary">{unit}</b></>}
                          </div>
                        </div>
                        <span className="text-[10px] text-text-subtle opacity-0 group-hover:opacity-100 transition-opacity shrink-0 font-sans">Insert ↵</span>
                      </button>
                    );
                  }) : (
                    <div className="px-3.5 py-4 text-center text-[11px] text-text-muted font-medium">
                      No tags found matching "{f.currentTypingWord}"
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Cron Schedule Section - Visual 5-Box Picker */}
        <div className="space-y-2.5">
          <label className="block text-[10px] font-bold text-text-muted uppercase tracking-[0.12em]">
            Cron Schedule <span className="text-brand">*</span>
          </label>

          {/* 5-Box Fields */}
          <div className="flex gap-2">
            {['MINUTE', 'HOUR', 'DAY (MONTH)', 'MONTH', 'DAY (WEEK)'].map((label, idx) => (
              <div key={label} className="flex flex-col items-center flex-1">
                <input
                  type="text"
                  value={cronFields[idx] ?? ''}
                  onChange={(e) => handleCronFieldChange(idx, e.target.value)}
                  className="w-full text-center py-2.5 bg-canvas border-[1.5px] border-border rounded-2xl text-text-primary text-sm font-mono font-bold focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all shadow-sm"
                />
                <span className="text-[10px] font-extrabold text-text-subtle mt-1.5 uppercase tracking-wider text-center">
                  {label}
                </span>
              </div>
            ))}
          </div>

          {/* Cron Timing Description Below Boxes */}
          {(() => {
            const { isValid, description, isLoading } = cronValidation;
            return (
              <div className={`pt-1 flex items-center gap-2 text-xs font-semibold px-3.5 py-4 rounded-xl border ${isValid ? 'text-success bg-success/10 border-success/20' : 'text-danger bg-danger/10 border-danger/20'}`}>
                {isLoading ? (
                  <span className="w-4 h-4 border-2 border-brand/30 border-t-brand rounded-full animate-spin shrink-0" />
                ) : isValid ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4 shrink-0"><path d="M20 6L9 17l-5-5" /></svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4 shrink-0"><path d="M18 6L6 18M6 6l12 12" /></svg>
                )}
                <span>{description}</span>
              </div>
            );
          })()}
        </div>

        <div>
          <label className="block text-[10px] font-bold text-text-muted uppercase tracking-[0.12em] mb-2">
            Description <span className="text-text-subtle ml-1 font-normal">(optional)</span>
          </label>
          <textarea
            value={expressionDescription}
            onChange={(e) => setExpressionDescription(e.target.value.slice(0, 200))}
            maxLength={200}
            className="w-full px-4 py-3 rounded-xl bg-canvas border-[1.5px] border-border text-sm text-text-secondary font-light focus:outline-none focus:border-brand focus:bg-surface focus:ring-[3.5px] focus:ring-brand/10 transition-all resize-none"
            placeholder="Expression Description..."
            rows={2}
          />
          <div className="text-[10px] text-text-subtle mt-1 text-right">{expressionDescription.length}/200</div>
        </div>

        {!f.isFormulaTested && formula.trim().length > 0 && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 text-xs font-medium flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 shrink-0"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            <span>Please click <strong>Test Formula</strong> to validate calculations before saving.</span>
          </div>
        )}

        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={f.handleCompute}
            disabled={f.isComputing || !formula.trim()}
            aria-busy={f.isComputing}
            className={`flex-1 h-11 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 border-[1.5px] ${f.isComputing || !formula.trim() ? 'bg-canvas text-text-subtle border-border cursor-not-allowed' : 'bg-surface border-border text-text-secondary hover:bg-canvas hover:border-border-strong shadow-sm cursor-pointer'}`}
          >
            {f.isComputing ? <span className="w-4 h-4 border-2 border-text-subtle border-t-transparent rounded-full animate-spin" /> : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><path d="M12 2v20M8 8h8M8 12h8M8 16h8" /></svg>}
            {f.isComputing ? 'Testing...' : 'Test Formula'}
          </button>
          <button
            type="button"
            onClick={f.handleSaveClick}
            disabled={!expressionName.trim() || !formula.trim() || f.isSaving || !f.isFormulaTested}
            aria-busy={f.isSaving}
            className={`flex-1 h-11 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 ${!expressionName.trim() || !formula.trim() || f.isSaving || !f.isFormulaTested
              ? 'bg-surface-2 text-text-subtle border border-border cursor-not-allowed'
              : f.saveStatus === 'success' ? 'bg-success hover:bg-success/80 text-white shadow-sm cursor-pointer'
                : f.saveStatus === 'error' ? 'bg-danger hover:bg-danger/80 text-white shadow-sm cursor-pointer'
                  : 'bg-brand hover:bg-brand-hover text-white shadow-sm cursor-pointer'}`}
          >
            {f.isSaving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : f.saveStatus === 'success' ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4"><path d="M20 6L9 17l-5-5" /></svg>
                : f.saveStatus === 'error' ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4"><path d="M18 6L6 18M6 6l12 12" /></svg>
                  : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>}
            {f.isSaving ? 'Saving...' : f.saveStatus === 'success' ? 'Saved!' : f.saveStatus === 'error' ? 'Failed' : editingLogicId ? 'Update Logic' : 'Save Logic'}
          </button>
        </div>

        {f.saveStatus === 'error' && f.saveError && (
          <div className="mt-2 text-[11px] font-semibold text-danger text-right animate-fadeIn">{f.saveError}</div>
        )}

        {f.computeResult !== null && (
          <div className="mt-3 p-4 rounded-xl bg-success/10 border-[1.5px] border-success/20 border-l-[5px] border-l-success shadow-sm animate-fadeIn space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold text-success uppercase tracking-widest">✓ Formula Output</div>
                <div className="text-[11px] text-success/80 mt-0.5">Computed {f.computeResult.length} sample points successfully</div>
              </div>
              <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center text-success">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4"><path d="M20 6L9 17l-5-5" /></svg>
              </div>
            </div>
            <div className="max-h-52 overflow-y-auto rounded-lg border border-success/20 bg-surface">
              <table className="w-full text-left border-collapse font-mono text-[10.5px]">
                <thead className="sticky top-0 bg-success/10 text-success font-sans font-bold text-2xs uppercase tracking-wider border-b border-success/20">
                  <tr><th className="p-2 pl-3 w-10">#</th><th className="p-2">Timestamp</th><th className="p-2 pr-3 text-right">Result</th></tr>
                </thead>
                <tbody className="divide-y divide-success/10 text-text-secondary">
                  {f.computeResult.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-canvas/30">
                      <td className="p-2 pl-3 text-text-subtle text-2xs">{rIdx + 1}</td>
                      <td className="p-2 text-text-muted">{row.timestamp ? String(row.timestamp).replace('T', ' ') : '—'}</td>
                      <td className="p-2 pr-3 text-right font-bold text-success">{typeof row.result === 'number' ? row.result.toFixed(4) : (row.result ?? row.value ?? '—')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {f.computeError && (
          <div className="mt-3 p-4 rounded-xl bg-danger/10 border-[1.5px] border-danger/20 border-l-[5px] border-l-danger shadow-sm flex items-start gap-3 animate-fadeIn">
            <div className="w-8 h-8 rounded-full bg-danger/10 flex items-center justify-center text-danger shrink-0">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4.5 h-4.5"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </div>
            <div>
              <div className="text-[10px] font-bold text-danger uppercase tracking-widest">⚠ Error in Formula</div>
              <div className="text-xs font-mono text-danger mt-1 leading-relaxed break-all">{f.computeError}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
