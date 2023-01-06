import * as React from 'react';
import clsx from 'clsx';

import { navigate } from '../utils/constants';
import { arrayMap } from '../utils/helpers';

export interface ToolbarProps {
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
  onNavigate: (view: View) => void;
  onView: (action: Action, newDate?: Date) => void;
  localizer: Localizer;
}

export default function Toolbar({
  label,
  localizer,
  view,
  views,
  onNavigate,
  onView,
}: ToolbarProps) {
  function handleNavigate(action: Action): void {
    onNavigate(action);
  }

  function handleView(view: View): void {
    onView(view);
  }

  return (
    <div className="rbc-toolbar">
      <span className="rbc-btn-group">
        <button type="button" onClick={() => handleNavigate(navigate.TODAY)}>
          {localizer.messages.today}
        </button>
        <button type="button" onClick={() => handleNavigate(navigate.PREVIOUS)}>
          {localizer.messages.previous}
        </button>
        <button type="button" onClick={() => handleNavigate(navigate.NEXT)}>
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
