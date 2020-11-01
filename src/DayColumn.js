import React from 'react'
import PropTypes from 'prop-types'
import clsx from 'clsx'

import usePrevious from './hooks/usePrevious'
import useRerender from './hooks/useRerender'
import useSelection, { getBoundsForNode, isEvent } from './hooks/useSelection'
import * as dates from './utils/dates'
import * as TimeSlotUtils from './utils/TimeSlots'
import { isSelected } from './utils/selection'
import { notify } from './utils/helpers'
import * as DayEventLayout from './utils/DayEventLayout'
import { DayLayoutAlgorithmPropType } from './utils/propTypes'
import TimeSlotGroup from './TimeSlotGroup'
import TimeGridEvent from './TimeGridEvent'

function DayColumn({
  events,
  step,
  date,
  min,
  max,
  getNow,
  isNow,

  rtl,

  accessors,
  components,
  getters,
  localizer,

  timeslots = 2,

  selected,
  selectable,
  longPressThreshold,

  onSelecting,
  onSelectSlot,
  onSelectEvent,
  onDoubleClickEvent,
  onKeyPressEvent,

  resourceId,

  dayLayoutAlgorithm,
}) {
  // we need most of these as refs because Selection doesn't see state changes
  // internally
  const selecting = React.useRef(false)
  const selectionRef = React.useRef({})
  const rerender = useRerender()
  // default state must be non-equal to selectable, so it is not a boolean
  const [prevSelectable, setPrevSelectable] = React.useState(null)
  // This is a current time position, a line at the day slot
  const [timeIndicatorPosition, setTimeIndicatorPosition] = React.useState(null)
  const prevGetNow = usePrevious(getNow)
  const prevIsNow = usePrevious(isNow)
  const prevDate = usePrevious(date)
  const prevMin = usePrevious(min)
  const prevMax = usePrevious(max)
  const prevTimeIndicatorPosition = usePrevious(timeIndicatorPosition)
  const dayRef = React.useRef()
  const intervalTriggered = React.useRef(false)
  const slotMetrics = React.useRef(
    TimeSlotUtils.getSlotMetrics({
      min: new Date(min),
      max: new Date(max),
      timeslots,
      step,
    })
  )
  const timeIndicatorTimeout = React.useRef(null)
  const initialSlot = React.useRef()

  const { dayProp, ...restGetters } = getters
  const {
    eventContainerWrapper: EventContainer,
    ...restComponents
  } = components
  const { className, style } = dayProp(max)

  const [on] = useSelection(dayRef, selectable, {
    longPressThreshold,
  })

  React.useEffect(() => {
    if (isNow) {
      setTimeIndicatorPositionUpdateInterval()
    }

    return () => {
      clearTimeIndicatorInterval()
    }
  }, [])

  React.useEffect(() => {
    slotMetrics.current = slotMetrics.current.update({
      min: new Date(min),
      max: new Date(max),
      timeslots,
      step,
    })
    rerender()
  }, [min, max, timeslots, step, rerender])

  React.useEffect(() => {
    function initSelectable() {
      const maybeSelect = (box) => {
        const state = getSelectionState(box)
        const { startDate: start, endDate: end } = state

        if (onSelecting) {
          if (
            (dates.eq(selectionRef.current.startDate, start, 'minutes') &&
              dates.eq(selectionRef.current.endDate, end, 'minutes')) ||
            onSelecting({ start, end, resourceId }) === false
          ) {
            return
          }
        }

        if (
          selectionRef.current.start !== state.start ||
          selectionRef.current.end !== state.end
        ) {
          selectionRef.current = state
          rerender()
        }

        if (!selecting.current) {
          selecting.current = true
        }
      }

      const getSelectionState = (point) => {
        let currentSlot = slotMetrics.current.closestSlotFromPoint(
          point,
          getBoundsForNode(dayRef.current)
        )

        if (!selecting.current) {
          initialSlot.current = currentSlot
        }

        let initial = initialSlot.current

        if (dates.lte(initial, currentSlot)) {
          currentSlot = slotMetrics.current.nextSlot(currentSlot)
        } else if (dates.gt(initial, currentSlot)) {
          initial = slotMetrics.current.nextSlot(initial)
        }

        const selectRange = slotMetrics.current.getRange(
          dates.min(initial, currentSlot),
          dates.max(initial, currentSlot)
        )

        return {
          ...selectRange,
          top: `${selectRange.top}%`,
          height: `${selectRange.height}%`,
        }
      }

      const selectorClicksHandler = (box, actionType) => {
        if (!isEvent(dayRef.current, box)) {
          const { startDate, endDate } = getSelectionState(box)
          selectSlot({
            startDate,
            endDate,
            action: actionType,
            box,
          })
        }
        selecting.current = false
      }

      on('selecting', maybeSelect)
      on('selectStart', maybeSelect)

      on('beforeSelect', (box) => {
        if (selectable !== 'ignoreEvents') {
          return
        }

        return !isEvent(dayRef.current, box)
      })

      on('click', (box) => selectorClicksHandler(box, 'click'))

      on('doubleClick', (box) => selectorClicksHandler(box, 'doubleClick'))

      on('select', (bounds) => {
        if (selecting.current) {
          selectSlot({
            startDate: selectionRef.current.startDate,
            endDate: selectionRef.current.endDate,
            action: 'select',
            bounds,
          })
          selecting.current = false
          rerender()
        }
      })

      on('reset', () => {
        if (selecting.current) {
          selecting.current = false
          rerender()
        }
      })
    }

    if (selectable !== prevSelectable) {
      if (selectable) {
        initSelectable()
      }

      setPrevSelectable(selectable)
    }
  }, [
    selectable,
    prevSelectable,
    on,
    onSelecting,
    resourceId,
    selectSlot,
    rerender,
  ])

  React.useEffect(() => {
    const getNowChanged = !dates.eq(prevGetNow(), getNow(), 'minutes')

    if (prevIsNow !== isNow || getNowChanged) {
      clearTimeIndicatorInterval()

      if (isNow) {
        const tail =
          !getNowChanged &&
          dates.eq(prevDate, date, 'minutes') &&
          prevTimeIndicatorPosition === timeIndicatorPosition

        setTimeIndicatorPositionUpdateInterval(tail)
      }
    } else if (
      isNow &&
      (!dates.eq(prevMin, min, 'minutes') || !dates.eq(prevMax, max, 'minutes'))
    ) {
      positionTimeIndicator()
    }
  }, [
    date,
    getNow,
    isNow,
    min,
    max,
    timeIndicatorPosition,
    positionTimeIndicator,
    setTimeIndicatorPositionUpdateInterval,
  ])

  function clearTimeIndicatorInterval() {
    intervalTriggered.current = false
    window.clearTimeout(timeIndicatorTimeout.current)
  }

  const positionTimeIndicator = React.useCallback(() => {
    const current = getNow()

    if (current >= min && current <= max) {
      const top = slotMetrics.current.getCurrentTimePosition(current)
      intervalTriggered.current = true
      setTimeIndicatorPosition(top)
    } else {
      clearTimeIndicatorInterval()
    }
  }, [getNow, min, max])

  /**
   * @param tail {Boolean} - whether `positionTimeIndicator` call should be
   *   deferred or called upon setting interval (`true` - if deferred);
   */
  const setTimeIndicatorPositionUpdateInterval = React.useCallback(
    (tail = false) => {
      if (!intervalTriggered.current && !tail) {
        positionTimeIndicator()
      }

      timeIndicatorTimeout.current = window.setTimeout(() => {
        intervalTriggered.current = true
        positionTimeIndicator()
        setTimeIndicatorPositionUpdateInterval()
      }, 60000)
    },
    [positionTimeIndicator]
  )

  const selectSlot = React.useCallback(
    ({ startDate, endDate, action, bounds, box }) => {
      let current = startDate
      const slots = []

      while (dates.lte(current, endDate)) {
        slots.push(current)
        // using Date ensures not to create an endless loop the day DST begins
        current = new Date(+current + step * 60 * 1000)
      }

      notify(onSelectSlot, {
        slots,
        start: startDate,
        end: endDate,
        resourceId,
        action,
        bounds,
        box,
      })
    },
    [onSelectSlot, resourceId, step]
  )

  function handleSelect(...args) {
    notify(onSelectEvent, args)
  }

  function handleDoubleClick(...args) {
    notify(onDoubleClickEvent, args)
  }

  function handleKeyPress(...args) {
    notify(onKeyPressEvent, args)
  }

  function renderEvents() {
    const { messages } = localizer

    const styledEvents = DayEventLayout.getStyledEvents({
      events,
      accessors,
      slotMetrics: slotMetrics.current,
      minimumStartDifference: Math.ceil((step * timeslots) / 2),
      dayLayoutAlgorithm,
    })

    return styledEvents.map(({ event, style }, idx) => {
      const end = accessors.end(event)
      const start = accessors.start(event)
      let format = 'eventTimeRangeFormat'
      let label

      const startsBeforeDay = slotMetrics.current.startsBeforeDay(start)
      const startsAfterDay = slotMetrics.current.startsAfterDay(end)

      if (startsBeforeDay) {
        format = 'eventTimeRangeEndFormat'
      } else if (startsAfterDay) {
        format = 'eventTimeRangeStartFormat'
      }

      if (startsBeforeDay && startsAfterDay) {
        label = messages.allDay
      } else {
        label = localizer.format({ start, end }, format)
      }

      let continuesEarlier =
        startsBeforeDay || slotMetrics.current.startsBefore(start)
      let continuesLater =
        startsAfterDay || slotMetrics.current.startsAfter(end)

      return (
        <TimeGridEvent
          style={style}
          event={event}
          label={label}
          key={'evt_' + idx}
          getters={getters}
          rtl={rtl}
          components={components}
          continuesEarlier={continuesEarlier}
          continuesLater={continuesLater}
          accessors={accessors}
          selected={isSelected(event, selected)}
          onClick={(e) => handleSelect(event, e)}
          onDoubleClick={(e) => handleDoubleClick(event, e)}
          onKeyPress={(e) => handleKeyPress(event, e)}
        />
      )
    })
  }

  return (
    <div
      style={style}
      className={clsx(
        className,
        'rbc-day-slot',
        'rbc-time-column',
        isNow && 'rbc-now',
        isNow && 'rbc-today', // WHY
        selecting.current && 'rbc-slot-selecting'
      )}
      ref={dayRef}
    >
      {slotMetrics.current.groups.map((grp, idx) => (
        <TimeSlotGroup
          key={idx}
          group={grp}
          resource={resourceId}
          getters={restGetters}
          components={restComponents}
        />
      ))}

      <EventContainer
        localizer={localizer}
        resource={resourceId}
        accessors={accessors}
        getters={restGetters}
        components={restComponents}
        slotMetrics={slotMetrics.current}
      >
        <div className={clsx('rbc-events-container', rtl && 'rtl')}>
          {renderEvents()}
        </div>
      </EventContainer>

      {selecting.current && (
        <div
          className="rbc-slot-selection"
          style={{
            top: selectionRef.current.top,
            height: selectionRef.current.height,
          }}
        >
          <span>
            {localizer.format(
              {
                start: selectionRef.current.startDate,
                end: selectionRef.current.endDate,
              },
              'selectRangeFormat'
            )}
          </span>
        </div>
      )}

      {isNow && intervalTriggered.current && (
        <div
          className="rbc-current-time-indicator"
          style={{ top: `${timeIndicatorPosition}%` }}
        />
      )}
    </div>
  )
}

DayColumn.propTypes = {
  events: PropTypes.array.isRequired,
  step: PropTypes.number.isRequired,
  date: PropTypes.instanceOf(Date).isRequired,
  min: PropTypes.instanceOf(Date).isRequired,
  max: PropTypes.instanceOf(Date).isRequired,
  getNow: PropTypes.func.isRequired,
  isNow: PropTypes.bool,

  rtl: PropTypes.bool,

  accessors: PropTypes.object.isRequired,
  components: PropTypes.object.isRequired,
  getters: PropTypes.object.isRequired,
  localizer: PropTypes.object.isRequired,

  timeslots: PropTypes.number,

  selected: PropTypes.object,
  selectable: PropTypes.oneOf([true, false, 'ignoreEvents']),
  longPressThreshold: PropTypes.number,

  onSelecting: PropTypes.func,
  onSelectSlot: PropTypes.func.isRequired,
  onSelectEvent: PropTypes.func.isRequired,
  onDoubleClickEvent: PropTypes.func.isRequired,
  onKeyPressEvent: PropTypes.func,

  resourceId: PropTypes.any,

  dayLayoutAlgorithm: DayLayoutAlgorithmPropType,
}

export default DayColumn
