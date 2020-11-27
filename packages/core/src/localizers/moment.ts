import { dates } from '@react-next-calendar/utils';

import { DateLocalizer } from '../localizer';

const dateRangeFormat: RangeFormat = ({ start, end }, culture, local) =>
  local.format(start, 'L', culture) + ' – ' + local.format(end, 'L', culture);

const timeRangeFormat: RangeFormat = ({ start, end }, culture, local) =>
  local.format(start, 'LT', culture) + ' – ' + local.format(end, 'LT', culture);

const timeRangeStartFormat: RangeStartFormat = ({ start }, culture, local) =>
  local.format(start, 'LT', culture) + ' – ';

const timeRangeEndFormat: RangeEndFormat = ({ end }, culture, local) =>
  ' – ' + local.format(end, 'LT', culture);

const weekRangeFormat: RangeFormat = ({ start, end }, culture, local) =>
  local.format(start, 'MMMM DD', culture) +
  ' – ' +
  local.format(end, dates.eq(start, end, 'month') ? 'DD' : 'MMMM DD', culture);

export const formats = {
  dateFormat: 'DD',
  dayFormat: 'DD ddd',
  weekdayFormat: 'ddd',

  selectRangeFormat: timeRangeFormat,
  eventTimeRangeFormat: timeRangeFormat,
  eventTimeRangeStartFormat: timeRangeStartFormat,
  eventTimeRangeEndFormat: timeRangeEndFormat,

  timeGutterFormat: 'LT',

  monthHeaderFormat: 'MMMM YYYY',
  dayHeaderFormat: 'dddd MMM DD',
  dayRangeHeaderFormat: weekRangeFormat,
  agendaHeaderFormat: dateRangeFormat,

  agendaDateFormat: 'ddd MMM DD',
  agendaTimeFormat: 'LT',
  agendaTimeRangeFormat: timeRangeFormat,
};

export default function (moment) {
  const locale = (m, c) => (c ? m.locale(c) : m);

  return new DateLocalizer({
    formats,
    firstOfWeek(culture) {
      let data = culture ? moment.localeData(culture) : moment.localeData();
      return data ? data.firstDayOfWeek() : 0;
    },

    format(value, format, culture) {
      return locale(moment(value), culture).format(format);
    },
  });
}
