import {useId as useIdReact} from 'react'

/**
 * Provides an HTML ID that is unique and stable across renders, typically for linking
 * elements with accessible descriptions and names.
 *
 * NOTE: Do not rely on the resulting ID's format, ie by testing `startsWith(prefix)` or
 * similar. This format may change in the future.
 * @param prefix An optional prefix to make the ID more readable for debugging.
 */
export const usePrefixedId = (prefix = ''): string => {
  const id = useIdReact()
  if (prefix.trim()) {
    return `${prefix}:${id}`
  }
  return id
}
