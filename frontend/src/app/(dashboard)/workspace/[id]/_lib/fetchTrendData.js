// industrial-data service removed from cpcp-configuration (out of the refactored
// contract) — disabled until this is rewired to a real backend.
// import { getVisualData } from '@/src/services/cpcp/industrial-data/industrialDataService';

export async function fetchTrendData(label) {
  // try {
  //   let startObj, endObj;
  //   const saved = localStorage.getItem('timeRange');
  //   if (saved) {
  //     const { start, end } = JSON.parse(saved);
  //     startObj = new Date(start);
  //     endObj = new Date(end);
  //   } else {
  //     endObj = new Date();
  //     startObj = new Date(endObj.getTime() - 24 * 60 * 60 * 1000);
  //   }
  //   const pad = n => n.toString().padStart(2, '0');
  //   const fmt = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  //
  //   const body = await getVisualData({
  //     start: fmt(startObj),
  //     end: fmt(endObj),
  //     tags: [label],
  //     dashboard_name: 'workspace_initial',
  //   });
  //   if (body.statusCode === 200) {
  //     const g = (body.data || []).find(i => i.tagGraph || i.graph)?.tagGraph ||
  //               (body.data || []).find(i => i.tagGraph || i.graph)?.graph;
  //     if (g && Array.isArray(g.x) && Array.isArray(g.y) && g.y.length > 0) {
  //       return g.x.map((xVal, i) => [
  //         typeof xVal === 'string' ? new Date(xVal.replace(' ', 'T')).getTime() : xVal,
  //         g.y[i],
  //       ]);
  //     }
  //   }
  // } catch {}
  return [];
}
