import * as React from 'react'

const useEnhancedEffect =
  typeof window !== 'undefined' ? React.useLayoutEffect : React.useEffect

/**
 * @thanks to @material-ui
 */
export default useEnhancedEffect
