import { createProxy } from '@/src/app/api/_lib/proxy';

export const { GET, POST } = createProxy({
    backend: 'DEVELOPER_OPTIONS',
    path: '/schedule',
    methods: ['GET', 'POST'],
});
