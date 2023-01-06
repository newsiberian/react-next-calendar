import {
  useMemo,
  DragEvent,
  KeyboardEvent,
  MouseEvent,
  ReactNode,
} from 'react';
import clsx from 'clsx';
import { dates } from '@react-next-calendar/utils';

interface EventCellProps {
  event: RNC.Event;
  slotStart: Date;
  slotEnd: Date;

  // TODO: children are not currently being passed to EventCell from anywhere
  children?: (content: ReactNode) => ReactNode;

  /**
   * Allowed to be dragged?
   */
  draggable?: boolean;
  selected: boolean;
  isAllDay?: boolean;
  /**
   * Indicates that event began on the previous week (at "month" view). This
   * prop will be truthy on the first cell (day) at week
   */
  continuesPrior: boolean;
  /**
   * Indicates that event will continue on the next week (at "month" view). This
   * prop will be truthy on the last cell (day) at week
   */
  continuesAfter: boolean;

  accessors: Accessors;
  components: Components;
  getters: Getters;
  localizer: Localizer;

  onSelect?: (event: RNC.Event, e: MouseEvent) => void;
  onDoubleClick?: (event: RNC.Event, e: MouseEvent) => void;
  onKeyPress?: (event: RNC.Event, e: KeyboardEvent) => void;

  /**
   * Callback handler which will be passed to EventWrapper. It fires when an
   * event drag from the popup on a month view will be finished
   * @param {DragEvent} e
   */
  onDragEnd?: (e: DragEvent) => void;
}

function EventCell(props: EventCellProps) {
  const {
    event,
    selected,
    isAllDay,
    onSelect,
    onDoubleClick,
    onKeyPress,
    localizer,
    continuesPrior,
    continuesAfter,
    accessors,
    getters,
    children,
    components: { event: Event, eventWrapper: EventWrapper },
    slotStart,
    slotEnd,
    ...rest
  } = props;

  const title = accessors.title(event);
  const tooltip = accessors.tooltip(event);
  const end = accessors.end(event);
  const start = accessors.start(event);
  const allDay = accessors.allDay(event);

  const showAsAllDay = useMemo(
    () =>
      isAllDay ||
      allDay ||
      dates.diff(start, dates.ceil(end, 'day'), 'day') > 1,
    [isAllDay, allDay, start, end],
  );

  const eventProps = getters.eventProp(event, start, end, selected);

  const content = (
    <div className="rbc-event-content" title={tooltip || undefined}>
      {Event ? (
        <Event
          event={event}
          continuesPrior={continuesPrior}
          continuesAfter={continuesAfter}
          title={title}
          isAllDay={allDay}
          localizer={localizer}
          slotStart={slotStart}
          slotEnd={slotEnd}
        />
      ) : (
        title
      )}
    </div>
  );

  return (
    <EventWrapper {...props} type="date">
      <div
        {...rest}
        tabIndex={0}
        style={eventProps.style}
        className={clsx('rbc-event', eventProps.className, {
          'rbc-selected': selected,
          'rbc-event-allday': showAsAllDay,
          'rbc-event-continues-prior': continuesPrior,
          'rbc-event-continues-after': continuesAfter,
        })}
        onClick={e => onSelect && onSelect(event, e)}
        onDoubleClick={e => onDoubleClick && onDoubleClick(event, e)}
        onKeyPress={e => onKeyPress && onKeyPress(event, e)}
      >
        {typeof children === 'function' ? children(content) : content}
      </div>
    </EventWrapper>
  );
}

export default EventCell;
