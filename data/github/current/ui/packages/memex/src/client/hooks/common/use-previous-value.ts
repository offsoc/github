import {useTrackingRef} from '@github-ui/use-tracking-ref'

export function usePreviousValue<T>(value: T): T {
  return useTrackingRef(value).current
}
