import * as React from 'react';
import moment from 'moment';

import { DraggableCalendar } from './helpers';

export const DaylightSavingsStarts = (): React.ReactElement => (
  <DraggableCalendar
    defaultView="day"
    min={moment('12:00am', 'h:mma').toDate()}
    max={moment('11:59pm', 'h:mma').toDate()}
    events={[
      {
        id: 1,
        title: 'on DST',
        start: new Date(2017, 2, 12, 1),
        end: new Date(2017, 2, 12, 2, 30),
        allDay: false,
      },
      {
        id: 2,
        title: 'crosses DST',
        start: new Date(2017, 2, 12, 1),
        end: new Date(2017, 2, 12, 6, 30),
        allDay: false,
      },
      {
        id: 3,
        title: 'After DST',
        start: new Date(2017, 2, 12, 7),
        end: new Date(2017, 2, 12, 9, 30),
        allDay: false,
      },
    ]}
  />
);
DaylightSavingsStarts.storyName = 'Daylight savings starts';

export const DaylightSavingsEnds = (): React.ReactElement => (
  <DraggableCalendar
    defaultView="day"
    min={moment('12:00am', 'h:mma').toDate()}
    max={moment('11:59pm', 'h:mma').toDate()}
    events={[
      {
        id: 1,
        title: 'on DST',
        start: new Date(2017, 10, 5, 1),
        end: new Date(2017, 10, 5, 3, 30),
        allDay: false,
      },
      {
        id: 2,
        title: 'crosses DST',
        start: new Date(2017, 10, 5, 1),
        end: new Date(2017, 10, 5, 6, 30),
        allDay: false,
      },
      {
        id: 3,
        title: 'After DST',
        start: new Date(2017, 10, 5, 7),
        end: new Date(2017, 10, 5, 7, 45),
        allDay: false,
      },
    ]}
  />
);
DaylightSavingsEnds.storyName = 'Daylight savings ends';

export const DaylightSavingsStartsAfterTwoAm = (): React.ReactElement => (
  <DraggableCalendar
    defaultView="day"
    min={moment('3:00am', 'h:mma').toDate()}
    max={moment('11:59pm', 'h:mma').toDate()}
    events={[
      {
        id: 1,
        title: 'After DST',
        start: new Date(2017, 2, 12, 7),
        end: new Date(2017, 2, 12, 9, 30),
        allDay: false,
      },
    ]}
  />
);
DaylightSavingsStartsAfterTwoAm.storyName = 'Daylight savings starts after 2am';

export const DaylightSavingsEndsAfterTwoAm = (): React.ReactElement => (
  <DraggableCalendar
    defaultView="day"
    min={moment('3:00am', 'h:mma').toDate()}
    max={moment('11:59pm', 'h:mma').toDate()}
    events={[
      {
        id: 1,
        title: 'After DST',
        start: new Date(2017, 10, 5, 7),
        end: new Date(2017, 10, 5, 9, 30),
        allDay: false,
      },
    ]}
  />
);
DaylightSavingsEndsAfterTwoAm.storyName = 'Daylight savings ends after 2am';

export default {
  title: 'Event Durations',
  component: DraggableCalendar,
};
