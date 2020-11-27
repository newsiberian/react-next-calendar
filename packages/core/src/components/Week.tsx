import * as React from 'react';
import { dates } from '@react-next-calendar/utils';

import { navigate } from '../utils/constants';
import TimeGrid, { TimeGridProps } from './TimeGrid';

export interface WeekProps extends TimeGridProps {
  date: Date;
  localizer: Localizer;
}

const Week: ExtendedFC<WeekProps> = ({ date, ...props }) => {
  const range = Week.range(date, { localizer: props.localizer }) as Date[];

  return <TimeGrid {...props} range={range} />;
};

Week.navigate = (date, action) => {
  switch (action) {
    case navigate.PREVIOUS:
      return dates.add(date, -1, 'week');

    case navigate.NEXT:
      return dates.add(date, 1, 'week');

    default:
      return date;
  }
};

Week.range = (date, { localizer }) => {
  const firstOfWeek = localizer.startOfWeek();
  const start = dates.startOf(date, 'week', firstOfWeek);
  const end = dates.endOf(date, 'week', firstOfWeek);

  return dates.range(start, end);
};

Week.title = (date, { localizer }) => {
  const [start, ...rest] = Week.range(date, { localizer }) as Date[];
  return localizer.format(
    { start, end: rest.pop() as Date },
    'dayRangeHeaderFormat',
  );
};

export default Week;
