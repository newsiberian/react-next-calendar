import * as React from 'react';
import {
  NoopWrapper,
  TimeGridEvent,
  useCalendarContext,
  usePluginsContext,
} from '@react-next-calendar/core';
import {
  useLatest,
  useSelection,
  getBoundsForNode,
  getEventNodeFromPoint,
} from '@react-next-calendar/hooks';
import { dates } from '@react-next-calendar/utils';

import { dragAccessors } from './common';
import { DraggableContext } from './useDragAndDrop';

export interface EventContainerWrapperProps {
  slotMetrics: TimeSlotMetrics;

  children: React.ReactElement;

  resourceId?: string | number;

  rootRef: React.RefObject<HTMLDivElement>;

  accessors: Accessors;
  components: Components;
  getters: Getters;
  localizer: Localizer;
}

const pointInColumn = (
  bounds: NodeBounds,
  { x, y }: { x: number; y: number },
): boolean => {
  const { left, right, top } = bounds;
  return x < right + 10 && x > left && y > top;
};

function EventContainerWrapper({
  rootRef,
  children,
  slotMetrics,
  resourceId,
  accessors,
  components,
  getters,
  localizer,
}: EventContainerWrapperProps): React.ReactElement {
  const { rtl } = useCalendarContext();
  const context = usePluginsContext<{
    draggable: DraggableContext;
  }>();
  const actionLatest = useLatest(context.draggable.dragAndDropAction);
  const [initialized, setInitialized] = React.useState<boolean>(false);
  const [top, setTop] = React.useState<number | 'inherit'>('inherit');
  const [height, setHeight] = React.useState<number | 'inherit'>('inherit');
  const [event, setEvent] = React.useState<RNC.Event>();
  const eventLatest = useLatest(event);
  const eventOffsetTop = React.useRef<number>(0);
  const container = rootRef.current?.closest(
    '.rbc-time-view',
  ) as HTMLDivElement | null;

  const [on] = useSelection(
    { current: container },
    // TODO: pass selectable here vvv
    true,
  );

  React.useEffect(() => {
    if (!initialized) {
      initSelectable();
      setInitialized(true);
    }
  }, [initialized, on]);

  function reset() {
    setTop('inherit');
    setHeight('inherit');
    setEvent(undefined);
  }

  function update(range: {
    startDate: Date;
    endDate: Date;
    top: number;
    height: number;
  }): void {
    if (
      eventLatest.current &&
      range.startDate === eventLatest.current.start &&
      range.endDate === eventLatest.current.end
    ) {
      return;
    }

    setTop(range.top);
    setHeight(range.height);
    setEvent({
      ...(actionLatest.current.event as RNC.Event),
      start: range.startDate,
      end: range.endDate,
    });
  }

  function handleMove(point: SelectedRect, bounds: NodeBounds): void {
    if (!pointInColumn(bounds, point)) {
      reset();
      return;
    }

    const currentSlot = slotMetrics.closestSlotFromPoint(
      { y: point.y - eventOffsetTop.current, x: point.x } as Point,
      bounds,
    );

    const eventStart = accessors.start(actionLatest.current.event as RNC.Event);
    const eventEnd = accessors.end(actionLatest.current.event as RNC.Event);
    const end = dates.add(
      currentSlot,
      dates.diff(eventStart, eventEnd, 'minutes'),
      'minutes',
    );

    update(slotMetrics.getRange(currentSlot, end, false, true));
  }

  function handleResize(point: SelectedRect, bounds: NodeBounds): void {
    let start;
    let end;
    const currentSlot = slotMetrics.closestSlotFromPoint(point, bounds);

    if (actionLatest.current.direction === 'UP') {
      end = accessors.end(actionLatest.current.event as RNC.Event);
      start = dates.min(currentSlot, slotMetrics.closestSlotFromDate(end, -1));
    } else if (actionLatest.current.direction === 'DOWN') {
      start = accessors.start(actionLatest.current.event as RNC.Event);
      end = dates.max(currentSlot, slotMetrics.closestSlotFromDate(start));
    }

    update(slotMetrics.getRange(start as Date, end as Date));
  }

  function handleDropFromOutside(point: Point, bounds: NodeBounds): void {
    const start = slotMetrics.closestSlotFromPoint(
      { y: point.y, x: point.x } as Point,
      bounds,
    );

    // todo is this ok to call this from `dragOverFromOutside`?
    context.draggable.onDropFromOutside &&
      context.draggable.onDropFromOutside({
        start,
        end: slotMetrics.nextSlot(start),
        allDay: false,
        resource: resourceId,
      });
  }

  function initSelectable() {
    let isBeingDragged = false;

    on('beforeSelect', (point: InitialSelection): boolean | void => {
      if (!actionLatest.current.action) {
        return false;
      }
      if (actionLatest.current.action === 'resize') {
        return pointInColumn(
          getBoundsForNode(rootRef.current as HTMLDivElement),
          point,
        );
      }

      const eventNode = getEventNodeFromPoint(
        rootRef.current as HTMLDivElement,
        point,
      );

      if (!eventNode) {
        return false;
      }

      eventOffsetTop.current =
        point.y - getBoundsForNode(eventNode as HTMLElement).top;
    });

    on('selectStart', () => {
      isBeingDragged = true;
      context.draggable.onStart();
    });

    on('select', (point: SelectedRect): void => {
      const bounds = getBoundsForNode(rootRef.current as HTMLDivElement);
      isBeingDragged = false;
      if (!eventLatest.current || !pointInColumn(bounds, point)) {
        return;
      }
      handleInteractionEnd();
    });

    on('selecting', (box: SelectedRect): void => {
      const bounds = getBoundsForNode(rootRef.current as HTMLDivElement);
      if (actionLatest.current.action === 'move') {
        handleMove(box, bounds);
      } else if (actionLatest.current.action === 'resize') {
        handleResize(box, bounds);
      }
    });

    on('dropFromOutside', (point: Point): void => {
      if (!context.draggable.onDropFromOutside) {
        return;
      }

      const bounds = getBoundsForNode(rootRef.current as HTMLDivElement);

      if (!pointInColumn(bounds, point)) {
        return;
      }

      handleDropFromOutside(point, bounds);
    });

    on('dragOverFromOutside', (point: Point): void => {
      if (!context.draggable.dragFromOutsideItem) {
        return;
      }

      const bounds = getBoundsForNode(rootRef.current as HTMLDivElement);

      // TODO: probably we should fire dragFromOutsideItem here?
      handleDropFromOutside(point, bounds);
    });

    on('click', () => {
      if (isBeingDragged) {
        reset();
      }
      context.draggable.onEnd(null);
    });

    on('reset', () => {
      reset();
      context.draggable.onEnd(null);
    });
  }

  function handleInteractionEnd() {
    context.draggable.onEnd({
      event: eventLatest.current,
      start: (eventLatest.current as RNC.Event).start,
      end: (eventLatest.current as RNC.Event).end,
      resourceId,
    });

    reset();
  }

  if (!event) {
    return children;
  }

  // This part of the component becomes available while the user drags an event
  // from the TimeGridHeader to DayColumns
  const events = children.props.children;
  const { start, end } = event;

  let label;
  let format = 'eventTimeRangeFormat';

  const startsBeforeDay = slotMetrics.startsBeforeDay(start);
  const startsAfterDay = slotMetrics.startsAfterDay(end);

  if (startsBeforeDay) {
    format = 'eventTimeRangeEndFormat';
  } else if (startsAfterDay) {
    format = 'eventTimeRangeStartFormat';
  }

  if (startsBeforeDay && startsAfterDay) {
    label = localizer.messages.allDay;
  } else {
    label = localizer.format({ start, end }, format);
  }

  return React.cloneElement(children, {
    children: (
      <React.Fragment>
        {events}

        {event && (
          <TimeGridEvent
            event={event}
            label={label}
            className="rbc-addons-dnd-drag-preview"
            style={{ top, height, width: 100 }}
            getters={getters}
            components={
              { ...components, eventWrapper: NoopWrapper } as Components
            }
            accessors={{ ...accessors, ...dragAccessors }}
            continuesEarlier={startsBeforeDay}
            continuesLater={startsAfterDay}
            selected={false}
            rtl={rtl}
          />
        )}
      </React.Fragment>
    ),
  });
}

export default EventContainerWrapper;
