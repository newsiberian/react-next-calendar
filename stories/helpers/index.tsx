import * as React from 'react';
import { addDecorator } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import moment from 'moment';

import {
  Calendar as BaseCalendar,
  momentLocalizer,
} from '../../packages/core/src';

// For Testing SASS styling
import '../../packages/core/src/sass/styles.scss';
import '../../packages/dnd/styles.scss';

import withDragAndDrop from '../../packages/dnd/src';

export { Views } from '../../packages/core/src';

addDecorator(function WithHeight(fn) {
  return <div style={{ height: 600 }}>{fn()}</div>;
});

const localizer = momentLocalizer(moment);

export { default as resourcesEvents } from './resourceEvents';

export const date = (...args) => moment(...args).toDate();

export const Calendar = props => (
  <BaseCalendar localizer={localizer} {...props} />
);

export const DragAndDropCalendar = withDragAndDrop(Calendar);

export const DraggableCalendar = props => {
  return (
    <DragAndDropCalendar
      popup
      selectable
      localizer={localizer}
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
