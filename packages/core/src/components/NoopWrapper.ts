import type { ReactElement } from 'react';

function NoopWrapper<P extends { children: ReactElement }>(props: P) {
  return props.children;
}

export default NoopWrapper;
