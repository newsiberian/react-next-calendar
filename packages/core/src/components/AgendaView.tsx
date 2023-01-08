import { useEffect, useMemo, useRef } from 'react';
import clsx from 'clsx';
import scrollbarSize from 'dom-helpers/scrollbarSize';
import { dates, inRange, isSelected } from '@react-next-calendar/utils';

import { NavigateAction } from '../utils/constants';

export type AgendaProps = {
  events: RNC.Event[];
  date: Date;
  length: number;

  selected?: RNC.Event;

  accessors: Accessors;
  components: Components & AgendaComponents;
  getters: Getters;
  localizer: Localizer;
};

const defaultLength = 30;

export const AgendaView: ExtendedFC<AgendaProps> = ({
  selected,
  getters,
  accessors,
  localizer,
  components,
  length = defaultLength,
  date,
  events,
}) => {
  const headerRef = useRef<HTMLTableElement>(null);
  const dateColRef = useRef<HTMLTableCellElement>(null);
  const timeColRef = useRef<HTMLTableCellElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const tbodyRef = useRef<HTMLTableSectionElement>(null);
  const widths = useRef<number[]>([]);

  useEffect(() => {
    _adjustHeader();
  });

  const renderDay = (day: Date, dayKey: number) => {
    const AgendaEvent = components.event;
    const AgendaDate = components.date;

    const eventsInRange = events.filter((e: RNC.Event) =>
      inRange(e, dates.startOf(day, 'day'), dates.endOf(day, 'day'), accessors),
    );

    return eventsInRange.map((event, idx) => {
      const title = accessors.title(event);
      const end = accessors.end(event);
      const start = accessors.start(event);

      const eventProps = getters.eventProp(
        event,
        start,
        end,
        isSelected(event, selected),
      );

      const dateLabel = idx === 0 && localizer.format(day, 'agendaDateFormat');
      const first =
        idx === 0 ? (
          <td rowSpan={eventsInRange.length} className="rbc-agenda-date-cell">
            {AgendaDate ? (
              <AgendaDate day={day} label={dateLabel} />
            ) : (
              dateLabel
            )}
          </td>
        ) : null;

      return (
        <tr
          key={dayKey + '_' + idx}
          className={eventProps.className}
          style={eventProps.style}
        >
          {first}
          <td className="rbc-agenda-time-cell">{timeRangeLabel(day, event)}</td>
          <td className="rbc-agenda-event-cell">
            {AgendaEvent ? <AgendaEvent event={event} title={title} /> : title}
          </td>
        </tr>
      );
    }, []);
  };

  const timeRangeLabel = (day: Date, event: RNC.Event) => {
    let label = localizer.messages.allDay;
    const AgendaTime = components.time;

    const end = accessors.end(event);
    const start = accessors.start(event);

    if (!accessors.allDay(event)) {
      if (dates.eq(start, end)) {
        label = localizer.format(start, 'agendaTimeFormat');
      } else if (dates.eq(start, end, 'day')) {
        label = localizer.format({ start, end }, 'agendaTimeRangeFormat');
      } else if (dates.eq(day, start, 'day')) {
        label = localizer.format(start, 'agendaTimeFormat');
      } else if (dates.eq(day, end, 'day')) {
        label = localizer.format(end, 'agendaTimeFormat');
      }
    }

    return (
      <span
        className={clsx(
          dates.gt(day, start, 'day') && 'rbc-continues-prior',
          dates.lt(day, end, 'day') && 'rbc-continues-after',
        )}
      >
        {AgendaTime ? (
          <AgendaTime event={event} day={day} label={label} />
        ) : (
          label
        )}
      </span>
    );
  };

  const _adjustHeader = () => {
    if (
      !tbodyRef.current ||
      !dateColRef.current ||
      !timeColRef.current ||
      !contentRef.current
    ) {
      return;
    }

    const header = headerRef.current;
    const firstRow = tbodyRef.current.firstChild as HTMLTableRowElement;

    if (!firstRow || !header) {
      return;
    }

    const isOverflowing =
      contentRef.current.scrollHeight > contentRef.current.clientHeight;

    const localWidths = [...widths.current];

    widths.current = [
      firstRow.children[0].getBoundingClientRect().width,
      firstRow.children[1].getBoundingClientRect().width,
    ];

    if (
      localWidths[0] !== widths.current[0] ||
      localWidths[1] !== widths.current[1]
    ) {
      dateColRef.current.style.width = widths.current[0] + 'px';
      timeColRef.current.style.width = widths.current[1] + 'px';
    }

    if (isOverflowing) {
      header.classList.add('rbc-header-overflowing');
      header.style.marginRight = scrollbarSize() + 'px';
    } else {
      header.classList.contains('rbc-header-overflowing') &&
        header.classList.remove('rbc-header-overflowing');
    }
  };

  const { messages } = localizer;
  const end = dates.add(date, length, 'day');
  const range = dates.range(date, end, 'day');

  const filteredEvents = useMemo(
    () =>
      events
        .filter(event => inRange(event, date, end, accessors))
        .sort((a, b) => +accessors.start(a) - +accessors.start(b)),
    [events, date, end],
  );

  return (
    <div className="rbc-agenda-view">
      {filteredEvents.length !== 0 ? (
        <>
          <table ref={headerRef} className="rbc-agenda-table">
            <thead>
              <tr>
                <th className="rbc-header" ref={dateColRef}>
                  {messages.date}
                </th>
                <th className="rbc-header" ref={timeColRef}>
                  {messages.time}
                </th>
                <th className="rbc-header">{messages.event}</th>
              </tr>
            </thead>
          </table>
          <div className="rbc-agenda-content" ref={contentRef}>
            <table className="rbc-agenda-table">
              <tbody ref={tbodyRef}>
                {range.map((day, idx) => renderDay(day, idx))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <span className="rbc-agenda-empty">{messages.noEventsInRange}</span>
      )}
    </div>
  );
};

AgendaView.range = (start, { length = defaultLength }: { length?: number }) => {
  const end = dates.add(start, length, 'day');
  return { start, end };
};

AgendaView.navigate = (
  date: Date,
  action: Action,
  { length = defaultLength },
) => {
  switch (action) {
    case NavigateAction.PREVIOUS:
      return dates.add(date, -length, 'day');

    case NavigateAction.NEXT:
      return dates.add(date, length, 'day');

    default:
      return date;
  }
};

AgendaView.title = (start: Date, { length = defaultLength, localizer }) => {
  const end = dates.add(start, length, 'day');
  return localizer.format({ start, end }, 'agendaHeaderFormat');
};
