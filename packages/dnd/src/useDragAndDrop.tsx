import * as React from 'react';
import clsx from 'clsx';
import useLatest from '@react-next-calendar/core/src/hooks/useLatest';

import EventWrapper from './EventWrapper';
import EventContainerWrapper from './EventContainerWrapper';
import WeekWrapper from './WeekWrapper';
import { mergeComponents } from './common';

interface InteractionInfo {
  event?: RNC.Event;
  start: Date;
  end: Date;
  resourceId?: string | number;
  isAllDay?: boolean;
}

export interface DragAndDropCalendarProps {
  onEventDrop: ({ event, start, end, resourceId }: InteractionInfo) => void;
  onEventResize: ({ event, start, end, resourceId }: InteractionInfo) => void;
  onDragStart: ({
    event,
    action,
    direction,
  }: {
    event: RNC.Event;
    action: DragAction;
    direction?: DragDirection;
  }) => void;
  onDragOver: (event: RNC.Event) => void;
  onDropFromOutside?: ({
    start,
    end,
    allDay,
    resource,
  }: {
    start: Date;
    end: Date;
    // TODO rename to isAllDay
    allDay: boolean;
    // TODO rename to resourceId
    resource?: string | number;
  }) => void;

  dragFromOutsideItem?: () => RNC.Event;

  draggableAccessor?: (event: RNC.Event) => boolean;
  resizableAccessor?: (event: RNC.Event) => boolean;

  selectable: Selectable;
  resizable: boolean;

  components: Components;

  elementProps?: React.HTMLAttributes<unknown>[] & React.MouseEventHandler[];
}

export interface DraggableContext {
  onStart: () => void;
  onEnd: (interactionInfo: InteractionInfo | null) => void;
  onBeginAction?: (
    event: RNC.Event,
    action: DragAction,
    direction?: DragDirection,
  ) => void;
  onDropFromOutside?: ({
    start,
    end,
    allDay,
    resource,
  }: {
    start: Date;
    end: Date;
    allDay: boolean;
    resource?: string | number;
  }) => void;
  dragFromOutsideItem?: () => RNC.Event;
  draggableAccessor?: (event: RNC.Event) => boolean;
  resizableAccessor?: (event: RNC.Event) => boolean;
  dragAndDropAction: {
    action: DragAction | null;
    direction: DragDirection | null;
    event: RNC.Event | null;
    interacting: boolean;
  };
}

/**
 * Creates a higher-order component (HOC) supporting drag & drop and optionally
 * resizing of events:
 *
 * ```js
 *    import Calendar from 'react-big-calendar'
 *    import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop'
 *    export default withDragAndDrop(Calendar)
 * ```
 *
 * Set `resizable` to true in your calendar if you want events to be resizable.
 *
 * The HOC adds `onEventDrop`, `onEventResize`, and `onDragStart` callback
 * properties if the events are moved or resized. These callbacks are called
 * with these signatures:
 *
 * ```js
 *    function onEventDrop({ event, start, end, allDay }) {...}
 *    // type is always 'drop'
 *    function onEventResize(type, { event, start, end, allDay }) {...}
 *    function onDragStart({ event, action, direction }) {...}
 * ```
 *
 * Moving and resizing of events has some subtlety which one should be aware of.
 *
 * In some situations, non-allDay events are displayed in "row" format where
 * they are rendered horizontally. This is the case for ALL events in a month
 * view.
 * It is also occurs with multi-day events in a day or week view (unless
 * `showMultiDayTimes` is set).
 *
 * When dropping or resizing non-allDay events into a the header area or when
 * resizing them horizontally because they are displayed in row format, their
 * times are preserved, only their date is changed.
 *
 * If you care about these corner cases, you can examine the `allDay` param
 * supplied in the callback to determine how the user dropped or resized the
 * event.
 *
 * Additionally, this HOC adds the callback props `onDropFromOutside` and
 * `onDragOver`.
 * By default, the calendar will not respond to outside draggable items being
 * dropped onto it. However, if `onDropFromOutside` callback is passed, then
 * when draggable DOM elements are dropped on the calendar, the callback will
 * fire, receiving an object with start and end times, and an allDay boolean.
 *
 * If `onDropFromOutside` is passed, but `onDragOver` is not, any draggable
 * event will be droppable  onto the calendar by default. On the other hand, if
 * an `onDragOver` callback *is* passed, then it can discriminate as to whether
 * a draggable item is droppable on the calendar. To designate a draggable item
 * as droppable, call `event.preventDefault` inside `onDragOver`. If
 * `event.preventDefault` is not called in the `onDragOver` callback, then the
 * draggable item will not be droppable on the calendar.
 *
 * * ```js
 *    function onDropFromOutside({ start, end, allDay }) {...}
 *    function onDragOver(DragEvent: event) {...}
 * ```
 * @param {*} Calendar
 */
