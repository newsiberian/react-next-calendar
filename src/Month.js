import * as React from 'react'
import PropTypes from 'prop-types'
import clsx from 'clsx'
import getPosition from 'dom-helpers/position'
import * as animationFrame from 'dom-helpers/animationFrame'
import chunk from 'lodash/chunk'
import Overlay from 'react-overlays/Overlay'

import useEnhancedEffect from './hooks/useEnhancedEffect'
import * as dates from './utils/dates'
import { navigate, views } from './utils/constants'
import { notify } from './utils/helpers'
import Popup from './Popup'
import DateContentRow from './DateContentRow'
import Header from './Header'
import DateHeader from './DateHeader'

import { inRange, sortEvents } from './utils/eventLevels'

const eventsForWeek = (events, start, end, accessors) =>
  events.filter((e) => inRange(e, start, end, accessors))

function MonthView({
  events,
  date,

  getNow,

  rtl,

  accessors,
  components,
  getters,
  localizer,

  selected,
  selectable,
  longPressThreshold,

  onSelectSlot,
  onSelectEvent,
  onDoubleClickEvent,
  onKeyPressEvent,
  onShowMore,
  onDrillDown,
  getDrilldownView,

  popup,
  handleDragStart,

  popupOffset,
  className,
}) {
  const [rowLimit, setRowLimit] = React.useState(5)
  const [needLimitMeasure, setNeedLimitMeasure] = React.useState(true)
  const [overlay, setOverlay] = React.useState({})
  const [prevDate, setPrevDate] = React.useState(date)
  const pendingSelection = React.useRef([])
  const slotRowRef = React.useRef()
  const rootRef = React.useRef()
  const selectTimer = React.useRef()

  React.useEffect(() => {
    function handleResize() {
      animationFrame.request(() => {
        setNeedLimitMeasure(true)
      })
    }

    window.addEventListener('resize', handleResize, false)

    return () => {
      window.removeEventListener('resize', handleResize, false)
    }
  }, [])

  // we must measure limits before render
  useEnhancedEffect(() => {
    if (needLimitMeasure) {
      measureRowLimit()
    }
  }, [needLimitMeasure])

  React.useEffect(() => {
    const changed = !dates.eq(prevDate, date, 'month')
    if (changed) {
      setNeedLimitMeasure(true)
      setPrevDate(date)
    }
  }, [date, prevDate])

  function renderWeek(week, weekIdx) {
    const weekEvents = eventsForWeek(
      events,
      week[0],
      week[week.length - 1],
      accessors
    )

    weekEvents.sort((a, b) => sortEvents(a, b, accessors))

    return (
      <DateContentRow
        key={weekIdx}
        ref={weekIdx === 0 ? slotRowRef : undefined}
        containerRef={rootRef}
        className="rbc-month-row"
        getNow={getNow}
        date={date}
        range={week}
        events={weekEvents}
        maxRows={rowLimit}
        selected={selected}
        selectable={selectable}
        components={components}
        accessors={accessors}
        getters={getters}
        localizer={localizer}
        renderHeader={readerDateHeading}
        renderForMeasure={needLimitMeasure}
        onShowMore={handleShowMore}
        onSelect={handleSelectEvent}
        onDoubleClick={handleDoubleClickEvent}
        onKeyPress={handleKeyPressEvent}
        onSelectSlot={handleSelectSlot}
        longPressThreshold={longPressThreshold}
        rtl={rtl}
      />
    )
  }

  function readerDateHeading({ date: headerDate, className, ...props }) {
    const isOffRange = dates.month(headerDate) !== dates.month(date)
    const isCurrent = dates.eq(headerDate, date, 'day')
    const drillDownView = getDrilldownView(headerDate)
    const label = localizer.format(headerDate, 'dateFormat')
    const DateHeaderComponent = components.dateHeader || DateHeader

    return (
      <div
        {...props}
        className={clsx(
          className,
          isOffRange && 'rbc-off-range',
          isCurrent && 'rbc-current'
        )}
      >
        <DateHeaderComponent
          label={label}
          date={headerDate}
          drilldownView={drillDownView}
          isOffRange={isOffRange}
          onDrillDown={(e) => handleHeadingClick(headerDate, drillDownView, e)}
        />
      </div>
    )
  }

  function renderHeaders(row) {
    const first = row[0]
    const last = row[row.length - 1]
    const HeaderComponent = components.header || Header

    return dates.range(first, last, 'day').map((day, idx) => (
      <div key={'header_' + idx} className="rbc-header">
        <HeaderComponent
          date={day}
          localizer={localizer}
          label={localizer.format(day, 'weekdayFormat')}
        />
      </div>
    ))
  }

  function renderOverlay() {
    return (
      <Overlay
        rootClose
        placement="bottom"
        show={!!overlay.position}
        onHide={() => setOverlay({})}
        target={() => overlay.target}
      >
        {({ props }) => (
          <Popup
            {...props}
            popupOffset={popupOffset}
            accessors={accessors}
            getters={getters}
            selected={selected}
            components={components}
            localizer={localizer}
            position={overlay.position}
            show={overlayDisplay}
            events={overlay.events}
            slotStart={overlay.date}
            slotEnd={overlay.end}
            onSelect={handleSelectEvent}
            onDoubleClick={handleDoubleClickEvent}
            onKeyPress={handleKeyPressEvent}
            handleDragStart={handleDragStart}
          />
        )}
      </Overlay>
    )
  }

  function measureRowLimit() {
    setRowLimit(slotRowRef.current.getRowLimit())
    setNeedLimitMeasure(false)
  }

  function handleSelectSlot(range, slotInfo) {
    pendingSelection.current = pendingSelection.current.concat(range)

    clearTimeout(selectTimer.current)
    selectTimer.current = setTimeout(() => selectDates(slotInfo))
  }

  function handleHeadingClick(date, view, e) {
    e.preventDefault()
    clearSelection()
    notify(onDrillDown, [date, view])
  }

  function handleSelectEvent(...args) {
    clearSelection()
    notify(onSelectEvent, args)
  }

  function handleDoubleClickEvent(...args) {
    clearSelection()
    notify(onDoubleClickEvent, args)
  }

  function handleKeyPressEvent(...args) {
    clearSelection()
    notify(onKeyPressEvent, args)
  }

  function handleShowMore(events, date, cell, slot, target) {
    //cancel any pending selections so only the event click goes through.
    clearSelection()

    if (popup) {
      let position = getPosition(cell, rootRef.current)

      setOverlay({ date, events, position, target })
    } else {
      notify(onDrillDown, [date, getDrilldownView(date) || views.DAY])
    }

    notify(onShowMore, [events, date, slot])
  }

  function overlayDisplay() {
    setOverlay({})
  }

  function selectDates(slotInfo) {
    let slots = pendingSelection.current.slice()

    pendingSelection.current = []

    slots.sort((a, b) => +a - +b)

    notify(onSelectSlot, {
      slots,
      start: slots[0],
      end: slots[slots.length - 1],
      action: slotInfo.action,
      bounds: slotInfo.bounds,
      box: slotInfo.box,
    })
  }

  function clearSelection() {
    clearTimeout(selectTimer.current)
    pendingSelection.current = []
  }

  const month = dates.visibleDays(date, localizer)
  const weeks = chunk(month, 7)

  return (
    <div className={clsx('rbc-month-view', className)} ref={rootRef}>
      <div className="rbc-row rbc-month-header">{renderHeaders(weeks[0])}</div>

      {weeks.map(renderWeek)}

      {popup && renderOverlay()}
    </div>
  )
}

