import {
  useCallback,
  useEffect,
  useRef,
  useState,
  KeyboardEvent,
  MouseEvent,
} from 'react';
import clsx from 'clsx';
import {
  useLatest,
  usePrevious,
  useSelection,
  getBoundsForNode,
  isEvent,
} from '@react-next-calendar/hooks';
import { dates, isSelected } from '@react-next-calendar/utils';

import { useCalendar } from '../model/calendarContext';
import { useLocalizer } from '../model/localizerContext';
import * as TimeSlotUtils from '../utils/TimeSlots';
import { notify } from '../utils/helpers';
import * as DayEventLayout from '../utils/DayEventLayout';
import { TimeSlotGroup } from './TimeSlotGroup';
import { TimeGridEvent } from './TimeGridEvent';

export type DayColumnProps = {
  events: RNC.Event[];
  step: number;
  date: Date;
  min: Date;
  max: Date;
  getNow: () => Date;
  isNow: boolean;

  components: Components;
  getters: Getters;

  timeslots?: number;

  selected?: RNC.Event;
  selectable: Selectable;
  longPressThreshold: number;

  onSelecting?: OnSelecting;
  onSelectSlot: (slotInfo: SlotInfo) => void;
  onSelectEvent: <P>(args: P) => void;
  onDoubleClickEvent: <P>(args: P) => void;
  onKeyPressEvent: <P>(args: P) => void;

  resourceId?: string | number;

  dayLayoutAlgorithm: DayLayoutAlgorithm;
};

