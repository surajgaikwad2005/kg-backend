'use client';

import { useState, useCallback, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';

/**
 * useUploadMutation — useMutation plus transient byte-level upload progress.
 *
 * The XHR transport stays exactly where it is. `uploadConnectorFileWithProgress`
 * (src/services/domain-configuration/common/connectorsService.js) uses
 * XMLHttpRequest because fetch cannot report upload progress, and TanStack Query
 * does not care what a mutationFn uses internally — it only needs a Promise,
 * which that function already returns.
 *
 * Progress lives in local state, NOT the query cache. It fires ~100x per upload;
 * writing it to the cache would re-render every subscriber of that cache entry
 * on each tick.
 *
 * Known gap, pre-existing and unchanged by this wrapper: AuthInterceptor patches
 * window.fetch only, so XHR uploads bypass the 401 refresh-and-replay path
 * entirely. A token that expires mid-upload surfaces as a plain 401 failure.
 *
 * @param {object}   opts
 * @param {Function} opts.mutationFn `(variables, { signal, onProgress }) => Promise`.
 *   `variables` is passed through EXACTLY as the caller supplied it — see below.
 */
export function useUploadMutation({ mutationFn, onMutate, ...options }) {
    const [progress, setProgress] = useState(0);
    const abortRef = useRef(null);

    const mutation = useMutation({
        // signal/onProgress travel as a SECOND argument, never merged into
        // `variables`. Spreading was the obvious-looking design and is wrong for
        // exactly the payloads this hook exists to carry: `{ ...formData }` is
        // `{}` (FormData's entries are not own enumerable properties), so the
        // upload would silently send no files at all. Same for a bare File/Blob,
        // and spreading a string would yield indexed characters.
        mutationFn: (variables) => {
            const controller = new AbortController();
            abortRef.current = controller;
            return mutationFn(variables, {
                signal: controller.signal,
                onProgress: setProgress,
            });
        },
        onMutate: async (variables) => {
            setProgress(0);
            return onMutate?.(variables);
        },
        ...options,
    });

    /** Cancel an in-flight upload. The XHR aborts via the AbortSignal it was given. */
    const abort = useCallback(() => {
        abortRef.current?.abort();
    }, []);

    const { reset: resetMutation } = mutation;
    const reset = useCallback(() => {
        setProgress(0);
        abortRef.current = null;
        resetMutation();
    }, [resetMutation]);

    return { ...mutation, progress, abort, reset };
}
