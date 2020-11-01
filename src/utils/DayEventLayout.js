import overlap from './layout-algorithms/overlap'
import noOverlap from './layout-algorithms/no-overlap'

const DefaultAlgorithms = {
  overlap: overlap,
  'no-overlap': noOverlap,
}

function isFunction(a) {
  return !!(a && a.constructor && a.call && a.apply)
}

export function getStyledEvents(props) {
  // one of DefaultAlgorithms keys or custom function
  let algorithm = props.dayLayoutAlgorithm

  if (props.dayLayoutAlgorithm in DefaultAlgorithms)
    algorithm = DefaultAlgorithms[props.dayLayoutAlgorithm]

  if (!isFunction(algorithm)) {
    // invalid algorithm
    return []
  }

  return algorithm.apply(this, arguments)
}
