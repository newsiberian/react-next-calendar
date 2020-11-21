export enum navigate {
  PREVIOUS = 'PREV',
  NEXT = 'NEXT',
  TODAY = 'TODAY',
  DATE = 'DATE',
}

export const views = {
  MONTH: 'month',
  WEEK: 'week',
  WORK_WEEK: 'work_week',
  DAY: 'day',
  AGENDA: 'agenda',
} as Readonly<Record<string, View>>;
