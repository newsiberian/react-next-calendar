import {
  useCallback,
  useEffect,
  useRef,
  useState,
  SyntheticEvent,
} from 'react';
import clsx from 'clsx';
import memoize from 'memoize-one';
import * as animationFrame from 'dom-helpers/animationFrame';
import { dates, inRange, sortEvents } from '@react-next-calendar/utils';

import { notify } from '../utils/helpers';
import { Resources } from '../utils/Resources';
import { DayColumn } from './DayColumn';
import { TimeGutter } from './TimeGutter';
import { TimeGridHeader } from './TimeGridHeader';

export type TimeGridProps = {
  events: RNC.Event[];
  resources?: Resource[];

  step: number;
  timeslots?: number;
  range: Date[];
  min?: Date;
  max?: Date;

  scrollToTime?: Date;
  showMultiDayTimes?: boolean;

  dayLayoutAlgorithm: DayLayoutAlgorithm;

  width?: number;

  components: Components;

  selected?: RNC.Event;
  selectable: Selectable;
  longPressThreshold: number;

  getDrilldownView: GetDrilldownView;
  getNow: GetNow;

  onSelecting?: OnSelecting;
  onSelectEvent: <P>(args: P) => void;
  onSelectSlot: (slotInfo: SlotInfo) => void;
  onDoubleClickEvent: <P>(args: P) => void;
  onKeyPressEvent: <P>(args: P) => void;
  onDrillDown: (date: Date, view: View) => void;
};

