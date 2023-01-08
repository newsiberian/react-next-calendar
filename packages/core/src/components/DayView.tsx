import { useMemo } from 'react';
import { dates } from '@react-next-calendar/utils';

import { NavigateAction } from '../utils/constants';
import { TimeGrid, TimeGridProps } from './TimeGrid';

export type DayProps = TimeGridProps & {
  date: Date;
};

export const DayView: ExtendedFC<DayProps> = ({ date, ...props }: DayProps) => {
  const range = useMemo(() => DayView.range(date), [date]) as Date[];

  return <TimeGrid {...props} range={range} />;
};

DayView.range = date => {
  return [dates.startOf(date, 'day')];
};

DayView.navigate = (date, action) => {
  switch (action) {
    case NavigateAction.PREVIOUS:
      return dates.add(date, -1, 'day');

    case NavigateAction.NEXT:
      return dates.add(date, 1, 'day');

    default:
      return date;
  }
};

DayView.title = (date: Date, { localizer }) =>
  localizer.format(date, 'dayHeaderFormat');
