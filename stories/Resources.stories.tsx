import * as React from 'react';

import { DraggableCalendar } from './helpers';
import resources from './helpers/resourceEvents';

export const Demo = (): React.ReactElement => (
  <DraggableCalendar events={resources.events} resources={resources.list} />
);

export default {
  title: 'Resources',
  component: DraggableCalendar,
};