export function TimeGrid({
  events,
  resources,

  step,
  timeslots = 2,
  range,
  min = dates.startOf(new Date(), 'day'),
  max = dates.endOf(new Date(), 'day'),

  scrollToTime = dates.startOf(new Date(), 'day'),
  showMultiDayTimes,

  width,

  components,

  selected,
  selectable,
  longPressThreshold,

  getDrilldownView,
  getNow,

  onSelecting,
  onSelectEvent,
  onSelectSlot,
  onDoubleClickEvent,
  onKeyPressEvent,
  onDrillDown,

  dayLayoutAlgorithm,
}: TimeGridProps) {
  const [gutterWidth, setGutterWidth] = useState<number>();
  const [isOverflowing, setIsOverflowing] = useState<boolean>(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const scrollRatio = useRef<number | null>(null);
  const measureGutterAnimationFrameRequest = useRef<number>();

  const measureGutter = useCallback(
    function measureGutter() {
      if (measureGutterAnimationFrameRequest.current) {
        window.cancelAnimationFrame(measureGutterAnimationFrameRequest.current);
      }
      measureGutterAnimationFrameRequest.current = window.requestAnimationFrame(
        () => {
          if (gutterRef.current) {
            const { width } = gutterRef.current.getBoundingClientRect();

            if (width && gutterWidth !== width) {
              setGutterWidth(width);
            }
          }
        },
      );
    },
    [gutterWidth],
  );

  const applyScroll = useCallback(function applyScroll() {
    if (contentRef.current && typeof scrollRatio.current === 'number') {
      contentRef.current.scrollTop =
        contentRef.current.scrollHeight * scrollRatio.current;
      // Only do this once
      scrollRatio.current = null;
    }
  }, []);

  const calculateScroll = useCallback(
    function calculateScroll() {
      const diffMillis =
        scrollToTime.getTime() - dates.startOf(scrollToTime, 'day').getTime();

      if (diffMillis === 0) {
        scrollRatio.current = null;
      } else {
        const totalMillis = max.getTime() - min.getTime();
        scrollRatio.current = diffMillis / totalMillis;
      }
    },
    [scrollToTime, max, min],
  );

  useEffect(() => {
    let rafHandle: number | void;

    function handleResize() {
      if (typeof rafHandle === 'number') {
        animationFrame.cancel(rafHandle);
      }
      rafHandle = animationFrame.request(checkOverflow);
    }

    function checkOverflow() {
      if (!contentRef.current) {
        return;
      }

      setIsOverflowing(
        contentRef.current.scrollHeight > contentRef.current.clientHeight,
      );
    }

    calculateScroll();
    checkOverflow();
    applyScroll();

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);

      if (typeof rafHandle === 'number') {
        animationFrame.cancel(rafHandle);
      }

      if (typeof measureGutterAnimationFrameRequest.current === 'number') {
        window.cancelAnimationFrame(measureGutterAnimationFrameRequest.current);
      }
    };
  }, []);

  useEffect(() => {
    if (typeof width !== 'number') {
      measureGutter();
    }

    applyScroll();
  }, [width, measureGutter, applyScroll]);

  useEffect(() => {
    calculateScroll();
  }, [range, scrollToTime, calculateScroll]);

  function handleScroll(e: SyntheticEvent<HTMLDivElement, Event>) {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = (e.target as HTMLDivElement).scrollLeft;
    }
  }

  function handleSelectAllDayEvent<P>(...args: P[]): void {
    notify(onSelectEvent, ...args);
  }

  function handleSelectAllDaySlot(slots: Date[], slot: Slot): void {
    notify(onSelectSlot, {
      slots,
      start: slots[0],
      end: slots[slots.length - 1],
      action: slot.action,
      resourceId: slot.resourceId,
    });
  }

  const memoizedResources = memoize(resources => Resources(resources));

  function renderEvents(range: Date[], events: RNC.Event[], now: Date) {
    const res = memoizedResources(resources);
    const groupedEvents = res.groupEvents(events);

    return res.map(([id, resource], resourceIndex) =>
      range.map((date, rangeIndex) => {
        const daysEvents = (groupedEvents.get(id) || []).filter(event =>
          dates.inRange(date, event.start, event.end, 'day'),
        );

        return (
          <DayColumn
            key={resourceIndex + '-' + rangeIndex}
            events={daysEvents}
            step={step}
            date={date}
            min={dates.merge(date, min)}
            max={dates.merge(date, max)}
            getNow={getNow}
            isNow={dates.eq(date, now, 'day')}
            components={components}
            timeslots={timeslots}
            selected={selected}
            selectable={selectable}
            longPressThreshold={longPressThreshold}
            onSelecting={onSelecting}
            onSelectSlot={onSelectSlot}
            onSelectEvent={onSelectEvent}
            onDoubleClickEvent={onDoubleClickEvent}
            onKeyPressEvent={onKeyPressEvent}
            resourceId={(resource && id) || undefined}
            dayLayoutAlgorithm={dayLayoutAlgorithm}
          />
        );
      }),
    );
  }

  const start = range[0];
  const end = range[range.length - 1];

  const allDayEvents: RNC.Event[] = [];
  const rangeEvents: RNC.Event[] = [];

  events.forEach(event => {
    if (inRange(event, start, end)) {
      const eStart = event.start;
      const eEnd = event.end;

      if (
        event.allDay ||
        (dates.isJustDate(eStart) && dates.isJustDate(eEnd)) ||
        (!showMultiDayTimes && !dates.eq(eStart, eEnd, 'day'))
      ) {
        allDayEvents.push(event);
      } else {
        rangeEvents.push(event);
      }
    }
  });

  allDayEvents.sort((a, b) => sortEvents(a, b));

  return (
    <div
      className={clsx('rbc-time-view', resources && 'rbc-time-view-resources')}
    >
      <TimeGridHeader
        range={range}
        events={allDayEvents}
        width={width || gutterWidth}
        getNow={getNow}
        selected={selected}
        resources={memoizedResources(resources)}
        selectable={selectable}
        components={components}
        scrollRef={scrollRef}
        isOverflowing={isOverflowing}
        longPressThreshold={longPressThreshold}
        onSelectSlot={handleSelectAllDaySlot}
        onSelectEvent={handleSelectAllDayEvent}
        onDoubleClickEvent={onDoubleClickEvent}
        onKeyPressEvent={onKeyPressEvent}
        onDrillDown={onDrillDown}
        getDrilldownView={getDrilldownView}
      />

      <div
        ref={contentRef}
        className="rbc-time-content"
        onScroll={handleScroll}
      >
        <TimeGutter
          ref={gutterRef}
          min={dates.merge(start, min).getTime()}
          max={dates.merge(start, max).getTime()}
          step={step}
          getNow={getNow}
          timeslots={timeslots}
          components={components}
        />

        {renderEvents(range, rangeEvents, getNow())}
      </div>
    </div>
  );
}
