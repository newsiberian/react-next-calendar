import * as React from 'react';
import clsx from 'clsx';
import { dates } from '@react-next-calendar/utils';

interface EventCellProps {
  event: RNC.Event;
  slotStart: Date;
  slotEnd: Date;

  // TODO: children are not currently being passed to EventCell from anywhere
  children?: (content: React.ReactNode) => React.ReactNode;

  selected: boolean;
  isAllDay?: boolean;
  continuesPrior: boolean;
  continuesAfter: boolean;

  accessors: Accessors;
  components: Components;
  getters: Getters;
  localizer: Localizer;

  onSelect?: (event: RNC.Event, e: React.MouseEvent) => void;
  onDoubleClick?: (event: RNC.Event, e: React.MouseEvent) => void;
  onKeyPress?: (event: RNC.Event, e: React.KeyboardEvent) => void;
}

function EventCell(props: EventCellProps): React.ReactElement {
  const {
    style,
    className,
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

  const showAsAllDay = React.useMemo(
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
        style={{ ...eventProps.style, ...style }}
        className={clsx('rbc-event', className, eventProps.className, {
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
