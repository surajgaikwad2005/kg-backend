import { createProxy } from '@/src/app/api/_lib/proxy';

export const { POST } = createProxy({ backend: 'CPCP', path: '/alternateRoutes', methods: ['POST'] });
