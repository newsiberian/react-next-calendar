import { dates } from '@react-next-calendar/utils';

import { NavigateAction } from '../utils/constants';
import { TimeGrid, TimeGridProps } from './TimeGrid';

export type WeekProps = TimeGridProps & {
  date: Date;
  localizer: Localizer;
};

const Week: ExtendedFC<WeekProps> = ({ date, ...props }) => {
  const range = Week.range(date, { localizer: props.localizer }) as Date[];

  return <TimeGrid {...props} range={range} />;
};

Week.navigate = (date, action) => {
  switch (action) {
    case NavigateAction.PREVIOUS:
      return dates.add(date, -1, 'week');

    case NavigateAction.NEXT:
      return dates.add(date, 1, 'week');

    default:
      return date;
  }
};

Week.range = (date, { localizer }: { localizer: Localizer }) => {
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
