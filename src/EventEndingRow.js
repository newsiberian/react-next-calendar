import * as React from 'react'
import PropTypes from 'prop-types'
import range from 'lodash/range'

import EventRowMixin from './EventRowMixin'
import { eventLevels } from './utils/eventLevels'

const isSegmentInSlot = (seg, slot) => seg.left <= slot && seg.right >= slot
const eventsInSlot = (segments, slot) =>
  segments.filter((seg) => isSegmentInSlot(seg, slot)).length

function EventEndingRow({ segments, onShowMore, ...props }) {
  function canRenderSlotEvent(slot, span) {
    return range(slot, slot + span).every((s) => {
      const count = eventsInSlot(segments, s)
      return count === 1
    })
  }

  function renderShowMore(segments, slot) {
    const count = eventsInSlot(segments, slot)
    return count ? (
      <a
        key={'sm_' + slot}
        href="#"
        className={'rbc-show-more'}
        onClick={(e) => showMore(slot, e)}
      >
        {props.localizer.messages.showMore(count)}
      </a>
    ) : null
  }

  function showMore(slot, e) {
    e.preventDefault()
    onShowMore(slot, e.target)
  }

  const rowSegments = eventLevels(segments).levels[0]

  let current = 1
  let lastEnd = 1
  const row = []

  while (current <= props.slotMetrics.slots) {
    const key = '_lvl_' + current

    const { event, left, right, span } =
      rowSegments.filter((seg) => isSegmentInSlot(seg, current))[0] || {}

    if (!event) {
      current++
      continue
    }

    const gap = Math.max(0, left - lastEnd)

    if (canRenderSlotEvent(left, span)) {
      let content = EventRowMixin.renderEvent(props, event)

      if (gap) {
        row.push(
          EventRowMixin.renderSpan(props.slotMetrics.slots, gap, key + '_gap')
        )
      }

      row.push(
        EventRowMixin.renderSpan(props.slotMetrics.slots, span, key, content)
      )

      lastEnd = current = right + 1
    } else {
      if (gap) {
        row.push(
          EventRowMixin.renderSpan(props.slotMetrics.slots, gap, key + '_gap')
        )
      }

      row.push(
        EventRowMixin.renderSpan(
          props.slotMetrics.slots,
          1,
          key,
          renderShowMore(segments, current)
        )
      )
      lastEnd = current = current + 1
    }
  }

  return <div className="rbc-row">{row}</div>
}

EventEndingRow.propTypes = {
  segments: PropTypes.array,
  slots: PropTypes.number,
  onShowMore: PropTypes.func,
  ...EventRowMixin.propTypes,
}

EventEndingRow.defaultProps = {
  ...EventRowMixin.defaultProps,
}

export default EventEndingRow
