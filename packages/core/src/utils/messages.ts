const defaultMessages = {
  date: 'Date',
  time: 'Time',
  event: 'Event',
  allDay: 'All Day',
  week: 'Week',
  work_week: 'Work Week',
  day: 'Day',
  month: 'Month',
  previous: 'Back',
  next: 'Next',
  yesterday: 'Yesterday',
  tomorrow: 'Tomorrow',
  today: 'Today',
  agenda: 'Agenda',

  noEventsInRange: 'There are no events in this range.',

  showMore: (total: number) => `+${total} more`,
};

export default function messages<P extends Messages>(msgs: P): Messages {
  return {
    ...defaultMessages,
    ...msgs,
  };
}
