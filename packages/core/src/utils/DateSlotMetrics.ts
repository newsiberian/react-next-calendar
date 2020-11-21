import memoizeOne from 'memoize-one';

import * as dates from './dates';
import { eventSegments, endOfRange, eventLevels } from './eventLevels';

const isSegmentInSlot = (seg: Segment, slot: number) =>
  seg.left <= slot && seg.right >= slot;

const isEqual = (a: DateSlotMetricsOptions[], b: DateSlotMetricsOptions[]) =>
  a[0].range === b[0].range && a[0].events === b[0].events;

export function getSlotMetrics(): (
  options: DateSlotMetricsOptions,
) => DateSlotMetrics<DateSlotMetricsOptions> {
  return memoizeOne((options: DateSlotMetricsOptions): DateSlotMetrics<
    DateSlotMetricsOptions
  > => {
    const { range, events, maxRows, minRows, accessors } = options;
    const { first, last } = endOfRange(range);

    const segments = events.map(evt => eventSegments(evt, range, accessors));

    const { levels, extra } = eventLevels(segments, Math.max(maxRows - 1, 1));

    while (levels.length < minRows) levels.push([]);

    return {
      first,
      last,

      levels,
      extra,
      range,
      slots: range.length,

      clone(args) {
        const metrics = getSlotMetrics();
        return metrics({ ...options, ...args });
      },

      getDateForSlot(slotNumber) {
        return range[slotNumber];
      },

      /**
       * @deprecated
       * @param {Date} date
       */
      getSlotForDate(date) {
        return range.find(r => dates.eq(r, date, 'day'));
      },

      getEventsForSlot(slot) {
        return segments
          .filter(seg => isSegmentInSlot(seg, slot))
          .map(seg => seg.event);
      },

      continuesPrior(event: RNC.Event): boolean {
        return dates.lt(accessors.start(event), first, 'day');
      },

      continuesAfter(event: RNC.Event): boolean {
        const eventEnd = accessors.end(event);
        const singleDayDuration = dates.eq(
          accessors.start(event),
          eventEnd,
          'minutes',
        );

        return singleDayDuration
          ? dates.gte(eventEnd, last, 'minutes')
          : dates.gt(eventEnd, last, 'minutes');
      },
    };
  }, isEqual);
}
