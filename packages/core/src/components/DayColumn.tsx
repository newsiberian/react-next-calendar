import * as React from 'react';
import clsx from 'clsx';

import usePrevious from '../hooks/usePrevious';
import useRerender from '../hooks/useRerender';
import useSelection, { getBoundsForNode, isEvent } from '../hooks/useSelection';
import * as dates from '../utils/dates';
import * as TimeSlotUtils from '../utils/TimeSlots';
import { isSelected } from '../utils/selection';
import { notify } from '../utils/helpers';
import * as DayEventLayout from '../utils/DayEventLayout';
import TimeSlotGroup from './TimeSlotGroup';
import TimeGridEvent from './TimeGridEvent';

interface DayColumnProps {
  events: RNC.Event[];
  step: number;
  date: Date;
  min: Date;
  max: Date;
  getNow: () => Date;
  isNow: boolean;

  rtl: boolean;

  accessors: Accessors;
  components: Components;
  getters: Getters;
  localizer: Localizer;

  timeslots?: number;

  selected?: RNC.Event;
  selectable: Selectable;
  longPressThreshold: number;

  onSelecting?: OnSelecting;
  onSelectSlot: (slotInfo: SlotInfo) => void;
  onSelectEvent: <P>(args: P) => void;
  onDoubleClickEvent: <P>(args: P) => void;
  onKeyPressEvent: <P>(args: P) => void;

  resourceId: string | number | Record<string, undefined> | null;

  dayLayoutAlgorithm: DayLayoutAlgorithm;
}

