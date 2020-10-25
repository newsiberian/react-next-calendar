import * as React from 'react'
import contains from 'dom-helpers/contains'
import closest from 'dom-helpers/closest'
import listen from 'dom-helpers/listen'

const clickTolerance = 5
const clickInterval = 250

export default function useSelection(
  node,
  selectable,
  { global = false, longPressThreshold = 250 } = {}
) {
  const isDetached = React.useRef(false)
  const selecting = React.useRef(false)
  const selectRect = React.useRef(null)
  const globalMouse = !node.current || global
  const listeners = React.useRef(Object.create(null))
  const initialEventData = React.useRef(null)
  const lastClickData = React.useRef(null)
  const ctrl = React.useRef()

  const removeTouchMoveWindowListener = React.useRef()
  const removeKeyUpListener = React.useRef()
  const removeKeyDownListener = React.useRef()
  const removeDropFromOutsideListener = React.useRef()
  const removeDragOverFromOutsideListener = React.useRef()
  const removeInitialEventListener = React.useRef()
  const removeEndListener = React.useRef()
  const onEscListener = React.useRef()
  const removeMoveListener = React.useRef()

  React.useEffect(() => {
    if (selectable) {
      // `isDetached` must be flushed to default to allow events be handled after
      // several `selectable` switching
      isDetached.current = false
      // Fixes an iOS 10 bug where scrolling could not be prevented on the window.
      // https://github.com/metafizzy/flickity/issues/457#issuecomment-254501356
      removeTouchMoveWindowListener.current = addEventListener(
        'touchmove',
        () => {},
        window
      )
      removeKeyDownListener.current = addEventListener('keydown', keyListener)
      removeKeyUpListener.current = addEventListener('keyup', keyListener)
      removeDropFromOutsideListener.current = addEventListener(
        'drop',
        dropFromOutsideListener
      )
      removeDragOverFromOutsideListener.current = addEventListener(
        'dragover',
        dragOverFromOutsideListener
      )
      addInitialEventListener()
    }

    return () => {
      isDetached.current = true
      listeners.current = Object.create(null)
      removeTouchMoveWindowListener.current &&
        removeTouchMoveWindowListener.current()
      removeInitialEventListener.current && removeInitialEventListener.current()
      removeEndListener.current && removeEndListener.current()
      onEscListener.current && onEscListener.current()
      removeMoveListener.current && removeMoveListener.current()
      removeKeyUpListener.current && removeKeyUpListener.current()
      removeKeyDownListener.current && removeKeyDownListener.current()
      removeDropFromOutsideListener.current &&
        removeDropFromOutsideListener.current()
      removeDragOverFromOutsideListener.current &&
        removeDragOverFromOutsideListener.current()
    }
  }, [
    selectable,
    addInitialEventListener,
    dragOverFromOutsideListener,
    dropFromOutsideListener,
  ])

  function on(type, handler) {
    const handlers = listeners.current[type] || (listeners.current[type] = [])

    handlers.push(handler)

    return {
      remove() {
        const idx = handlers.indexOf(handler)
        if (idx !== -1) {
          handlers.splice(idx, 1)
        }
      },
    }
  }

  function emit(type, ...args) {
    let result
    const handlers = listeners.current[type] || []

    handlers.forEach((fn) => {
      if (typeof result === 'undefined') {
        result = fn(...args)
      }
    })

    return result
  }

  function isSelected(nodeRef) {
    if (!selectRect.current || !selecting.current) {
      return false
    }
    return objectsCollide(selectRect.current, getBoundsForNode(nodeRef))
  }

  function filter(items) {
    // not selecting
    if (!selectRect.current || !selecting.current) {
      return []
    }
    return items.filter(isSelected)
  }

  // Adds a listener that will call the handler only after the user has pressed
  // on the screen without moving their finger for 250ms.
  const addLongPressListener = React.useCallback(
    (handler, initialEvent) => {
      let timer = null
      let removeTouchMoveListener = null
      let removeTouchEndListener = null

      const handleTouchStart = (initialEvent) => {
        timer = setTimeout(() => {
          cleanup()
          handler(initialEvent)
        }, longPressThreshold)
        removeTouchMoveListener = addEventListener('touchmove', () => cleanup())
        removeTouchEndListener = addEventListener('touchend', () => cleanup())
      }

      const removeTouchStartListener = addEventListener(
        'touchstart',
        handleTouchStart
      )

      const cleanup = () => {
        if (timer) {
          clearTimeout(timer)
        }
        if (removeTouchMoveListener) {
          removeTouchMoveListener()
        }
        if (removeTouchEndListener) {
          removeTouchEndListener()
        }

        timer = null
        removeTouchMoveListener = null
        removeTouchEndListener = null
      }

      if (initialEvent) {
        handleTouchStart(initialEvent)
      }

      return () => {
        cleanup()
        removeTouchStartListener()
      }
    },
    [longPressThreshold]
  )

  // Listen for mousedown and touchstart events. When one is received, disable
  // the other and setup future event handling based on the type of event.
  const addInitialEventListener = React.useCallback(() => {
    const removeMouseDownListener = addEventListener('mousedown', (e) => {
      removeInitialEventListener.current()
      handleInitialEvent(e)
      removeInitialEventListener.current = addEventListener(
        'mousedown',
        handleInitialEvent
      )
    })
    const removeTouchStartListener = addEventListener('touchstart', (e) => {
      removeInitialEventListener.current()
      removeInitialEventListener.current = addLongPressListener(
        handleInitialEvent,
        e
      )
    })

    removeInitialEventListener.current = () => {
      removeMouseDownListener()
      removeTouchStartListener()
    }
  }, [addLongPressListener, handleInitialEvent])

  const dropFromOutsideListener = React.useCallback((e) => {
    const { pageX, pageY, clientX, clientY } = getEventCoordinates(e)

    emit('dropFromOutside', {
      x: pageX,
      y: pageY,
      clientX: clientX,
      clientY: clientY,
    })

    e.preventDefault()
  }, [])

  const dragOverFromOutsideListener = React.useCallback((e) => {
    const { pageX, pageY, clientX, clientY } = getEventCoordinates(e)

    emit('dragOverFromOutside', {
      x: pageX,
      y: pageY,
      clientX: clientX,
      clientY: clientY,
    })

    e.preventDefault()
  }, [])

  const handleClickEvent = React.useCallback((e) => {
    const { pageX, pageY, clientX, clientY } = getEventCoordinates(e)
    const now = new Date().getTime()

    if (
      lastClickData.current &&
      now - lastClickData.current.timestamp < clickInterval
    ) {
      // Double click event
      lastClickData.current = null
      return emit('doubleClick', {
        x: pageX,
        y: pageY,
        clientX: clientX,
        clientY: clientY,
      })
    }

    // Click event
    lastClickData.current = {
      timestamp: now,
    }
    return emit('click', {
      x: pageX,
      y: pageY,
      clientX: clientX,
      clientY: clientY,
    })
  }, [])

  const handleTerminatingEvent = React.useCallback(
    (e) => {
      const { pageX, pageY } = getEventCoordinates(e)

      selecting.current = false

      removeEndListener.current && removeEndListener.current()
      removeMoveListener.current && removeMoveListener.current()

      if (!initialEventData.current) {
        return
      }

      const inRoot = !node.current || contains(node.current, e.target)
      const click = isClick(pageX, pageY)

      initialEventData.current = null

      if (e.key === 'Escape') {
        return emit('reset')
      }

      if (!inRoot) {
        return emit('reset')
      }

      if (click && inRoot) {
        return handleClickEvent(e)
      }

      // User drag-clicked in the Selectable area
      if (!click) {
        return emit('select', selectRect.current)
      }
    },
    [handleClickEvent]
  )

  const handleMoveEvent = React.useCallback((e) => {
    if (initialEventData.current === null || isDetached.current) {
      return
    }

    const { x, y } = initialEventData.current
    const { pageX, pageY } = getEventCoordinates(e)
    const w = Math.abs(x - pageX)
    const h = Math.abs(y - pageY)

    const left = Math.min(pageX, x)
    const top = Math.min(pageY, y)
    const old = selecting.current

    // Prevent emitting selectStart event until mouse is moved.
    // in Chrome on Windows, mouseMove event may be fired just after mouseDown
    // event.
    if (isClick(pageX, pageY) && !old && !(w || h)) {
      return
    }

    selecting.current = true
    selectRect.current = {
      top,
      left,
      x: pageX,
      y: pageY,
      right: left + w,
      bottom: top + h,
    }

    if (!old) {
      emit('selectStart', initialEventData.current)
    }

    if (!isClick(pageX, pageY)) {
      emit('selecting', selectRect.current)
    }

    e.preventDefault()
  }, [])

  const handleInitialEvent = React.useCallback(
    function handleInitialEvent(e) {
      if (isDetached.current) {
        return
      }

      const { clientX, clientY, pageX, pageY } = getEventCoordinates(e)

      // Right clicks
      if (
        e.which === 3 ||
        e.button === 2 ||
        !isOverContainer(node.current, clientX, clientY)
      ) {
        return
      }

      if (!globalMouse && node.current && !contains(node.current, e.target)) {
        const { top, left, bottom, right } = normalizeDistance(0)

        const offsetData = getBoundsForNode(node.current)

        const collides = objectsCollide(
          {
            top: offsetData.top - top,
            left: offsetData.left - left,
            bottom: offsetData.bottom + bottom,
            right: offsetData.right + right,
          },
          { top: pageY, left: pageX }
        )

        if (!collides) {
          return
        }
      }

      const result = emit(
        'beforeSelect',
        (initialEventData.current = {
          isTouch: /^touch/.test(e.type),
          x: pageX,
          y: pageY,
          clientX,
          clientY,
        })
      )

      if (typeof result === 'boolean' && !result) {
        return
      }

      switch (e.type) {
        case 'mousedown':
          removeEndListener.current = addEventListener(
            'mouseup',
            handleTerminatingEvent
          )
          onEscListener.current = addEventListener(
            'keydown',
            handleTerminatingEvent
          )
          removeMoveListener.current = addEventListener(
            'mousemove',
            handleMoveEvent
          )
          break
        case 'touchstart':
          handleMoveEvent(e)
          removeEndListener.current = addEventListener(
            'touchend',
            handleTerminatingEvent
          )
          removeMoveListener.current = addEventListener(
            'touchmove',
            handleMoveEvent
          )
          break
        default:
          break
      }
    },
    [globalMouse, handleMoveEvent, handleTerminatingEvent]
  )

  function keyListener(e) {
    ctrl.current = e.metaKey || e.ctrlKey
  }

  function isClick(pageX, pageY) {
    if (initialEventData.current) {
      const { x, y, isTouch } = initialEventData.current
      return (
        !isTouch &&
        Math.abs(pageX - x) <= clickTolerance &&
        Math.abs(pageY - y) <= clickTolerance
      )
    }
    return false
  }

  return [on, isSelected, filter]
}

