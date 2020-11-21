import invariant from 'invariant';

import { navigate } from './constants';
import VIEWS from '../components/Views';

interface Params {
  action: Action;
  date: Date;
  today?: Date;
}

export default function moveDate(
  View: ExtendedFC | View,
  { action, date, today, ...props }: Params,
): Date {
  const ViewComponent = typeof View === 'string' ? VIEWS[View] : View;

  switch (action) {
    case navigate.TODAY:
      date = today || new Date();
      break;
    case navigate.DATE:
      break;
    default:
      invariant(
        View && typeof ViewComponent.navigate === 'function',
        'Calendar View components must implement a static `.navigate(date, action)` method.s',
      );
      date = ViewComponent.navigate(date, action, props);
  }
  return date;
}
