import { createProxy } from '@/src/app/api/_lib/proxy';

export const { PUT } = createProxy({
    backend: 'GROUP_MANAGEMENT',
    path: '/p0/userManagement/config',
    methods: ['PUT'],
});
