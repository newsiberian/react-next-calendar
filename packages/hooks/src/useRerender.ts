import * as React from 'react';

export default function useRerender(): () => void {
  // just rerender component. This is useful because refs doesn't trigger the
  // rerender, but we have to use them
  const [, setRerender] = React.useState<number>(0);

  return React.useCallback(() => {
    setRerender(prevState => prevState + 1);
  }, []);
}