MonthView.propTypes = {
  events: PropTypes.array.isRequired,
  date: PropTypes.instanceOf(Date),

  min: PropTypes.instanceOf(Date),
  max: PropTypes.instanceOf(Date),

  step: PropTypes.number,
  getNow: PropTypes.func.isRequired,

  scrollToTime: PropTypes.instanceOf(Date),
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
  onSelectEvent: PropTypes.func,
  onDoubleClickEvent: PropTypes.func,
  onKeyPressEvent: PropTypes.func,
  onShowMore: PropTypes.func,
  onDrillDown: PropTypes.func,
  getDrilldownView: PropTypes.func.isRequired,

  popup: PropTypes.bool,
  handleDragStart: PropTypes.func,

  popupOffset: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.shape({
      x: PropTypes.number,
      y: PropTypes.number,
    }),
  ]),
}

MonthView.range = (date, { localizer }) => {
  let start = dates.firstVisibleDay(date, localizer)
  let end = dates.lastVisibleDay(date, localizer)
  return { start, end }
}

MonthView.navigate = (date, action) => {
  switch (action) {
    case navigate.PREVIOUS:
      return dates.add(date, -1, 'month')

    case navigate.NEXT:
      return dates.add(date, 1, 'month')

    default:
      return date
  }
}

MonthView.title = (date, { localizer }) =>
  localizer.format(date, 'monthHeaderFormat')

export default MonthView
