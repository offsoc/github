let nextMockItemId = 9

function setValue(n: number) {
  nextMockItemId = n
}

function getValue(errorIfNotFound = true): number {
  const value = nextMockItemId
  const number = parseInt(`${value}`, 10)
  if (isNaN(number)) {
    if (errorIfNotFound) {
      throw new Error(`Unable to find number in global object`)
    }

    return -1
  }

  return number
}

/**
 * A stateful function for generating an incrementing id which is backed by
 * a global object, to allow for multiple imports and ES module usage without
 * generating duplicate ids
 */
export const getNextId = () => {
  const value = getValue()
  const nextId = value + 1
  setValue(nextId)
  return nextId
}
