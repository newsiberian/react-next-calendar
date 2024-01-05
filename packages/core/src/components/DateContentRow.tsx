import { useCallback, useRef, ReactElement, RefObject } from 'react';
import clsx from 'clsx';
import qsa from 'dom-helpers/querySelectorAll';
import { useEnhancedEffect } from '@react-next-calendar/hooks';
import { dates } from '@react-next-calendar/utils';

import * as DateSlotMetrics from '../utils/DateSlotMetrics';
import { BackgroundCells, BackgroundCellsProps } from './BackgroundCells';
import { EventRow, EventRowProps } from './EventRow';
import { EventEndingRow } from './EventEndingRow';

type DateContentRowProps = Omit<EventRowProps, 'slotMetrics'> &
  Pick<
    BackgroundCellsProps,
    | 'date'
    | 'longPressThreshold'
    | 'rtl'
    | 'range'
    | 'resourceId'
    | 'selectable'
  > & {
    events: RNC.Event[];

    renderForMeasure?: boolean;
    measureRowLimit?: (getRowLimit: () => number) => void;
    renderHeader?: <P extends { date: Date; className: string }>(
      props: P,
    ) => ReactElement<P>;

    containerRef?: RefObject<HTMLDivElement>;

    onShowMore?: (
      events: RNC.Event[],
      date: Date,
      cell: HTMLElement,
      slot: number,
      target: EventTarget,
    ) => void;
    onSelectSlot: (slots: Date[], slot: Slot) => void;

    getNow: () => Date;
    isAllDay?: boolean;
    /**
     * Is this the first week row at month view
     */
    isFirstRow?: boolean;

    className?: string;

    minRows?: number;
    maxRows?: number;
  };

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
  onDoubleClick,
  onKeyPress,

  getNow,
  isAllDay = false,
  isFirstRow,

  components,
  getters,

  className,

  minRows = 0,
  maxRows = Infinity,
}: DateContentRowProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const headingRowRef = useRef<HTMLDivElement>(null);
  const eventRowRef = useRef<HTMLDivElement>(null);
  const dateSlotMetrics = useRef(DateSlotMetrics.getSlotMetrics());

  const getRowLimit = useCallback(() => {
    const eventHeight = (
      eventRowRef.current as HTMLDivElement
    ).getBoundingClientRect().height;
    const headingHeight = headingRowRef.current
      ? headingRowRef.current.getBoundingClientRect().height
      : 0;
    const eventSpace =
      (rootRef.current as HTMLDivElement).getBoundingClientRect().height -
      headingHeight;

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
    });
    const row = qsa(rootRef.current as HTMLDivElement, '.rbc-row-bg')[0];

    // const row = (rootRef.current as HTMLDivElement)
    //   .querySelectorAll('.rbc-row-bg')
    //   .item(0);

    if (row) {
      const cell = row.children[slot - 1] as HTMLElement;
      const slotEvents = metrics.getEventsForSlot(slot);

      if (onShowMore) {
        onShowMore(slotEvents, range[slot - 1], cell, slot, target);
      }
    }
  }

  function renderHeadingCell(date: Date, index: number) {
    return (
      renderHeader as <P extends { date: Date; className: string }>(
        props: P,
      ) => ReactElement<P>
    )({
      date,
      key: `header_${index}`,
      className: clsx(
        'rbc-date-cell',
        dates.eq(date, getNow(), 'day') && 'rbc-now',
      ),
    });
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
  });
  const { levels, extra } = metrics;

  const WeekWrapper = components.weekWrapper;

  const eventRowProps = {
    selected,
    getters,
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
        onSelectSlot={handleSelectSlot}
        components={components}
        longPressThreshold={longPressThreshold}
        resourceId={resourceId}
      />

      <div className="rbc-row-content">
        {renderHeader && (
          <div className="rbc-row" ref={headingRowRef}>
            {range.map(renderHeadingCell)}
          </div>
        )}
        {/* We need to wait till rootRef DOM element will be linked. This is
        important for useSelection hook */}
        {Boolean(rootRef.current) && (
          <WeekWrapper isAllDay={isAllDay} rootRef={rootRef} {...eventRowProps}>
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
        )}
      </div>
    </div>
  );
}

export default DateContentRow;
