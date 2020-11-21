import overlap, { Event } from './layout-algorithms/overlap';
import noOverlap from './layout-algorithms/no-overlap';

const defaultAlgorithms = {
  overlap: overlap,
  'no-overlap': noOverlap,
};

function isFunction(func: unknown | CustomDayLayoutAlgorithm): boolean {
  return !!(
    func &&
    (func as CustomDayLayoutAlgorithm).constructor &&
    (func as CustomDayLayoutAlgorithm).call &&
    (func as CustomDayLayoutAlgorithm).apply
  );
}

export function getStyledEvents(
  this: Event,
  options: GetStyledEventsOptions,
): StyledEvent[] {
  // one of defaultAlgorithms keys or custom function
  let algorithm = options.dayLayoutAlgorithm;

  if (
    typeof options.dayLayoutAlgorithm === 'string' &&
    options.dayLayoutAlgorithm in defaultAlgorithms
  ) {
    algorithm = defaultAlgorithms[options.dayLayoutAlgorithm];
  }

  if (!isFunction(algorithm)) {
    // invalid algorithm
    return [];
  }

  return (algorithm as
    | CustomDayLayoutAlgorithm
    | ((options: GetStyledEventsOptions) => StyledEvent[])).apply(this, [
    options,
  ]);
}
