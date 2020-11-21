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
