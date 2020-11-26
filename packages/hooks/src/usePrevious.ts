import * as React from 'react';

export default function usePrevious<T>(state: T): T {
  const ref = React.useRef(state);

  React.useEffect(() => {
    ref.current = state;
  });

  return ref.current;
}
