/**
 * Implementation of the proposed Array.prototype.group() method. Groups elements in the given array
 * according to the return value of the passed callback.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/group
 */
export function group<Item, GroupKey extends keyof any>(
  array: Array<Item>,
  callbackFn: (item: Item) => GroupKey,
): {[key in GroupKey]?: Array<Item>} {
  const result = {} as {[key in GroupKey]?: Array<Item>}
  for (const item of array) {
    const key = callbackFn(item)
    const arr = result[key] ?? (result[key] = [])
    arr.push(item)
  }
  return result
}
