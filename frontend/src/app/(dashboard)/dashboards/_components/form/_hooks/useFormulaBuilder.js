'use client';
import { useState, useEffect } from 'react';
import { useTestExpression } from '../../../_queries/useDashboardQueries';
import { useApp } from '@/src/context/AppContext';

export function useFormulaBuilder({ editingLogicId, formula, setFormula, availableTags, formulaInputRef, onSaveFormula }) {
  const { plantId } = useApp();
  const plantCode = plantId?.id || 'cdm_copy';
  const { mutateAsync: testExpressionAsync } = useTestExpression(plantCode);
  const [isComputing, setIsComputing] = useState(false);
  const [computeResult, setComputeResult] = useState(null);
  const [computeError, setComputeError] = useState(null);
  const [formulaSuggestions, setFormulaSuggestions] = useState([]);
  const [currentTypingWord, setCurrentTypingWord] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [testedFormula, setTestedFormula] = useState(null);

  useEffect(() => {
    setTestedFormula(null);
    setComputeResult(null);
    setComputeError(null);
  }, [editingLogicId]);

  useEffect(() => {
    if (testedFormula !== null && formula.trim() !== testedFormula.trim()) {
      setTestedFormula(null);
      setComputeResult(null);
      setComputeError(null);
    }
  }, [formula, testedFormula]);

  const handleFormulaChange = (e) => {
    const val = e.target.value;
    setFormula(val);
    const cursorPosition = e.target.selectionStart;
    const textBeforeCursor = val.slice(0, cursorPosition);
    const words = textBeforeCursor.split(/[\s+\-*/()]+/);
    const lastWord = words[words.length - 1];
    if (lastWord.length > 0) {
      setCurrentTypingWord(lastWord);
      const matches = availableTags.filter(t => {
        const id = typeof t === 'string' ? t : (t.id || t.value || t.label || '');
        const label = typeof t === 'string' ? '' : (t.label || '');
        const desc = typeof t === 'string' ? '' : (t.description || '');
        return id.toLowerCase().includes(lastWord.toLowerCase()) ||
          label.toLowerCase().includes(lastWord.toLowerCase()) ||
          desc.toLowerCase().includes(lastWord.toLowerCase());
      });
      const uniqueMatches = [];
      const seenIds = new Set();
      for (const t of matches) {
        const id = typeof t === 'string' ? t : (t.id || t.value || t.label || '');
        if (id && !seenIds.has(id)) { seenIds.add(id); uniqueMatches.push(t); }
      }
      setFormulaSuggestions(uniqueMatches);
    } else {
      setCurrentTypingWord('');
      setFormulaSuggestions([]);
    }
  };

  const insertSuggestion = (tag) => {
    const textarea = formulaInputRef.current;
    if (!textarea) return;
    const cursorPosition = textarea.selectionStart;
    const textBeforeCursor = formula.slice(0, cursorPosition);
    const textAfterCursor = formula.slice(cursorPosition);
    const replacement = typeof tag === 'string' ? tag : (tag.id || tag.value || tag.label || '');
    const wrappedReplacement = `(${replacement})`;
    const newTextBeforeCursor = textBeforeCursor.slice(0, -currentTypingWord.length) + wrappedReplacement;
    setFormula(newTextBeforeCursor + textAfterCursor);
    setFormulaSuggestions([]);
    setCurrentTypingWord('');
    setTimeout(() => {
      textarea.focus();
      const newCursor = newTextBeforeCursor.length;
      textarea.selectionStart = newCursor;
      textarea.selectionEnd = newCursor;
    }, 0);
  };

  const handleCompute = async () => {
    setIsComputing(true);
    setComputeResult(null);
    setComputeError(null);
    setTestedFormula(null);
    try {
      const json = await testExpressionAsync(formula);
      const results = json?.data?.results || json?.data?.execution?.data || [];
      if (json?.success || results.length > 0) {
        setComputeResult(results.length > 0 ? results : [{ message: 'success', result: json?.data?.execution?.data?.[0]?.value ?? 0, timestamp: new Date().toISOString() }]);
        setTestedFormula(formula);
      } else {
        throw new Error(json.message || 'No successful rows computed');
      }
    } catch (e) {
      let msg = e.message;
      if (e.data?.detail?.message) msg = e.data.detail.message;
      else if (typeof e.data?.detail === 'string') msg = e.data.detail;
      setComputeError(msg);
    } finally {
      setIsComputing(false);
    }
  };

  const handleSaveClick = async () => {
    setIsSaving(true);
    setSaveStatus(null);
    setSaveError(null);
    try {
      await onSaveFormula();
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (e) {
      setSaveStatus('error');
      setSaveError(e.message || 'Failed to save logic');
    } finally {
      setIsSaving(false);
    }
  };

  const isFormulaTested = testedFormula !== null && formula !== null && formula.trim() === testedFormula.trim();

  return {
    isComputing, computeResult, computeError,
    formulaSuggestions, currentTypingWord, isSaving, saveStatus, saveError,
    isFormulaTested,
    handleFormulaChange, insertSuggestion, handleCompute, handleSaveClick,
  };
}
