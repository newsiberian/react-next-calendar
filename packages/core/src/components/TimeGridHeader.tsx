import type { MouseEvent, RefObject } from 'react';
import clsx from 'clsx';
import scrollbarSize from 'dom-helpers/scrollbarSize';
import { dates } from '@react-next-calendar/utils';

import { useCalendar } from '../model/calendarContext';
import { useGetters } from '../model/gettersContext';
import { useLocalizer } from '../model/localizerContext';
import { Resources } from '../utils/Resources';
import { notify } from '../utils/helpers';
import DateContentRow from './DateContentRow';
import { Header } from './Header';
import { ResourceHeader } from './ResourceHeader';

export type TimeGridHeaderProps = {
  events: RNC.Event[];
  /**
   * Structured resources
   */
  resources: ReturnType<typeof Resources>;

  range: Date[];

  isOverflowing: boolean;

  width?: number;

  components: Components & WeekComponents;

  selected?: RNC.Event;
  selectable: Selectable;
  longPressThreshold: number;

  getDrilldownView: GetDrilldownView;
  getNow: GetNow;

  onSelectSlot: (slots: Date[], slot: Slot) => void;
  onSelectEvent: <P>(args: P) => void;
  onDoubleClickEvent: <P>(args: P) => void;
  onKeyPressEvent: <P>(args: P) => void;
  onDrillDown: (date: Date, view: View) => void;

  scrollRef: RefObject<HTMLDivElement>;
};

export function TimeGridHeader({
  events,
  resources,
  range,

  isOverflowing,

  width,

  components,

  selected,
  selectable,
  longPressThreshold,

  getDrilldownView,
  getNow,

  onSelectSlot,
  onSelectEvent,
  onDoubleClickEvent,
  onKeyPressEvent,
  onDrillDown,

  scrollRef,
}: TimeGridHeaderProps) {
  const { rtl } = useCalendar();
  const getters = useGetters();
  const localizer = useLocalizer();

  function handleHeaderClick(date: Date, view: View, e: MouseEvent): void {
    e.preventDefault();
    notify(onDrillDown, date, view);
  }

  function renderHeaderCells() {
    const today = getNow();
    // TODO: week header or day header? How do we know what `view` it is?
    //  perhaps we should propagate `view` prop
    const { header: HeaderComponent = Header } = components;

    return range.map((date, i) => {
      const drilldownView = getDrilldownView(date);
      const label = localizer.format(date, 'dayFormat');

      const { className, style } = getters.dayProp(date);

      const header = <HeaderComponent date={date} label={label} />;

      return (
        <div
          key={i}
          style={style}
          className={clsx(
            'rbc-header',
            className,
            dates.eq(date, today, 'day') && 'rbc-today',
          )}
        >
          {drilldownView ? (
            <a
              href="#"
              onClick={e => handleHeaderClick(date, drilldownView, e)}
            >
              {header}
            </a>
          ) : (
            <span>{header}</span>
          )}
        </div>
      );
    });
  }

  const {
    timeGutterHeader: TimeGutterHeader,
    resourceHeader: ResourceHeaderComponent = ResourceHeader,
  } = components;

  const style = {} as { marginLeft?: number; marginRight?: number };
  if (isOverflowing) {
    style[rtl ? 'marginLeft' : 'marginRight'] = scrollbarSize();
  }

  const groupedEvents = resources.groupEvents(events);

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

      {resources.map(([id, resource], index) => (
        <div className="rbc-time-header-content" key={id || index}>
          {resource && (
            <div className="rbc-row rbc-row-resource" key={`resource_${index}`}>
              <div className="rbc-header">
                <ResourceHeaderComponent
                  index={index}
                  label={resource.title}
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
            {renderHeaderCells()}
          </div>

          <DateContentRow
            isAllDay
            getNow={getNow}
            minRows={2}
            range={range}
            events={groupedEvents.get(id) || []}
            resourceId={id}
            className="rbc-allday-cell"
            selectable={selectable}
            selected={selected}
            components={components}
            onSelect={onSelectEvent}
            onDoubleClick={onDoubleClickEvent}
            onKeyPress={onKeyPressEvent}
            onSelectSlot={onSelectSlot}
            longPressThreshold={longPressThreshold}
          />
        </div>
      ))}
    </div>
  );
}
