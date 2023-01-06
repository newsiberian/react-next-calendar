import type { ReactElement } from 'react';

export function NoopWrapper<P extends { children: ReactElement }>(props: P) {
  return props.children;
}
