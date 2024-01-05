const defaultMessages = {
  agenda: 'Agenda',
  allDay: 'All Day',
  date: 'Date',
  day: 'Day',
  event: 'Event',
  month: 'Month',
  next: 'Next',
  noEventsInRange: 'There are no events in this range.',
  previous: 'Back',
  showMore: (total: number) => `+${total} more`,
  time: 'Time',
  today: 'Today',
  tomorrow: 'Tomorrow',
  week: 'Week',
  work_week: 'Work Week',
  yesterday: 'Yesterday',
};

export function applyMessages<Key extends keyof typeof defaultMessages>(
  messages: Record<Key, typeof defaultMessages[Key]>,
) {
  return {
    ...defaultMessages,
    ...messages,
  };
}