export default function useDragAndDrop({
  components,

  selectable,
  elementProps,
  className,

  onDragStart,
  onDragOver,
  onEventDrop,
  onEventResize,
  onDropFromOutside,

  dragFromOutsideItem,

  draggableAccessor,
  resizableAccessor,
}: DragAndDropCalendarProps) {
  const [interacting, setInteracting] = React.useState<boolean>(false);
  const [action, setAction] = React.useState<DragAction | null>(null);
  const [direction, setDirection] = React.useState<DragDirection | null>(null);
  const [event, setEvent] = React.useState<RNC.Event | null>(null);
  const latestAction = useLatest(action);

  const handleInteractionStart = React.useCallback((): void => {
    setInteracting(true);
  }, []);

  const handleInteractionEnd = React.useCallback(
    (interactionInfo: InteractionInfo): void => {
      if (!latestAction.current) {
        return;
      }

      const actionCopy = latestAction.current;

      setAction(null);
      setDirection(null);
      setInteracting(false);

      if (interactionInfo == null) {
        return;
      }

      setEvent(prevState => {
        interactionInfo.event = prevState as RNC.Event;
        return null;
      });

      if (actionCopy === 'move') {
        onEventDrop && onEventDrop(interactionInfo);
      } else if (actionCopy === 'resize') {
        onEventResize && onEventResize(interactionInfo);
      }
    },
    [],
  );

  const handleBeginAction = React.useCallback(
    (event: RNC.Event, action: DragAction, direction?: DragDirection) => {
      setAction(action);
      setEvent(event);
      if (direction) {
        setDirection(direction);
      }

      if (onDragStart) {
        onDragStart({ event, action, direction });
      }
    },
    [],
  );

  const defaultOnDragOver = React.useCallback(event => {
    event.preventDefault();
  }, []);

  const context = React.useMemo<{ draggable: DraggableContext }>(
    () => ({
      draggable: {
        // TODO: rename to onDragStart?
        onStart: handleInteractionStart,
        // TODO: rename to onDragEnd?
        onEnd: handleInteractionEnd,
        onBeginAction: handleBeginAction,
        onDropFromOutside: onDropFromOutside,
        dragFromOutsideItem: dragFromOutsideItem,
        draggableAccessor: draggableAccessor,
        resizableAccessor: resizableAccessor,
        dragAndDropAction: {
          action,
          direction,
          event,
          interacting,
        },
      },
    }),
    [
      action,
      direction,
      event,
      interacting,
      onDropFromOutside,
      dragFromOutsideItem,
      draggableAccessor,
      resizableAccessor,
    ],
  );

  return [
    context,
    mergeComponents(components, {
      eventWrapper: EventWrapper,
      eventContainerWrapper: EventContainerWrapper,
      weekWrapper: WeekWrapper,
    }),
    selectable ? 'ignoreEvents' : false,
    onDropFromOutside
      ? {
          ...elementProps,
          onDragOver: onDragOver || defaultOnDragOver,
        }
      : elementProps,
    clsx(
      className,
      'rbc-addons-dnd',
      interacting && 'rbc-addons-dnd-is-dragging',
    ),
  ];
}
