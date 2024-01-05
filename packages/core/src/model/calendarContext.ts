import { createContext, useContext } from 'react';
import invariant from 'tiny-invariant';

export type CalendarContextValue = {
  rtl: boolean;
};

/**
 * This context contains commonly used heave props like components, getters,
 * accessors, localizer etc
 */
export const CalendarContext = createContext<CalendarContextValue>({
  rtl: false,
});

CalendarContext.displayName = 'CalendarContext';

export const useCalendarContext = () => {
  const context = useContext(CalendarContext);

  invariant(
    context,
    'useCalendarContext shouldn\'t be used outside of "CalendarContext"',
  );

  return context;
};
