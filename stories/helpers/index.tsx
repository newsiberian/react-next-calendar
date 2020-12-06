import * as React from 'react';
import { addDecorator } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import moment from 'moment';
import format from 'date-fns/format';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enLocale from 'date-fns/locale/en-US';
import ruLocale from 'date-fns/locale/ru';

const dateFnsLocales = {
  'en-US': enLocale,
  ru: ruLocale,
};

import {
  Calendar as BaseCalendar,
  dateFnsLocalizer,
  momentLocalizer,
} from '@react-next-calendar/core';
import { useDragAndDrop } from '@react-next-calendar/dnd';

export { Views } from '@react-next-calendar/core';

addDecorator(function WithHeight(fn) {
  return <div style={{ height: 600 }}>{fn()}</div>;
});

const localizerMoment = momentLocalizer(moment);
const localizerDateFns = dateFnsLocalizer({
  format,
  startOfWeek,
  getDay,
  locales: dateFnsLocales,
});

export { default as resourcesEvents } from './resourceEvents';

export const Calendar = (
  props: Record<string, unknown>,
): React.ReactElement => (
  <BaseCalendar localizer={localizerMoment} {...props} />
);

export const CalendarDateFns = (
  props: Record<string, unknown>,
): React.ReactElement => (
  <BaseCalendar localizer={localizerDateFns} {...props} />
);

export function DragAndDropCalendar<P>(props: P): React.ReactElement {
  const [
    context,
    components,
    selectable,
    elementProps,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
  ] = useDragAndDrop(props);

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
  props: Record<string, unknown>,
): React.ReactElement => {
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
    title: 'test',
    start: moment().add(1, 'days').subtract(5, 'hours').toDate(),
    end: moment().add(1, 'days').subtract(4, 'hours').toDate(),
    allDay: false,
  },
  {
    title: 'test larger',
    start: moment().startOf('day').add(5, 'hours').toDate(),
    end: moment().startOf('day').add(10, 'hours').toDate(),
    allDay: false,
  },

  {
    title: 'test larger',
    start: moment().startOf('day').add(15, 'hours').toDate(),
    end: moment().startOf('day').add(23, 'hours').toDate(),
    allDay: false,
  },
  {
    title: 'test all day',
    start: moment().startOf('day').toDate(),
    end: moment().startOf('day').add(1, 'day').toDate(),
    allDay: true,
  },
  {
    title: 'test 2 days',
    start: moment().startOf('day').toDate(),
    end: moment().startOf('day').add(2, 'days').toDate(),
    allDay: true,
  },
  {
    title: 'test multi-day',
    start: moment().toDate(),
    end: moment().add(3, 'days').toDate(),
    allDay: false,
  },
];
