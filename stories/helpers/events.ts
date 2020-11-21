import set from 'date-fns/set';

const now = new Date();

export default [
  {
    id: 0,
    title: 'All Day Event very long title',
    allDay: true,
    start: set(now, { date: 0 }),
    end: set(now, { date: 1 }),
  },
  {
    id: 1,
    title: 'Long Event',
    start: set(now, { date: 7 }),
    end: set(now, { date: 10 }),
  },

  {
    id: 2,
    title: 'DTS STARTS',
    start: set(now, {
      month: now.getMonth() + 1,
      date: 13,
    }),
    end: set(now, {
      month: now.getMonth() + 1,
      date: 20,
    }),
  },

  {
    id: 3,
    title: 'DTS ENDS',
    start: set(now, {
      month: now.getMonth() + 1,
      date: 6,
    }),
    end: set(now, {
      month: now.getMonth() + 1,
      date: 13,
    }),
  },

  {
    id: 4,
    title: 'Some Event',
    start: set(now, { date: 9 }),
    end: set(now, { date: 10 }),
  },
  {
    id: 5,
    title: 'Conference',
    start: set(now, { date: 11 }),
    end: set(now, { date: 13 }),
    desc: 'Big conference for important people',
  },
  {
    id: 6,
    title: 'Meeting',
    start: set(now, { date: 12, hours: 10, minutes: 30 }),
    end: set(now, { date: 12, hours: 12, minutes: 30 }),
    desc: 'Pre-meeting meeting, to prepare for the meeting',
  },
  {
    id: 7,
    title: 'Lunch',
    start: set(now, { date: 12, hours: 12 }),
    end: set(now, { date: 12, hours: 13 }),
    desc: 'Power lunch',
  },
  {
    id: 8,
    title: 'Meeting',
    start: set(now, { date: 12, hours: 14 }),
    end: set(now, { date: 12, hours: 15 }),
  },
  {
    id: 9,
    title: 'Happy Hour',
    start: set(now, { date: 12, hours: 17 }),
    end: set(now, { date: 12, hours: 17, minutes: 30 }),
    desc: 'Most important meal of the day',
  },
  {
    id: 10,
    title: 'Dinner',
    start: set(now, { date: 12, hours: 20 }),
    end: set(now, { date: 12, hours: 21 }),
  },
  {
    id: 11,
    title: 'Birthday Party',
    start: set(now, { date: 13, hours: 7 }),
    end: set(now, { date: 13, hours: 10, minutes: 30 }),
  },
  {
    id: 11.5,
    title: 'Meet John',
    start: set(now, { date: 13, hours: 12 }),
    end: set(now, { date: 13, hours: 13 }),
  },
  {
    id: 12,
    title: 'Late Night Event',
    start: set(now, { date: 17, hours: 19, minutes: 30 }),
    end: set(now, { date: 18, hours: 2 }),
  },
  {
    id: 12.5,
    title: 'Late Same Night Event',
    start: set(now, { date: 17, hours: 19, minutes: 30 }),
    end: set(now, { date: 17, hours: 23, minutes: 30 }),
  },
  {
    id: 13,
    title: 'Multi-day Event',
    start: set(now, { date: 20, hours: 19, minutes: 30 }),
    end: set(now, { date: 22, hours: 2 }),
  },
  {
    id: 14,
    title: 'Today',
    start: new Date(new Date().setHours(new Date().getHours() - 3)),
    end: new Date(new Date().setHours(new Date().getHours() + 3)),
  },
  {
    id: 15,
    title: 'Point in Time Event',
    start: now,
    end: now,
  },
  {
    id: 16,
    title: 'Video Record',
    start: set(now, { date: 14, hours: 15, minutes: 30 }),
    end: set(now, { date: 14, hours: 19 }),
  },
  {
    id: 17,
    title: 'Dutch Song Producing',
    start: set(now, { date: 14, hours: 16, minutes: 30 }),
    end: set(now, { date: 14, hours: 20 }),
  },
  {
    id: 18,
    title: 'Itaewon Halloween Meeting',
    start: set(now, { date: 14, hours: 16, minutes: 30 }),
    end: set(now, { date: 14, hours: 17, minutes: 30 }),
  },
  {
    id: 19,
    title: 'Online Coding Test',
    start: set(now, { date: 14, hours: 17, minutes: 30 }),
    end: set(now, { date: 14, hours: 20, minutes: 30 }),
  },
  {
    id: 20,
    title: 'An overlapped Event',
    start: set(now, { date: 14, hours: 17 }),
    end: set(now, { date: 14, hours: 18, minutes: 30 }),
  },
  {
    id: 21,
    title: 'Phone Interview',
    start: set(now, { date: 14, hours: 17 }),
    end: set(now, { date: 14, hours: 18, minutes: 30 }),
  },
  {
    id: 22,
    title: 'Cooking Class',
    start: set(now, { date: 14, hours: 17, minutes: 30 }),
    end: set(now, { date: 14, hours: 19 }),
  },
  {
    id: 23,
    title: 'Go to the gym',
    start: set(now, { date: 14, hours: 18, minutes: 30 }),
    end: set(now, { date: 14, hours: 20 }),
  },
];
