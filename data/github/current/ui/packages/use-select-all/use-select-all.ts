import type {RefObject} from 'react'

/**
 * Returns a function that can be called to select all text in the given input or textarea.
 */
export function useSelectAll(ref: RefObject<HTMLInputElement>): () => void {
  return () => {
    if (!ref.current) return
    ref.current.setSelectionRange(0, ref.current.value.length, 'forward')
  }
}
