import {useRef} from 'react'

/**
 * Given an object, deep compares it to the previous 5 objects passed to this hook to see if they
 * are the same. If so, return the previous object.
 * This is useful for objects that come from the server and are likely to match objects we
 * previously received. Using this, we can avoid unnecessary rerenders.
 * This function has the potential to be slow and memory-hungry if it is passed very large objects.
 */
export function useCanonicalObject<T>(obj: T): T {
  const previousObjects = useRef([] as T[])
  for (const previousObject of previousObjects.current) {
    if (obj === previousObject || deepCompare(previousObject, obj)) {
      return previousObject
    }
  }
  previousObjects.current.unshift(obj)
  if (previousObjects.current.length > 5) {
    previousObjects.current.pop()
  }
  return obj
}

/** exported for testing */
export function deepCompare(a: unknown, b: unknown): boolean {
  if (a === b) {
    return true
  }
  if (typeof a !== 'object' || typeof a !== typeof b || !a || !b) {
    return false
  }
  if (Array.isArray(a)) {
    if (!Array.isArray(b)) {
      return false
    }
    if (a.length !== b.length) {
      return false
    }
    for (let i = 0; i < a.length; i++) {
      if (!deepCompare(a[i], b[i])) {
        return false
      }
    }
    return true
  }
  const aKeys = Object.keys(a)
  // we're smart enough to know that b is an object but TypeScript isn't
  const bKeys = Object.keys(b as object)
  if (aKeys.length !== bKeys.length) {
    return false
  }
  for (const key of aKeys) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!deepCompare((a as any)[key], (b as any)[key])) {
      return false
    }
  }
  return true
}
