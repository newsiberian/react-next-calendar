import * as dates from 'date-arithmetic';

export {
  milliseconds,
  seconds,
  minutes,
  hours,
  month,
  startOf,
  endOf,
  add,
  eq,
  gte,
  gt,
  lte,
  lt,
  inRange,
  min,
  max,
} from 'date-arithmetic';

const MILLI = {
  seconds: 1000,
  minutes: 1000 * 60,
  hours: 1000 * 60 * 60,
  day: 1000 * 60 * 60 * 24,
} as Record<Unit, number>;

const MONTHS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

/**
 * @deprecated
 *
 * @param year
 */
export function monthsInYear(year: number): Date[] {
  const date = new Date(year, 0, 1);

  return MONTHS.map(i => dates.month(date, i));
}

export function firstVisibleDay(
  date: Date,
  startOfWeek: dates.StartOfWeek,
): Date {
  const firstOfMonth = dates.startOf(date, 'month');

  return dates.startOf(firstOfMonth, 'week', startOfWeek);
}

export function lastVisibleDay(
  date: Date,
  startOfWeek: dates.StartOfWeek,
): Date {
  const endOfMonth = dates.endOf(date, 'month');

  return dates.endOf(endOfMonth, 'week', startOfWeek);
}

export function visibleDays(
  date: Date,
  startOfWeek: dates.StartOfWeek,
): Date[] {
  let current = firstVisibleDay(date, startOfWeek);
  const last = lastVisibleDay(date, startOfWeek);
  const days = [];

  while (dates.lte(current, last, 'day')) {
    days.push(current);
    current = dates.add(current, 1, 'day');
  }

  return days;
}

export function ceil(date: Date, unit: Exclude<Unit, 'week'>): Date {
  const floor = dates.startOf(date, unit);

  return dates.eq(floor, date) ? floor : dates.add(floor, 1, unit);
}

export function range(start: Date, end: Date, unit: Unit = 'day'): Date[] {
  let current = start;
  const days = [];

  while (dates.lte(current, end, unit)) {
    days.push(current);
    current = dates.add(current, 1, unit);
  }

  return days;
}

export function merge(date: undefined, time: undefined): null;
export function merge(date?: Date, time?: Date): Date;
export function merge(date?: Date, time?: Date): Date | null {
  if (!time && !date) {
    return null;
  }

  if (!time) {
    time = new Date();
  }
  if (!date) {
    date = new Date();
  }

  date = dates.startOf(date, 'day');
  date = dates.hours(date, dates.hours(time));
  date = dates.minutes(date, dates.minutes(time));
  date = dates.seconds(date, dates.seconds(time));
  return dates.milliseconds(date, dates.milliseconds(time));
}

/**
 * @deprecated
 * @param dateA
 * @param dateB
 */
export function eqTime(dateA: Date, dateB: Date): boolean {
  return (
    dates.hours(dateA) === dates.hours(dateB) &&
    dates.minutes(dateA) === dates.minutes(dateB) &&
    dates.seconds(dateA) === dates.seconds(dateB)
  );
}

/**
 * Determines is the given date is a date w/o time
 *
 * @param date
 */
export function isJustDate(date: Date): boolean {
  return (
    dates.hours(date) === 0 &&
    dates.minutes(date) === 0 &&
    dates.seconds(date) === 0 &&
    dates.milliseconds(date) === 0
  );
}

export function diff(
  dateA: Date,
  dateB: Date,
  unit?: Exclude<Unit, 'week'>,
): number {
  if (!unit || unit === 'milliseconds') {
    return Math.abs(+dateA - +dateB);
  }

  // the .round() handles an edge case with DST where the total won't be exact
  // since one day in the range may be shorter/longer by an hour
  return Math.round(
    Math.abs(
      +dates.startOf(dateA, unit) / MILLI[unit] -
        +dates.startOf(dateB, unit) / MILLI[unit],
    ),
  );
}

export function total(date: Date, unit: Unit): number {
  const ms = date.getTime();
  let div = 1;

  switch (unit) {
    case 'week':
      div *= 7;
      break;
    case 'day':
      div *= 24;
      break;
    case 'hours':
      div *= 60;
      break;
    case 'minutes':
      div *= 60;
      break;
    case 'seconds':
      div *= 1000;
      break;
  }

  return ms / div;
}

export function week(date: Date): number {
  const d = new Date(date);
  d.setHours(0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  return Math.ceil(
    ((d.getTime() - new Date(d.getFullYear(), 0, 1).getTime()) / 8.64e7 + 1) /
      7,
  );
}

export function today(): Date {
  return dates.startOf(new Date(), 'day');
}

/**
 * @deprecated
 */
export function yesterday(): Date {
  return dates.add(dates.startOf(new Date(), 'day'), -1, 'day');
}

/**
 * @deprecated
 */
export function tomorrow(): Date {
  return dates.add(dates.startOf(new Date(), 'day'), 1, 'day');
}
