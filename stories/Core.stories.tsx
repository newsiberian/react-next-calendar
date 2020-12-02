import * as React from 'react';
import moment from 'moment';
import { action } from '@storybook/addon-actions';

import '../packages/core/src/sass/styles.scss';
import '../packages/dnd/styles.scss';

import demoEvents from './helpers/events';
import createEvents from './helpers/createEvents';
import customComponents from './helpers/customComponents';
import { events, Views, Calendar, CalendarDateFns } from './helpers';

const Template = (props: Record<string, unknown>) => <Calendar {...props} />;

export const Demo = Template.bind({});
Demo.storyName = 'Demo';
Demo.args = {
  popup: true,
  popupOffset: { x: -10, y: -20 },
  events: demoEvents,
  culture: 'en',
  onSelectEvent: action('event selected'),
};
Demo.argTypes = {
  events: { table: { disable: true } },
  onSelectEvent: { table: { disable: true } },
  popup: {
    description:
      'Show truncated events in an overlay when you click the "+_x_ more" link',
    defaultValue: true,
    control: { type: 'boolean' },
  },
  toolbar: {
    description: 'Determines whether the toolbar is displayed',
    defaultValue: true,
    control: { type: 'boolean' },
  },
  dayLayoutAlgorithm: {
    name: 'dayLayoutAlgorithm',
    description: 'A day event layout(arrangement) algorithm',
    type: { name: 'enum' },
    defaultValue: 'overlap',
    control: {
      type: 'select',
      options: { Overlap: 'overlap', 'Without overlap': 'no-overlap' },
    },
  },
  culture: {
    description: `Specify a specific culture code for the Calendar.

    Note: it's generally better to handle this globally via your i18n library.
    `,
  },
};

export const DefaultView = Template.bind({});
DefaultView.storyName = 'Default view';
DefaultView.args = {
  defaultView: Views.WEEK,
  min: moment('12:00am', 'h:mma').toDate(),
  max: moment('11:59pm', 'h:mma').toDate(),
  events,
  onSelectEvent: action('event selected'),
};

export const Selectable = Template.bind({});
Selectable.storyName = 'Selectable';
Selectable.args = {
  selectable: true,
  defaultView: Views.WEEK,
  min: moment('12:00am', 'h:mma').toDate(),
  max: moment('11:59pm', 'h:mma').toDate(),
  events,
  onSelectEvent: action('event selected'),
  onSelectSlot: action('slot selected'),
};
Selectable.argTypes = {
  defaultView: { table: { disable: true } },
  events: { table: { disable: true } },
  min: { table: { disable: true } },
  max: { table: { disable: true } },
  onSelectEvent: { table: { disable: true } },
  onSelectSlot: { table: { disable: true } },
};

export const AddCustomDateHeader = Template.bind({});
AddCustomDateHeader.storyName = 'Add custom date header';
AddCustomDateHeader.args = {
  defaultView: Views.MONTH,
  events,
  components: {
    month: {
      dateHeader: ({ label }) => <span>{label} - Custom date header</span>,
    },
  },
};

export const ComplexDayViewLayout = Template.bind({});
ComplexDayViewLayout.storyName = 'Complex day view layout';
ComplexDayViewLayout.args = {
  defaultView: Views.DAY,
  events: createEvents(1),
  step: 30,
};

export const MultiDay = (): React.ReactElement => (
  /* should display all three events */
  <Calendar
    date={new Date(2016, 11, 4)}
    showMultiDayTimes
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
);
MultiDay.storyName = 'Multi day';

export const AgendaWithLength = (): React.ReactElement => (
  /* should display as title toolbar (from now to now + 14 days) */
  <Calendar defaultView={Views.AGENDA} events={events} length={14} />
);
AgendaWithLength.storyName = 'Agenda view - with length prop';

