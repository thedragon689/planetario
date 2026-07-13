export interface AstroEvent {
  id: string;
  title: string;
  date: string;
  type: string;
  description: string;
  scene?: string;
  objectId?: string;
}

export interface AstroEventsData {
  events: AstroEvent[];
  timeline: Array<{ year: number; event: string }>;
}

export function getUpcomingEvents(data: AstroEventsData, withinDays = 90, fromDate = new Date()) {
  const now = fromDate.getTime();
  const limit = now + withinDays * 86400000;
  return (data.events || [])
    .map((e) => ({ ...e, ts: new Date(e.date).getTime() }))
    .filter((e) => e.ts >= now && e.ts <= limit)
    .sort((a, b) => a.ts - b.ts);
}

export function getEventsThisMonth(data: AstroEventsData, fromDate = new Date()) {
  const y = fromDate.getFullYear();
  const m = fromDate.getMonth();
  return (data.events || []).filter((e) => {
    const d = new Date(e.date);
    return d.getFullYear() === y && d.getMonth() === m;
  });
}

export function formatEventDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return iso;
  }
}
