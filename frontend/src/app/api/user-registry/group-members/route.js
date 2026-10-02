import { createProxy } from '@/src/app/api/_lib/proxy';

export const { GET } = createProxy({
    backend: 'GROUP_MANAGEMENT',
    path: '/p0/userManagement/groupMembers',
    methods: ['GET'],
});
