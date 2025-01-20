import {useCallback, useRef, useState} from 'react'

function shallowCompare<T>(oldData: T, newData: T): boolean {
  for (const key in oldData) {
    if (oldData[key] !== newData[key]) {
      return false
    }
  }

  return true
}

/**
 * Tracks custom state as it changes and tells consumers when it is dirty.
 *
 * @param originalData The original data to compare against.
 * @param compare Function to compare the original data with the new data. Defaults to a shallow key-by-key comparison.
 * @returns
 * isDirty - Whether the data has changed.
 * changeData - A function to set the data to a new value, which will trigger a comparison and update of isDirty.
 * resetOriginalData - A function that changes the original data that is being compared against and resets dirty state.
 */
export function useIsDirty<T>(
  originalData: T,
  compare: (oldData: T, newData: T) => boolean = shallowCompare,
): [isDirty: boolean, changeData: (newData: Partial<T>) => void, resetOriginalData: (newData: Partial<T>) => void] {
  const [isDirty, setIsDirty] = useState(false)
  const originalDataRef = useRef(originalData)
  const currentDataRef = useRef(originalData)

  const updateIsDirty = useCallback(() => {
    const dirty = !compare(originalDataRef.current, currentDataRef.current)
    if (dirty !== isDirty) {
      setIsDirty(dirty)
    }
  }, [compare, isDirty])

  const changeData = useCallback(
    (newData: Partial<T>) => {
      currentDataRef.current = {...currentDataRef.current, ...newData}
      updateIsDirty()
    },
    [updateIsDirty],
  )

  const resetOriginalData = useCallback(
    (newData: Partial<T>) => {
      originalDataRef.current = {...originalDataRef.current, ...newData}
      updateIsDirty()
    },
    [updateIsDirty],
  )

  return [isDirty, changeData, resetOriginalData]
}
