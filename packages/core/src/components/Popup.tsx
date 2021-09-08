import * as React from 'react';
import getScrollTop from 'dom-helpers/scrollTop';
import getScrollLeft from 'dom-helpers/scrollLeft';
import { isSelected } from '@react-next-calendar/utils';

import EventCell from './EventCell';

type OffsetObject = { x: number; y: number };

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
  onDragEnd: (e: React.MouseEvent) => void;
  popupOffset: OffsetObject | number;

  slotStart: Date;

  /**
   * Goes from Overlay
   */
  style: React.CSSProperties;
}

/**
 * The Overlay component, of react-overlays, creates a ref that is passed to the
 * Popup, and requires proper ref forwarding to be used without error
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
    onDragEnd,
    slotStart,
    style,
  }: PopupProps,
  ref: React.ForwardedRef<HTMLElement>,
): React.ReactElement {
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const [offset, setOffset] = React.useState({ topOffset: 0, leftOffset: 0 });

  React.useEffect(() => {
    const {
      top,
      left,
      width,
      height,
    } = (rootRef.current as HTMLDivElement).getBoundingClientRect();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const viewBottom = window.innerHeight + getScrollTop(window);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const viewRight = window.innerWidth + getScrollLeft(window);
    const bottom = top + height;
    const right = left + width;

    if (bottom > viewBottom || right > viewRight) {
      let topOffset = 0;
      let leftOffset = 0;

      if (bottom > viewBottom) {
        topOffset =
          bottom -
          viewBottom +
          ((popupOffset as OffsetObject).y || +popupOffset || 0);
      }
      if (right > viewRight) {
        leftOffset =
          right -
          viewRight +
          ((popupOffset as OffsetObject).x || +popupOffset || 0);
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
      ref={(element: HTMLDivElement) => {
        (ref as React.RefCallback<HTMLElement>)(element);
        rootRef.current = element;
      }}
    >
      <div className="rbc-overlay-header">
        {localizer.format(slotStart, 'dayHeaderFormat')}
      </div>
      {events.map((event, idx) => (
        <EventCell
          // this prop enables element drag
          draggable
          key={idx}
          event={event}
          getters={getters}
          onSelect={onSelect}
          accessors={accessors}
          components={components}
          localizer={localizer}
          onDoubleClick={onDoubleClick}
          onKeyPress={onKeyPress}
          // since this is a Popup, we don't need to change event's border styles
          continuesPrior={false}
          continuesAfter={false}
          slotStart={slotStart}
          slotEnd={slotStart}
          selected={isSelected(event, selected)}
          onDragEnd={onDragEnd}
        />
      ))}
    </div>
  );
});

export default Popup;
