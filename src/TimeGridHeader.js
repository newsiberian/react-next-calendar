import * as React from 'react'
import PropTypes from 'prop-types'
import clsx from 'clsx'
import scrollbarSize from 'dom-helpers/scrollbarSize'

import * as dates from './utils/dates'
import DateContentRow from './DateContentRow'
import Header from './Header'
import ResourceHeader from './ResourceHeader'
import { notify } from './utils/helpers'

function TimeGridHeader({
  range,
  events,
  resources,
  getNow,
  isOverflowing,

  rtl,
  width,

  localizer,
  accessors,
  components,
  getters,

  selected,
  selectable,
  longPressThreshold,

  onSelectSlot,
  onSelectEvent,
  onDoubleClickEvent,
  onKeyPressEvent,
  onDrillDown,
  getDrilldownView,
  scrollRef,
}) {
  function handleHeaderClick(date, view, e) {
    e.preventDefault()
    notify(onDrillDown, [date, view])
  }

  function renderHeaderCells(range) {
    const today = getNow()
    const { header: HeaderComponent = Header } = components

    return range.map((date, i) => {
      let drilldownView = getDrilldownView(date)
      let label = localizer.format(date, 'dayFormat')

      const { className, style } = getters.dayProp(date)

      let header = (
        <HeaderComponent date={date} label={label} localizer={localizer} />
      )

      return (
        <div
          key={i}
          style={style}
          className={clsx(
            'rbc-header',
            className,
            dates.eq(date, today, 'day') && 'rbc-today'
          )}
        >
          {drilldownView ? (
            <a
              href="#"
              onClick={(e) => handleHeaderClick(date, drilldownView, e)}
            >
              {header}
            </a>
          ) : (
            <span>{header}</span>
          )}
        </div>
      )
    })
  }

  const {
    timeGutterHeader: TimeGutterHeader,
    resourceHeader: ResourceHeaderComponent = ResourceHeader,
  } = components

  const style = {}
  if (isOverflowing) {
    style[rtl ? 'marginLeft' : 'marginRight'] = `${scrollbarSize()}px`
  }

  const groupedEvents = resources.groupEvents(events)

  return (
    <div
      style={style}
      ref={scrollRef}
      className={clsx('rbc-time-header', isOverflowing && 'rbc-overflowing')}
    >
      <div
        className="rbc-label rbc-time-header-gutter"
        style={{ width, minWidth: width, maxWidth: width }}
      >
        {TimeGutterHeader && <TimeGutterHeader />}
      </div>

      {resources.map(([id, resource], idx) => (
        <div className="rbc-time-header-content" key={id || idx}>
          {resource && (
            <div className="rbc-row rbc-row-resource" key={`resource_${idx}`}>
              <div className="rbc-header">
                <ResourceHeaderComponent
                  index={idx}
                  label={accessors.resourceTitle(resource)}
                  resource={resource}
                />
              </div>
            </div>
          )}

          <div
            className={`rbc-row rbc-time-header-cell${
              range.length <= 1 ? ' rbc-time-header-cell-single-day' : ''
            }`}
          >
            {renderHeaderCells(range)}
          </div>

          <DateContentRow
            isAllDay
            rtl={rtl}
            getNow={getNow}
            minRows={2}
            range={range}
            events={groupedEvents.get(id) || []}
            resourceId={resource && id}
            className="rbc-allday-cell"
            selectable={selectable}
            selected={selected}
            components={components}
            accessors={accessors}
            getters={getters}
            localizer={localizer}
            onSelect={onSelectEvent}
            onDoubleClick={onDoubleClickEvent}
            onKeyPress={onKeyPressEvent}
            onSelectSlot={onSelectSlot}
            longPressThreshold={longPressThreshold}
          />
        </div>
      ))}
    </div>
  )
}

TimeGridHeader.propTypes = {
  range: PropTypes.array.isRequired,
  events: PropTypes.array.isRequired,
  resources: PropTypes.object,
  getNow: PropTypes.func.isRequired,
  isOverflowing: PropTypes.bool,

  rtl: PropTypes.bool,
  width: PropTypes.number,

  localizer: PropTypes.object.isRequired,
  accessors: PropTypes.object.isRequired,
  components: PropTypes.object.isRequired,
  getters: PropTypes.object.isRequired,

  selected: PropTypes.object,
  selectable: PropTypes.oneOf([true, false, 'ignoreEvents']),
  longPressThreshold: PropTypes.number,

  onSelectSlot: PropTypes.func,
  onSelectEvent: PropTypes.func,
  onDoubleClickEvent: PropTypes.func,
  onKeyPressEvent: PropTypes.func,
  onDrillDown: PropTypes.func,
  getDrilldownView: PropTypes.func.isRequired,
  scrollRef: PropTypes.any,
}

export default TimeGridHeader
