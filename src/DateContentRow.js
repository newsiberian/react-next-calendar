import * as React from 'react'
import PropTypes from 'prop-types'
import clsx from 'clsx'
import getHeight from 'dom-helpers/height'
import qsa from 'dom-helpers/querySelectorAll'

import useEnhancedEffect from './hooks/useEnhancedEffect'
import * as dates from './utils/dates'
import BackgroundCells from './BackgroundCells'
import EventRow from './EventRow'
import EventEndingRow from './EventEndingRow'
import * as DateSlotMetrics from './utils/DateSlotMetrics'

function DateContentRow({
  date,
  events,
  range,

  rtl,
  resourceId,
  renderForMeasure,
  measureRowLimit,
  renderHeader,

  containerRef = undefined,
  selected,
  selectable,
  longPressThreshold,

  onShowMore,
  onSelectSlot,
  onSelect,
  onSelectEnd,
  onSelectStart,
  onDoubleClick,
  onKeyPress,

  getNow,
  isAllDay,
  isFirstRow,

  accessors,
  components,
  getters,
  localizer,

  className,

  minRows = 0,
  maxRows = Infinity,
}) {
  const rootRef = React.useRef()
  const headingRowRef = React.useRef()
  const eventRowRef = React.useRef()
  const slotMetrics = React.useRef(DateSlotMetrics.getSlotMetrics())

  // we must measure limits before render
  useEnhancedEffect(() => {
    // measure first row only
    if (isFirstRow && renderForMeasure) {
      measureRowLimit(getRowLimit)
    }
  }, [isFirstRow, renderForMeasure, getRowLimit])

  function handleSelectSlot(slot) {
    onSelectSlot(range.slice(slot.start, slot.end + 1), slot)
  }

  function handleShowMore(slot, target) {
    const metrics = slotMetrics.current({
      range,
      events,
      maxRows,
      minRows,
      accessors,
    })
    const row = qsa(rootRef.current, '.rbc-row-bg')[0]

    let cell
    if (row) {
      cell = row.children[slot - 1]
    }

    const slotEvents = metrics.getEventsForSlot(slot)
    onShowMore(slotEvents, range[slot - 1], cell, slot, target)
  }

  const getRowLimit = React.useCallback(function getRowLimit() {
    let eventHeight = getHeight(eventRowRef.current)
    let headingHeight = headingRowRef.current
      ? getHeight(headingRowRef.current)
      : 0
    let eventSpace = getHeight(rootRef.current) - headingHeight

    return Math.max(Math.floor(eventSpace / eventHeight), 1)
  }, [])

  function renderHeadingCell(date, index) {
    return renderHeader({
      date,
      key: `header_${index}`,
      className: clsx(
        'rbc-date-cell',
        dates.eq(date, getNow(), 'day') && 'rbc-now'
      ),
    })
  }

  function renderDummy() {
    return (
      <div className={className} ref={rootRef}>
        <div className="rbc-row-content">
          {renderHeader && (
            <div className="rbc-row" ref={headingRowRef}>
              {range.map(renderHeadingCell)}
            </div>
          )}
          <div className="rbc-row" ref={eventRowRef}>
            <div className="rbc-row-segment">
              <div className="rbc-event">
                <div className="rbc-event-content">&nbsp;</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (renderForMeasure) {
    return renderDummy()
  }

  const metrics = slotMetrics.current({
    range,
    events,
    maxRows,
    minRows,
    accessors,
  })
  const { levels, extra } = metrics

  const WeekWrapper = components.weekWrapper

  const eventRowProps = {
    selected,
    accessors,
    getters,
    localizer,
    components,
    onSelect,
    onDoubleClick,
    onKeyPress,
    resourceId,
    slotMetrics: metrics,
  }

  return (
    <div className={className} ref={rootRef}>
      <BackgroundCells
        date={date}
        getNow={getNow}
        rtl={rtl}
        range={range}
        selectable={selectable}
        containerRef={containerRef || rootRef}
        getters={getters}
        onSelectStart={onSelectStart}
        onSelectEnd={onSelectEnd}
        onSelectSlot={handleSelectSlot}
        components={components}
        longPressThreshold={longPressThreshold}
        resourceId={resourceId}
      />

      <div className="rbc-row-content">
        {renderHeader && (
          <div className="rbc-row " ref={headingRowRef}>
            {range.map(renderHeadingCell)}
          </div>
        )}
        <WeekWrapper isAllDay={isAllDay} {...eventRowProps}>
          {levels.map((segs, idx) => (
            <EventRow key={idx} segments={segs} {...eventRowProps} />
          ))}
          {!!extra.length && (
            <EventEndingRow
              segments={extra}
              onShowMore={handleShowMore}
              {...eventRowProps}
            />
          )}
        </WeekWrapper>
      </div>
    </div>
  )
}

DateContentRow.propTypes = {
  date: PropTypes.instanceOf(Date),
  events: PropTypes.array.isRequired,
  range: PropTypes.array.isRequired,

  rtl: PropTypes.bool,
  resourceId: PropTypes.any,
  renderForMeasure: PropTypes.bool,
  measureRowLimit: PropTypes.func,
  renderHeader: PropTypes.func,

  containerRef: PropTypes.shape({ current: PropTypes.object }),
  selected: PropTypes.object,
  selectable: PropTypes.oneOf([true, false, 'ignoreEvents']),
  longPressThreshold: PropTypes.number,

  onShowMore: PropTypes.func,
  onSelectSlot: PropTypes.func,
  onSelect: PropTypes.func,
  onSelectEnd: PropTypes.func,
  onSelectStart: PropTypes.func,
  onDoubleClick: PropTypes.func,
  onKeyPress: PropTypes.func,
  dayPropGetter: PropTypes.func,

  getNow: PropTypes.func.isRequired,
  isAllDay: PropTypes.bool,
  /**
   * Is this the first week row at month view
   */
  isFirstRow: PropTypes.bool,

  accessors: PropTypes.object.isRequired,
  components: PropTypes.object.isRequired,
  getters: PropTypes.object.isRequired,
  localizer: PropTypes.object.isRequired,

  minRows: PropTypes.number,
  maxRows: PropTypes.number,
}

export default DateContentRow
