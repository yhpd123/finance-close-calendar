const DATE_TIME_SUFFIX = 'T12:00:00';

export function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDateKey(value: string): Date {
  return new Date(`${value}${DATE_TIME_SUFFIX}`);
}

export function toMiddayDate(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12);
}

export function addDays(date: Date, amount: number): Date {
  const next = toMiddayDate(date);
  next.setDate(next.getDate() + amount);
  return next;
}

export function addMonths(date: Date, amount: number): Date {
  const targetYear = date.getFullYear();
  const targetMonth = date.getMonth() + amount;
  const probe = new Date(targetYear, targetMonth + 1, 0, 12);
  const day = Math.min(date.getDate(), probe.getDate());
  return new Date(probe.getFullYear(), probe.getMonth(), day, 12);
}

export function diffInCalendarDays(laterDate: Date, earlierDate: Date): number {
  const later = toMiddayDate(laterDate).getTime();
  const earlier = toMiddayDate(earlierDate).getTime();
  return Math.round((later - earlier) / 86_400_000);
}

export function isSameDay(left: Date, right: Date): boolean {
  return formatDateKey(left) === formatDateKey(right);
}

export function isWithinInclusive(date: Date, start: Date, end: Date): boolean {
  const time = toMiddayDate(date).getTime();
  return time >= toMiddayDate(start).getTime() && time <= toMiddayDate(end).getTime();
}

export function getMonthStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1, 12);
}

export function getMonthEnd(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 12);
}

export function createRecurringDate(year: number, monthIndex: number, dayOfMonth: number): Date {
  const lastDay = new Date(year, monthIndex + 1, 0, 12).getDate();
  return new Date(year, monthIndex, Math.min(dayOfMonth, lastDay), 12);
}

export function formatLongDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function formatTimeLabel(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatMonthLabel(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function formatShortDate(value: string | Date): string {
  const date = typeof value === 'string' ? parseDateKey(value) : value;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export function weekdayLabels(): string[] {
  return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
}
