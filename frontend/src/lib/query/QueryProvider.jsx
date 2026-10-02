'use client';

import { useState, lazy, Suspense } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { makeQueryClient } from './queryClient';

// The NODE_ENV check must wrap the lazy() CALL, not just the JSX that renders
// it. `process.env.NODE_ENV` is statically replaced at build time, so in a
// production build this whole branch folds to `null` and the bundler never has
// to resolve the specifier at all. With the import() at module scope instead,
// the module stays in the graph regardless of the render guard — and a deploy
// running `npm ci --omit=dev` (devtools not installed) would fail the build
// with "Module not found", because resolution happens at parse time.
const Devtools =
    process.env.NODE_ENV !== 'production'
        ? lazy(() =>
              import('@tanstack/react-query-devtools').then((m) => ({ default: m.ReactQueryDevtools })),
          )
        : null;

export function QueryProvider({ children }) {
    // useState, never module scope: a module-level client is shared across
    // requests during SSR and would leak one user's cached data into another
    // user's response. (Enforced by @tanstack/query/stable-query-client.)
    const [client] = useState(makeQueryClient);

    return (
        <QueryClientProvider client={client}>
            {children}
            {Devtools && (
                <Suspense fallback={null}>
                    <Devtools initialIsOpen={false} buttonPosition="bottom-left" />
                </Suspense>
            )}
        </QueryClientProvider>
    );
}
