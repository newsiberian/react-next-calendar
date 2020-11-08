let idCount = 0

function uniqueId(prefix) {
  return '' + ((prefix == null ? '' : prefix) + ++idCount)
}

export function notify(handler, args) {
  handler && handler.apply(null, [].concat(args))
}

export function instanceId(component, suffix = '') {
  component.__id || (component.__id = uniqueId('rw_'))
  return (component.props.id || component.__id) + suffix
}

export function isFirstFocusedRender(component) {
  return (
    component._firstFocus ||
    (component.state.focused && (component._firstFocus = true))
  )
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
 * @function {function} callback - map condition
 * @return {function(function): Array | null}
 */
export const arrayMap = (arr) => (callback) =>
  Array.isArray(arr) && arr.length ? arr.map(callback) : null
