import * as React from 'react'
import PropTypes from 'prop-types'
import clsx from 'clsx'
import * as animationFrame from 'dom-helpers/animationFrame'
import memoize from 'memoize-one'
import getWidth from 'dom-helpers/width'

import * as dates from './utils/dates'
import DayColumn from './DayColumn'
import TimeGutter from './TimeGutter'
import TimeGridHeader from './TimeGridHeader'
import { notify } from './utils/helpers'
import { inRange, sortEvents } from './utils/eventLevels'
import Resources from './utils/Resources'
import { DayLayoutAlgorithmPropType } from './utils/propTypes'

export default function TimeGrid({
  events,
  resources,

  step = 30,
  timeslots = 2,
  range,
  min = dates.startOf(new Date(), 'day'),
  max = dates.endOf(new Date(), 'day'),
  getNow,

  scrollToTime = dates.startOf(new Date(), 'day'),
  showMultiDayTimes,

  rtl,

  width,

  accessors,
  components,
  getters,
  localizer,

  selected,
  selectable,
  longPressThreshold,

  onSelecting,
  onSelectEvent,
  onSelectSlot,
  onDoubleClickEvent,
  onKeyPressEvent,
  onDrillDown,
  getDrilldownView,

  dayLayoutAlgorithm,
}) {
  const [gutterWidth, setGutterWidth] = React.useState(undefined)
  const [isOverflowing, setIsOverflowing] = React.useState(false)
  const scrollRef = React.useRef()
  const contentRef = React.useRef()
  const gutterRef = React.useRef()
  const scrollRatio = React.useRef(null)
  const measureGutterAnimationFrameRequest = React.useRef()

  React.useEffect(() => {
    let rafHandle
    let updatingOverflow = false

    function handleResize() {
      if (typeof rafHandle === 'number') {
        animationFrame.cancel(rafHandle)
      }
      rafHandle = animationFrame.request(checkOverflow)
    }

    function checkOverflow() {
      if (updatingOverflow || !contentRef.current) {
        return
      }

      setIsOverflowing(
        contentRef.current.scrollHeight > contentRef.current.clientHeight
      )
    }

    calculateScroll()
    checkOverflow()
    applyScroll()

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)

      animationFrame.cancel(rafHandle)

      if (measureGutterAnimationFrameRequest.current) {
        window.cancelAnimationFrame(measureGutterAnimationFrameRequest.current)
      }
    }
  }, [])

  React.useEffect(() => {
    if (typeof width !== 'number') {
      measureGutter()
    }

    applyScroll()
  }, [width, measureGutter, applyScroll])

  React.useEffect(() => {
    calculateScroll()
  }, [range, scrollToTime, calculateScroll])

  function handleScroll(e) {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = e.target.scrollLeft
    }
  }

  function handleSelectAllDayEvent(...args) {
    notify(onSelectEvent, args)
  }

  function handleSelectAllDaySlot(slots, slotInfo) {
    notify(onSelectSlot, {
      slots,
      start: slots[0],
      end: slots[slots.length - 1],
      action: slotInfo.action,
      resourceId: slotInfo.resourceId,
    })
  }

  const measureGutter = React.useCallback(
    function measureGutter() {
      if (measureGutterAnimationFrameRequest.current) {
        window.cancelAnimationFrame(measureGutterAnimationFrameRequest.current)
      }
      measureGutterAnimationFrameRequest.current = window.requestAnimationFrame(
        () => {
          const width = getWidth(gutterRef.current)

          if (width && gutterWidth !== width) {
            setGutterWidth(width)
          }
        }
      )
    },
    [gutterWidth]
  )

  const applyScroll = React.useCallback(function applyScroll() {
    if (typeof scrollRatio.current === 'number') {
      contentRef.current.scrollTop =
        contentRef.current.scrollHeight * scrollRatio.current
      // Only do this once
      scrollRatio.current = null
    }
  }, [])

  const calculateScroll = React.useCallback(
    function calculateScroll() {
      const diffMillis = scrollToTime - dates.startOf(scrollToTime, 'day')

      if (diffMillis === 0) {
        scrollRatio.current = null
      } else {
        const totalMillis = dates.diff(max, min)
        scrollRatio.current = diffMillis / totalMillis
      }
    },
    [scrollToTime, max, min]
  )

  const memoizedResources = memoize((resources, accessors) =>
    Resources(resources, accessors)
  )

  function renderEvents(range, events, now) {
    const res = memoizedResources(resources, accessors)
    const groupedEvents = res.groupEvents(events)

    return res.map(([id, resource], i) =>
      range.map((date, jj) => {
        let daysEvents = (groupedEvents.get(id) || []).filter((event) =>
          dates.inRange(
            date,
            accessors.start(event),
            accessors.end(event),
            'day'
          )
        )

        return (
          <DayColumn
            key={i + '-' + jj}
            events={daysEvents}
            step={step}
            date={date}
            min={dates.merge(date, min)}
            max={dates.merge(date, max)}
            getNow={getNow}
            isNow={dates.eq(date, now, 'day')}
            rtl={rtl}
            accessors={accessors}
            components={components}
            getters={getters}
            localizer={localizer}
            showMultiDayTimes={showMultiDayTimes}
            // TODO: do we need this?
            // culture={}
            timeslots={timeslots}
            selected={selected}
            selectable={selectable}
            // TODO: do we need this?
            // eventOffset={}
            longPressThreshold={longPressThreshold}
            onSelecting={onSelecting}
            onSelectSlot={onSelectSlot}
            onSelectEvent={onSelectEvent}
            onDoubleClickEvent={onDoubleClickEvent}
            onKeyPressEvent={onKeyPressEvent}
            resource={resource && id}
            dayLayoutAlgorithm={dayLayoutAlgorithm}
          />
        )
      })
    )
  }

  let start = range[0]
  let end = range[range.length - 1]

  let allDayEvents = []
  let rangeEvents = []

  events.forEach((event) => {
    if (inRange(event, start, end, accessors)) {
      let eStart = accessors.start(event),
        eEnd = accessors.end(event)

      if (
        accessors.allDay(event) ||
        (dates.isJustDate(eStart) && dates.isJustDate(eEnd)) ||
        (!showMultiDayTimes && !dates.eq(eStart, eEnd, 'day'))
      ) {
        allDayEvents.push(event)
      } else {
        rangeEvents.push(event)
      }
    }
  })

  allDayEvents.sort((a, b) => sortEvents(a, b, accessors))

  return (
    <div
      className={clsx('rbc-time-view', resources && 'rbc-time-view-resources')}
    >
      <TimeGridHeader
        range={range}
        events={allDayEvents}
        width={width || gutterWidth}
        rtl={rtl}
        getNow={getNow}
        localizer={localizer}
        selected={selected}
        resources={memoizedResources(resources, accessors)}
        selectable={selectable}
        accessors={accessors}
        getters={getters}
        components={components}
        scrollRef={scrollRef}
        isOverflowing={isOverflowing}
        longPressThreshold={longPressThreshold}
        onSelectSlot={handleSelectAllDaySlot}
        onSelectEvent={handleSelectAllDayEvent}
        onDoubleClickEvent={onDoubleClickEvent}
        onKeyPressEvent={onKeyPressEvent}
        onDrillDown={onDrillDown}
        getDrilldownView={getDrilldownView}
      />

      <div
        ref={contentRef}
        className="rbc-time-content"
        onScroll={handleScroll}
      >
        <TimeGutter
          date={start}
          ref={gutterRef}
          localizer={localizer}
          min={dates.merge(start, min).getTime()}
          max={dates.merge(start, max).getTime()}
          step={step}
          getNow={getNow}
          timeslots={timeslots}
          components={components}
          className="rbc-time-gutter"
          getters={getters}
        />

        {renderEvents(range, rangeEvents, getNow())}
      </div>
    </div>
  )
}

