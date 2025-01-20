import {useLayoutEffect} from '@github-ui/use-layout-effect'
import {useTrackingRef} from '@github-ui/use-tracking-ref'

import {useElementSizes} from './common/use-element-sizes'
import {useRootElement} from './use-root-element'

type UseMemexProjectViewRootHeightOpts = {
  onResize?: (measurement: ReturnType<typeof useElementSizes>) => void
}

/**
 * Returns the max height and width of the memex app root element
 * Using a resize observer, these values are updated when the size of the
 * element is changed
 */
export const useMemexRootHeight = ({onResize}: UseMemexProjectViewRootHeightOpts = {}) => {
  const rootElement = useRootElement()
  const measurement = useElementSizes(rootElement ?? null)

  const handleResizeRef = useTrackingRef(onResize)

  useLayoutEffect(() => {
    handleResizeRef.current?.(measurement)
  }, [measurement, handleResizeRef])

  return measurement
}
