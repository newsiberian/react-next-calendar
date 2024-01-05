import * as React from 'react';

export interface NextProps {
  children: React.ReactNode;
}

export const nest = <T>(...Components: Array<ValueOf<T>>): React.ReactNode => {
  const factories = Components.filter(Boolean);
  return ({ children, ...props }: NextProps) =>
    factories.reduceRight(
      (child, component: React.ReactNode) =>
        React.createElement(component as React.FunctionComponent, props, child),
      children,
    );
};

export const mergeComponents = (
  components: Components = {} as Components,
  addons: Pick<
    Components,
    'eventWrapper' | 'eventContainerWrapper' | 'weekWrapper'
  >,
): Components => {
  const keys = Object.keys(addons) as Array<
    keyof Pick<
      Components,
      'eventWrapper' | 'eventContainerWrapper' | 'weekWrapper'
    >
  >;
  const result = { ...components };

  keys.forEach(
    <
      K extends keyof Pick<
        Components,
        'eventWrapper' | 'eventContainerWrapper' | 'weekWrapper'
      >,
    >(
      key: K,
    ) => {
      result[key] = (
        components[key] ? nest(components[key], addons[key]) : addons[key]
      ) as Component;
    },
  );
  return result;
};