TimeGrid.propTypes = {
  events: PropTypes.array.isRequired,
  resources: PropTypes.array,

  step: PropTypes.number,
  timeslots: PropTypes.number,
  range: PropTypes.arrayOf(PropTypes.instanceOf(Date)),
  min: PropTypes.instanceOf(Date),
  max: PropTypes.instanceOf(Date),
  getNow: PropTypes.func.isRequired,

  scrollToTime: PropTypes.instanceOf(Date),
  showMultiDayTimes: PropTypes.bool,

  rtl: PropTypes.bool,
  width: PropTypes.number,

  accessors: PropTypes.object.isRequired,
  components: PropTypes.object.isRequired,
  getters: PropTypes.object.isRequired,
  localizer: PropTypes.object.isRequired,

  selected: PropTypes.object,
  selectable: PropTypes.oneOf([true, false, 'ignoreEvents']),
  longPressThreshold: PropTypes.number,

  onNavigate: PropTypes.func,
  onSelectSlot: PropTypes.func,
  onSelectEnd: PropTypes.func,
  onSelectStart: PropTypes.func,
  onSelectEvent: PropTypes.func,
  onDoubleClickEvent: PropTypes.func,
  onKeyPressEvent: PropTypes.func,
  onDrillDown: PropTypes.func,
  getDrilldownView: PropTypes.func.isRequired,

  dayLayoutAlgorithm: DayLayoutAlgorithmPropType,
}
