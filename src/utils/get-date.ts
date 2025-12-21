import { endOfDay, startOfDay } from 'date-fns';

export function getDate(): { start: Date; end: Date } {
  const now = new Date();
  const start = startOfDay(now);
  const end = endOfDay(now);
  return { start, end };
}
