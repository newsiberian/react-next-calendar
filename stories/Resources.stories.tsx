import * as React from 'react';

import { DraggableCalendar } from './helpers';
import resources from './helpers/resourceEvents';

export const Resources = (): React.ReactElement => (
  <DraggableCalendar events={resources.events} resources={resources.list} />
);
Resources.storyName = 'Resources basics';

export default {
  title: 'Resources',
  component: DraggableCalendar,
};
