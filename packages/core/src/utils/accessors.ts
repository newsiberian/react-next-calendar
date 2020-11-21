type Field =
  | ((data: RNC.Event | Resource) => string | number | boolean | Date)
  | keyof (RNC.Event | Resource)
  | unknown;

type Data = RNC.Event | Resource;

/**
 * Retrieve via an accessor-like property
 *
 *    accessor(obj, 'name')   // => retrieves obj['name']
 *    accessor(data, func)    // => retrieves func(data)
 *    ... otherwise null
 */
export function accessor(
  data: Data,
  field: Field,
): string | number | boolean | Date | null {
  if (typeof field === 'function') {
    return field(data);
  }
  if (typeof field === 'string' && data && field in data) {
    return data[field as keyof (RNC.Event | Resource)];
  }
  return null;
}

export const wrapAccessor = (acc: Field) => (data: Data) => accessor(data, acc);
