import { createContext, useContext } from 'react';
import invariant from 'tiny-invariant';

export type GetterResult = {
  className?: string;
  style?: Record<string, number | string>;
};

export type Getters = {
  dayProp: (date: Date) => GetterResult;
  eventProp: (
    event: RNC.Event,
    start: Date,
    end: Date,
    isSelected: boolean,
  ) => GetterResult;
  slotGroupProp: () => GetterResult;
  slotProp: (date: Date, resourceId?: string | number) => GetterResult;
};

export const GettersContext = createContext<Getters | null>(null);

export const useGetters = () => {
  const context = useContext(GettersContext);

  invariant(
    context,
    'useGetters shouldn\'t be used outside of "GettersContext"',
  );

  return context;
};