export const CustomNowIsTheFirstOfMonth = (): React.ReactElement => {
  const [day, setDay] = React.useState(1);
  const customNow = () => {
    const now = new Date();
    now.setDate(day);
    return now;
  };

  function handleChange() {
    setDay(prevState => {
      if (prevState >= 29) {
        return 1;
      }
      return prevState + 1;
    });
  }

  return (
    <>
      <button onClick={handleChange}>Change Now</button>
      <Calendar
        defaultView={Views.WEEK}
        getNow={customNow}
        min={moment('12:00am', 'h:mma').toDate()}
        max={moment('11:59pm', 'h:mma').toDate()}
        events={events}
        onSelectEvent={action('event selected')}
      />
    </>
  );
};

export const CustomTimeGutterHeader = (): React.ReactElement => {
  const TimeGutter = () => <p>Custom gutter text</p>;

  return (
    <Calendar
      popup
      events={demoEvents}
      onSelectEvent={action('event selected')}
      defaultView="week"
      views={['week', 'day']}
      components={{
        timeGutterHeader: TimeGutter,
      }}
    />
  );
};
CustomTimeGutterHeader.storyName = 'Custom timeGutterHeader';

export const CustomDateCellWrapper = (): React.ReactElement => (
  <Calendar
    defaultView={Views.MONTH}
    events={events}
    components={{
      dateCellWrapper: customComponents.dateCellWrapper,
    }}
  />
);
CustomDateCellWrapper.storyName = 'Custom dateCellWrapper';

export const CustomTimeSlotWrapperDay = (): React.ReactElement => (
  <Calendar
    defaultView={Views.DAY}
    events={events}
    components={{
      timeSlotWrapper: customComponents.timeSlotWrapper,
    }}
  />
);
CustomTimeSlotWrapperDay.storyName = 'Custom timeSlotWrapper (Day)';

export const CustomTimeSlotWrapperWeek = (): React.ReactElement => (
  <Calendar
    defaultView={Views.WEEK}
    events={events}
    components={{
      timeSlotWrapper: customComponents.timeSlotWrapper,
    }}
  />
);
CustomTimeSlotWrapperWeek.storyName = 'Custom timeSlotWrapper (Week)';

export const CustomWeekHeader = (): React.ReactElement => (
  <Calendar
    defaultView={Views.WEEK}
    events={events}
    components={{
      week: {
        header: customComponents.header,
      },
    }}
  />
);
CustomWeekHeader.storyName = 'Custom week header';

export const CustomEventWrapper = (): React.ReactElement => (
  <Calendar
    defaultView={Views.DAY}
    events={events}
    components={{
      eventWrapper: customComponents.eventWrapper,
    }}
  />
);
CustomEventWrapper.storyName = 'Custom eventWrapper';

export const CustomNoAgendaEventsLabel = (): React.ReactElement => (
  <Calendar
    defaultView={Views.AGENDA}
    events={events}
    messages={{
      noEventsInRange:
        'There are no special events in this range [test message]',
    }}
  />
);
CustomNoAgendaEventsLabel.storyName = 'Custom no agenda events label';

export const ScrollToTime = (): React.ReactElement => (
  <Calendar
    defaultView={Views.DAY}
    scrollToTime={moment('5:00am', 'h:mma').toDate()}
    events={events}
  />
);
ScrollToTime.storyName = 'Scroll to time';

export const ViewsAsObject = (): React.ReactElement => (
  <Calendar
    events={events}
    views={{
      month: true,
      week: true,
    }}
  />
);
ViewsAsObject.storyName = 'Views prop as object';

export const DateFnsLocalizer = (): React.ReactElement => (
  <CalendarDateFns events={events} culture="ru" />
);
DateFnsLocalizer.storyName = 'Date-fns localizer';

export const MomentLocalizer = (): React.ReactElement => (
  <Calendar events={events} culture="ru" />
);
MomentLocalizer.storyName = 'Moment localizer';

export default {
  title: 'Core',
  component: Calendar,
};
