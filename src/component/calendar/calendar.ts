export const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;

export const HOUR_IN_MILLISECONDS = 60 * 60 * 1000;

export function addDays(date: Date, days: number): Date {
  return addMilliseconds(date, days * DAY_IN_MILLISECONDS);
}

export function addMilliseconds(date: Date, milliseconds: number): Date {
  return new Date(date.getTime() + milliseconds);
}

// The calendar date (YYYY-MM-DD) in UTC, the same everywhere on Earth at a given moment.
export function calendarDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

// The day number since 1970 in UTC, the same everywhere on Earth at a given moment.
export function dayNumber(date: Date): number {
  return Math.floor(date.getTime() / DAY_IN_MILLISECONDS);
}
