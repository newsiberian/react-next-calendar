import * as React from 'react';
import contains from 'dom-helpers/contains';
import closest from 'dom-helpers/closest';
import listen from 'dom-helpers/listen';
import { EventHandler } from 'dom-helpers/addEventListener';

const clickTolerance = 5;
const clickInterval = 250;

type NodePossibleBounds = {
  top: number;
  left: number;
  right?: number;
  bottom?: number;
};

type On = <T extends ActionType, A>(
  type: T,
  handler: (args: A, type?: T) => boolean | void,
) => { remove: () => void };

type AddEventListener = <K extends keyof HTMLElementEventMap>(
  type: K,
  handler: EventHandler<K>,
  target: HTMLElement,
) => () => void;

export default function useSelection(
  node: React.RefObject<HTMLElement>,
  selectable: Selectable,
  { global = false, longPressThreshold = 250 } = {},
) {
  const isDetached = React.useRef<boolean>(false);
  const selecting = React.useRef<boolean>(false);
  const selectRect = React.useRef<SelectedRect | null>(null);
  const globalMouse = !node.current || global;
  const listeners = React.useRef(Object.create(null));
  const initialEventData = React.useRef<InitialSelection | null>(null);
  const lastClickData = React.useRef<{ timestamp: number } | null>(null);
  /**
   * @deprecated
   */
  const ctrl = React.useRef<boolean>(false);

  const removeTouchMoveWindowListener = React.useRef<
    ReturnType<AddEventListener>
  >();
  const removeKeyUpListener = React.useRef<ReturnType<AddEventListener>>();
  const removeKeyDownListener = React.useRef<ReturnType<AddEventListener>>();
  const removeDropFromOutsideListener = React.useRef<
    ReturnType<AddEventListener>
  >();
  const removeDragOverFromOutsideListener = React.useRef<
    ReturnType<AddEventListener>
  >();
  const removeInitialEventListener = React.useRef<
    ReturnType<AddEventListener>
  >();
  const removeEndListener = React.useRef<ReturnType<AddEventListener>>();
  const onEscListener = React.useRef<ReturnType<AddEventListener>>();
  const removeMoveListener = React.useRef<ReturnType<AddEventListener>>();

  function isSelected(nodeRef: HTMLElement): boolean {
    if (!selectRect.current || !selecting.current) {
      return false;
    }
    return objectsCollide(selectRect.current, getBoundsForNode(nodeRef));
  }

  function filter(items: HTMLElement[]) {
    // not selecting
    if (!selectRect.current || !selecting.current) {
      return [];
    }
    return items.filter(isSelected);
  }

  const handleClickEvent = React.useCallback((e: MouseEvent) => {
    const { pageX, pageY, clientX, clientY } = getEventCoordinates(e);
    const now = new Date().getTime();

    if (
      lastClickData.current &&
      now - lastClickData.current.timestamp < clickInterval
    ) {
      // Double click event
      lastClickData.current = null;
      return emit('doubleClick', {
        x: pageX,
        y: pageY,
        clientX: clientX,
        clientY: clientY,
      });
    }

    // Click event
    lastClickData.current = {
      timestamp: now,
    };
    return emit('click', {
      x: pageX,
      y: pageY,
      clientX: clientX,
      clientY: clientY,
    });
  }, []);

  const handleTerminatingEvent = React.useCallback(
    (e: MouseEvent | TouchEvent | KeyboardEvent) => {
      const { pageX, pageY } = getEventCoordinates(
        e as MouseEvent | TouchEvent,
      );

      selecting.current = false;

      removeEndListener.current && removeEndListener.current();
      removeMoveListener.current && removeMoveListener.current();

      if (!initialEventData.current) {
        return;
      }

      const inRoot =
        !node.current || contains(node.current, e.target as Element);
      const click = isClick(pageX, pageY);

      initialEventData.current = null;

      if ((e as KeyboardEvent).key === 'Escape') {
        return emit('reset');
      }

      if (!inRoot) {
        return emit('reset');
      }

      if (click && inRoot) {
        return handleClickEvent(e as MouseEvent);
      }

      // User drag-clicked in the Selectable area
      if (!click) {
        return emit('select', selectRect.current);
      }
    },
    [handleClickEvent],
  );

  const handleMoveEvent = React.useCallback((e: MouseEvent | TouchEvent) => {
    if (initialEventData.current === null || isDetached.current) {
      return;
    }

    const { x, y } = initialEventData.current;
    const { pageX, pageY } = getEventCoordinates(e);
    const w = Math.abs(x - pageX);
    const h = Math.abs(y - pageY);

    const left = Math.min(pageX, x);
    const top = Math.min(pageY, y);
    const old = selecting.current;

    // Prevent emitting selectStart event until mouse is moved.
    // in Chrome on Windows, mouseMove event may be fired just after mouseDown
    // event.
    if (isClick(pageX, pageY) && !old && !(w || h)) {
      return;
    }

    selecting.current = true;
    selectRect.current = {
      top,
      left,
      x: pageX,
      y: pageY,
      right: left + w,
      bottom: top + h,
    };

    if (!old) {
      emit('selectStart', initialEventData.current);
    }

    if (!isClick(pageX, pageY)) {
      emit('selecting', selectRect.current);
    }

    e.preventDefault();
  }, []);

  const handleInitialEvent = React.useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (isDetached.current) {
        return;
      }

      const { clientX, clientY, pageX, pageY } = getEventCoordinates(e);

      // Right clicks
      if (
        e.which === 3 ||
        (e as MouseEvent).button === 2 ||
        !isOverContainer(node.current, clientX, clientY)
      ) {
        return;
      }

      if (
        !globalMouse &&
        node.current &&
        !contains(node.current, e.target as HTMLElement)
      ) {
        const { top, left, bottom, right } = normalizeDistance(0);

        const offsetData = getBoundsForNode(node.current);

        const collides = objectsCollide(
          {
            top: offsetData.top - top,
            left: offsetData.left - left,
            bottom: offsetData.bottom + bottom,
            right: offsetData.right + right,
          },
          { top: pageY, left: pageX },
        );

        if (!collides) {
          return;
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
        }),
      );

      if (typeof result === 'boolean' && !result) {
        return;
      }

      switch (e.type) {
        case 'mousedown':
          removeEndListener.current = addEventListener(
            'mouseup',
            handleTerminatingEvent,
          );
          onEscListener.current = addEventListener(
            'keydown',
            handleTerminatingEvent,
          );
          removeMoveListener.current = addEventListener(
            'mousemove',
            handleMoveEvent,
          );
          break;
        case 'touchstart':
          handleMoveEvent(e);
          removeEndListener.current = addEventListener(
            'touchend',
            handleTerminatingEvent,
          );
          removeMoveListener.current = addEventListener(
            'touchmove',
            handleMoveEvent,
          );
          break;
        default:
          break;
      }
    },
    [globalMouse, handleMoveEvent, handleTerminatingEvent],
  );

  // Adds a listener that will call the handler only after the user has pressed
  // on the screen without moving their finger for 250ms.
  const addLongPressListener = React.useCallback(
    (handler, initialEvent: TouchEvent) => {
      let timer: ReturnType<typeof setTimeout> | null = null;
      let removeTouchMoveListener: ReturnType<AddEventListener> | null = null;
      let removeTouchEndListener: ReturnType<AddEventListener> | null = null;

      const handleTouchStart = (initialEvent: TouchEvent) => {
        timer = setTimeout(() => {
          cleanup();
          handler(initialEvent);
        }, longPressThreshold);
        removeTouchMoveListener = addEventListener('touchmove', () =>
          cleanup(),
        );
        removeTouchEndListener = addEventListener('touchend', () => cleanup());
      };

      const removeTouchStartListener = addEventListener(
        'touchstart',
        handleTouchStart,
      );

      const cleanup = () => {
        if (timer) {
          clearTimeout(timer);
        }
        if (removeTouchMoveListener) {
          removeTouchMoveListener();
        }
        if (removeTouchEndListener) {
          removeTouchEndListener();
        }

        timer = null;
        removeTouchMoveListener = null;
        removeTouchEndListener = null;
      };

      if (initialEvent) {
        handleTouchStart(initialEvent);
      }

      return () => {
        cleanup();
        removeTouchStartListener();
      };
    },
    [longPressThreshold],
  );

  /**
   * Fires when the user drop something from outside the calendar
   */
  const dropFromOutsideListener = React.useCallback((e: DragEvent): void => {
    const { pageX, pageY, clientX, clientY } = getEventCoordinates(e);

    emit('dropFromOutside', {
      x: pageX,
      y: pageY,
      clientX: clientX,
      clientY: clientY,
    });

    e.preventDefault();
  }, []);

  /**
   * Fires when the user starts dragging outside the calendar
   */
  const dragOverFromOutsideListener = React.useCallback(
    (e: DragEvent): void => {
      const { pageX, pageY, clientX, clientY } = getEventCoordinates(e);

      emit('dragOverFromOutside', {
        x: pageX,
        y: pageY,
        clientX: clientX,
        clientY: clientY,
      });

      e.preventDefault();
    },
    [],
  );

  React.useEffect(() => {
    if (selectable) {
      // `isDetached` must be flushed to default to allow events be handled after
      // several `selectable` switching
      isDetached.current = false;
      // Fixes an iOS 10 bug where scrolling could not be prevented on the window.
      // https://github.com/metafizzy/flickity/issues/457#issuecomment-254501356
      removeTouchMoveWindowListener.current = addEventListener(
        'touchmove',
        () => {
          // do nothing.
        },
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        window,
      );
      removeKeyDownListener.current = addEventListener('keydown', keyListener);
      removeKeyUpListener.current = addEventListener('keyup', keyListener);
      removeDropFromOutsideListener.current = addEventListener(
        'drop',
        dropFromOutsideListener,
      );
      removeDragOverFromOutsideListener.current = addEventListener(
        'dragover',
        dragOverFromOutsideListener,
      );
      addInitialEventListener();
    }

    return () => {
      isDetached.current = true;
      listeners.current = Object.create(null);
      removeTouchMoveWindowListener.current &&
        removeTouchMoveWindowListener.current();
      removeInitialEventListener.current &&
        removeInitialEventListener.current();
      removeEndListener.current && removeEndListener.current();
      onEscListener.current && onEscListener.current();
      removeMoveListener.current && removeMoveListener.current();
      removeKeyUpListener.current && removeKeyUpListener.current();
      removeKeyDownListener.current && removeKeyDownListener.current();
      removeDropFromOutsideListener.current &&
        removeDropFromOutsideListener.current();
      removeDragOverFromOutsideListener.current &&
        removeDragOverFromOutsideListener.current();
    };
  }, [
    selectable,
    // TODO: drag breaks if we move `addInitialEventListener` up. Why?
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    addInitialEventListener,
    dragOverFromOutsideListener,
    dropFromOutsideListener,
  ]);

  // Listen for mousedown and touchstart events. When one is received, disable
  // the other and setup future event handling based on the type of event.
  const addInitialEventListener = React.useCallback(() => {
    const removeMouseDownListener = addEventListener(
      'mousedown',
      (e: MouseEvent) => {
        removeInitialEventListener.current &&
          removeInitialEventListener.current();
        handleInitialEvent(e);
        removeInitialEventListener.current = addEventListener(
          'mousedown',
          handleInitialEvent,
        );
      },
    );
    const removeTouchStartListener = addEventListener(
      'touchstart',
      (e: TouchEvent) => {
        removeInitialEventListener.current &&
          removeInitialEventListener.current();
        removeInitialEventListener.current = addLongPressListener(
          handleInitialEvent,
          e,
        );
      },
    );

    removeInitialEventListener.current = () => {
      removeMouseDownListener();
      removeTouchStartListener();
    };
  }, [addLongPressListener, handleInitialEvent]);

  const on: On = (type, handler) => {
    const handlers = listeners.current[type] || (listeners.current[type] = []);

    handlers.push(handler);

    return {
      remove() {
        const idx = handlers.indexOf(handler);
        if (idx !== -1) {
          handlers.splice(idx, 1);
        }
      },
    };
  };

  function emit<T>(type: ActionType, ...args: T[]) {
    let result: unknown | undefined;
    const handlers = listeners.current[type] || [];

    handlers.forEach((fn: (...args: T[]) => unknown) => {
      if (typeof result === 'undefined') {
        result = fn(...args);
      }
    });

    return result;
  }

  function keyListener(e: KeyboardEvent) {
    ctrl.current = e.metaKey || e.ctrlKey;
  }

  function isClick(pageX: number, pageY: number): boolean {
    if (initialEventData.current) {
      const { x, y, isTouch } = initialEventData.current;
      return (
        !isTouch &&
        Math.abs(pageX - x) <= clickTolerance &&
        Math.abs(pageY - y) <= clickTolerance
      );
    }
    return false;
  }

  return [on, isSelected, filter] as const;
}

