/**
 *
 * Returns a shallow copy of an object, without the keys passed
 * in the second argument from the returned object.
 *
 * NOTE: Unlike the `lodash` version, this function does not support property
 * paths like `a.b.c`, and always expects a flat array of property names.
 *
 * @param obj An object to remove properties from
 * @param keys a list of keys to remove
 * @returns
 */
export function omit<GivenObject extends object, KeysToOmit extends keyof GivenObject>(
  givenObject: GivenObject,
  keys: Iterable<KeysToOmit>,
): Omit<GivenObject, KeysToOmit> {
  // `Key` represents any type that can be used as a key in an object, since using
  // `keyof GivenObject` is too narrow (hard to satisfy the constraint)
  type Key = keyof any
  const objectWithoutOmittedKeys: Record<Key, unknown> = {}
  const keysToOmit = new Set<Key>(keys)
  for (const key in givenObject) {
    if (!keysToOmit.has(key)) {
      objectWithoutOmittedKeys[key] = givenObject[key]
    }
  }

  return objectWithoutOmittedKeys as Omit<GivenObject, KeysToOmit>
}
