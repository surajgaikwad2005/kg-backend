'use client';
import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { ConfirmDialog } from './ConfirmDialog';

const ConfirmContext = createContext(null);

/**
 * useConfirm()
 * Returns an async `openConfirm(message, options?)` function.
 * Resolves `true` when the user clicks Confirm, `false` on Cancel/close.
 *
 * Usage:
 *   const { openConfirm } = useConfirm();
 *   const ok = await openConfirm('Delete this item?');
 *   if (!ok) return;
 *
 * Rendering is delegated to the shared ConfirmDialog (built on ui/Modal), so
 * the app has ONE confirm implementation with two ergonomic APIs:
 * declarative (<ConfirmDialog …/>) and imperative (useConfirm()). This file
 * previously hand-rolled its own overlay — do not reintroduce one.
 */
export const useConfirm = () => {
    const ctx = useContext(ConfirmContext);
    if (!ctx) throw new Error('useConfirm must be used inside ConfirmProvider');
    return ctx;
};

export function ConfirmProvider({ children }) {
    const [state, setState] = useState({
        open: false,
        message: '',
        title: 'Confirm',
        confirmLabel: 'Confirm',
        cancelLabel: 'Cancel',
        variant: 'danger'
    });
    const resolveRef = useRef(null);
    const callbackRef = useRef(null);

    const openConfirm = useCallback((param1, param2 = {}) => {
        let opts = {};
        if (typeof param1 === 'object' && param1 !== null && !React.isValidElement(param1)) {
            opts = param1;
        } else {
            opts = { message: param1, ...param2 };
        }

        const {
            message = '',
            description = '',
            title = 'Are you sure?',
            confirmLabel = 'Confirm',
            cancelLabel = 'Cancel',
            variant = 'danger',
            intent,
            onConfirm = null,
        } = opts;

        const displayMessage = (typeof message === 'string' || React.isValidElement(message)) ? message : (description || '');
        const displayVariant = intent || variant || 'danger';

        return new Promise((resolve) => {
            resolveRef.current = resolve;
            callbackRef.current = onConfirm;
            setState({
                open: true,
                message: displayMessage,
                title,
                confirmLabel,
                cancelLabel,
                variant: displayVariant
            });
        });
    }, []);

    const settle = (result) => {
        const cb = callbackRef.current;
        setState(s => ({ ...s, open: false }));
        if (result && typeof cb === 'function') {
            cb();
        }
        resolveRef.current?.(result);
        resolveRef.current = null;
        callbackRef.current = null;
    };

    return (
        <ConfirmContext.Provider value={{ openConfirm }}>
            {children}
            <ConfirmDialog
                open={state.open}
                onClose={() => settle(false)}
                onConfirm={() => settle(true)}
                title={state.title}
                description={state.message}
                confirmLabel={state.confirmLabel}
                cancelLabel={state.cancelLabel}
                intent={state.variant}
            />
        </ConfirmContext.Provider>
    );
}