function addEventListener<K extends keyof HTMLElementEventMap>(
  type: K,
  handler: EventHandler<K>,
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  target?: HTMLElement = document,
) {
  return listen(target, type, handler, { passive: false });
}

function isOverContainer(
  container: HTMLElement | null,
  x: number,
  y: number,
): boolean {
  return Boolean(
    !container ||
      contains(container, document.elementFromPoint(x, y) as Element),
  );
}

export function isEvent(
  node: HTMLElement,
  bounds: Point | InitialSelection,
): boolean {
  return !!getEventNodeFromPoint(node, bounds);
}

export function getEventNodeFromPoint(
  node: HTMLElement,
  { clientX, clientY }: Point | InitialSelection,
): Element | null {
  const target = document.elementFromPoint(clientX, clientY);
  return target ? closest(target, '.rbc-event', node) : null;
}

function getEventCoordinates(
  e: MouseEvent | TouchEvent,
): { clientX: number; clientY: number; pageX: number; pageY: number } {
  let target: MouseEvent | TouchEvent | Touch = e;

  // when this is a touch event, take coordinates from current Touch
  if ((e as TouchEvent).touches?.length) {
    target = (e as TouchEvent).touches[0];
  }

  return {
    clientX: (target as MouseEvent).clientX,
    clientY: (target as MouseEvent).clientY,
    pageX: (target as MouseEvent).pageX,
    pageY: (target as MouseEvent).pageY,
  };
}

