import * as React from 'react';

export interface Context {
  rtl: boolean;
}

/**
 * This context contains commonly used heave props like components, getters,
 * accessors, localizer etc
 */
export const CalendarContext = React.createContext<Context>({} as Context);

/**
 * You can use this context to pass your props down to the components you extends
 */
export const PluginsContext = React.createContext(
  {} as Record<string, unknown>,
);
