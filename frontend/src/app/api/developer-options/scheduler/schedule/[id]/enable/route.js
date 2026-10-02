import { createProxy } from '@/src/app/api/_lib/proxy';

export const { POST } = createProxy({
    backend: 'DEVELOPER_OPTIONS',
    path: ({ id }) => `/schedule/${id}/enable`,
    methods: ['POST'],
});
