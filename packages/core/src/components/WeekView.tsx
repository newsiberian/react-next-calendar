import { dates } from '@react-next-calendar/utils';

import { useLocalizer } from '../model/localizerContext';
import { NavigateAction } from '../utils/constants';
import type { Localizer } from '../localizer';
import { TimeGrid, TimeGridProps } from './TimeGrid';

export type WeekProps = TimeGridProps & {
  date: Date;
};

export const WeekView: ExtendedFC<WeekProps> = ({ date, ...props }) => {
  const localizer = useLocalizer();

  const range = WeekView.range(date, { localizer }) as Date[];

  return <TimeGrid {...props} range={range} />;
};

WeekView.navigate = (date, action) => {
  switch (action) {
    case NavigateAction.PREVIOUS:
      return dates.add(date, -1, 'week');

    case NavigateAction.NEXT:
      return dates.add(date, 1, 'week');

    default:
      return date;
  }
};

WeekView.range = (date, { localizer }: { localizer: Localizer }) => {
  const firstOfWeek = localizer.startOfWeek();
  const start = dates.startOf(date, 'week', firstOfWeek);
  const end = dates.endOf(date, 'week', firstOfWeek);

  return dates.range(start, end);
};

WeekView.title = (date, { localizer }) => {
  const [start, ...rest] = WeekView.range(date, { localizer }) as Date[];
  return localizer.format(
    { start, end: rest.pop() as Date },
    'dayRangeHeaderFormat',
  );
};
