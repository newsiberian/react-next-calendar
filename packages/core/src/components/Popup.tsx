import * as React from 'react';
import getOffset from 'dom-helpers/offset';
import getScrollTop from 'dom-helpers/scrollTop';
import getScrollLeft from 'dom-helpers/scrollLeft';
import { dates, isSelected } from '@react-next-calendar/utils';

import EventCell from './EventCell';

export interface PopupProps {
  events: RNC.Event[];
  selected?: RNC.Event;

  accessors: Accessors;
  components: Components;
  getters: Getters;
  localizer: Localizer;

  onSelect: (event: RNC.Event, e: React.MouseEvent) => void;
  onDoubleClick: (event: RNC.Event, e: React.MouseEvent) => void;
  onKeyPress: (event: RNC.Event, e: React.KeyboardEvent) => void;

  position: {
    top: number;
    left: number;
    height: number;
    width: number;
  };
  // TODO: remove?
  show;
  popupOffset: { x: number; y: number } | number;

  slotStart: Date;
  slotEnd: Date;

  /**
   * Goes from Overlay
   */
  style: Record<string, number | string>;
}

/**
 * The Overlay component, of react-overlays, creates a ref that is passed to the Popup, and
 * requires proper ref forwarding to be used without error
 */
const Popup = React.forwardRef(function Popup(
  {
    position,
    popupOffset,
    events,
    selected,

    accessors,
    components,
    getters,
    localizer,
    onSelect,
    onDoubleClick,
    onKeyPress,
    show,
    slotStart,
    slotEnd,
    style,
  }: PopupProps,
  ref: React.ForwardedRef<HTMLDivElement>,
): React.ReactElement {
  const [offset, setOffset] = React.useState({ topOffset: 0, leftOffset: 0 });

  React.useEffect(() => {
    const { top, left, width, height } = getOffset(ref.current);
    const viewBottom = window.innerHeight + getScrollTop(window);
    const viewRight = window.innerWidth + getScrollLeft(window);
    const bottom = top + height;
    const right = left + width;

    if (bottom > viewBottom || right > viewRight) {
      let topOffset = 0;
      let leftOffset = 0;

      if (bottom > viewBottom) {
        topOffset = bottom - viewBottom + (popupOffset.y || +popupOffset || 0);
      }
      if (right > viewRight) {
        leftOffset = right - viewRight + (popupOffset.x || +popupOffset || 0);
      }

      setOffset({ topOffset, leftOffset });
    }
  }, []);

  const computedStyle = {
    top: -offset.topOffset,
    left: -offset.leftOffset,
    minWidth: position.width + position.width / 2,
  };

  return (
    <div
      style={{ ...style, ...computedStyle }}
      className="rbc-overlay"
      ref={ref}
    >
      <div className="rbc-overlay-header">
        {localizer.format(slotStart, 'dayHeaderFormat')}
      </div>
      {events.map((event, idx) => (
        <EventCell
          // TODO: do we need `draggable` here?
          draggable
          key={idx}
          type="popup"
          event={event}
          getters={getters}
          onSelect={onSelect}
          accessors={accessors}
          components={components}
          onDoubleClick={onDoubleClick}
          onKeyPress={onKeyPress}
          continuesPrior={dates.lt(accessors.end(event), slotStart, 'day')}
          continuesAfter={dates.gte(accessors.start(event), slotEnd, 'day')}
          slotStart={slotStart}
          slotEnd={slotEnd}
          selected={isSelected(event, selected)}
          // TODO: this one doesn't used anywhere
          onDragEnd={show}
        />
      ))}
    </div>
  );
});

export default Popup;
