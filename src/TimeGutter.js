import * as React from 'react'
import PropTypes from 'prop-types'
import clsx from 'clsx'

import * as TimeSlotUtils from './utils/TimeSlots'
import TimeSlotGroup from './TimeSlotGroup'

const TimeGutter = React.forwardRef(function TimeGutter(
  {
    min,
    max,
    timeslots,
    step,
    resource,
    components,
    getters,
    localizer,
    getNow,
  },
  ref
) {
  const slotMetrics = React.useRef(
    TimeSlotUtils.getSlotMetrics({
      min: new Date(min),
      max: new Date(max),
      timeslots,
      step,
    })
  )

  React.useEffect(() => {
    slotMetrics.current = slotMetrics.current.update({
      min: new Date(min),
      max: new Date(max),
      timeslots,
      step,
    })
  }, [min, max, timeslots, step])

  function renderSlot(value, idx) {
    if (idx !== 0) return null

    const isNow = slotMetrics.current.dateIsInGroup(getNow(), idx)
    return (
      <span className={clsx('rbc-label', isNow && 'rbc-now')}>
        {localizer.format(value, 'timeGutterFormat')}
      </span>
    )
  }

  return (
    <div className="rbc-time-gutter rbc-time-column" ref={ref}>
      {slotMetrics.current.groups.map((grp, idx) => {
        return (
          <TimeSlotGroup
            key={idx}
            group={grp}
            resource={resource}
            components={components}
            renderSlot={renderSlot}
            getters={getters}
          />
        )
      })}
    </div>
  )
})

TimeGutter.propTypes = {
  /**
   * in seconds to allow use this as dep for useEffect
   */
  min: PropTypes.number.isRequired,
  /**
   * in seconds to allow use this as dep for useEffect
   */
  max: PropTypes.number.isRequired,
  timeslots: PropTypes.number.isRequired,
  step: PropTypes.number.isRequired,
  getNow: PropTypes.func.isRequired,
  components: PropTypes.object.isRequired,
  getters: PropTypes.object,
  localizer: PropTypes.object.isRequired,
  resource: PropTypes.string,
}

export default TimeGutter
