import {useCallback, useEffect, useState} from 'react'

type IsEqual<T> = (a: T, b: T) => boolean

const DEFAULT_EQUALITY: IsEqual<unknown> = (a, b) => a === b

export function useDirtyStateTracking<T>(
  trackedValue: T,
  defaultValue: T,
  initialValueIsDirty: boolean,
  isEqual?: IsEqual<T>,
): [boolean, () => void] {
  const [isDirty, setIsDirty] = useState(initialValueIsDirty)

  useEffect(() => {
    if (!(isEqual ?? DEFAULT_EQUALITY)(trackedValue, defaultValue)) {
      setIsDirty(true)
    }
  }, [trackedValue, defaultValue, isEqual])

  const resetIsDirty = useCallback(() => {
    setIsDirty(false)
  }, [])

  return [isDirty, resetIsDirty]
}
