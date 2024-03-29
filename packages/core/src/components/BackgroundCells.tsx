import { useEffect, useRef, useState, RefObject } from 'react';
import clsx from 'clsx';
import {
  useSelection,
  getBoundsForNode,
  isEvent,
} from '@react-next-calendar/hooks';
import {
  dates,
  dateCellSelection,
  getSlotAtX,
  pointInBox,
} from '@react-next-calendar/utils';

import { useGetters } from '../model/gettersContext';
import { useCalendar } from '../model/calendarContext';

export type BackgroundCellsProps = {
  components: Components;
  containerRef: RefObject<HTMLDivElement>;
  date?: Date;
  getNow: () => Date;
  longPressThreshold: number;
  onSelectSlot: (slot: Slot) => void;
  selectable: Selectable;
  range: Date[];
  resourceId?: string | number;
};

const initialSelection = { x: 0, y: 0 };

export function BackgroundCells({
  components: { dateCellWrapper: Wrapper },
  containerRef,
  date: currentDate,
  getNow,
  longPressThreshold,
  onSelectSlot,
  selectable,
  range,
  resourceId,
}: BackgroundCellsProps) {
  const getters = useGetters();
  const { rtl } = useCalendar();
  // we need most of these as refs because Selection doesn't see state changes
  // internally
  const selecting = useRef(false);
  // we need this as `state` because otherwise render function doesn't see
  // startIdx/endIdx changes
  const [{ startVisual, endVisual }, setStartEnd] = useState<{
    startVisual: number;
    endVisual: number;
  }>({
    startVisual: -1,
    endVisual: -1,
  });
  const startEnd = useRef<{ startIdx: number; endIdx: number }>({
    startIdx: -1,
    endIdx: -1,
  });
  const initial = useRef<{ x: number; y: number }>(initialSelection);
  const rowRef = useRef<HTMLDivElement>(null);

  const [on, isSelected] = useSelection(containerRef, selectable, {
    longPressThreshold,
  });

  useEffect(() => {
    function initSelectable() {
      on('selecting', handleSelecting);

      on('beforeSelect', (box: InitialSelection): boolean | void => {
        if (selectable !== 'ignoreEvents') {
          return;
        }

        return (
          Boolean(rowRef.current) &&
          !isEvent(rowRef.current as HTMLDivElement, box)
        );
      });

      on('click', (point: Point) => selectorClicksHandler(point, 'click'));

      on('doubleClick', (point: Point) =>
        selectorClicksHandler(point, 'doubleClick'),
      );

      on('select', handleSelect);
    }

    if (selectable) {
      initSelectable();
    }
  }, [selectable]);

  const handleSelecting = (box: SelectedRect): void => {
    let start = -1;
    let end = -1;

    if (!selecting.current) {
      initial.current = { x: box.x, y: box.y };
      selecting.current = true;
    }

    if (rowRef.current && isSelected(rowRef.current)) {
      const nodeBox = getBoundsForNode(rowRef.current);
      ({ startIdx: start, endIdx: end } = dateCellSelection(
        initial.current,
        nodeBox,
        box,
        range.length,
        rtl,
      ));
    }

    setStartEnd({ startVisual: start, endVisual: end });
    startEnd.current = { startIdx: start, endIdx: end };
  };

  const handleSelect = (bounds: SelectedRect): void => {
    const { startIdx, endIdx } = startEnd.current;
    selectSlot({ start: startIdx, end: endIdx, action: 'select', bounds });
    initial.current = initialSelection;
    selecting.current = false;
    startEnd.current = { startIdx: -1, endIdx: -1 };
    setStartEnd({ startVisual: -1, endVisual: -1 });
  };

  const selectorClicksHandler = (
    point: Point,
    actionType: ActionType,
  ): void => {
    if (rowRef.current && !isEvent(rowRef.current, point)) {
      const rowBox = getBoundsForNode(rowRef.current);

      if (pointInBox(rowBox, point)) {
        const currentCell = getSlotAtX(rowBox, point.x, rtl, range.length);

        selectSlot({
          start: currentCell,
          end: currentCell,
          action: actionType,
          box: point,
        });
      }
    }

    initial.current = initialSelection;
    selecting.current = false;
  };

  function selectSlot({
    start,
    end,
    action,
    bounds,
    box,
  }: {
    start: number;
    end: number;
    action: ActionType;
    bounds?: SelectedRect;
    box?: Point;
  }) {
    if (end !== -1 && start !== -1)
      onSelectSlot &&
        onSelectSlot({
          start,
          end,
          action,
          bounds,
          box,
          resourceId,
        });
  }

  const current = getNow();

  return (
    <div className="rbc-row-bg" ref={rowRef}>
      {range.map((date, index) => {
        const { className, style } = getters.dayProp(date);

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
                  'rbc-off-range-bg',
              )}
            />
          </Wrapper>
        );
      })}
    </div>
  );
}