/**
 * Given a node, get everything needed to calculate its boundaries
 * @param {HTMLElement} node
 * @return {NodeBounds}
 */
export function getBoundsForNode(
  node: HTMLElement | NodePossibleBounds,
): NodeBounds {
  if (typeof (node as HTMLElement).getBoundingClientRect !== 'function') {
    return node as NodeBounds;
  }

  const rect = (node as HTMLElement).getBoundingClientRect();
  const left = rect.left + pageOffset('left');
  const top = rect.top + pageOffset();

  return {
    top,
    left,
    right: ((node as HTMLElement).offsetWidth || 0) + left,
    bottom: ((node as HTMLElement).offsetHeight || 0) + top,
  };
}

/**
 * Resolve the distance prop from either an Int or an Object
 * @return {Object}
 */
function normalizeDistance(
  distance:
    | { bottom: number; left: number; right: number; top: number }
    | number = 0,
): { bottom: number; left: number; right: number; top: number } {
  if (typeof distance !== 'object') {
    distance = {
      top: distance,
      left: distance,
      right: distance,
      bottom: distance,
    };
  }

  return distance;
}

/**
 * Given two objects containing "top", "left", "offsetWidth" and "offsetHeight"
 * properties, determine if they collide.
 * @param {HTMLElement|NodePossibleBounds} nodeA
 * @param {HTMLElement|NodePossibleBounds} nodeB
 * @param {Number} tolerance
 * @return {boolean}
 */
export function objectsCollide(
  nodeA: HTMLElement | NodePossibleBounds,
  nodeB: HTMLElement | NodePossibleBounds,
  tolerance = 0,
): boolean {
  const {
    top: aTop,
    left: aLeft,
    right: aRight = aLeft,
    bottom: aBottom = aTop,
  } = getBoundsForNode(nodeA);
  const {
    top: bTop,
    left: bLeft,
    right: bRight = bLeft,
    bottom: bBottom = bTop,
  } = getBoundsForNode(nodeB);

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
  );
}

function pageOffset(dir?: 'left'): number {
  if (dir === 'left') {
    return window.pageXOffset || document.body.scrollLeft || 0;
  }
  // else 'top'
  return window.pageYOffset || document.body.scrollTop || 0;
}
