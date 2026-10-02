import { createProxy } from '@/src/app/api/_lib/proxy';

export const { GET } = createProxy({
    backend: 'DEVELOPER_OPTIONS',
    path: '/health',
    methods: ['GET'],
});
