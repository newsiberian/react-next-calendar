import * as dates from './dates';

export function endOfRange(
  dateRange: Date[],
  unit: Unit = 'day',
): {
  first: Date;
  last: Date;
} {
  return {
    first: dateRange[0],
    last: dates.add(dateRange[dateRange.length - 1], 1, unit),
  };
}

export function eventSegments(calEvent: RNC.Event, range: Date[]): Segment {
  const { first, last } = endOfRange(range);

  const slots = dates.diff(first, last, 'day');
  const start = dates.max(dates.startOf(calEvent.start, 'day'), first);
  const end = dates.min(dates.ceil(calEvent.end, 'day'), last);

  const padding = range.findIndex((x: Date) => dates.eq(x, start, 'day'));
  let span = dates.diff(start, end, 'day');

  span = Math.min(span, slots);
  span = Math.max(span, 1);

  return {
    event: calEvent,
    span,
    left: padding + 1,
    right: Math.max(padding + span, 1),
  };
}

export function eventLevels(
  rowSegments: Segment[],
  limit = Infinity,
): {
  levels: Segment[][];
  extra: Segment[];
} {
  let i: number;
  let j: number;
  let seg: Segment;
  const levels = [] as Segment[][];
  const extra = [] as Segment[];

  for (i = 0; i < rowSegments.length; i++) {
    seg = rowSegments[i];

    for (j = 0; j < levels.length; j++) {
      if (!segsOverlap(seg, levels[j])) {
        break;
      }
    }

    if (j >= limit) {
      extra.push(seg);
    } else {
      (levels[j] || (levels[j] = [])).push(seg);
    }
  }

  for (i = 0; i < levels.length; i++) {
    levels[i].sort((a, b) => a.left - b.left);
  }

  return { levels, extra };
}

export function inRange(calEvent: RNC.Event, start: Date, end: Date): boolean {
  const eStart = dates.startOf(calEvent.start, 'day');
  const eEnd = calEvent.end;

  const startsBeforeEnd = dates.lte(eStart, end, 'day');
  // when the event is zero duration we need to handle a bit differently
  const endsAfterStart = !dates.eq(eStart, eEnd, 'minutes')
    ? dates.gt(eEnd, start, 'minutes')
    : dates.gte(eEnd, start, 'minutes');

  return startsBeforeEnd && endsAfterStart;
}

export function segsOverlap(seg: Segment, otherSegs: Segment[]): boolean {
  return otherSegs.some(
    otherSeg => otherSeg.left <= seg.right && otherSeg.right >= seg.left,
  );
}

export function sortEvents(calEventA: RNC.Event, calEventB: RNC.Event): number {
  const startSort =
    +dates.startOf(calEventA.start, 'day') -
    +dates.startOf(calEventB.start, 'day');

  const durA = dates.diff(
    calEventA.start,
    dates.ceil(calEventA.end, 'day'),
    'day',
  );

  const durB = dates.diff(
    calEventB.start,
    dates.ceil(calEventB.end, 'day'),
    'day',
  );

  return (
    // sort by start Day first
    startSort ||
    // events spanning multiple days go first
    Math.max(durB, 1) - Math.max(durA, 1) ||
    // then allDay single day events
    +(calEventB.allDay || 0) - +(calEventA.allDay || 0) ||
    // then sort by start time
    +calEventA.start - +calEventB.start
  );
}
