import { forwardRef, useEffect, useRef } from 'react';
import clsx from 'clsx';
import { useRerender } from '@react-next-calendar/hooks';

import * as TimeSlotUtils from '../utils/TimeSlots';
import TimeSlotGroup from './TimeSlotGroup';

interface TimeGutterProps {
  /**
   * in seconds to allow use this as dep for useEffect
   */
  min: number;
  /**
   * in seconds to allow use this as dep for useEffect
   */
  max: number;
  timeslots: number;
  step: number;

  components: Components;
  getters: Getters;
  localizer: Localizer;

  getNow: GetNow;
}

const TimeGutter = forwardRef<HTMLDivElement | null, TimeGutterProps>(
  (
    { min, max, timeslots, step, components, getters, localizer, getNow },
    ref,
  ) => {
    const rerender = useRerender();
    const slotMetrics = useRef(
      TimeSlotUtils.getSlotMetrics({
        min: new Date(min),
        max: new Date(max),
        timeslots,
        step,
      }),
    );

    useEffect(() => {
      slotMetrics.current = slotMetrics.current.update({
        min: new Date(min),
        max: new Date(max),
        timeslots,
        step,
      });
      rerender();
    }, [min, max, timeslots, step, rerender]);

    function renderSlot(date: Date, idx: number) {
      if (idx !== 0) {
        return null;
      }

      const isNow = slotMetrics.current.dateIsInGroup(getNow(), idx);
      return (
        <span className={clsx('rbc-label', isNow && 'rbc-now')}>
          {localizer.format(date, 'timeGutterFormat')}
        </span>
      );
    }

    return (
      <div className="rbc-time-gutter rbc-time-column" ref={ref}>
        {slotMetrics.current.groups.map((group, idx) => (
          <TimeSlotGroup
            key={idx}
            group={group}
            components={components}
            renderSlot={renderSlot}
            getters={getters}
          />
        ))}
      </div>
    );
  },
);

TimeGutter.displayName = 'TimeGutter';

export default TimeGutter;
