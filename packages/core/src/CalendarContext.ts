import { createContext } from 'react';

export type Context = {
  rtl: boolean;
};

/**
 * This context contains commonly used heave props like components, getters,
 * accessors, localizer etc
 */
export const CalendarContext = createContext<Context>({} as Context);

/**
 * You can use this context to pass your props down to the components you extends
 */
export const PluginsContext = createContext({} as Record<string, unknown>);
