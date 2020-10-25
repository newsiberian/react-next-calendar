import * as React from 'react'
import moment from 'moment'

import { Views, DraggableCalendar } from './helpers'

export const DaylightSavingsStarts = () => (
  <DraggableCalendar
    defaultView={Views.DAY}
    min={moment('12:00am', 'h:mma').toDate()}
    max={moment('11:59pm', 'h:mma').toDate()}
    events={[
      {
        title: 'on DST',
        start: new Date(2017, 2, 12, 1),
        end: new Date(2017, 2, 12, 2, 30),
        allDay: false,
      },
      {
        title: 'crosses DST',
        start: new Date(2017, 2, 12, 1),
        end: new Date(2017, 2, 12, 6, 30),
        allDay: false,
      },
      {
        title: 'After DST',
        start: new Date(2017, 2, 12, 7),
        end: new Date(2017, 2, 12, 9, 30),
        allDay: false,
      },
    ]}
    defaultDate={new Date(2017, 2, 12)}
  />
)
DaylightSavingsStarts.storyName = 'Daylight savings starts'

export const DaylightSavingsEnds = () => (
  <DraggableCalendar
    defaultView={Views.DAY}
    min={moment('12:00am', 'h:mma').toDate()}
    max={moment('11:59pm', 'h:mma').toDate()}
    events={[
      {
        title: 'on DST',
        start: new Date(2017, 10, 5, 1),
        end: new Date(2017, 10, 5, 3, 30),
        allDay: false,
      },
      {
        title: 'crosses DST',
        start: new Date(2017, 10, 5, 1),
        end: new Date(2017, 10, 5, 6, 30),
        allDay: false,
      },
      {
        title: 'After DST',
        start: new Date(2017, 10, 5, 7),
        end: new Date(2017, 10, 5, 7, 45),
        allDay: false,
      },
    ]}
    defaultDate={new Date(2017, 10, 5)}
  />
)
DaylightSavingsEnds.storyName = 'Daylight savings ends'

export const DaylightSavingsStartsAfterTwoAm = () => (
  <DraggableCalendar
    defaultView={Views.DAY}
    min={moment('3:00am', 'h:mma').toDate()}
    max={moment('11:59pm', 'h:mma').toDate()}
    events={[
      {
        title: 'After DST',
        start: new Date(2017, 2, 12, 7),
        end: new Date(2017, 2, 12, 9, 30),
        allDay: false,
      },
    ]}
    defaultDate={new Date(2017, 2, 12)}
  />
)
DaylightSavingsStartsAfterTwoAm.storyName = 'Daylight savings starts after 2am'

export const DaylightSavingsEndsAfterTwoAm = () => (
  <DraggableCalendar
    defaultView={Views.DAY}
    min={moment('3:00am', 'h:mma').toDate()}
    max={moment('11:59pm', 'h:mma').toDate()}
    events={[
      {
        title: 'After DST',
        start: new Date(2017, 10, 5, 7),
        end: new Date(2017, 10, 5, 9, 30),
        allDay: false,
      },
    ]}
    defaultDate={new Date(2017, 10, 5)}
  />
)
DaylightSavingsEndsAfterTwoAm.storyName = 'Daylight savings ends after 2am'

export default {
  title: 'Event Durations',
  component: DraggableCalendar,
}
