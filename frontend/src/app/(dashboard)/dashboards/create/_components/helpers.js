export function formatTime(ts, interval) {
  const d = new Date(ts);
  if (!interval || interval.endsWith('d')) return `${d.getMonth() + 1}/${d.getDate()}`;
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}
