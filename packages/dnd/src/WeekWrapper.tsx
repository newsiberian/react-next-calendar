import * as React from 'react';
import { findDOMNode } from 'react-dom';
import EventRow from '@react-next-calendar/core/src/components/EventRow';
import * as dates from '@react-next-calendar/core/src/utils/dates';
import {
  getSlotAtX,
  pointInBox,
} from '@react-next-calendar/core/src/utils/selection';
import { eventSegments } from '@react-next-calendar/core/src/utils/eventLevels';
import { CalendarContext } from '@react-next-calendar/core/src';

import Selection, { getBoundsForNode } from './Selection';
import { dragAccessors } from './common';

export interface WeekWrapperProps {
  isAllDay: boolean;
  slotMetrics: DateSlotMetrics;

  accessors: Accessors;
  getters: Getters;
  components: Components;

  resourceId: string | number;
}

const eventTimes = (event, accessors) => {
  const start = accessors.start(event);
  const end = accessors.end(event);

  const isZeroDuration =
    dates.eq(start, end, 'minutes') && start.getMinutes() === 0;
  // make zero duration midnight events at least one day long
  const modifiedEnd = isZeroDuration ? dates.add(end, 1, 'day') : end;

  return { start, end: modifiedEnd };
};

class WeekWrapper extends React.Component<WeekWrapperProps> {
  static contextType = CalendarContext;

  constructor(...args) {
    super(...args);
    this.state = {};
  }

  componentDidMount() {
    this._selectable();
  }

  componentWillUnmount() {
    this._teardownSelectable();
  }

  reset() {
    if (this.state.segment) this.setState({ segment: null });
  }

  update(event, start, end) {
    const segment = eventSegments(
      { ...event, end, start, __isPreview: true },
      this.props.slotMetrics.range,
      dragAccessors,
    );

    const { segment: lastSegment } = this.state;
    if (
      lastSegment &&
      segment.span === lastSegment.span &&
      segment.left === lastSegment.left &&
      segment.right === lastSegment.right
    ) {
      return;
    }
    this.setState({ segment });
  }

  handleMove = ({ x, y }, node, draggedEvent) => {
    const event =
      this.context.draggable.dragAndDropAction.event || draggedEvent;
    const metrics = this.props.slotMetrics;
    const { accessors } = this.props;

    if (!event) return;

    let rowBox = getBoundsForNode(node);

    if (!pointInBox(rowBox, { x, y })) {
      this.reset();
      return;
    }

    // Make sure to maintain the time of the start date while moving it to the new slot
    let start = dates.merge(
      metrics.getDateForSlot(getSlotAtX(rowBox, x, false, metrics.slots)),
      accessors.start(event),
    );

    let end = dates.add(
      start,
      dates.diff(accessors.start(event), accessors.end(event), 'minutes'),
      'minutes',
    );

    this.update(event, start, end);
  };

  handleDropFromOutside = (point, rowBox) => {
    if (!this.context.draggable.onDropFromOutside) return;
    const { slotMetrics: metrics } = this.props;

    let start = metrics.getDateForSlot(
      getSlotAtX(rowBox, point.x, false, metrics.slots),
    );

    this.context.draggable.onDropFromOutside({
      start,
      end: dates.add(start, 1, 'day'),
      allDay: false,
    });
  };

  handleDragOverFromOutside = ({ x, y }, node) => {
    if (!this.context.draggable.dragFromOutsideItem) return;

    this.handleMove(
      { x, y },
      node,
      this.context.draggable.dragFromOutsideItem(),
    );
  };

