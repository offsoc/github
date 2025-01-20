/**
 * Creates a test selector to find an element in the DOM
 *
 * @param testId the identifier associated with the element
 * @param index (optional) an index for locating a specific item within a list-like element
 *
 * @returns a string representing the selector
 */
export function _(testId: string, index?: number) {
  const baseSelector = `[data-testid="${testId}"]`

  if (index) {
    return `${baseSelector}[data-list-index="${index}"]`
  }

  return baseSelector
}
