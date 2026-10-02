import { createProxy } from '@/src/app/api/_lib/proxy';

export const { GET } = createProxy({ backend: 'CPCP', path: '/elementTypes', methods: ['GET'] });
