import { views } from '../utils/constants';
import { MonthView } from './MonthView';
import { DayView } from './DayView';
import { WeekView } from './WeekView';
import { WorkWeekView } from './WorkWeekView';
import { AgendaView } from './AgendaView';

export default {
  [views.MONTH]: MonthView,
  [views.WEEK]: WeekView,
  [views.WORK_WEEK]: WorkWeekView,
  [views.DAY]: DayView,
  [views.AGENDA]: AgendaView,
} as Record<View, ExtendedFC<unknown>>;