function addEventListener(type, handler, target = document) {
  return listen(target, type, handler, { passive: false })
}

function isOverContainer(container, x, y) {
  return !container || contains(container, document.elementFromPoint(x, y))
}

export function getEventNodeFromPoint(node, { clientX, clientY }) {
  const target = document.elementFromPoint(clientX, clientY)
  return closest(target, '.rbc-event', node)
}

export function isEvent(node, bounds) {
  return !!getEventNodeFromPoint(node, bounds)
}

function getEventCoordinates(e) {
  let target = e

  if (e.touches && e.touches.length) {
    target = e.touches[0]
  }

  return {
    clientX: target.clientX,
    clientY: target.clientY,
    pageX: target.pageX,
    pageY: target.pageY,
  }
}

/**
 * Resolve the distance prop from either an Int or an Object
 * @return {Object}
 */
function normalizeDistance(distance = 0) {
  if (typeof distance !== 'object') {
    distance = {
      top: distance,
      left: distance,
      right: distance,
      bottom: distance,
    }
  }

  return distance
}

/**
 * Given two objects containing "top", "left", "offsetWidth" and "offsetHeight"
 * properties, determine if they collide.
 * @param {Object|HTMLElement} nodeA
 * @param {Object|HTMLElement} nodeB
 * @param {Number} tolerance
 * @return {boolean}
 */
