import * as React from 'react';
import { wrapAccessor } from '@react-next-calendar/core/src/utils/accessors';

export const dragAccessors = {
  start: wrapAccessor((e: RNC.Event) => e.start),
  end: wrapAccessor((e: RNC.Event) => e.end),
} as Pick<Accessors, 'start' | 'end'>;

export interface NextProps {
  children: React.ReactNode;
}

export const nest = <T>(...Components: Array<T[keyof T]>): React.ReactNode => {
  const factories = Components.filter(Boolean).map(React.createFactory);
  return ({ children, ...props }: NextProps) =>
    factories.reduceRight((child, factory) => factory(props, child), children);
};

export const mergeComponents = (
  components: Components = {} as Components,
  addons: Components,
): Components => {
  const keys = Object.keys(addons) as Array<keyof Components>;
  const result = { ...components };

  keys.forEach((key: keyof Components) => {
    result[key] = components[key]
      ? nest(components[key], addons[key])
      : addons[key];
  });
  return result;
};