export function DayColumn({
  events,
  step,
  date,
  min,
  max,
  getNow,
  isNow,

  components,
  getters,

  timeslots = 2,

  selected,
  selectable,
  longPressThreshold,

  onSelecting,
  onSelectSlot,
  onSelectEvent,
  onDoubleClickEvent,
  onKeyPressEvent,

  resourceId,

  dayLayoutAlgorithm,
}: DayColumnProps) {
  const { rtl } = useCalendar();
  const localizer = useLocalizer();
  // we need most of these as refs because Selection doesn't see state changes
  // internally

  const [selecting, setSelecting] = useState<boolean>(false);
  const selectingLatest = useLatest(selecting);
  const [selection, setSelection] = useState<RNC.Selection>(
    {} as RNC.Selection,
  );
  // TODO: let initial be undefined or null
  const selectionLatest = useLatest(selection);
  // default state must be non-equal to selectable, so it is not a boolean
  const [prevSelectable, setPrevSelectable] = useState<Selectable | null>(null);
  // This is a current time position, a line at the day slot
  const [timeIndicatorPosition, setTimeIndicatorPosition] = useState<
    number | null
  >(null);
  const prevGetNow = usePrevious(getNow);
  const prevIsNow = usePrevious(isNow);
  const prevDate = usePrevious(date);
  const prevMin = usePrevious(min);
  const prevMax = usePrevious(max);
  const prevTimeIndicatorPosition = usePrevious(timeIndicatorPosition);
  const dayRef = useRef<HTMLDivElement>(null);
  const intervalTriggered = useRef<boolean>(false);
  const [timeSlotMetrics, setTimeSlotMetrics] = useState(
    TimeSlotUtils.getSlotMetrics({
      min: new Date(min),
      max: new Date(max),
      timeslots,
      step,
    }),
  );
  const timeSlotMetricsLatest = useLatest(timeSlotMetrics);
  // const timeSlotMetrics = useRef(
  //   TimeSlotUtils.getSlotMetrics({
  //     min: new Date(min),
  //     max: new Date(max),
  //     timeslots,
  //     step,
  //   }),
  // );
  const timeIndicatorTimeout = useRef<number | null>(null);
  const initialSlot = useRef<Date>();

  const { dayProp, ...restGetters } = getters;
  const { eventContainerWrapper: EventContainer, ...restComponents } =
    components;
  const { className, style } = dayProp(max);

  const [on] = useSelection(dayRef, selectable, {
    longPressThreshold,
  });

  const positionTimeIndicator = useCallback(() => {
    const current = getNow();

    if (current >= min && current <= max) {
      const top = timeSlotMetricsLatest.current.getCurrentTimePosition(current);
      intervalTriggered.current = true;
      setTimeIndicatorPosition(top);
    } else {
      clearTimeIndicatorInterval();
    }
  }, [getNow, min, max]);

  /**
   * @param tail {Boolean} - whether `positionTimeIndicator` call should be
   *   deferred or called upon setting interval (`true` - if deferred);
   */
  const setTimeIndicatorPositionUpdateInterval = useCallback(
    (tail = false) => {
      if (!intervalTriggered.current && !tail) {
        positionTimeIndicator();
      }

      timeIndicatorTimeout.current = window.setTimeout(() => {
        intervalTriggered.current = true;
        positionTimeIndicator();
        setTimeIndicatorPositionUpdateInterval();
      }, 60000);
    },
    [positionTimeIndicator],
  );

  const selectSlot = useCallback(
    ({
      startDate,
      endDate,
      action,
      bounds,
      box,
    }: {
      startDate: Date;
      endDate: Date;
      action: ActionType;
      bounds?: SelectedRect;
      box?: Point;
    }) => {
      let current = startDate;
      const slots = [];

      while (dates.lte(current, endDate)) {
        slots.push(current);
        // using Date ensures not to create an endless loop the day DST begins
        current = new Date(+current + step * 60 * 1000);
      }

      notify(onSelectSlot, {
        slots,
        start: startDate,
        end: endDate,
        // TODO: resourceId could be staled. test it and use useLatest
        resourceId,
        action,
        bounds,
        box,
      });
    },
    [onSelectSlot, resourceId, step],
  );

  useEffect(() => {
    if (isNow) {
      setTimeIndicatorPositionUpdateInterval();
    }

    return () => {
      clearTimeIndicatorInterval();
    };
  }, []);

  useEffect(() => {
    setTimeSlotMetrics(prevState =>
      prevState.update({
        min: new Date(min),
        max: new Date(max),
        step,
        timeslots,
      }),
    );
  }, [min, max, timeslots, step]);

  useEffect(() => {
    function initSelectable() {
      const maybeSelect = (box: InitialSelection | SelectedRect) => {
        const state = getSelectionState(box);
        const { startDate: start, endDate: end } = state;

        if (onSelecting) {
          if (
            (dates.eq(selectionLatest.current.startDate, start, 'minutes') &&
              dates.eq(selectionLatest.current.endDate, end, 'minutes')) ||
            // TODO: resourceId could be staled here. use useLatest?
            !onSelecting({ start, end, resourceId })
          ) {
            return;
          }
        }

        if (
          selectionLatest.current.start !== state.start ||
          selectionLatest.current.end !== state.end
        ) {
          setSelection(state);
        }

        if (!selectingLatest.current) {
          setSelecting(true);
        }
      };

      const getSelectionState = (
        point: Point | SelectedRect,
      ): RNC.Selection => {
        let currentSlot = timeSlotMetricsLatest.current.closestSlotFromPoint(
          point,
          getBoundsForNode(dayRef.current as HTMLDivElement),
        );

        if (!selectingLatest.current) {
          initialSlot.current = currentSlot;
        }

        let initial = initialSlot.current as Date;

        if (dates.lte(initial, currentSlot)) {
          currentSlot = timeSlotMetricsLatest.current.nextSlot(currentSlot);
        } else if (dates.gt(initial, currentSlot)) {
          initial = timeSlotMetricsLatest.current.nextSlot(initial);
        }

        const selectRange = timeSlotMetricsLatest.current.getRange(
          dates.min(initial, currentSlot),
          dates.max(initial, currentSlot),
        );

        return {
          ...selectRange,
          top: `${selectRange.top}%`,
          height: `${selectRange.height}%`,
        };
      };

      const selectorClicksHandler = (
        box: Point,
        actionType: ActionType,
      ): void => {
        if (dayRef.current && !isEvent(dayRef.current, box)) {
          const { startDate, endDate } = getSelectionState(box);
          selectSlot({
            startDate,
            endDate,
            action: actionType,
            box,
          });
        }
        setSelecting(false);
      };

      on('selecting', maybeSelect);
      on('selectStart', maybeSelect);

      on('beforeSelect', (box: InitialSelection) => {
        if (selectable !== 'ignoreEvents') {
          return;
        }

        return !isEvent(dayRef.current as HTMLDivElement, box);
      });

      on('click', (box: Point) => selectorClicksHandler(box, 'click'));

      on('doubleClick', (box: Point) =>
        selectorClicksHandler(box, 'doubleClick'),
      );

      on('select', (bounds: SelectedRect) => {
        if (selectingLatest.current) {
          selectSlot({
            startDate: selectionLatest.current.startDate,
            endDate: selectionLatest.current.endDate,
            action: 'select',
            bounds,
          });
          setSelecting(false);
        }
      });

      on('reset', () => {
        if (selectingLatest.current) {
          setSelecting(false);
        }
      });
    }

    if (selectable !== prevSelectable) {
      if (selectable) {
        initSelectable();
      }

      setPrevSelectable(selectable);
    }
  }, [selectable, prevSelectable, on, onSelecting, resourceId, selectSlot]);

  useEffect(() => {
    const getNowChanged = !dates.eq(prevGetNow(), getNow(), 'minutes');

    if (prevIsNow !== isNow || getNowChanged) {
      clearTimeIndicatorInterval();

      if (isNow) {
        const tail =
          !getNowChanged &&
          dates.eq(prevDate, date, 'minutes') &&
          prevTimeIndicatorPosition === timeIndicatorPosition;

        setTimeIndicatorPositionUpdateInterval(tail);
      }
    } else if (
      isNow &&
      (!dates.eq(prevMin, min, 'minutes') || !dates.eq(prevMax, max, 'minutes'))
    ) {
      positionTimeIndicator();
    }
  }, [
    date,
    getNow,
    isNow,
    min,
    max,
    timeIndicatorPosition,
    positionTimeIndicator,
    setTimeIndicatorPositionUpdateInterval,
  ]);

  function clearTimeIndicatorInterval() {
    intervalTriggered.current = false;
    if (typeof timeIndicatorTimeout.current === 'number') {
      window.clearTimeout(timeIndicatorTimeout.current);
    }
  }

  function handleSelect(...args: [event: RNC.Event, e: MouseEvent]) {
    notify(onSelectEvent, ...args);
  }

  function handleDoubleClick(...args: [event: RNC.Event, e: MouseEvent]) {
    notify(onDoubleClickEvent, ...args);
  }

  function handleKeyPress(...args: [event: RNC.Event, e: KeyboardEvent]) {
    notify(onKeyPressEvent, ...args);
  }

  function renderEvents() {
    const { messages } = localizer;

    const styledEvents = DayEventLayout.getStyledEvents({
      events,
      slotMetrics: timeSlotMetrics,
      minimumStartDifference: Math.ceil((step * timeslots) / 2),
      dayLayoutAlgorithm,
    });

    return styledEvents.map(({ event, style }, idx) => {
      const { start, end } = event;
      let format = 'eventTimeRangeFormat';
      let label;

      const startsBeforeDay = timeSlotMetrics.startsBeforeDay(start);
      const startsAfterDay = timeSlotMetrics.startsAfterDay(end);

      if (startsBeforeDay) {
        format = 'eventTimeRangeEndFormat';
      } else if (startsAfterDay) {
        format = 'eventTimeRangeStartFormat';
      }

      if (startsBeforeDay && startsAfterDay) {
        label = messages.allDay;
      } else {
        label = localizer.format({ start, end }, format);
      }

      const continuesEarlier =
        startsBeforeDay || timeSlotMetrics.startsBefore(start);
      const continuesLater = startsAfterDay || timeSlotMetrics.startsAfter(end);

      return (
        <TimeGridEvent
          style={style}
          event={event}
          label={label}
          key={'evt_' + idx}
          getters={getters}
          components={components}
          continuesEarlier={continuesEarlier}
          continuesLater={continuesLater}
          selected={isSelected(event, selected)}
          onClick={(e: MouseEvent) => handleSelect(event, e)}
          onDoubleClick={(e: MouseEvent) => handleDoubleClick(event, e)}
          onKeyPress={(e: KeyboardEvent) => handleKeyPress(event, e)}
        />
      );
    });
  }

  return (
    <div
      style={style}
      className={clsx(
        className,
        'rbc-day-slot',
        'rbc-time-column',
        isNow && 'rbc-now',
        isNow && 'rbc-today', // WHY
        selecting && 'rbc-slot-selecting',
      )}
      ref={dayRef}
    >
      {timeSlotMetrics.groups.map((grp, idx) => (
        <TimeSlotGroup
          key={idx}
          group={grp}
          resourceId={resourceId}
          getters={restGetters}
          components={restComponents}
        />
      ))}

      <EventContainer
        rootRef={dayRef}
        slotMetrics={timeSlotMetrics}
        resourceId={resourceId}
        components={restComponents}
        getters={restGetters}
      >
        <div className={clsx('rbc-events-container', rtl && 'rtl')}>
          {renderEvents()}
        </div>
      </EventContainer>

      {selecting && (
        <div
          className="rbc-slot-selection"
          style={{
            top: selection.top,
            height: selection.height,
          }}
        >
          <span>
            {localizer.format(
              {
                start: selection.startDate,
                end: selection.endDate,
              },
              'selectRangeFormat',
            )}
          </span>
        </div>
      )}

      {isNow && intervalTriggered.current && (
        <div
          className="rbc-current-time-indicator"
          style={{ top: `${timeIndicatorPosition}%` }}
        />
      )}
    </div>
  );
}
