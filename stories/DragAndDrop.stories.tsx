import * as React from 'react';
import { action } from '@storybook/addon-actions';

import { events, Views, DragAndDropCalendar } from './helpers';
import customComponents from './helpers/customComponents';

export const DraggableAndResizable = (): React.ReactElement => (
  <DragAndDropCalendar
    defaultView={Views.WEEK}
    events={events}
    resizable
    onEventDrop={action('event dropped')}
    onEventResize={action('event resized')}
  />
);
DraggableAndResizable.storyName = 'Draggable and resizable';

export const WithNonDefaultStepsAndTimeSlots = (): React.ReactElement => (
  <DragAndDropCalendar
    defaultView={Views.WEEK}
    events={events}
    resizable
    step={15}
    timeslots={4}
    onEventDrop={action('event dropped')}
    onEventResize={action('event resized')}
  />
);
WithNonDefaultStepsAndTimeSlots.storyName =
  'With non-default steps and timeslots';

export const WithShowMultiDayTimes = (): React.ReactElement => (
  <DragAndDropCalendar
    defaultView={Views.WEEK}
    events={events}
    resizable
    showMultiDayTimes
    onEventDrop={action('event dropped')}
    onEventResize={action('event resized')}
  />
);
WithShowMultiDayTimes.storyName = 'With showMultiDayTimes';

export const CustomDateCellWrapper = (): React.ReactElement => (
  <DragAndDropCalendar
    components={{
      dateCellWrapper: customComponents.dateCellWrapper,
    }}
    defaultView={Views.MONTH}
    events={events}
    resizable
    showMultiDayTimes
    onEventDrop={action('event dropped')}
    onEventResize={action('event resized')}
  />
);
CustomDateCellWrapper.storyName = 'Custom dateCellWrapper';

export const CustomTimeSlotWrapper = (): React.ReactElement => (
  <DragAndDropCalendar
    components={{
      timeSlotWrapper: customComponents.timeSlotWrapper,
    }}
    defaultView={Views.WEEK}
    events={events}
    resizable
    showMultiDayTimes
    onEventDrop={action('event dropped')}
    onEventResize={action('event resized')}
  />
);
CustomTimeSlotWrapper.storyName = 'Custom timeSlotWrapper';

export const CustomEventWrapper = (): React.ReactElement => (
  <DragAndDropCalendar
    components={{
      eventWrapper: customComponents.eventWrapper,
    }}
    defaultView={Views.WEEK}
    events={events}
    resizable
    showMultiDayTimes
    onEventDrop={action('event dropped')}
    onEventResize={action('event resized')}
  />
);
CustomEventWrapper.storyName = 'Custom eventWrapper';

export default {
  title: 'Drag and Drop',
  component: DragAndDropCalendar,
};
