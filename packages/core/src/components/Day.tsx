import * as React from 'react';
import { dates } from '@react-next-calendar/utils';

import { navigate } from '../utils/constants';
import TimeGrid, { TimeGridProps } from './TimeGrid';

export interface DayProps extends TimeGridProps {
  date: Date;
}

const Day: ExtendedFC<DayProps> = ({ date, ...props }: DayProps) => {
  const range = React.useMemo(() => Day.range(date), [date]) as Date[];

  return <TimeGrid {...props} range={range} />;
};

Day.range = date => {
  return [dates.startOf(date, 'day')];
};

Day.navigate = (date, action) => {
  switch (action) {
    case navigate.PREVIOUS:
      return dates.add(date, -1, 'day');

    case navigate.NEXT:
      return dates.add(date, 1, 'day');

    default:
      return date;
  }
};

Day.title = (date: Date, { localizer }) =>
  localizer.format(date, 'dayHeaderFormat');

export default Day;
