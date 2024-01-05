import type { KeyboardEvent, MouseEvent } from 'react';
import clsx from 'clsx';

import { useCalendar } from '../model/calendarContext';
import { useGetters } from '../model/gettersContext';

function stringifyPercent(value: string | number): string {
  return typeof value === 'string' ? value : value + '%';
}

export type TimeGridEventProps = {
  event: RNC.Event;

  style: StyledEventStyle;
  /**
   * This class could go from dnd addon
   */
  className?: string;

  components: Components;

  label?: string | null;
  continuesEarlier: boolean;
  continuesLater: boolean;
  selected: boolean;

  // The handlers will not be passed while event drags from one place to another

  onClick?: (e: MouseEvent) => void;
  onDoubleClick?: (e: MouseEvent) => void;
  onKeyPress?: (e: KeyboardEvent) => void;
};

export function TimeGridEvent(props: TimeGridEventProps) {
  const {
    style,
    className,
    event,
    selected,
    label,
    continuesEarlier,
    continuesLater,
    onClick,
    onDoubleClick,
    onKeyPress,
    components: { event: Event, eventWrapper: EventWrapper },
  } = props;
  const { rtl } = useCalendar();
  const getters = useGetters();

  const { title, start, end } = event;
  const tooltip = title;

  const eventProps = getters.eventProp(event, start, end, selected);

  const { height, top, width, xOffset } = style;

  return (
    <div
      style={{
        ...eventProps.style,
        top: stringifyPercent(top),
        [rtl ? 'right' : 'left']: stringifyPercent(xOffset as number),
        width: stringifyPercent(width),
        height: stringifyPercent(height),
        position: 'absolute',
      }}
    >
      <EventWrapper type="time" {...props}>
        <div
          onClick={onClick}
          onDoubleClick={onDoubleClick}
          onKeyDown={onKeyPress}
          title={
            tooltip
              ? (typeof label === 'string' ? label + ': ' : '') + tooltip
              : undefined
          }
          className={clsx('rbc-event', className, eventProps.className, {
            'rbc-selected': selected,
            'rbc-event-continues-earlier': continuesEarlier,
            'rbc-event-continues-later': continuesLater,
          })}
        >
          <div className="rbc-event-label">{label}</div>
          <div className="rbc-event-content">
            {Event ? <Event event={event} title={title} /> : title}
          </div>
        </div>
      </EventWrapper>
    </div>
  );
}
