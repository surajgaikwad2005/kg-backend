import { createProxy } from '@/src/app/api/_lib/proxy';

export const { GET } = createProxy({
    backend: 'DEVELOPER_OPTIONS',
    path: '/reload',
    methods: ['GET'],
});
