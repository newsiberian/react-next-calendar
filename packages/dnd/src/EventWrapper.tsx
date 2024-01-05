import * as React from 'react';
import clsx from 'clsx';
import { usePluginsContext } from '@react-next-calendar/core';

import { DraggableContext } from './useDragAndDrop';

interface ExtendedEvent extends RNC.Event {
  __isPreview: boolean;
}

interface NewProps {
  onMouseDown: (e: React.MouseEvent) => void;
  onTouchStart: (e: React.MouseEvent) => void;
  children: React.ReactElement;
  className: string;
}

export interface EventWrapperProps {
  type: 'date' | 'time';
  event: ExtendedEvent;
  /**
   * This is Event Component
   */
  children: React.ReactElement;
  continuesPrior: boolean;
  continuesAfter: boolean;
}

export default function EventWrapper({
  type,
  event,
  children,
  continuesPrior,
  continuesAfter,
}: EventWrapperProps): React.ReactElement {
  const { draggable } = usePluginsContext<{
    draggable: DraggableContext;
  }>();

  function handleResizeUp(e: React.MouseEvent) {
    if (e.button !== 0) {
      return;
    }
    e.stopPropagation();
    draggable.onBeginAction && draggable.onBeginAction(event, 'resize', 'UP');
  }

  function handleResizeDown(e: React.MouseEvent) {
    if (e.button !== 0) {
      return;
    }
    e.stopPropagation();
    draggable.onBeginAction && draggable.onBeginAction(event, 'resize', 'DOWN');
  }

  function handleResizeLeft(e: React.MouseEvent) {
    if (e.button !== 0) {
      return;
    }
    e.stopPropagation();
    draggable.onBeginAction && draggable.onBeginAction(event, 'resize', 'LEFT');
  }

  function handleResizeRight(e: React.MouseEvent) {
    if (e.button !== 0) {
      return;
    }
    e.stopPropagation();
    draggable.onBeginAction &&
      draggable.onBeginAction(event, 'resize', 'RIGHT');
  }

  function handleStartDragging(e: React.MouseEvent) {
    if (e.button === 0) {
      draggable.onBeginAction && draggable.onBeginAction(event, 'move');
    }
  }

  function renderAnchor(
    direction: 'Up' | 'Down' | 'Left' | 'Right',
    handler: (e: React.MouseEvent) => void,
  ) {
    const cls = direction === 'Up' || direction === 'Down' ? 'ns' : 'ew';
    return (
      <div
        className={`rbc-addons-dnd-resize-${cls}-anchor`}
        onMouseDown={handler}
      >
        <div className={`rbc-addons-dnd-resize-${cls}-icon`} />
      </div>
    );
  }

  if (event.__isPreview)
    return React.cloneElement(children, {
      className: clsx(children.props.className, 'rbc-addons-dnd-drag-preview'),
    });

  const { draggableAccessor, resizableAccessor } = draggable;

  const isDraggable = draggableAccessor ? draggableAccessor(event) : true;

  // Event is not draggable, no need to wrap it
  if (!isDraggable) {
    return children;
  }

  // The resizability of events depends on whether they are allDay events and
  // how they are displayed.
  //
  // 1. If the event is being shown in an event row (because it is an allDay
  // event shown in the header row or because as in month view the view is
  // showing all events as rows) then we allow east-west resizing.
  //
  // 2. Otherwise the event is being displayed normally, we can drag it
  // north-south to resize the times.
  //
  // See `DropWrappers` for handling of the drop of such events.
  //
  // Notwithstanding the above, we never show drag anchors for events which
  // continue beyond current component. This happens in the middle of events
  // when showMultiDay is true, and to events at the edges of the calendar's
  // min/max location.
  const isResizable = resizableAccessor ? resizableAccessor(event) : true;

  if (isResizable || isDraggable) {
    // props.children is the singular <Event> component. BigCalendar positions
    // the Event absolutely and we need the anchors to be part of that
    // positioning. So we insert the anchors inside the Event's children rather
    // than wrap the Event here as the latter approach would lose the
    // positioning.
    const newProps = {
      onMouseDown: handleStartDragging,
      onTouchStart: handleStartDragging,
    } as NewProps;

    if (isResizable) {
      // replace original event child with anchor-embellished child
      let StartAnchor;
      let EndAnchor;

      if (type === 'date') {
        StartAnchor = !continuesPrior && renderAnchor('Left', handleResizeLeft);
        EndAnchor = !continuesAfter && renderAnchor('Right', handleResizeRight);
      } else {
        StartAnchor = !continuesPrior && renderAnchor('Up', handleResizeUp);
        EndAnchor = !continuesAfter && renderAnchor('Down', handleResizeDown);
      }

      newProps.children = (
        <div className="rbc-addons-dnd-resizable">
          {StartAnchor}
          {children.props.children}
          {EndAnchor}
        </div>
      );
    }

    if (
      // if an event is being dragged right now
      draggable.dragAndDropAction.interacting &&
      // and it's the current event
      draggable.dragAndDropAction.event === event
    ) {
      // add a new class to it
      newProps.className = clsx(
        children.props.className,
        'rbc-addons-dnd-dragged-event',
      );
    }

    children = React.cloneElement(children, newProps);
  }

  return children;
}
