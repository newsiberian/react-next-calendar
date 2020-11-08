import * as React from 'react'
import PropTypes from 'prop-types'
import clsx from 'clsx'

import EventRowMixin from './EventRowMixin'

function EventRow({ segments, className, ...props }) {
  let lastEnd = 1

  return (
    <div className={clsx(className, 'rbc-row')}>
      {segments.reduce((row, { event, left, right, span }, li) => {
        const key = '_lvl_' + li
        const gap = left - lastEnd

        const content = EventRowMixin.renderEvent(props, event)

        if (gap)
          row.push(
            EventRowMixin.renderSpan(props.slotMetrics.slots, gap, `${key}_gap`)
          )

        row.push(
          EventRowMixin.renderSpan(props.slotMetrics.slots, span, key, content)
        )

        lastEnd = right + 1

        return row
      }, [])}
    </div>
  )
}

EventRow.propTypes = {
  segments: PropTypes.array,
  ...EventRowMixin.propTypes,
}

EventRow.defaultProps = {
  ...EventRowMixin.defaultProps,
}

export default EventRow
