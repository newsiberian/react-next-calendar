import * as React from 'react'

export default function usePrevious(state) {
  const ref = React.useRef(state)

  React.useEffect(() => {
    ref.current = state
  })

  return ref.current
}
