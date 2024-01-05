import clsx from 'clsx';

import { useLocalizer } from '../model/localizerContext';
import { NavigateAction } from '../utils/constants';
import { arrayMap } from '../utils/helpers';

export type ToolbarProps = {
  /**
   * The current date value of the calendar.
   */
  date: Date;
  /**
   * Localized string that describes current period
   */
  label: string;
  view: View;
  views: View[];
  onNavigate: (action: NavigateAction) => void;
  onView: (view: View, newDate?: Date) => void;
};

export function Toolbar({
  label,
  view,
  views,
  onNavigate,
  onView,
}: ToolbarProps) {
  const localizer = useLocalizer();

  function handleNavigate(action: NavigateAction): void {
    onNavigate(action);
  }

  function handleView(view: View): void {
    onView(view);
  }

  return (
    <div className="rbc-toolbar">
      <span className="rbc-btn-group">
        <button
          type="button"
          onClick={() => handleNavigate(NavigateAction.TODAY)}
        >
          {localizer.messages.today}
        </button>
        <button
          type="button"
          onClick={() => handleNavigate(NavigateAction.PREVIOUS)}
        >
          {localizer.messages.previous}
        </button>
        <button
          type="button"
          onClick={() => handleNavigate(NavigateAction.NEXT)}
        >
          {localizer.messages.next}
        </button>
      </span>

      <span className="rbc-toolbar-label">{label}</span>

      <span className="rbc-btn-group">
        {arrayMap(views)(name => (
          <button
            key={name}
            type="button"
            className={clsx({ 'rbc-active': view === name })}
            onClick={() => handleView(name)}
          >
            {localizer.messages[name]}
          </button>
        ))}
      </span>
    </div>
  );
}