export function objectsCollide(nodeA, nodeB, tolerance = 0) {
  const {
    top: aTop,
    left: aLeft,
    right: aRight = aLeft,
    bottom: aBottom = aTop,
  } = getBoundsForNode(nodeA)
  const {
    top: bTop,
    left: bLeft,
    right: bRight = bLeft,
    bottom: bBottom = bTop,
  } = getBoundsForNode(nodeB)

  return !(
    // 'a' bottom doesn't touch 'b' top
    (
      aBottom - tolerance < bTop ||
      // 'a' top doesn't touch 'b' bottom
      aTop + tolerance > bBottom ||
      // 'a' right doesn't touch 'b' left
      aRight - tolerance < bLeft ||
      // 'a' left doesn't touch 'b' right
      aLeft + tolerance > bRight
    )
  )
}

/**
 * Given a node, get everything needed to calculate its boundaries
 * @param {HTMLElement} node
 * @return {Object}
 */
export function getBoundsForNode(node) {
  if (!node.getBoundingClientRect) {
    return node
  }

  const rect = node.getBoundingClientRect()
  const left = rect.left + pageOffset('left')
  const top = rect.top + pageOffset('top')

  return {
    top,
    left,
    right: (node.offsetWidth || 0) + left,
    bottom: (node.offsetHeight || 0) + top,
  }
}

function pageOffset(dir) {
  if (dir === 'left') {
    return window.pageXOffset || document.body.scrollLeft || 0
  }
  if (dir === 'top') {
    return window.pageYOffset || document.body.scrollTop || 0
  }
}
