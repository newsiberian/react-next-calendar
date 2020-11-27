import { dates } from '@react-next-calendar/utils';

const getDstOffset = (start: Date, end: Date) =>
  start.getTimezoneOffset() - end.getTimezoneOffset();

const getKey = ({
  min,
  max,
  step,
  timeslots,
}: TimeSlotMetricsOptions): string =>
  `${+dates.startOf(min, 'minutes')}` +
  `${+dates.startOf(max, 'minutes')}` +
  `${step}-${timeslots}`;

export function getSlotMetrics({
  min: start,
  max: end,
  step,
  timeslots,
}: TimeSlotMetricsOptions): TimeSlotMetrics<TimeSlotMetricsOptions> {
  const key = getKey({ min: start, max: end, step, timeslots });

  // if the start is on a DST-changing day but *after* the moment of DST
  // transition we need to add those extra minutes to our minutesFromMidnight
  const daystart = dates.startOf(start, 'day');
  const daystartdstoffset = getDstOffset(daystart, start);
  const totalMin =
    1 + dates.diff(start, end, 'minutes') + getDstOffset(start, end);
  const minutesFromMidnight =
    dates.diff(daystart, start, 'minutes') + daystartdstoffset;
  const numGroups = Math.ceil(totalMin / (step * timeslots));
  const numSlots = numGroups * timeslots;

  const groups = new Array(numGroups);
  const slots = new Array(numSlots);
  // Each slot date is created from "zero", instead of adding `step` to
  // the previous one, in order to avoid DST oddities
  for (let grp = 0; grp < numGroups; grp++) {
    groups[grp] = new Array(timeslots);

    for (let slot = 0; slot < timeslots; slot++) {
      const slotIdx = grp * timeslots + slot;
      const minFromStart = slotIdx * step;
      // A date with total minutes calculated from the start of the day
      slots[slotIdx] = groups[grp][slot] = new Date(
        start.getFullYear(),
        start.getMonth(),
        start.getDate(),
        0,
        minutesFromMidnight + minFromStart,
        0,
        0,
      );
    }
  }

  // Necessary to be able to select up until the last timeslot in a day
  const lastSlotMinFromStart = slots.length * step;
  slots.push(
    new Date(
      start.getFullYear(),
      start.getMonth(),
      start.getDate(),
      0,
      minutesFromMidnight + lastSlotMinFromStart,
      0,
      0,
    ),
  );

  function positionFromDate(date: Date): number {
    const diff = dates.diff(start, date, 'minutes') + getDstOffset(start, date);
    return Math.min(diff, totalMin);
  }

  return {
    groups,
    update(options: TimeSlotMetricsOptions) {
      if (getKey(options) !== key) {
        return getSlotMetrics(options);
      }
      return this;
    },

    dateIsInGroup(date: Date, groupIndex: number): boolean {
      const nextGroup = groups[groupIndex + 1];
      return dates.inRange(
        date,
        groups[groupIndex][0],
        nextGroup ? nextGroup[0] : end,
        'minutes',
      );
    },

    nextSlot(slot: Date): Date {
      const next = slots[Math.min(slots.indexOf(slot) + 1, slots.length - 1)];
      // in the case of the last slot we won't a long enough range so manually
      // get it
      if (next === slot) {
        return dates.add(slot, step, 'minutes');
      }
      return next;
    },

    closestSlotToPosition(percent: number): Date {
      const slot = Math.min(
        slots.length - 1,
        Math.max(0, Math.floor(percent * numSlots)),
      );
      return slots[slot];
    },

    closestSlotFromPoint(
      point: Point | SelectedRect,
      boundaryRect: NodeBounds,
    ): Date {
      const range = Math.abs(boundaryRect.top - boundaryRect.bottom);
      return this.closestSlotToPosition((point.y - boundaryRect.top) / range);
    },

    closestSlotFromDate(date: Date, offset = 0): Date {
      if (dates.lt(date, start, 'minutes')) {
        return slots[0];
      }

      const diffMins = dates.diff(start, date, 'minutes');
      return slots[(diffMins - (diffMins % step)) / step + offset];
    },

    startsBeforeDay(date: Date): boolean {
      return dates.lt(date, start, 'day');
    },

    startsAfterDay(date: Date): boolean {
      return dates.gt(date, end, 'day');
    },

    startsBefore(date: Date): boolean {
      return dates.lt(dates.merge(start, date), start, 'minutes');
    },

    startsAfter(date: Date): boolean {
      return dates.gt(dates.merge(end, date), end, 'minutes');
    },

    getRange(
      rangeStart: Date,
      rangeEnd: Date,
      ignoreMin?: boolean,
      ignoreMax?: boolean,
    ): {
      end: number;
      endDate: Date;
      height: number;
      start: number;
      startDate: Date;
      top: number;
    } {
      if (!ignoreMin) {
        rangeStart = dates.min(end, dates.max(start, rangeStart));
      }
      if (!ignoreMax) {
        rangeEnd = dates.min(end, dates.max(start, rangeEnd));
      }

      const rangeStartMin = positionFromDate(rangeStart);
      const rangeEndMin = positionFromDate(rangeEnd);
      const top =
        rangeEndMin > step * numSlots && !dates.eq(end, rangeEnd)
          ? ((rangeStartMin - step) / (step * numSlots)) * 100
          : (rangeStartMin / (step * numSlots)) * 100;

      return {
        top,
        height: (rangeEndMin / (step * numSlots)) * 100 - top,
        start: positionFromDate(rangeStart),
        startDate: rangeStart,
        end: positionFromDate(rangeEnd),
        endDate: rangeEnd,
      };
    },

    getCurrentTimePosition(rangeStart: Date): number {
      const rangeStartMin = positionFromDate(rangeStart);
      return (rangeStartMin / (step * numSlots)) * 100;
    },
  };
}
