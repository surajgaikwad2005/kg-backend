import { createProxy } from '@/src/app/api/_lib/proxy';

export const { GET } = createProxy({
  backend: 'DASHBOARDS',
  path: '/dashboard/expression/expressionList',
  methods: ['GET'],
});