  handleResize(point, node) {
    const { event, direction } = this.context.draggable.dragAndDropAction;
    const { accessors, slotMetrics: metrics } = this.props;

    let { start, end } = eventTimes(event, accessors);

    let rowBox = getBoundsForNode(node);
    let cursorInRow = pointInBox(rowBox, point);

    if (direction === 'RIGHT') {
      if (cursorInRow) {
        if (metrics.last < start) return this.reset();
        // add min
        end = dates.add(
          metrics.getDateForSlot(
            getSlotAtX(rowBox, point.x, false, metrics.slots),
          ),
          1,
          'day',
        );
      } else if (
        dates.inRange(start, metrics.first, metrics.last) ||
        (rowBox.bottom < point.y && +metrics.first > +start)
      ) {
        end = dates.add(metrics.last, 1, 'milliseconds');
      } else {
        this.setState({ segment: null });
        return;
      }

      end = dates.max(end, dates.add(start, 1, 'day'));
    } else if (direction === 'LEFT') {
      // inbetween Row
      if (cursorInRow) {
        if (metrics.first > end) return this.reset();

        start = metrics.getDateForSlot(
          getSlotAtX(rowBox, point.x, false, metrics.slots),
        );
      } else if (
        dates.inRange(end, metrics.first, metrics.last) ||
        (rowBox.top > point.y && +metrics.last < +end)
      ) {
        start = dates.add(metrics.first, -1, 'milliseconds');
      } else {
        this.reset();
        return;
      }

      start = dates.min(dates.add(end, -1, 'day'), start);
    }

    this.update(event, start, end);
  }

  _selectable = () => {
    let node = findDOMNode(this).closest('.rbc-month-row, .rbc-allday-cell');
    let container = node.closest('.rbc-month-view, .rbc-time-view');

    let selector = (this._selector = new Selection(() => container));

    selector.on('beforeSelect', point => {
      const { isAllDay } = this.props;
      const { action } = this.context.draggable.dragAndDropAction;

      return (
        action === 'move' ||
        (action === 'resize' &&
          (!isAllDay || pointInBox(getBoundsForNode(node), point)))
      );
    });

    selector.on('selecting', box => {
      const bounds = getBoundsForNode(node);
      const { dragAndDropAction } = this.context.draggable;

      if (dragAndDropAction.action === 'move') this.handleMove(box, bounds);
      if (dragAndDropAction.action === 'resize') this.handleResize(box, bounds);
    });

    selector.on('selectStart', () => this.context.draggable.onStart());
    selector.on('select', point => {
      const bounds = getBoundsForNode(node);

      if (!this.state.segment) return;
      this.handleInteractionEnd();

      if (!pointInBox(bounds, point)) {
        this.reset();
      } else {
        this.handleInteractionEnd();
      }
    });

    selector.on('dropFromOutside', point => {
      if (!this.context.draggable.onDropFromOutside) return;

      const bounds = getBoundsForNode(node);

      if (!pointInBox(bounds, point)) return;

      this.handleDropFromOutside(point, bounds);
    });

    selector.on('dragOverFromOutside', point => {
      if (!this.context.draggable.dragFromOutsideItem) return;

      const bounds = getBoundsForNode(node);

      this.handleDragOverFromOutside(point, bounds);
    });

    selector.on('click', () => this.context.draggable.onEnd(null));

    selector.on('reset', () => {
      this.reset();
      this.context.draggable.onEnd(null);
    });
  };

  handleInteractionEnd = () => {
    const { resourceId, isAllDay } = this.props;
    const { event } = this.state.segment;

    this.reset();

    this.context.draggable.onEnd({
      start: event.start,
      end: event.end,
      resourceId,
      isAllDay,
    });
  };

  _teardownSelectable = () => {
    if (!this._selector) return;
    this._selector.teardown();
    this._selector = null;
  };

  render() {
    const { children, accessors } = this.props;

    let { segment } = this.state;

    return (
      <div className="rbc-addons-dnd-row-body">
        {children}

        {segment && (
          <EventRow
            {...this.props}
            selected={null}
            className="rbc-addons-dnd-drag-row"
            segments={[segment]}
            accessors={{
              ...accessors,
              ...dragAccessors,
            }}
          />
        )}
      </div>
    );
  }
}

export default WeekWrapper;
