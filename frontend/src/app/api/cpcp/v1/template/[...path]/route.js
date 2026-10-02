import { createCatchAllProxy } from '@/src/app/api/_lib/proxy';

/**
 * Catch-all proxy for the /cpcpv1/template API.
 * Maps /api/cpcp/v1/template/* directly to the CPCP_CONFIGURATION backend.
 */
export const { GET, POST, PUT, DELETE, PATCH } = createCatchAllProxy({
    backend: 'CPCP_CONFIGURATION',
    path: '/cpcpv1/template',
});
