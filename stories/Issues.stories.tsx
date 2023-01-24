import * as React from 'react';
import moment from 'moment';

import { events, Calendar, DragAndDropCalendar } from './helpers';
import createEvents from './helpers/createEvents';

export const EventLayout = (): React.ReactElement => (
  <Calendar defaultView="day" timeslots={4} events={createEvents(1)} />
);
EventLayout.storyName = 'Event layout';

export const FirstOfTheWeekAllDayEvent = (): React.ReactElement => (
  <Calendar
    events={[
      {
        id: 1,
        allDay: true,
        title: 'All Day Event',
        start: new Date(2016, 11, 4),
        end: new Date(2016, 11, 4),
      },
    ]}
  />
);
FirstOfTheWeekAllDayEvent.storyName = 'First of the week all-day event';

export const EndOfTheWeekAllDayEvent = (): React.ReactElement => (
  <Calendar
    events={[
      {
        id: 1,
        allDay: true,
        title: 'All Day Event',
        start: new Date(2016, 11, 3),
        end: new Date(2016, 11, 3),
      },
    ]}
  />
);
EndOfTheWeekAllDayEvent.storyName = 'End of the week all-day event';

export const EventAtEndOfWeek = (): React.ReactElement => {
  const days = 1;
  const start = moment(new Date(2016, 11, 3))
    .add(days, 'days')
    .subtract(5, 'hours')
    .toDate();

  const end = moment(new Date(2016, 11, 3))
    .add(days, 'days')
    .subtract(4, 'hours')
    .toDate();

  return (
    <Calendar
      events={[
        {
          id: 1,
          title: 'has time',
          start,
          end,
        },
      ]}
    />
  );
};
EventAtEndOfWeek.storyName = 'Event at the end of the week';

export const EventAtStartOfWeek = (): React.ReactElement => {
  const days = 1;
  return (
    <Calendar
      events={[
        {
          id: 1,
          title: 'has time',
          start: moment(new Date(2016, 11, 4))
            .add(days, 'days')
            .subtract(5, 'hours')
            .toDate(),
          end: moment(new Date(2016, 11, 4))
            .add(days, 'days')
            .subtract(4, 'hours')
            .toDate(),
        },
      ]}
    />
  );
};
EventAtStartOfWeek.storyName = 'Event at the beginning of the week';

export const EventsOnConstrainedDayColumn = (): React.ReactElement => (
  <Calendar
    defaultView="day"
    min={moment('8 am', 'h a').toDate()}
    max={moment('5 pm', 'h a').toDate()}
    events={events}
  />
);
EventsOnConstrainedDayColumn.storyName = 'Events on a constrained day column';

export const NoDuration = (): React.ReactElement => (
  /* should display all three events */
  <Calendar
    events={[
      {
        id: 1,
        title: 'start of the week',
        start: new Date(2016, 11, 4),
        end: new Date(2016, 11, 4),
      },
      {
        id: 2,
        title: 'end of the week',
        start: new Date(2016, 11, 3),
        end: new Date(2016, 11, 3),
      },
      {
        id: 3,
        title: 'middle',
        start: new Date(2016, 11, 6),
        end: new Date(2016, 11, 6),
      },
    ]}
  />
);
NoDuration.storyName = 'No duration';

export const SingleDaysShouldOnlySpanOneSlotMultiDaysMultiple =
  (): React.ReactElement => (
    <Calendar
      events={[
        {
          id: 1,
          title: 'SingleDay 1',
          start: new Date(2015, 3, 10),
          end: new Date(2015, 3, 11),
        },
        {
          id: 2,
          title: 'SingleDay 2',
          start: new Date(2015, 3, 11),
          end: new Date(2015, 3, 12),
        },
        {
          id: 3,
          title: 'SingleDay 3',
          start: new Date(2015, 3, 12),
          end: new Date(2015, 3, 13),
        },
        {
          id: 4,
          title: 'SingleDay 4',
          start: new Date(2015, 3, 13),
          end: new Date(2015, 3, 14),
        },
        {
          id: 5,
          title: 'MultiDay 1',
          start: new Date(2015, 3, 24),
          end: new Date(2015, 3, 25, 1, 0, 0, 0),
        },
        {
          id: 6,
          title: 'MultiDay 2',
          start: new Date(2015, 3, 25),
          end: new Date(2015, 3, 26, 1, 0, 0, 0),
        },
      ]}
    />
  );
SingleDaysShouldOnlySpanOneSlotMultiDaysMultiple.storyName =
  'Single days should only span one slot, multi-days multiple';

export const ZeroDurationOddities = (): React.ReactElement => (
  <DragAndDropCalendar
    events={[
      {
        id: 4,
        title: '0 day duration',
        start: new Date(2015, 3, 8, 0, 0, 0),
        end: new Date(2015, 3, 8, 0, 0, 0),
      },
      {
        id: 4,
        title: '1 day duration',
        start: new Date(2015, 3, 9, 0, 0, 0),
        end: new Date(2015, 3, 10, 0, 0, 0),
      },
    ]}
  />
);
ZeroDurationOddities.storyName = 'Zero duration oddities';

export default {
  title: 'Issues',
  component: Calendar,
};
