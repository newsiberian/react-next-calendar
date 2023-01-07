import { useMemo } from 'react';
import { dates } from '@react-next-calendar/utils';

import { NavigateAction } from '../utils/constants';
import { TimeGrid, TimeGridProps } from './TimeGrid';

export type DayProps = TimeGridProps & {
  date: Date;
};

const Day: ExtendedFC<DayProps> = ({ date, ...props }: DayProps) => {
  const range = useMemo(() => Day.range(date), [date]) as Date[];

  return <TimeGrid {...props} range={range} />;
};

Day.range = date => {
  return [dates.startOf(date, 'day')];
};

Day.navigate = (date, action) => {
  switch (action) {
    case NavigateAction.PREVIOUS:
      return dates.add(date, -1, 'day');

    case NavigateAction.NEXT:
      return dates.add(date, 1, 'day');

    default:
      return date;
  }
};

Day.title = (date: Date, { localizer }) =>
  localizer.format(date, 'dayHeaderFormat');

export default Day;
