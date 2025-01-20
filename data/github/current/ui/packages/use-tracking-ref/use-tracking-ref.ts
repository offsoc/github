import {useLayoutEffect} from '@github-ui/use-layout-effect'
import {useRef} from 'react'

export function useTrackingRef<T>(value: T): React.MutableRefObject<T> {
  const ref = useRef(value)

  useLayoutEffect(() => {
    ref.current = value
  }, [value])

  return ref
}
