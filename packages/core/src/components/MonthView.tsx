import {
  useEffect,
  useCallback,
  useRef,
  useState,
  MouseEvent,
  KeyboardEvent,
} from 'react';
import clsx from 'clsx';
import getPosition from 'dom-helpers/position';
import * as animationFrame from 'dom-helpers/animationFrame';
import Overlay from 'react-overlays/Overlay';
import { dates, inRange, sortEvents } from '@react-next-calendar/utils';

import { useLocalizer } from '../model/localizerContext';
import { NavigateAction, views } from '../utils/constants';
import { notify } from '../utils/helpers';
import type { Localizer } from '../localizer';
import { Popup } from './Popup';
import DateContentRow from './DateContentRow';
import { Header } from './Header';
import { DateHeader } from './DateHeader';

type Position = {
  top: number;
  left: number;
  height: number;
  width: number;
};

export type MonthViewProps = {
  events: RNC.Event[];
  date: Date;

  selected?: RNC.Event;
  selectable: Selectable;
  longPressThreshold: number;

  components: Components & MonthComponents;

  onSelectSlot: (slotInfo: SlotInfo) => void;
  onSelectEvent: <P>(args: P) => void;
  onDoubleClickEvent: <P>(args: P) => void;
  onKeyPressEvent: <P>(args: P) => void;
  onShowMore?: (events: RNC.Event[], date: Date, slot: number) => void;
  onDrillDown: (date: Date, view: View | null) => void;

  getDrilldownView: GetDrilldownView;
  getNow: GetNow;

  popup: boolean;
  popupOffset: { x: number; y: number } | number;
};

function chunk<T>(input: T[], size: number): Array<T[]> {
  return input.reduce((arr: Array<T[]>, item: T, idx: number) => {
    return idx % size === 0
      ? [...arr, [item]]
      : [...arr.slice(0, -1), [...arr.slice(-1)[0], item]];
  }, []);
}

const eventsForWeek = (events: RNC.Event[], start: Date, end: Date) =>
  events.filter(e => inRange(e, start, end));

