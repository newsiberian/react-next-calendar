import { createContext, useContext } from 'react';

type PluginsContextValue<Params extends Record<string, unknown>> = Params;

/**
 * You can use this context to pass your props down to the components you extends
 */
export const PluginsContext = createContext<PluginsContextValue<any>>({});

PluginsContext.displayName = 'PluginsContext';

export const usePluginsContext = <Params extends Record<string, unknown>>() => {
  const context = useContext<PluginsContextValue<Params>>(PluginsContext);

  if (!context) {
    throw new Error(
      'usePluginsContext shouldn\'t be used outside of "PluginsContext"',
    );
  }

  return context;
};
