import * as React from 'react'
import { action } from '@storybook/addon-actions'
import moment from 'moment'

import { events, Calendar, Views } from './helpers'

const Template = (props) => (
  <Calendar
    {...props}
    defaultView={Views.WEEK}
    min={moment('12:00am', 'h:mma').toDate()}
    max={moment('11:59pm', 'h:mma').toDate()}
    events={events}
    onSelectEvent={action('event selected')}
    onSelectSlot={action('slot selected')}
    defaultDate={new Date()}
  />
)

export const FirstCase = Template.bind({})
FirstCase.storyName = 'selectable, step 15, 4 timeslots'
FirstCase.args = {
  selectable: true,
  timeslots: 4,
  step: 15,
}

export const SecondCase = () => (
  <Calendar
    selectable
    defaultView={Views.WEEK}
    timeslots={6}
    step={10}
    min={moment('12:00am', 'h:mma').toDate()}
    max={moment('11:59pm', 'h:mma').toDate()}
    events={events}
    onSelectEvent={action('event selected')}
    onSelectSlot={action('slot selected')}
    defaultDate={new Date()}
  />
)
SecondCase.storyName = 'selectable, step 10, 6 timeslots'

export const ThirdCase = () => (
  <Calendar
    selectable
    defaultView={Views.WEEK}
    timeslots={6}
    step={5}
    min={moment('12:00am', 'h:mma').toDate()}
    max={moment('11:59pm', 'h:mma').toDate()}
    events={events}
    onSelectEvent={action('event selected')}
    onSelectSlot={action('slot selected')}
    defaultDate={new Date()}
  />
)
ThirdCase.storyName = 'selectable, step 5, 6 timeslots'

export const FourthCase = () => (
  <Calendar
    defaultView={Views.WEEK}
    selectable
    timeslots={3}
    getNow={() => moment('9:30am', 'h:mma').toDate()}
    min={moment('12:00am', 'h:mma').toDate()}
    max={moment('11:59pm', 'h:mma').toDate()}
    events={events}
    onSelectEvent={action('event selected')}
    onSelectSlot={action('slot selected')}
    defaultDate={new Date()}
  />
)
FourthCase.storyName = 'selectable, 3 timeslots'

export default {
  title: 'Timeslots',
  component: Calendar,
}