export const MonthView: ExtendedFC<MonthViewProps> = ({
  events,
  date,

  selected,
  selectable,
  longPressThreshold,

  components,

  onSelectSlot,
  onSelectEvent,
  onDoubleClickEvent,
  onKeyPressEvent,
  onShowMore,
  onDrillDown,

  getDrilldownView,
  getNow,

  popup,
  popupOffset,
}) => {
  const localizer = useLocalizer();
  const [rowLimit, setRowLimit] = useState<number>(5);
  const [needLimitMeasure, setNeedLimitMeasure] = useState<boolean>(true);
  const [overlay, setOverlay] = useState<{
    date?: Date;
    events?: RNC.Event[];
    position?: Position;
    target?: EventTarget;
  }>({});
  const [prevDate, setPrevDate] = useState(date);
  const pendingSelection = useRef<Date[]>([]);
  const rootRef = useRef<HTMLDivElement>(null);
  const selectTimer = useRef<ReturnType<typeof setTimeout> | undefined>();

  const month = dates.visibleDays(date, localizer.startOfWeek());
  const weeks = chunk(month, 7);

  useEffect(() => {
    function handleResize() {
      animationFrame.request(() => {
        setNeedLimitMeasure(true);
      });
    }

    window.addEventListener('resize', handleResize, false);

    return () => {
      window.removeEventListener('resize', handleResize, false);
    };
  }, []);

  useEffect(() => {
    const changed = !dates.eq(prevDate, date, 'month');
    if (changed) {
      setNeedLimitMeasure(true);
      setPrevDate(date);
    }
  }, [date, prevDate]);

  const measureRowLimit = useCallback(getRowLimit => {
    setRowLimit(getRowLimit());
    setNeedLimitMeasure(false);
  }, []);

  function handleSelectSlot(range: Date[], slot: Slot): void {
    pendingSelection.current = pendingSelection.current.concat(range);

    if (selectTimer.current) {
      clearTimeout(selectTimer.current);
    }
    selectTimer.current = setTimeout(() => selectDates(slot));
  }

  function handleHeadingClick(
    date: Date,
    view: View | null,
    e: MouseEvent,
  ): void {
    e.preventDefault();
    clearSelection();
    notify(onDrillDown, date, view);
  }

  function handleSelect(event: RNC.Event, e: MouseEvent): void {
    clearSelection();
    notify(onSelectEvent, event, e);
  }

  function handleDoubleClick(event: RNC.Event, e: MouseEvent): void {
    clearSelection();
    notify(onDoubleClickEvent, event, e);
  }

  function handleKeyPress(event: RNC.Event, e: KeyboardEvent): void {
    clearSelection();
    notify(onKeyPressEvent, event, e);
  }

  function handleShowMore(
    events: RNC.Event[],
    date: Date,
    cell: HTMLElement,
    slot: number,
    target: EventTarget,
  ): void {
    //cancel any pending selections so only the event click goes through.
    clearSelection();

    if (popup) {
      const position = getPosition(cell, rootRef.current as HTMLDivElement);

      setOverlay({ date, events, position, target });
    } else {
      notify(onDrillDown, date, getDrilldownView(date) || views.DAY);
    }

    notify(onShowMore, events, date, slot);
  }

  /**
   * This callback fires after event been dragged from popup to month view
   */
  function handlePopupClose(/* e: DragEvent */) {
    setOverlay({});
  }

  function selectDates(slot: Slot): void {
    const slots = pendingSelection.current.slice();

    pendingSelection.current = [];

    slots.sort((a, b) => +a - +b);

    notify(onSelectSlot, {
      slots,
      start: slots[0],
      end: slots[slots.length - 1],
      action: slot.action,
      bounds: slot.bounds,
      box: slot.box,
    });
  }

  function clearSelection() {
    if (selectTimer.current) {
      clearTimeout(selectTimer.current);
    }
    pendingSelection.current = [];
  }

  function readerDateHeading({
    date: headerDate,
    className,
    ...props
  }: {
    date: Date;
    className: string;
  }) {
    const isOffRange = dates.month(headerDate) !== dates.month(date);
    const isCurrent = dates.eq(headerDate, date, 'day');
    const drillDownView = getDrilldownView(headerDate);
    const label = localizer.format(headerDate, 'dateFormat');
    const DateHeaderComponent = components.dateHeader || DateHeader;

    return (
      <div
        {...props}
        className={clsx(
          className,
          isOffRange && 'rbc-off-range',
          isCurrent && 'rbc-current',
        )}
      >
        <DateHeaderComponent
          label={label}
          date={headerDate}
          drillDownView={drillDownView}
          isOffRange={isOffRange}
          onDrillDown={e => handleHeadingClick(headerDate, drillDownView, e)}
        />
      </div>
    );
  }

  function renderWeek(week: Date[], weekIdx: number) {
    const weekEvents = eventsForWeek(events, week[0], week[week.length - 1]);

    weekEvents.sort((a: RNC.Event, b: RNC.Event) => sortEvents(a, b));

    return (
      <DateContentRow
        key={weekIdx}
        containerRef={rootRef}
        isFirstRow={weekIdx === 0}
        className="rbc-month-row"
        getNow={getNow}
        date={date}
        range={week}
        events={weekEvents}
        maxRows={rowLimit}
        selected={selected}
        selectable={selectable}
        components={components}
        renderHeader={readerDateHeading}
        renderForMeasure={needLimitMeasure}
        measureRowLimit={measureRowLimit}
        onShowMore={handleShowMore}
        onSelect={handleSelect}
        onDoubleClick={handleDoubleClick}
        onKeyPress={handleKeyPress}
        onSelectSlot={handleSelectSlot}
        longPressThreshold={longPressThreshold}
      />
    );
  }

  function renderHeaders(row: Date[]) {
    const first = row[0];
    const last = row[row.length - 1];
    const HeaderComponent = components.header || Header;

    return dates.range(first, last, 'day').map((day, idx) => (
      <div key={'header_' + idx} className="rbc-header">
        <HeaderComponent
          date={day}
          label={localizer.format(day, 'weekdayFormat')}
        />
      </div>
    ));
  }

  function renderOverlay() {
    return (
      <Overlay
        flip
        rootClose
        placement="bottom"
        show={!!overlay.position}
        onHide={handlePopupClose}
        target={overlay.target as HTMLElement}
      >
        {({ props }) => (
          <Popup
            {...props}
            popupOffset={popupOffset}
            selected={selected}
            components={components}
            position={overlay.position as Position}
            onDragEnd={handlePopupClose}
            events={overlay.events as RNC.Event[]}
            slotStart={overlay.date as Date}
            onSelect={handleSelect}
            onDoubleClick={handleDoubleClick}
            onKeyPress={handleKeyPress}
          />
        )}
      </Overlay>
    );
  }

  // TODO: Pass custom className from getters
  return (
    <div className={clsx('rbc-month-view')} ref={rootRef}>
      <div className="rbc-row rbc-month-header">{renderHeaders(weeks[0])}</div>

      {weeks.map(renderWeek)}

      {popup && renderOverlay()}
    </div>
  );
};

MonthView.range = (date, { localizer }: { localizer: Localizer }) => {
  const start = dates.firstVisibleDay(date, localizer.startOfWeek());
  const end = dates.lastVisibleDay(date, localizer.startOfWeek());
  return { start, end };
};

MonthView.navigate = (date, action) => {
  switch (action) {
    case NavigateAction.PREVIOUS:
      return dates.add(date, -1, 'month');

    case NavigateAction.NEXT:
      return dates.add(date, 1, 'month');

    default:
      return date;
  }
};

MonthView.title = (date, { localizer }) =>
  localizer.format(date, 'monthHeaderFormat');
