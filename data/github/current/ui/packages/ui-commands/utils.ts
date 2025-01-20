/** Return a copy of the array without the first encountered instance of `value` (based on `===` comparison). */
export function filterOnce<T>(array: readonly T[], value: T) {
  let encounteredOnce = false
  return array.filter(el => {
    if (el === value && !encounteredOnce) {
      encounteredOnce = true
      return false
    }
    return true
  })
}
