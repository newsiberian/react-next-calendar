import React, { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import clsx from 'clsx'

import useSelection, { getBoundsForNode, isEvent } from './hooks/useSelection'
import * as dates from './utils/dates'
import { notify } from './utils/helpers'
import { dateCellSelection, getSlotAtX, pointInBox } from './utils/selection'

function BackgroundCells({
  components: { dateCellWrapper: Wrapper },
  containerRef,
  date: currentDate,
  getNow,
  getters,
  longPressThreshold,
  onSelectStart,
  onSelectEnd,
  onSelectSlot,
  selectable,
  range,
  rtl,
}) {
  // we need most of these as refs because Selection doesn't see state changes
  // internally
  const selecting = useRef(false)
  // we need this as `state` because otherwise render function doesn't see
  // startIdx/endIdx changes
  const [{ startVisual, endVisual }, setStartEnd] = useState({
    startVisual: -1,
    endVisual: -1,
  })
  const startEnd = useRef({
    startIdx: -1,
    endIdx: -1,
  })
  const initial = useRef({})
  const rowRef = useRef(null)

  const [on, isSelected] = useSelection(containerRef.current, selectable, {
    longPressThreshold,
  })

  useEffect(() => {
    if (selectable) {
      initSelectable()
    }
  }, [selectable])

  const handleSelecting = box => {
    let start = -1
    let end = -1

    if (!selecting.current) {
      notify(onSelectStart, [box])
      initial.current = { x: box.x, y: box.y }
      selecting.current = true
    }

    if (isSelected(rowRef.current)) {
      const nodeBox = getBoundsForNode(rowRef.current)
      ;({ startIdx: start, endIdx: end } = dateCellSelection(
        initial.current,
        nodeBox,
        box,
        range.length,
        rtl
      ))
    }

    setStartEnd({ startVisual: start, endVisual: end })
    startEnd.current = { startIdx: start, endIdx: end }
  }

  const handleSelect = bounds => {
    const { startIdx, endIdx } = startEnd.current
    selectSlot({ start: startIdx, end: endIdx, action: 'select', bounds })
    initial.current = {}
    selecting.current = false
    startEnd.current = { startIdx: -1, endIdx: -1 }
    setStartEnd({ startVisual: -1, endVisual: -1 })
    // TODO: this is not passed here, so it always be undefined
    notify(onSelectEnd, [startIdx, endIdx, selecting.current])
  }

  const selectorClicksHandler = (point, actionType) => {
    if (!isEvent(rowRef.current, point)) {
      const rowBox = getBoundsForNode(rowRef.current)

      if (pointInBox(rowBox, point)) {
        let currentCell = getSlotAtX(rowBox, point.x, rtl, range.length)

        selectSlot({
          start: currentCell,
          end: currentCell,
          action: actionType,
          box: point,
        })
      }
    }

    initial.current = {}
    selecting.current = false
  }

  function initSelectable() {
    on('selecting', handleSelecting)

    on('beforeSelect', box => {
      if (selectable !== 'ignoreEvents') return

      return !isEvent(rowRef.current, box)
    })

    on('click', point => selectorClicksHandler(point, 'click'))

    on('doubleClick', point => selectorClicksHandler(point, 'doubleClick'))

    on('select', handleSelect)
  }

  function selectSlot({ start, end, action, bounds, box }) {
    if (end !== -1 && start !== -1)
      onSelectSlot &&
        onSelectSlot({
          start,
          end,
          action,
          bounds,
          box,
          resourceId: this.props.resourceId,
        })
  }

  const current = getNow()

  return (
    <div className="rbc-row-bg" ref={rowRef}>
      {range.map((date, index) => {
        const { className, style } = getters.dayProp(date)

        return (
          <Wrapper
            key={`${date.getDate()}-${index}`}
            value={date}
            range={range}
          >
            <div
              style={style}
              className={clsx(
                'rbc-day-bg',
                className,
                selecting.current &&
                  index >= startVisual &&
                  index <= endVisual &&
                  'rbc-selected-cell',
                dates.eq(date, current, 'day') && 'rbc-today',
                currentDate &&
                  dates.month(currentDate) !== dates.month(date) &&
                  'rbc-off-range-bg'
              )}
            />
          </Wrapper>
        )
      })}
    </div>
  )
}

BackgroundCells.propTypes = {
  date: PropTypes.instanceOf(Date),
  getNow: PropTypes.func.isRequired,

  getters: PropTypes.object.isRequired,
  components: PropTypes.object.isRequired,

  containerRef: PropTypes.shape({
    current: PropTypes.object,
  }).isRequired,
  dayPropGetter: PropTypes.func,
  selectable: PropTypes.oneOf([true, false, 'ignoreEvents']),
  longPressThreshold: PropTypes.number,

  onSelectSlot: PropTypes.func.isRequired,
  onSelectEnd: PropTypes.func,
  onSelectStart: PropTypes.func,

  range: PropTypes.arrayOf(PropTypes.instanceOf(Date)),
  rtl: PropTypes.bool,
  type: PropTypes.string,
  resourceId: PropTypes.any,
}

export default BackgroundCells
