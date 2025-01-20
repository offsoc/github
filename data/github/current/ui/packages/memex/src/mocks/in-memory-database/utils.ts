/**
 * Makes a deep copy (recursively copying all fields) of an object.
 * We re-use mock data objects across multiple stories and test cases.
 * These data are then modified by the mock database as the user interacts wtih
 * the app.
 * If we did not perform this deep copy upon first receiving the mock data,
 * changes within one story or test, would have an impact on the initial state of another
 * story or test.
 *
 * @param obj Object to make a deep copy of.
 */
export const deepCopy = <T>(obj: T): T => {
  // Handle the 3 simple types, and null or undefined
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  // Handle Date
  if (obj instanceof Date) {
    const copy = new Date()
    copy.setTime(obj.getTime())
    return copy as unknown as T
  }

  // Handle Array
  if (Array.isArray(obj)) {
    const copy = []
    for (let i = 0; i < obj.length; i++) {
      copy[i] = deepCopy(obj[i])
    }
    return copy as unknown as T
  }

  // Handle Object
  if (obj instanceof Object) {
    const copy: Record<string, any> = {}
    for (const attr in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, attr)) copy[attr] = deepCopy(obj[attr])
    }
    return copy as unknown as T
  }

  throw new Error("Unable to copy obj! Its type isn't supported.")
}
