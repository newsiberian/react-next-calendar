import * as React from 'react'
import moment from 'moment'
import { action } from '@storybook/addon-actions'

import '../src/sass/styles.scss'
import '../src/addons/dragAndDrop/styles.scss'

import demoEvents from '../examples/events'
import createEvents from './helpers/createEvents'
import customComponents from './helpers/customComponents'
import { events, Views, Calendar } from './helpers'

const Template = (props) => <Calendar {...props} />

export const Demo = Template.bind({})
Demo.storyName = 'Demo'
Demo.args = {
  popup: true,
  popupOffset: { x: -10, y: -20 },
  events: demoEvents,
  onSelectEvent: action('event selected'),
  defaultDate: new Date(2015, 3, 1),
}

export const DefaultView = Template.bind({})
DefaultView.storyName = 'Default view'
DefaultView.args = {
  defaultView: Views.WEEK,
  min: moment('12:00am', 'h:mma').toDate(),
  max: moment('11:59pm', 'h:mma').toDate(),
  events,
  onSelectEvent: action('event selected'),
  defaultDate: new Date(),
}

export const Selectable = Template.bind({})
Selectable.storyName = 'Selectable'
Selectable.args = {
  selectable: true,
  defaultView: Views.WEEK,
  min: moment('12:00am', 'h:mma').toDate(),
  max: moment('11:59pm', 'h:mma').toDate(),
  events,
  onSelectEvent: action('event selected'),
  onSelectSlot: action('slot selected'),
  defaultDate: new Date(),
}
Selectable.argTypes = {
  defaultView: { type: null },
  events: { type: null },
  min: { type: null },
  max: { type: null },
  defaultDate: { type: null },
}

export const AddCustomDateHeader = Template.bind({})
AddCustomDateHeader.storyName = 'Add custom date header'
AddCustomDateHeader.args = {
  defaultView: Views.MONTH,
  events,
  components: {
    month: {
      dateHeader: ({ label }) => <span>{label} - Custom date header</span>,
    },
  },
}

export const ComplexDayViewLayout = Template.bind({})
ComplexDayViewLayout.storyName = 'Complex day view layout'
ComplexDayViewLayout.args = {
  defaultDate: new Date(),
  defaultView: Views.DAY,
  events: createEvents(1),
  step: 30,
}

export const MultiDay = () => (
  /* should display all three events */
  <Calendar
    showMultiDayTimes
    defaultDate={new Date(2016, 11, 4)}
    max={moment().endOf('day').add(-1, 'hours').toDate()}
    events={[
      {
        title: 'start of the week',
        start: new Date(2016, 11, 4, 15),
        end: new Date(2016, 11, 5, 3),
      },
      {
        title: 'single day longer than max',
        start: new Date(2016, 11, 4, 15),
        end: new Date(2016, 11, 4, 23, 30),
      },
      {
        title: 'end of the week',
        start: new Date(2016, 11, 3),
        end: new Date(2016, 11, 3),
      },
      {
        title: 'middle',
        start: new Date(2016, 11, 6),
        end: new Date(2016, 11, 6),
      },
    ]}
  />
)
MultiDay.storyName = 'Multi day'

export const AgendaWithLength = () => (
  /* should display as title toolbar (from now to now + 14 days) */
  <Calendar defaultView={Views.AGENDA} events={events} length={14} />
)
AgendaWithLength.storyName = 'Agenda view - with length prop'

export const CustomNowIsTheFirstOfMonth = () => {
  const customNow = () => {
    let now = new Date()
    now.setDate(1)
    return now
  }
  return (
    <Calendar
      defaultView={Views.WEEK}
      getNow={customNow}
      min={moment('12:00am', 'h:mma').toDate()}
      max={moment('11:59pm', 'h:mma').toDate()}
      events={events}
      onSelectEvent={action('event selected')}
      defaultDate={new Date()}
    />
  )
}
CustomNowIsTheFirstOfMonth.storyName = 'Custom now is the first of the month'

export const CustomTimeGutterHeader = () => {
  const TimeGutter = () => <p>Custom gutter text</p>

  return (
    <Calendar
      popup
      events={demoEvents}
      onSelectEvent={action('event selected')}
      defaultDate={new Date(2015, 3, 1)}
      defaultView="week"
      views={['week', 'day']}
      components={{
        timeGutterHeader: TimeGutter,
      }}
    />
  )
}
CustomTimeGutterHeader.storyName = 'Custom timeGutterHeader'

export const CustomDateCellWrapper = () => (
  <Calendar
    defaultView={Views.MONTH}
    events={events}
    components={{
      dateCellWrapper: customComponents.dateCellWrapper,
    }}
  />
)
CustomDateCellWrapper.storyName = 'Custom dateCellWrapper'

export const CustomTimeSlotWrapperDay = () => (
  <Calendar
    defaultView={Views.DAY}
    events={events}
    components={{
      timeSlotWrapper: customComponents.timeSlotWrapper,
    }}
  />
)
CustomTimeSlotWrapperDay.storyName = 'Custom timeSlotWrapper (Day)'

export const CustomTimeSlotWrapperWeek = () => (
  <Calendar
    defaultView={Views.WEEK}
    events={events}
    components={{
      timeSlotWrapper: customComponents.timeSlotWrapper,
    }}
  />
)
CustomTimeSlotWrapperWeek.storyName = 'Custom timeSlotWrapper (Week)'

export const CustomEventWrapper = () => (
  <Calendar
    defaultView={Views.DAY}
    events={events}
    components={{
      eventWrapper: customComponents.eventWrapper,
    }}
  />
)
CustomEventWrapper.storyName = 'Custom eventWrapper'

export const CustomNoAgendaEventsLabel = () => (
  <Calendar
    defaultView={Views.AGENDA}
    events={events}
    messages={{
      noEventsInRange:
        'There are no special events in this range [test message]',
    }}
  />
)
CustomNoAgendaEventsLabel.storyName = 'Custom no agenda events label'

export const ScrollToTime = () => (
  <Calendar
    defaultView={Views.DAY}
    scrollToTime={moment('5:00am', 'h:mma').toDate()}
    events={events}
    defaultDate={new Date()}
  />
)
ScrollToTime.storyName = 'Scroll to time'

export default {
  title: 'BigCalendar',
  component: Calendar,
}
