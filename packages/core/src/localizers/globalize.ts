import { dates } from '@react-next-calendar/utils';

import {
  DateLocalizer,
  RangeFormat,
  RangeStartFormat,
  RangeEndFormat,
  WeekStartsOn,
} from '../localizer';

const dateRangeFormat: RangeFormat = ({ start, end }, culture, local) =>
  local.format(start, { date: 'short' }, culture) +
  ' – ' +
  local.format(end, { date: 'short' }, culture);

const timeRangeFormat: RangeFormat = ({ start, end }, culture, local) =>
  local.format(start, { time: 'short' }, culture) +
  ' – ' +
  local.format(end, { time: 'short' }, culture);

const timeRangeStartFormat: RangeStartFormat = ({ start }, culture, local) =>
  local.format(start, { time: 'short' }, culture) + ' – ';

const timeRangeEndFormat: RangeEndFormat = ({ end }, culture, local) =>
  ' – ' + local.format(end, { time: 'short' }, culture);

const weekRangeFormat: RangeFormat = ({ start, end }, culture, local) =>
  local.format(start, 'MMM dd', culture) +
  ' – ' +
  local.format(end, dates.eq(start, end, 'month') ? 'dd' : 'MMM dd', culture);

export const formats = {
  dateFormat: 'dd',
  dayFormat: 'eee dd/MM',
  weekdayFormat: 'eee',

  selectRangeFormat: timeRangeFormat,
  eventTimeRangeFormat: timeRangeFormat,
  eventTimeRangeStartFormat: timeRangeStartFormat,
  eventTimeRangeEndFormat: timeRangeEndFormat,

  timeGutterFormat: { time: 'short' },

  monthHeaderFormat: 'MMMM yyyy',
  dayHeaderFormat: 'eeee MMM dd',
  dayRangeHeaderFormat: weekRangeFormat,
  agendaHeaderFormat: dateRangeFormat,

  agendaDateFormat: 'eee MMM dd',
  agendaTimeFormat: { time: 'short' },
  agendaTimeRangeFormat: timeRangeFormat,
};

export function globalizeLocalizer(globalize: Globalize.Static): DateLocalizer {
  const locale = (culture?: string) =>
    culture ? globalize(culture) : globalize;

  // return the first day of the week from the locale data. Defaults to 'world'
  // territory if no territory is derivable from CLDR.
  // Failing to use CLDR supplemental (not loaded?), revert to the original
  // method of getting first day of week.
  function firstOfWeek(culture?: string): WeekStartsOn {
    try {
      const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
      const cldr = locale(culture).cldr;
      const territory = cldr.attributes.territory;
      const weekData = cldr.get('supplemental').weekData;
      const firstDay = weekData.firstDay[territory || '001'];
      return days.indexOf(firstDay) as WeekStartsOn;
    } catch (e) {
      if (process.env.NODE_ENV !== 'production') {
        console.error(
          'Failed to accurately determine first day of the week.' +
            ' Is supplemental data loaded into CLDR?',
        );
      }
      // maybe cldr supplemental is not loaded? revert to original method
      const date = new Date();
      //cldr-data doesn't seem to be zero based
      const localeDay = Math.max(
        parseInt(locale(culture).formatDate(date, { raw: 'e' }), 10) - 1,
        0,
      );

      return Math.abs(date.getDay() - localeDay) as WeekStartsOn;
    }
  }

  return new DateLocalizer({
    firstOfWeek,
    formats,
    format(value, options, culture) {
      return locale(culture).formatDate(
        value as Date,
        typeof options === 'string'
          ? { raw: options }
          : (options as Globalize.DateFormatterOptions),
      );
    },
  });
}