export default function DayColumn({
  events,
  step,
  date,
  min,
  max,
  getNow,
  isNow,

  rtl,

  accessors,
  components,
  getters,
  localizer,

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
}: DayColumnProps): React.ReactElement {
  // we need most of these as refs because Selection doesn't see state changes
  // internally

  const selecting = React.useRef<boolean>(false);
  // TODO: let initial be undefined or null
  const selectionRef = React.useRef<RNC.Selection>({} as RNC.Selection);
  const rerender = useRerender();
  // default state must be non-equal to selectable, so it is not a boolean
  const [prevSelectable, setPrevSelectable] = React.useState<Selectable | null>(
    null,
  );
  // This is a current time position, a line at the day slot
  const [timeIndicatorPosition, setTimeIndicatorPosition] = React.useState<
    number | null
  >(null);
  const prevGetNow = usePrevious(getNow);
  const prevIsNow = usePrevious(isNow);
  const prevDate = usePrevious(date);
  const prevMin = usePrevious(min);
  const prevMax = usePrevious(max);
  const prevTimeIndicatorPosition = usePrevious(timeIndicatorPosition);
  const dayRef = React.useRef<HTMLDivElement>(null);
  const intervalTriggered = React.useRef<boolean>(false);
  const timeSlotMetrics = React.useRef(
    TimeSlotUtils.getSlotMetrics({
      min: new Date(min),
      max: new Date(max),
      timeslots,
      step,
    }),
  );
  const timeIndicatorTimeout = React.useRef<number | null>(null);
  const initialSlot = React.useRef<Date>();

  const { dayProp, ...restGetters } = getters;
  const {
    eventContainerWrapper: EventContainer,
    ...restComponents
  } = components;
  const { className, style } = dayProp(max);

  const [on] = useSelection(dayRef, selectable, {
    longPressThreshold,
  });

  const positionTimeIndicator = React.useCallback(() => {
    const current = getNow();

    if (current >= min && current <= max) {
      const top = timeSlotMetrics.current.getCurrentTimePosition(current);
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
  const setTimeIndicatorPositionUpdateInterval = React.useCallback(
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

  const selectSlot = React.useCallback(
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
        resourceId,
        action,
        bounds,
        box,
      });
    },
    [onSelectSlot, resourceId, step],
  );

  React.useEffect(() => {
    if (isNow) {
      setTimeIndicatorPositionUpdateInterval();
    }

    return () => {
      clearTimeIndicatorInterval();
    };
  }, []);

  React.useEffect(() => {
    timeSlotMetrics.current = timeSlotMetrics.current.update({
      min: new Date(min),
      max: new Date(max),
      step,
      timeslots,
    });
    rerender();
  }, [min, max, timeslots, step, rerender]);

  React.useEffect(() => {
    function initSelectable() {
      const maybeSelect = (box: InitialSelection | SelectedRect) => {
        const state = getSelectionState(box);
        const { startDate: start, endDate: end } = state;

        if (onSelecting) {
          if (
            (dates.eq(selectionRef.current.startDate, start, 'minutes') &&
              dates.eq(selectionRef.current.endDate, end, 'minutes')) ||
            !onSelecting({ start, end, resourceId })
          ) {
            return;
          }
        }

        if (
          selectionRef.current.start !== state.start ||
          selectionRef.current.end !== state.end
        ) {
          selectionRef.current = state;
          rerender();
        }

        if (!selecting.current) {
          selecting.current = true;
        }
      };

      const getSelectionState = (
        point: Point | SelectedRect,
      ): RNC.Selection => {
        let currentSlot = timeSlotMetrics.current.closestSlotFromPoint(
          point,
          getBoundsForNode(dayRef.current as HTMLDivElement),
        );

        if (!selecting.current) {
          initialSlot.current = currentSlot;
        }

        let initial = initialSlot.current as Date;

        if (dates.lte(initial, currentSlot)) {
          currentSlot = timeSlotMetrics.current.nextSlot(currentSlot);
        } else if (dates.gt(initial, currentSlot)) {
          initial = timeSlotMetrics.current.nextSlot(initial);
        }

        const selectRange = timeSlotMetrics.current.getRange(
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
        selecting.current = false;
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
        if (selecting.current) {
          selectSlot({
            startDate: selectionRef.current.startDate,
            endDate: selectionRef.current.endDate,
            action: 'select',
            bounds,
          });
          selecting.current = false;
          rerender();
        }
      });

      on('reset', () => {
        if (selecting.current) {
          selecting.current = false;
          rerender();
        }
      });
    }

    if (selectable !== prevSelectable) {
      if (selectable) {
        initSelectable();
      }

      setPrevSelectable(selectable);
    }
  }, [
    selectable,
    prevSelectable,
    on,
    onSelecting,
    resourceId,
    selectSlot,
    rerender,
  ]);

  React.useEffect(() => {
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

  function handleSelect(...args: [event: RNC.Event, e: React.MouseEvent]) {
    notify(onSelectEvent, ...args);
  }

  function handleDoubleClick(...args: [event: RNC.Event, e: React.MouseEvent]) {
    notify(onDoubleClickEvent, ...args);
  }

  function handleKeyPress(...args: [event: RNC.Event, e: React.KeyboardEvent]) {
    notify(onKeyPressEvent, ...args);
  }

  function renderEvents() {
    const { messages } = localizer;

    const styledEvents = DayEventLayout.getStyledEvents({
      events,
      accessors,
      slotMetrics: timeSlotMetrics.current,
      minimumStartDifference: Math.ceil((step * timeslots) / 2),
      dayLayoutAlgorithm,
    });

    return styledEvents.map(({ event, style }, idx) => {
      const end = accessors.end(event);
      const start = accessors.start(event);
      let format = 'eventTimeRangeFormat';
      let label;

      const startsBeforeDay = timeSlotMetrics.current.startsBeforeDay(start);
      const startsAfterDay = timeSlotMetrics.current.startsAfterDay(end);

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
        startsBeforeDay || timeSlotMetrics.current.startsBefore(start);
      const continuesLater =
        startsAfterDay || timeSlotMetrics.current.startsAfter(end);

      return (
        <TimeGridEvent
          style={style}
          event={event}
          label={label}
          key={'evt_' + idx}
          getters={getters}
          rtl={rtl}
          components={components}
          continuesEarlier={continuesEarlier}
          continuesLater={continuesLater}
          accessors={accessors}
          selected={isSelected(event, selected)}
          onClick={(e: React.MouseEvent) => handleSelect(event, e)}
          onDoubleClick={(e: React.MouseEvent) => handleDoubleClick(event, e)}
          onKeyPress={(e: React.KeyboardEvent) => handleKeyPress(event, e)}
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
        selecting.current && 'rbc-slot-selecting',
      )}
      ref={dayRef}
    >
      {timeSlotMetrics.current.groups.map((grp, idx) => (
        <TimeSlotGroup
          key={idx}
          group={grp}
          resourceId={resourceId}
          getters={restGetters}
          components={restComponents}
        />
      ))}

      <EventContainer
        localizer={localizer}
        resource={resourceId}
        accessors={accessors}
        getters={restGetters}
        components={restComponents}
        slotMetrics={timeSlotMetrics.current}
      >
        <div className={clsx('rbc-events-container', rtl && 'rtl')}>
          {renderEvents()}
        </div>
      </EventContainer>

      {selecting.current && (
        <div
          className="rbc-slot-selection"
          style={{
            top: selectionRef.current.top,
            height: selectionRef.current.height,
          }}
        >
          <span>
            {localizer.format(
              {
                start: selectionRef.current.startDate,
                end: selectionRef.current.endDate,
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
