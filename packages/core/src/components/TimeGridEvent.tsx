import * as React from 'react';
import clsx from 'clsx';

function stringifyPercent(value: string | number): string {
  return typeof value === 'string' ? value : value + '%';
}

export interface TimeGridEventProps {
  event: RNC.Event;

  style: StyledEventStyle;
  /**
   * This class could go from dnd addon
   */
  className?: string;

  accessors: Accessors;
  getters: Getters;
  components: Components;

  rtl: boolean;

  label?: string | null;
  continuesEarlier: boolean;
  continuesLater: boolean;
  selected: boolean;

  // The handlers will not be passed while event drags from one place to another

  onClick?: (e: React.MouseEvent) => void;
  onDoubleClick?: (e: React.MouseEvent) => void;
  onKeyPress?: (e: React.KeyboardEvent) => void;
}

function TimeGridEvent(props: TimeGridEventProps): React.ReactElement {
  const {
    style,
    className,
    event,
    accessors,
    rtl,
    selected,
    label,
    continuesEarlier,
    continuesLater,
    getters,
    onClick,
    onDoubleClick,
    onKeyPress,
    components: { event: Event, eventWrapper: EventWrapper },
  } = props;

  const title = accessors.title(event);
  const tooltip = accessors.tooltip(event);
  const end = accessors.end(event);
  const start = accessors.start(event);

  const eventProps = getters.eventProp(event, start, end, selected);

  const { height, top, width, xOffset } = style;

  const inner = [
    <div key="1" className="rbc-event-label">
      {label}
    </div>,
    <div key="2" className="rbc-event-content">
      {Event ? <Event event={event} title={title} /> : title}
    </div>,
  ];

  return (
    <EventWrapper type="time" {...props}>
      <div
        onClick={onClick}
        onDoubleClick={onDoubleClick}
        onKeyPress={onKeyPress}
        style={{
          ...eventProps.style,
          top: stringifyPercent(top),
          [rtl ? 'right' : 'left']: stringifyPercent(xOffset as number),
          width: stringifyPercent(width),
          height: stringifyPercent(height),
        }}
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
        {inner}
      </div>
    </EventWrapper>
  );
}

export default TimeGridEvent;
