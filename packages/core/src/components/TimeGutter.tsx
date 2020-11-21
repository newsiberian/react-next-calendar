import * as React from 'react';
import clsx from 'clsx';

import useRerender from '../hooks/useRerender';
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
  resource: Resource;

  components: Components;
  getters: Getters;
  localizer: Localizer;

  getNow: GetNow;
}

const TimeGutter = React.forwardRef(function TimeGutter(
  {
    min,
    max,
    timeslots,
    step,
    resource,
    components,
    getters,
    localizer,
    getNow,
  }: TimeGutterProps,
  ref: React.ForwardedRef<HTMLDivElement | null>,
) {
  const rerender = useRerender();
  const slotMetrics = React.useRef(
    TimeSlotUtils.getSlotMetrics({
      min: new Date(min),
      max: new Date(max),
      timeslots,
      step,
    }),
  );

  React.useEffect(() => {
    slotMetrics.current = slotMetrics.current.update({
      min: new Date(min),
      max: new Date(max),
      timeslots,
      step,
    });
    rerender();
  }, [min, max, timeslots, step, rerender]);

  function renderSlot(date: Date, idx: number): React.ReactElement | null {
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
          resource={resource}
          components={components}
          renderSlot={renderSlot}
          getters={getters}
        />
      ))}
    </div>
  );
});

export default TimeGutter;
