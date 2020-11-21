import * as React from 'react';

import Week from './Week';
import TimeGrid, { TimeGridProps } from './TimeGrid';

export interface WorkWeekProps extends TimeGridProps {
  date: Date;
}

function workWeekRange(date: Date, options: { localizer: Localizer }): Date[] {
  return (Week.range(date, options) as Date[]).filter(
    d => [6, 0].indexOf(d.getDay()) === -1,
  );
}

const WorkWeek: ExtendedFC<WorkWeekProps> = ({
  date,
  ...props
}): React.ReactElement => {
  const range = workWeekRange(date, props);

  return <TimeGrid {...props} range={range} />;
};

WorkWeek.range = workWeekRange;

WorkWeek.navigate = Week.navigate;

WorkWeek.title = (date, { localizer }) => {
  const [start, ...rest] = workWeekRange(date, { localizer });

  return localizer.format(
    { start, end: rest.pop() as Date },
    'dayRangeHeaderFormat',
  );
};

export default WorkWeek;
