import { createProxy } from '@/src/app/api/_lib/proxy';

export const { GET, PUT, DELETE } = createProxy({
    backend: 'DEVELOPER_OPTIONS',
    path: ({ id }) => `/schedule/${id}`,
    methods: ['GET', 'PUT', 'DELETE'],
});
