import * as React from 'react'
import PropTypes from 'prop-types'
import getOffset from 'dom-helpers/offset'
import getScrollTop from 'dom-helpers/scrollTop'
import getScrollLeft from 'dom-helpers/scrollLeft'
import * as dates from './utils/dates'

import EventCell from './EventCell'
import { isSelected } from './utils/selection'

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
    handleDragStart,
    show,
    slotStart,
    slotEnd,
    style,
  },
  ref
) {
  const [offset, setOffset] = React.useState({ topOffset: 0, leftOffset: 0 })

  React.useEffect(() => {
    const { top, left, width, height } = getOffset(ref.current)
    const viewBottom = window.innerHeight + getScrollTop(window)
    const viewRight = window.innerWidth + getScrollLeft(window)
    const bottom = top + height
    const right = left + width

    if (bottom > viewBottom || right > viewRight) {
      let topOffset = 0
      let leftOffset = 0

      if (bottom > viewBottom) {
        topOffset = bottom - viewBottom + (popupOffset.y || +popupOffset || 0)
      }
      if (right > viewRight) {
        leftOffset = right - viewRight + (popupOffset.x || +popupOffset || 0)
      }

      setOffset({ topOffset, leftOffset })
    }
  }, [])

  const computedStyle = {
    top: -offset.topOffset,
    left: -offset.leftOffset,
    minWidth: position.width + position.width / 2,
  }

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
          onDragStart={() => handleDragStart(event)}
          onDragEnd={show}
        />
      ))}
    </div>
  )
})

Popup.propTypes = {
  position: PropTypes.object,
  popupOffset: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.shape({
      x: PropTypes.number,
      y: PropTypes.number,
    }),
  ]),
  events: PropTypes.array,
  selected: PropTypes.object,

  accessors: PropTypes.object.isRequired,
  components: PropTypes.object.isRequired,
  getters: PropTypes.object.isRequired,
  localizer: PropTypes.object.isRequired,
  onSelect: PropTypes.func,
  onDoubleClick: PropTypes.func,
  onKeyPress: PropTypes.func,
  handleDragStart: PropTypes.func,
  show: PropTypes.func,
  slotStart: PropTypes.instanceOf(Date),
  slotEnd: PropTypes.number,
  style: PropTypes.object,
}

export default Popup
