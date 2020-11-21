import EventWrapper from './components/EventWrapper';
import BackgroundWrapper from './components/BackgroundWrapper';

export const components = {
  eventWrapper: EventWrapper,
  timeSlotWrapper: BackgroundWrapper,
  dateCellWrapper: BackgroundWrapper,
};
export { default as Calendar } from './components/Calendar';

export { default as CalendarContext } from './CalendarContext';

export { DateLocalizer } from './localizer';
export { default as momentLocalizer } from './localizers/moment';
export { default as globalizeLocalizer } from './localizers/globalize';
export { default as dateFnsLocalizer } from './localizers/date-fns';
export { default as move } from './utils/move';
export { views as Views, navigate as Navigate } from './utils/constants';
