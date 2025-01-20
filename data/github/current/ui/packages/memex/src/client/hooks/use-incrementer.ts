import {useCallback, useRef} from 'react'

/** Options for configuring the hook */
type Options = {
  /** The integer to start with (default 0) */
  start?: number
}

export function useIncrementer(opts: Options = {}): () => number {
  const nextValueRef = useRef(opts.start ?? 0)

  const getNextValue = useCallback(() => {
    const value = nextValueRef.current
    nextValueRef.current += 1
    return value
  }, [])

  return getNextValue
}
