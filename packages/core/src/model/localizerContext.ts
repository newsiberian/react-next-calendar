import { createContext, useContext } from 'react';
import invariant from 'tiny-invariant';

import { Localizer } from '../localizer';

export const LocalizerContext = createContext<Localizer | null>(null);

export const useLocalizer = () => {
  const context = useContext(LocalizerContext);

  invariant(
    context,
    'useLocalizer shouldn\'t be used outside of "LocalizerContext"',
  );

  return context;
};
