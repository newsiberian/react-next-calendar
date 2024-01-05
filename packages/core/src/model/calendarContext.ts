import { createContext, useContext } from 'react';

export type Context = {
  rtl: boolean;
};

/**
 * This context contains commonly used heave props like components, getters,
 * accessors, localizer etc
 */
export const CalendarContext = createContext<Context>({ rtl: false });

CalendarContext.displayName = 'CalendarContext';

export const useCalendarContext = () => {
  const context = useContext(CalendarContext);

  if (!context) {
    throw new Error(
      'useCalendarContext shouldn\'t be used outside of "CalendarContext"',
    );
  }

  return context;
};
