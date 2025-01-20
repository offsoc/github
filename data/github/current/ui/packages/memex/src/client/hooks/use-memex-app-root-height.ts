import {useLayoutEffect} from '@github-ui/use-layout-effect'
import {useTrackingRef} from '@github-ui/use-tracking-ref'
import {useState} from 'react'

import {useElementSizes} from './common/use-element-sizes'

type UseMemexProjectViewRootHeightOpts = {
  onResize?: (measurement: ReturnType<typeof useElementSizes>) => void
}

/**
 * Returns the max height and width of the memex app root element
 * Using a resize observer, these values are updated when the size of the
 * element is changed
 */
export const useMemexProjectViewRootHeight = ({onResize}: UseMemexProjectViewRootHeightOpts = {}) => {
  const [memexRootElement, setMemexRootElement] = useState(() => document.getElementById('memex-project-view-root'))
  const measurement = useElementSizes(memexRootElement)

  useLayoutEffect(() => {
    if (!memexRootElement) {
      setMemexRootElement(document.getElementById('memex-project-view-root'))
    }
  }, [memexRootElement])

  const handleResizeRef = useTrackingRef(onResize)

  useLayoutEffect(() => {
    handleResizeRef.current?.(measurement)
  }, [measurement, handleResizeRef])
  return measurement
}
