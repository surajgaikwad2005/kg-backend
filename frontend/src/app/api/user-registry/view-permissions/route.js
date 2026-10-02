import { createProxy } from '@/src/app/api/_lib/proxy';

export const { POST } = createProxy({
    backend: 'GROUP_MANAGEMENT',
    path: '/p0/userManagement/view',
    methods: ['POST'],
});
