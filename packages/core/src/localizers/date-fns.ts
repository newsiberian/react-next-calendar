import { dates } from '@react-next-calendar/utils';

import {
  DateLocalizer,
  RangeFormat,
  RangeStartFormat,
  RangeEndFormat,
  WeekStartsOn,
} from '../localizer';

type Locale = {
  code?: string;
  formatDistance?: (...args: Array<any>) => any;
  formatRelative?: (...args: Array<any>) => any;
  localize?: {
    ordinalNumber: (...args: Array<any>) => any;
    era: (...args: Array<any>) => any;
    quarter: (...args: Array<any>) => any;
    month: (...args: Array<any>) => any;
    day: (...args: Array<any>) => any;
    dayPeriod: (...args: Array<any>) => any;
  };
  formatLong?: {
    date: (...args: Array<any>) => any;
    time: (...args: Array<any>) => any;
    dateTime: (...args: Array<any>) => any;
  };
  match?: {
    ordinalNumber: (...args: Array<any>) => any;
    era: (...args: Array<any>) => any;
    quarter: (...args: Array<any>) => any;
    month: (...args: Array<any>) => any;
    day: (...args: Array<any>) => any;
    dayPeriod: (...args: Array<any>) => any;
  };
  options?: {
    weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
    firstWeekContainsDate?: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  };
};

type Options = {
  locale?: Locale;
  weekStartsOn?: WeekStartsOn;
  firstWeekContainsDate?: number;
  useAdditionalWeekYearTokens?: boolean;
  useAdditionalDayOfYearTokens?: boolean;
};

const dateRangeFormat: RangeFormat = ({ start, end }, culture, local) =>
  `${local.format(start, 'P', culture)} – ${local.format(end, 'P', culture)}`;

const timeRangeFormat: RangeFormat = ({ start, end }, culture, local) =>
  `${local.format(start, 'p', culture)} – ${local.format(end, 'p', culture)}`;

const timeRangeStartFormat: RangeStartFormat = ({ start }, culture, local) =>
  `${local.format(start, 'h:mma', culture)} – `;

const timeRangeEndFormat: RangeEndFormat = ({ end }, culture, local) =>
  ` – ${local.format(end, 'h:mma', culture)}`;

const weekRangeFormat: RangeFormat = ({ start, end }, culture, local) =>
  `${local.format(start, 'MMMM dd', culture)} – ${local.format(
    end,
    dates.eq(start, end, 'month') ? 'dd' : 'MMMM dd',
    culture,
  )}`;

export const formats = {
  dateFormat: 'dd',
  dayFormat: 'dd eee',
  weekdayFormat: 'cccc',

  selectRangeFormat: timeRangeFormat,
  eventTimeRangeFormat: timeRangeFormat,
  eventTimeRangeStartFormat: timeRangeStartFormat,
  eventTimeRangeEndFormat: timeRangeEndFormat,

  timeGutterFormat: 'p',

  monthHeaderFormat: 'MMMM yyyy',
  dayHeaderFormat: 'cccc dd MMM',
  dayRangeHeaderFormat: weekRangeFormat,
  agendaHeaderFormat: dateRangeFormat,

  agendaDateFormat: 'ccc MMM dd',
  agendaTimeFormat: 'p',
  agendaTimeRangeFormat: timeRangeFormat,
};

const dateFnsLocalizer = function ({
  startOfWeek,
  getDay,
  format: _format,
  locales,
}: {
  startOfWeek: (
    date: Date | number,
    options?: Pick<Options, 'locale' | 'weekStartsOn'>,
  ) => Date;
  format: (date: Date | number, format: string, options?: Options) => string;
  getDay: (date: Date | number) => WeekStartsOn;
  locales: Record<string, unknown>;
}): DateLocalizer {
  return new DateLocalizer({
    formats,
    firstOfWeek(culture): WeekStartsOn {
      return getDay(
        startOfWeek(new Date(), {
          locale: culture ? locales[culture] : undefined,
        } as Options),
      );
    },

    format(value, formatString, culture) {
      return _format(
        new Date(value as Date),
        formatString as string,
        {
          locale: culture ? locales[culture] : undefined,
        } as Options,
      );
    },
  });
};

export default dateFnsLocalizer;
