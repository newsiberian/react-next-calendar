import * as React from 'react';
import EventRow from '@react-next-calendar/core/src/components/EventRow';
import {
  useLatest,
  useSelection,
  getBoundsForNode,
} from '@react-next-calendar/hooks';
import {
  eventSegments,
  dates,
  getSlotAtX,
  pointInBox,
} from '@react-next-calendar/utils';
import { CalendarContext } from '@react-next-calendar/core/src';

import { dragAccessors } from './common';
import { DraggableContext } from './useDragAndDrop';

export interface WeekWrapperProps {
  children: React.ReactElement;
  isAllDay: boolean;
  slotMetrics: DateSlotMetrics;
  accessors: Accessors;
  resourceId: string | number;
  rootRef: React.RefObject<HTMLDivElement>;
}

const eventTimes = (
  event: RNC.Event,
  accessors: Accessors,
): { start: Date; end: Date } => {
  const start = accessors.start(event);
  const end = accessors.end(event);

  const isZeroDuration =
    dates.eq(start, end, 'minutes') && start.getMinutes() === 0;
  // make zero duration midnight events at least one day long
  const modifiedEnd = isZeroDuration ? dates.add(end, 1, 'day') : end;

  return { start, end: modifiedEnd };
};

function WeekWrapper({
  children,
  isAllDay,
  slotMetrics,
  accessors,
  resourceId,
  rootRef,
  ...props
}: WeekWrapperProps): React.ReactElement {
  const context = React.useContext(CalendarContext) as {
    draggable: DraggableContext;
  };
  const actionLatest = useLatest(context.draggable.dragAndDropAction);
  const [segment, setSegment] = React.useState<Segment | null>(null);
  const segmentLatest = useLatest(segment);
  const [initialized, setInitialized] = React.useState<boolean>(false);
  const container = rootRef.current?.closest(
    '.rbc-month-view, .rbc-time-view',
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

  const initSelectable = React.useCallback(() => {
    on('beforeSelect', (point: InitialSelection): boolean => {
      return (
        actionLatest.current.action === 'move' ||
        (actionLatest.current.action === 'resize' &&
          (!isAllDay ||
            pointInBox(
              getBoundsForNode(rootRef.current as HTMLDivElement),
              point,
            )))
      );
    });

    on('selecting', (box: SelectedRect) => {
      const bounds = getBoundsForNode(rootRef.current as HTMLDivElement);

      if (actionLatest.current.action === 'move') {
        handleMove(box, bounds);
      } else if (actionLatest.current.action === 'resize') {
        handleResize(box, bounds);
      }
    });

    on('selectStart', () => context.draggable.onStart());
    on('select', (point: SelectedRect): void => {
      const bounds = getBoundsForNode(rootRef.current as HTMLDivElement);

      if (segmentLatest.current) {
        handleInteractionEnd();

        if (!pointInBox(bounds, point)) {
          reset();
        } else {
          handleInteractionEnd();
        }
      }
    });

    on('dropFromOutside', (point: Point): void => {
      if (!context.draggable.onDropFromOutside) {
        return;
      }

      const bounds = getBoundsForNode(rootRef.current as HTMLDivElement);

      if (!pointInBox(bounds, point)) {
        return;
      }

      handleDropFromOutside(point, bounds);
    });

    on('dragOverFromOutside', (point: Point): void => {
      if (!context.draggable.dragFromOutsideItem) {
        return;
      }

      const bounds = getBoundsForNode(rootRef.current as HTMLDivElement);

      handleDragOverFromOutside(point, bounds);
    });

    on('click', () => context.draggable.onEnd(null));

    on('reset', () => {
      reset();
      context.draggable.onEnd(null);
    });
  }, [on]);

  function reset() {
    if (segmentLatest.current) {
      setSegment(null);
    }
  }

  function update(event: RNC.Event, start: Date, end: Date): void {
    const eventSegment = eventSegments(
      { ...event, end, start, __isPreview: true } as RNC.Event & {
        __isPreview: boolean;
      },
      slotMetrics.range,
      dragAccessors,
    );

    if (
      segmentLatest.current &&
      eventSegment.span === segmentLatest.current.span &&
      eventSegment.left === segmentLatest.current.left &&
      eventSegment.right === segmentLatest.current.right
    ) {
      return;
    }

    setSegment(eventSegment);
  }

  function handleMove(
    { x, y }: Point | SelectedRect,
    node: NodeBounds,
    // this event is defined when dragged from outside
    draggedEvent?: RNC.Event,
  ): void {
    const event = actionLatest.current.event || draggedEvent;

    if (!event) {
      return;
    }

    const rowBox = getBoundsForNode(node);

    if (!pointInBox(rowBox, { x, y })) {
      reset();
      return;
    }

    // Make sure to maintain the time of the start date while moving it to the new slot
    const start = dates.merge(
      slotMetrics.getDateForSlot(
        getSlotAtX(rowBox, x, false, slotMetrics.slots),
      ),
      accessors.start(event),
    );

    const end = dates.add(
      start,
      dates.diff(accessors.start(event), accessors.end(event), 'minutes'),
      'minutes',
    );

    update(event, start as Date, end);
  }

  function handleDropFromOutside(point: Point, rowBox: NodeBounds): void {
    if (context.draggable.onDropFromOutside) {
      const start = slotMetrics.getDateForSlot(
        getSlotAtX(rowBox, point.x, false, slotMetrics.slots),
      );

      context.draggable.onDropFromOutside({
        start,
        end: dates.add(start, 1, 'day'),
        allDay: false,
      });
    }
  }

  function handleDragOverFromOutside({ x, y }: Point, node: NodeBounds): void {
    if (context.draggable.dragFromOutsideItem) {
      handleMove(
        { x, y } as Point,
        node,
        context.draggable.dragFromOutsideItem(),
      );
    }
  }

  function handleResize(point: SelectedRect, node: NodeBounds): void {
    const { event, direction } = actionLatest.current;

    let { start, end } = eventTimes(event as RNC.Event, accessors);

    const rowBox = getBoundsForNode(node);
    const cursorInRow = pointInBox(rowBox, point);

    if (direction === 'RIGHT') {
      if (cursorInRow) {
        if (slotMetrics.last < start) {
          reset();
          return;
        }
        // add min
        end = dates.add(
          slotMetrics.getDateForSlot(
            getSlotAtX(rowBox, point.x, false, slotMetrics.slots),
          ),
          1,
          'day',
        );
      } else if (
        dates.inRange(start, slotMetrics.first, slotMetrics.last) ||
        (rowBox.bottom < point.y && +slotMetrics.first > +start)
      ) {
        end = dates.add(slotMetrics.last, 1, 'milliseconds');
      } else {
        setSegment(null);
        return;
      }

      end = dates.max(end, dates.add(start, 1, 'day'));
    } else if (direction === 'LEFT') {
      // in between Row
      if (cursorInRow) {
        if (slotMetrics.first > end) {
          reset();
          return;
        }

        start = slotMetrics.getDateForSlot(
          getSlotAtX(rowBox, point.x, false, slotMetrics.slots),
        );
      } else if (
        dates.inRange(end, slotMetrics.first, slotMetrics.last) ||
        (rowBox.top > point.y && +slotMetrics.last < +end)
      ) {
        start = dates.add(slotMetrics.first, -1, 'milliseconds');
      } else {
        reset();
        return;
      }

      start = dates.min(dates.add(end, -1, 'day'), start);
    }

    update(event as RNC.Event, start, end);
  }

  function handleInteractionEnd() {
    if (segmentLatest.current) {
      const { event } = segmentLatest.current;

      reset();

      context.draggable.onEnd({
        start: event.start,
        end: event.end,
        resourceId,
        isAllDay,
      });
    }
  }

  return (
    <div className="rbc-addons-dnd-row-body">
      {children}

      {segment && (
        <EventRow
          {...props}
          selected={undefined}
          className="rbc-addons-dnd-drag-row"
          segments={[segment]}
          accessors={{
            ...accessors,
            ...dragAccessors,
          }}
          slotMetrics={slotMetrics}
        />
      )}
    </div>
  );
}

export default WeekWrapper;
