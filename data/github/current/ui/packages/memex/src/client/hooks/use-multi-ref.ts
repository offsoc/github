import {type Key, type MutableRefObject, useMemo} from 'react'

/**
 * Store refs to many instances in one convenient place. Useful when rendering a list of items.
 *
 * @example
 * ```jsx
 * const itemsRef = useMultiRef<string, HTMLLIElement>()
 *
 * useEffect(() => {
 *   itemsRef("a").current?.focus()
 * }, [])
 *
 * return <ul>
 *   {items.map(item => <li key={item.id} ref={itemsRef(item.id)}>{item.text}</li>)}
 * </ul>
 * ```
 */
export function useMultiRef<K extends Key, V>() {
  return useMemo(() => {
    // @ts-expect-error bigint cannot be an index type
    const store: Partial<Record<K, MutableRefObject<V | null>>> = {}

    return (key: K) => (store[key] ??= {current: null})
  }, [])
}
