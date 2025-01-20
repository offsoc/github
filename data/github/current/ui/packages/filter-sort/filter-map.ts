export type MapFilter<T, U> = (item: T) => U | null | undefined

export function* filterMap<T, U>(items: T[], map: MapFilter<T, U>): Iterable<U> {
  for (const item of items) {
    const value = map(item)
    if (value != null) {
      yield value
    }
  }
}
