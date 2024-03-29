import { action } from '@storybook/addon-actions';
import moment from 'moment';

import { events, Calendar, CalendarProps } from './helpers';

const Template = (props: CalendarProps) => (
  <Calendar
    {...props}
    defaultView="week"
    min={moment('12:00am', 'h:mma').toDate()}
    max={moment('11:59pm', 'h:mma').toDate()}
    events={events}
    onSelectEvent={action('event selected')}
    onSelectSlot={action('slot selected')}
  />
);

export const FirstCase = Template.bind({});
FirstCase.storyName = 'selectable, step 15, 4 timeslots';
FirstCase.args = {
  selectable: true,
  timeslots: 4,
  step: 15,
};

export const SecondCase = () => (
  <Calendar
    selectable
    defaultView="week"
    timeslots={6}
    step={10}
    min={moment('12:00am', 'h:mma').toDate()}
    max={moment('11:59pm', 'h:mma').toDate()}
    events={events}
    onSelectEvent={action('event selected')}
    onSelectSlot={action('slot selected')}
  />
);
SecondCase.storyName = 'selectable, step 10, 6 timeslots';

export const ThirdCase = () => (
  <Calendar
    selectable
    defaultView="week"
    timeslots={6}
    step={5}
    min={moment('12:00am', 'h:mma').toDate()}
    max={moment('11:59pm', 'h:mma').toDate()}
    events={events}
    onSelectEvent={action('event selected')}
    onSelectSlot={action('slot selected')}
  />
);
ThirdCase.storyName = 'selectable, step 5, 6 timeslots';

export const FourthCase = () => (
  <Calendar
    defaultView="week"
    selectable
    timeslots={3}
    getNow={() => moment('9:30am', 'h:mma').toDate()}
    min={moment('12:00am', 'h:mma').toDate()}
    max={moment('11:59pm', 'h:mma').toDate()}
    events={events}
    onSelectEvent={action('event selected')}
    onSelectSlot={action('slot selected')}
  />
);
FourthCase.storyName = 'selectable, 3 timeslots';

export default {
  title: 'Timeslots',
  component: Calendar,
};
