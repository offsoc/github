/** Return a copy of the map with the entry added to it. */
export function mapWith<K, V>(map: ReadonlyMap<K, V>, [key, value]: [key: K, value: V]) {
  const copy = new Map(map)
  copy.set(key, value)
  return copy
}

/** Return a copy of the map with the entry deleted from it. */
export function mapWithout<K, V>(map: ReadonlyMap<K, V>, key: K) {
  const copy = new Map(map)
  copy.delete(key)
  return copy
}
