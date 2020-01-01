import React, { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import clsx from 'clsx'

import * as dates from './utils/dates'
import { notify } from './utils/helpers'
import { dateCellSelection, getSlotAtX, pointInBox } from './utils/selection'
import Selection, { getBoundsForNode, isEvent } from './Selection'

function BackgroundCells({
  components: { dateCellWrapper: Wrapper },
  container,
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
  const [prevSelectable, setPrevSelectable] = useState(null)
  const [selecting, setSelecting] = useState(false)
  const [startIdx, setStartIdx] = useState(null)
  const [endIdx, setEndIdx] = useState(null)
  const initial = useRef({})
  const selector = useRef(null)
  const rowRef = useRef(null)

  useEffect(() => {
    if (selectable) {
      initSelectable()
    }

    return () => {
      teardownSelectable()
    }
  }, [])

  useEffect(() => {
    if (selectable) {
      initSelectable()
    } else if (prevSelectable) {
      teardownSelectable()
    }
    setPrevSelectable(selectable)
  }, [selectable])

  function initSelectable() {
    selector.current = new Selection(container, {
      longPressThreshold,
    })

    const selectorClicksHandler = (point, actionType) => {
      if (!isEvent(rowRef.current, point)) {
        const rowBox = getBoundsForNode(rowRef.current)

        if (pointInBox(rowBox, point)) {
          let currentCell = getSlotAtX(rowBox, point.x, rtl, range.length)

          selectSlot({
            startIdx: currentCell,
            endIdx: currentCell,
            action: actionType,
            box: point,
          })
        }
      }

      initial.current = {}
      setSelecting(false)
    }

    selector.current.on('selecting', box => {
      let start = -1
      let end = -1

      if (!selecting) {
        notify(onSelectStart, [box])
        initial.current = { x: box.x, y: box.y }
      }

      if (selector.isSelected(rowRef.current)) {
        const nodeBox = getBoundsForNode(rowRef.current)
        ;({ startIdx: start, endIdx: end } = dateCellSelection(
          initial.current,
          nodeBox,
          box,
          range.length,
          rtl
        ))
      }

      setSelecting(true)
      setStartIdx(start)
      setEndIdx(end)
    })

    selector.current.on('beforeSelect', box => {
      if (selectable !== 'ignoreEvents') return

      return !isEvent(rowRef.current, box)
    })

    selector.current.on('click', point => selectorClicksHandler(point, 'click'))

    selector.current.on('doubleClick', point =>
      selectorClicksHandler(point, 'doubleClick')
    )

    selector.current.on('select', bounds => {
      selectSlot({ action: 'select', bounds })
      initial.current = {}
      setSelecting(false)
      // TODO: this is not passed here, so it always be undefined
      notify(onSelectEnd, [startIdx, endIdx, selecting])
    })
  }

  function teardownSelectable() {
    if (!selector.current) return
    selector.current.teardown()
    selector.current = null
  }

  function selectSlot({ action, bounds, box }) {
    if (endIdx !== -1 && startIdx !== -1)
      onSelectSlot &&
        onSelectSlot({
          start: startIdx,
          end: endIdx,
          action,
          bounds,
          box,
        })
  }

  const current = getNow()

  return (
    <div className="rbc-row-bg" ref={rowRef}>
      {range.map((date, index) => {
        const selected = selecting && index >= startIdx && index <= endIdx
        const { className, style } = getters.dayProp(date)

        return (
          <Wrapper key={index} value={date} range={range}>
            <div
              style={style}
              className={clsx(
                'rbc-day-bg',
                className,
                selected && 'rbc-selected-cell',
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

  container: PropTypes.func,
  dayPropGetter: PropTypes.func,
  selectable: PropTypes.oneOf([true, false, 'ignoreEvents']),
  longPressThreshold: PropTypes.number,

  onSelectSlot: PropTypes.func.isRequired,
  onSelectEnd: PropTypes.func,
  onSelectStart: PropTypes.func,

  range: PropTypes.arrayOf(PropTypes.instanceOf(Date)),
  rtl: PropTypes.bool,
  type: PropTypes.string,
}

export default BackgroundCells
