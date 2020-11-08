/**
 * Retrieve via an accessor-like property
 *
 *    accessor(obj, 'name')   // => retrieves obj['name']
 *    accessor(data, func)    // => retrieves func(data)
 *    ... otherwise null
 */
export function accessor(data, field) {
  if (typeof field === 'function') {
    return field(data)
  }
  if (
    typeof field === 'string' &&
    typeof data === 'object' &&
    data != null &&
    field in data
  ) {
    return data[field]
  }
}

export const wrapAccessor = (acc) => (data) => accessor(data, acc)
