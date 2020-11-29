import * as React from 'react';

function NoopWrapper<P extends { children: React.ReactElement }>(
  props: P,
): React.ReactElement {
  return props.children;
}

export default NoopWrapper;
