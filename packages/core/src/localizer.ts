import invariant from 'tiny-invariant';
import type { StartOfWeek as WeekStartsOn } from 'date-arithmetic';

type ValueOf<T> = T[keyof T];

export type { WeekStartsOn };

export type Formats = {
  agendaDateFormat: string;

  /**
   * Toolbar header format for the Agenda view, e.g. "4/1/2015 – 5/1/2015"
   */
  agendaHeaderFormat: RangeFormat;
  agendaTimeFormat: string | Record<string, string>;
  agendaTimeRangeFormat: RangeFormat;

  /**
   * Format for the day of the month heading in the Month view.
   * e.g. "01", "02", "03", etc
   */
  dateFormat: string;

  /**
   * A day of the week format for Week and Day headings,
   * e.g. "Wed 01/04"
   *
   */
  dayFormat: string;

  /**
   * Toolbar header format for the Day view, e.g. "Wednesday Apr 01"
   */
  dayHeaderFormat: string;

  /**
   * Toolbar header format for the Week views, e.g. "Mar 29 - Apr 04"
   */
  dayRangeHeaderFormat: RangeFormat;

  /**
   * An optional event time range for events that continue from another day
   */
  eventTimeRangeEndFormat: RangeEndFormat;

  /**
   * Time range displayed on events.
   */
  eventTimeRangeFormat: RangeFormat;

  /**
   * An optional event time range for events that continue onto another day
   */
  eventTimeRangeStartFormat: RangeStartFormat;

  /**
   * Toolbar header format for the Month view, e.g "2015 April"
   *
   */
  monthHeaderFormat: string;

  /**
   * A time range format for selecting time slots, e.g "8:00am – 2:00pm"
   */
  selectRangeFormat: RangeFormat;

  /**
   * The timestamp cell formats in Week and Time views, e.g. "4:00 AM"
   */
  timeGutterFormat: string | Record<string, string>;

  /**
   * Week day name format for the Month week day headings,
   * e.g: "Sun", "Mon", "Tue", etc
   *
   */
  weekdayFormat: string;
};

export type RangeFormat = (
  { start, end }: { start: Date; end: Date },
  culture: string | undefined,
  local: Localizer,
) => string;

export type RangeStartFormat = (
  { start }: { start: Date },
  culture: string | undefined,
  local: Localizer,
) => string;

export type RangeEndFormat = (
  { end }: { end: Date },
  culture: string | undefined,
  local: Localizer,
) => string;

type StartOfWeek = (culture?: string) => WeekStartsOn;

type Format = (
  value: Date | { start: Date; end: Date },
  format: ValueOf<Formats>,
  culture?: string,
) => string;

type Messages = {
  agenda: string;
  allDay: string;
  date: string;
  day: string;
  event: string;
  month: string;
  next: string;
  noEventsInRange: string;
  previous: string;
  showMore: (total: number) => string;
  time: string;
  today: string;
  tomorrow: string;
  week: string;
  work_week: string;
  yesterday: string;
};

export type Localizer = {
  format: Format;
  formats: Formats;
  messages: Messages;
  /**
   * Return the start of a week for the given culture.
   *
   * @param {string} [culture]
   */
  startOfWeek: StartOfWeek;
};

interface DateLocalizerProps {
  firstOfWeek: StartOfWeek;
  format: Format;
  formats: Formats;
}

function _format(
  localizer: Omit<Localizer, 'messages'>,
  formatter: Format,
  value: Date | { start: Date; end: Date },
  format: ValueOf<Formats>,
  culture?: string,
) {
  const result =
    typeof format === 'function'
      ? format(
          value as { start: Date; end: Date },
          culture,
          localizer as Localizer,
        )
      : formatter.call(localizer, value, format, culture);

  invariant(
    result == null || typeof result === 'string',
    '`localizer format(..)` must return a string, null, or undefined',
  );

  return result;
}

export class DateLocalizer implements Omit<Localizer, 'messages'> {
  public startOfWeek: StartOfWeek;
  public formats: Formats;
  public format: Format;

  public constructor(spec: DateLocalizerProps) {
    invariant(
      typeof spec.format === 'function',
      'date localizer `format(..)` must be a function',
    );
    invariant(
      typeof spec.firstOfWeek === 'function',
      'date localizer `firstOfWeek(..)` must be a function',
    );

    this.startOfWeek = spec.firstOfWeek;
    this.formats = spec.formats;
    this.format = (...args) => _format(this, spec.format, ...args);
  }
}

export function mergeWithDefaults(
  localizer: Localizer,
  formatOverrides: Formats,
  messages: Messages,
  culture?: string,
) {
  const formats = {
    ...localizer.formats,
    ...formatOverrides,
  };

  return {
    ...localizer,
    messages,
    startOfWeek: () => localizer.startOfWeek(culture),
    format: (
      value: Date | { start: Date; end: Date },
      format: keyof Formats | ValueOf<Formats>,
    ) =>
      localizer.format(
        value,
        formats[format as keyof Formats] || format,
        culture,
      ),
  };
}
