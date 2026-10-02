'use client';
import { createContext, useContext, useReducer, useEffect, useMemo, useCallback } from 'react';
import { toBackendIndustry, toUiIndustry } from '@/src/lib/industry';

// localStorage keys — the durable backing store for the global selections so
// they survive reloads.
const LS_PLANT_ID = 'admin_plant_id';
const LS_INDUSTRY = 'admin_industry'; // stores the BACKEND enum (oil_gas / cement)

const AppContext = createContext(null);

// Demo build: authentication and plant selection are removed. The plant is
// pinned to a single static value so every plant-scoped query is enabled.
const initial = {
  user: { role: 'user', username: 'demo' },
  globalLoading: false,
  industry: null,
  plantId: { id: 'BOKOR', name: 'BOKOR' },
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_USER':
      if (state.user === action.payload) return state;
      return { ...state, user: action.payload };
    case 'SET_LOADING':
      if (state.globalLoading === action.payload) return state;
      return { ...state, globalLoading: action.payload };
    case 'SET_INDUSTRY':
      if (state.industry === action.payload) return state;
      return { ...state, industry: action.payload };
    case 'SET_PLANT_ID': {
      const plant = action.payload;
      const isSamePlant = state.plantId?.id === plant?.id && state.plantId?.industry === plant?.industry && state.plantId?.name === plant?.name;
      const uiInd = plant?.industry ? toUiIndustry(plant.industry) : null;
      const isSameIndustry = !uiInd || state.industry === uiInd;

      if (isSamePlant && isSameIndustry) return state;

      return {
        ...state,
        plantId: plant,
        ...(uiInd && uiInd !== state.industry ? { industry: uiInd } : {}),
      };
    }
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initial);

  const setUser = useCallback((user) => dispatch({ type: 'SET_USER', payload: user }), []);
  const setGlobalLoading = useCallback((loading) => dispatch({ type: 'SET_LOADING', payload: loading }), []);
  const setIndustry = useCallback((ind) => dispatch({ type: 'SET_INDUSTRY', payload: ind }), []);
  const setPlantId = useCallback((pid) => dispatch({ type: 'SET_PLANT_ID', payload: pid }), []);

  // Demo build: no localStorage auth/plant hydration — the initial state above
  // already pins the plant and a static demo user.

  // Persist the global selections to localStorage so every domain-config API can
  // read the actual values (context first, localStorage as the durable fallback).
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      if (state.plantId) localStorage.setItem(LS_PLANT_ID, JSON.stringify(state.plantId));
    } catch { /* ignore */ }
  }, [state.plantId]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const backend = toBackendIndustry(state.industry);
      if (backend) localStorage.setItem(LS_INDUSTRY, backend);
    } catch { /* ignore */ }
  }, [state.industry]);

  const value = useMemo(() => ({
    user:            state.user,
    globalLoading:   state.globalLoading,
    industry:        state.industry,
    // Backend-canonical industry enum, resolved from context → localStorage.
    // Send THIS to the backend (not the UI label).
    industryCode:    toBackendIndustry(state.industry)
                       || (typeof window !== 'undefined' ? localStorage.getItem(LS_INDUSTRY) : null)
                       || null,
    plantId:         state.plantId,
    plantCode:       state.plantId?.id || null,
    setUser,
    setGlobalLoading,
    setIndustry,
    setPlantId,
  }), [state.user, state.globalLoading, state.industry, state.plantId, setUser, setGlobalLoading, setIndustry, setPlantId]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
