import * as React from 'react';
import clsx from 'clsx';
import getHeight from 'dom-helpers/height';
import qsa from 'dom-helpers/querySelectorAll';

import useEnhancedEffect from '../hooks/useEnhancedEffect';
import * as dates from '../utils/dates';
import * as DateSlotMetrics from '../utils/DateSlotMetrics';
import BackgroundCells from './BackgroundCells';
import EventRow from './EventRow';
import EventEndingRow from './EventEndingRow';

interface DateContentRowProps {
  date?: Date;
  events: RNC.Event[];
  range: Date[];

  rtl: boolean;
  resourceId?: string;
  renderForMeasure?: boolean;
  measureRowLimit?: (getRowLimit: () => number) => void;
  renderHeader?: <P>(props: P) => React.ReactElement<P>;

  containerRef?: React.RefObject<HTMLDivElement>;
  selected?: RNC.Event;
  selectable: Selectable;
  longPressThreshold: number;

  onShowMore?: (
    events: RNC.Event[],
    date: Date,
    cell: HTMLElement,
    slot: number,
    target: EventTarget,
  ) => void;
  onSelectSlot: (slots: Date[], slot: Slot) => void;
  onSelect: (event: RNC.Event, e: React.MouseEvent) => void;
  onSelectEnd: () => void;
  onSelectStart: () => void;
  onDoubleClick: (event: RNC.Event, e: React.MouseEvent) => void;
  onKeyPress: (event: RNC.Event, e: React.KeyboardEvent) => void;

  getNow: () => Date;
  isAllDay?: boolean;
  /**
   * Is this the first week row at month view
   */
  isFirstRow?: boolean;

  accessors: Accessors;
  components: Components;
  getters: Getters;
  localizer: Localizer;

  className?: string;

  minRows?: number;
  maxRows?: number;
}

function DateContentRow({
  date,
  events,
  range,

  rtl,
  resourceId,
  renderForMeasure = false,
  measureRowLimit,
  renderHeader,

  containerRef,
  selected,
  selectable,
  longPressThreshold,

  onShowMore,
  onSelectSlot,
  onSelect,
  // TODO: not propagated
  onSelectEnd,
  // TODO: not propagated
  onSelectStart,
  onDoubleClick,
  onKeyPress,

  getNow,
  isAllDay = false,
  isFirstRow,

  accessors,
  components,
  getters,
  localizer,

  className,

  minRows = 0,
  maxRows = Infinity,
}: DateContentRowProps): React.ReactElement {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const headingRowRef = React.useRef<HTMLDivElement>(null);
  const eventRowRef = React.useRef<HTMLDivElement>(null);
  const dateSlotMetrics = React.useRef(DateSlotMetrics.getSlotMetrics());

  const getRowLimit = React.useCallback(function getRowLimit() {
    const eventHeight = getHeight(eventRowRef.current as HTMLDivElement);
    const headingHeight = headingRowRef.current
      ? getHeight(headingRowRef.current)
      : 0;
    const eventSpace =
      getHeight(rootRef.current as HTMLDivElement) - headingHeight;

    return Math.max(Math.floor(eventSpace / eventHeight), 1);
  }, []);

  // we must measure limits before render
  useEnhancedEffect(() => {
    // measure first row only
    if (isFirstRow && renderForMeasure && measureRowLimit) {
      measureRowLimit(getRowLimit);
    }
  }, [isFirstRow, renderForMeasure, getRowLimit]);

  function handleSelectSlot(slot: Slot): void {
    onSelectSlot(range.slice(slot.start, slot.end + 1), slot);
  }

  function handleShowMore(slot: number, target: EventTarget) {
    const metrics = dateSlotMetrics.current({
      range,
      events,
      maxRows,
      minRows,
      accessors,
    });
    const row = qsa(rootRef.current as HTMLDivElement, '.rbc-row-bg')[0];

    if (row) {
      const cell = row.children[slot - 1] as HTMLElement;
      const slotEvents = metrics.getEventsForSlot(slot);

      if (onShowMore) {
        onShowMore(slotEvents, range[slot - 1], cell, slot, target);
      }
    }
  }

  function renderHeadingCell(date: Date, index: number): React.ReactElement {
    return (renderHeader as <P>(props: P) => React.ReactElement<P>)({
      date,
      key: `header_${index}`,
      className: clsx(
        'rbc-date-cell',
        dates.eq(date, getNow(), 'day') && 'rbc-now',
      ),
    });
  }

  function renderDummy(): React.ReactElement {
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
    );
  }

  if (renderForMeasure) {
    return renderDummy();
  }

  const metrics = dateSlotMetrics.current({
    range,
    events,
    maxRows,
    minRows,
    accessors,
  });
  const { levels, extra } = metrics;

  const WeekWrapper = components.weekWrapper;

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
  };

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
          {levels.map((segments, idx) => (
            <EventRow key={idx} segments={segments} {...eventRowProps} />
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
  );
}

export default DateContentRow;
