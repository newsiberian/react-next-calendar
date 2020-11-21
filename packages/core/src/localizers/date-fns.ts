import * as dates from '../utils/dates';
import { DateLocalizer } from '../localizer';

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
}) {
  return new DateLocalizer({
    formats,
    firstOfWeek(culture) {
      return getDay(startOfWeek(new Date(), { locale: locales[culture] }));
    },

    format(value, formatString, culture) {
      return _format(new Date(value), formatString, {
        locale: locales[culture],
      });
    },
  });
};

export default dateFnsLocalizer;
