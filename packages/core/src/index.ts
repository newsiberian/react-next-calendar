import EventWrapper from './components/EventWrapper';
import BackgroundWrapper from './components/BackgroundWrapper';

export const components = {
  eventWrapper: EventWrapper,
  timeSlotWrapper: BackgroundWrapper,
  dateCellWrapper: BackgroundWrapper,
};
export { default as Calendar, CalendarProps } from './components/Calendar';

export { CalendarContext, PluginsContext } from './CalendarContext';

export { default as EventRow } from './components/EventRow';
export { default as NoopWrapper } from './components/NoopWrapper';
export { default as TimeGridEvent } from './components/TimeGridEvent';

export { DateLocalizer } from './localizer';
export { default as dateFnsLocalizer } from './localizers/date-fns';
export { default as momentLocalizer } from './localizers/moment';
export { default as globalizeLocalizer } from './localizers/globalize';

export { default as move } from './utils/move';
export { views as Views, NavigateAction, NavigateAction as Navigate } from './utils/constants';
