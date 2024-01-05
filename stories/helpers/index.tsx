import { action } from '@storybook/addon-actions';
import moment from 'moment';
import format from 'date-fns/format';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enLocale from 'date-fns/locale/en-US';
import ruLocale from 'date-fns/locale/ru';

import {
  Calendar as BaseCalendar,
  CalendarProps,
  dateFnsLocalizer,
  momentLocalizer,
} from '@react-next-calendar/core';
import {
  useDragAndDrop,
  DragAndDropCalendarProps,
} from '@react-next-calendar/dnd';

export type { CalendarProps };

const dateFnsLocales = {
  'en-US': enLocale,
  ru: ruLocale,
};

const localizerMoment = momentLocalizer(moment);
const localizerDateFns = dateFnsLocalizer({
  format,
  startOfWeek,
  getDay,
  locales: dateFnsLocales,
});

export { default as resourcesEvents } from './resourceEvents';

export const Calendar = (props: CalendarProps) => (
  <BaseCalendar localizer={localizerMoment} {...props} />
);

export const CalendarDateFns = (props: CalendarProps) => (
  <BaseCalendar localizer={localizerDateFns} {...props} />
);

export function DragAndDropCalendar(
  props: CalendarProps & DragAndDropCalendarProps,
) {
  const [context, components, selectable, elementProps] = useDragAndDrop(props);

  return (
    <Calendar
      {...props}
      context={context}
      components={components}
      selectable={selectable}
      elementProps={elementProps}
    />
  );
}

export const DraggableCalendar = (
  props: CalendarProps & DragAndDropCalendarProps,
) => {
  return (
    <DragAndDropCalendar
      popup
      selectable
      localizer={localizerDateFns}
      onEventDrop={action('event dropped')}
      onSelectEvent={action('event selected')}
      onSelectSlot={action('slot selected')}
      {...props}
    />
  );
};

export const events = [
  {
    id: 1,
    title: 'test',
    start: moment().add(1, 'days').subtract(5, 'hours').toDate(),
    end: moment().add(1, 'days').subtract(4, 'hours').toDate(),
    allDay: false,
  },
  {
    id: 2,
    title: 'test larger',
    start: moment().startOf('day').add(5, 'hours').toDate(),
    end: moment().startOf('day').add(10, 'hours').toDate(),
    allDay: false,
  },

  {
    id: 3,
    title: 'test larger',
    start: moment().startOf('day').add(15, 'hours').toDate(),
    end: moment().startOf('day').add(23, 'hours').toDate(),
    allDay: false,
  },
  {
    id: 4,
    title: 'test all day',
    start: moment().startOf('day').toDate(),
    end: moment().startOf('day').add(1, 'day').toDate(),
    allDay: true,
  },
  {
    id: 5,
    title: 'test 2 days',
    start: moment().startOf('day').toDate(),
    end: moment().startOf('day').add(2, 'days').toDate(),
    allDay: true,
  },
  {
    id: 6,
    title: 'test multi-day',
    start: moment().toDate(),
    end: moment().add(3, 'days').toDate(),
    allDay: false,
  },
];
