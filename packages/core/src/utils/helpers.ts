import * as React from 'react';

export function notify<T extends (...args: R) => void, R extends unknown[]>(
  handler?: T,
  ...args: R
): void {
  handler && handler(...args);
}

/**
 * Determines is an object is a filled array or not and execute arr.map with
 * given callback
 *
 * Can be used in React components like instead of such cases:
 * return (
 *   <Select>
 *     {Boolean(Array.isArray(arr) && arr.length) && arr.map(a => (
 *       <MenuItem key={a.id} value={a.id}>
 *         {a.name}
 *       </MenuItem>
 *     ))}
 *   </Select>
 * );
 *
 * to this:
 *
 * return (
 *   <Select>
 *     {arrayMap(arr)(a => (
 *       <MenuItem key={a.id} value={a.id}>
 *         {a.name}
 *       </MenuItem>
 *     ))}
 *   </Select>
 * );
 *
 * @param {Array} arr - possible array
 * @function {function} callbackfn - map condition
 * @return {function(function): Array | null}
 */
export const arrayMap = <T, U extends React.ReactNode>(arr: T[]) => (
  callbackfn: (value: T, index: number, array: T[]) => U,
): React.ReactNode | null =>
  Array.isArray(arr) && arr.length ? arr.map(callbackfn) : null;

/**
 * Assigns own and inherited enumerable string keyed properties of source objects
 * to the destination object for all destination properties that resolve to
 * undefined. Source objects are applied from left to right. Once a property is
 * set, additional values of the same property are ignored.
 *
 * @param args
 */
export const defaults = <T extends Record<string, unknown>>(
  ...args: T[]
): Record<string, unknown> =>
  args.reverse().reduce((acc, obj) => ({ ...acc, ...obj }), {});

/**
 * This method creates an object composed of the own and inherited enumerable
 * property paths of object that are not omitted.
 *
 * @param obj
 * @param props
 */
export const omit = <T, K extends keyof T>(obj: T, props: K[]): Partial<T> => {
  const newObj = { ...obj };
  props.forEach(prop => delete newObj[prop]);
  return newObj;
};
