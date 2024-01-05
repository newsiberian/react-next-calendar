import { getStyledEvents } from '../../packages/core/src/utils/DayEventLayout';
import { getSlotMetrics } from '../../packages/core/src/utils/TimeSlots';
import { dates } from '../../packages/utils/src';

describe('getStyledEvents', () => {
  const d = (...args: number[]) => new Date(2015, 3, 1, ...args);
  const min = dates.startOf(d(), 'day');
  const max = dates.endOf(d(), 'day');
  const slotMetrics = getSlotMetrics({ min, max, step: 30, timeslots: 4 });
  const dayLayoutAlgorithm = 'overlap';

  describe('matrix', () => {
    [
      [
        'single event',
        [{ start: d(11), end: d(12) }],
        [{ width: 100, xOffset: 0 }],
      ],
      [
        'two consecutive events',
        [
          { start: d(11), end: d(11, 10) },
          { start: d(11, 10), end: d(11, 20) },
        ],
        [
          { width: 100, xOffset: 0 },
          { width: 100, xOffset: 0 },
        ],
      ],
      [
        'two consecutive events too close together',
        [
          { start: d(11), end: d(11, 5) },
          { start: d(11, 5), end: d(11, 10) },
        ],
        [
          { width: 85, xOffset: 0 },
          { width: 50, xOffset: 50 },
        ],
      ],
      [
        'two overlapping events',
        [
          { start: d(11), end: d(12) },
          { start: d(11), end: d(12) },
        ],
        [
          { width: 85, xOffset: 0 },
          { width: 50, xOffset: 50 },
        ],
      ],
      [
        'three overlapping events',
        [
          { start: d(11), end: d(12) },
          { start: d(11), end: d(12) },
          { start: d(11), end: d(12) },
        ],
        [
          { width: 56, xOffset: 0 },
          { width: 56, xOffset: 33 },
          { width: 33, xOffset: 66 },
        ],
      ],
      [
        'one big event overlapping with two consecutive events',
        [
          { start: d(11), end: d(12) },
          { start: d(11), end: d(11, 30) },
          { start: d(11, 30), end: d(12) },
        ],
        [
          { width: 85, xOffset: 0 },
          { width: 50, xOffset: 50 },
          { width: 50, xOffset: 50 },
        ],
      ],
      [
        'one big event overlapping with two consecutive events starting too close together',
        [
          { start: d(11), end: d(12) },
          { start: d(11), end: d(11, 5) },
          { start: d(11, 5), end: d(11, 10) },
        ],
        [
          { width: 56, xOffset: 0 },
          { width: 56, xOffset: 33 },
          { width: 33, xOffset: 66 },
        ],
      ],
    ].forEach(([title, events, expectedResults]) => {
      it(title as string, () => {
        const styledEvents = getStyledEvents({
          events,
          slotMetrics,
          minimumStartDifference: 10,
          dayLayoutAlgorithm,
        } as GetStyledEventsOptions);

        const results = styledEvents.map(result => ({
          width: Math.floor(Number(result.style.width)),
          xOffset: Math.floor(Number(result.style.xOffset)),
        }));
        expect(results).toEqual(expectedResults);
      });
    });
  });
});
