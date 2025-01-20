import {useTrackingRef} from '@github-ui/use-tracking-ref'
import {useState, useCallback} from 'react'

export function useTrackedValue<T>({initialValue}: {initialValue: T}) {
  const [value, setValue] = useState<T>(initialValue)
  const lastValue = useTrackingRef(value)

  const updateValue = useCallback(
    (nextValue: T) => {
      lastValue.current = value
      setValue(nextValue)
    },
    [lastValue, value],
  )

  return {
    value,
    lastValue,
    updateValue,
  }
}
