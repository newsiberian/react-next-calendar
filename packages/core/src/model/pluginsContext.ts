import { createContext, useContext } from 'react';
import invariant from 'tiny-invariant';

type PluginsContextValue<Params extends Record<string, unknown>> = Params;

/**
 * You can use this context to pass your props down to the components you extends
 */
export const PluginsContext = createContext<PluginsContextValue<any>>({});

PluginsContext.displayName = 'PluginsContext';

export const usePlugins = <Params extends Record<string, unknown>>() => {
  const context = useContext<PluginsContextValue<Params>>(PluginsContext);

  invariant(
    context,
    'usePlugins shouldn\'t be used outside of "PluginsContext"',
  );

  return context;
};
