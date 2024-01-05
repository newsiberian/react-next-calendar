import { useLocalizer } from '../model/localizerContext';
import type { Localizer } from '../localizer';
import { WeekView } from './WeekView';
import { TimeGrid, TimeGridProps } from './TimeGrid';

export type WorkWeekProps = TimeGridProps & {
  date: Date;
};

function workWeekRange(date: Date, options: { localizer: Localizer }): Date[] {
  return (WeekView.range(date, options) as Date[]).filter(
    d => [6, 0].indexOf(d.getDay()) === -1,
  );
}

export const WorkWeekView: ExtendedFC<WorkWeekProps> = ({ date, ...props }) => {
  const localizer = useLocalizer();

  const range = workWeekRange(date, { localizer });

  return <TimeGrid {...props} range={range} />;
};

WorkWeekView.range = workWeekRange;

WorkWeekView.navigate = WeekView.navigate;

WorkWeekView.title = (date, { localizer }) => {
  const [start, ...rest] = workWeekRange(date, { localizer });

  return localizer.format(
    { start, end: rest.pop() as Date },
    'dayRangeHeaderFormat',
  );
};
