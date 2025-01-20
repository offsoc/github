import {useEffect, useRef} from 'react'

import {isInsidePortal} from '../../helpers/portal-elements'
import {useTableDispatch} from './table-provider'
import {useDeselectAll} from './use-deselect-all'

export const useSelectionBlur = () => {
  const containerRef = useRef<HTMLDivElement>(null)

  const deselectAll = useDeselectAll()
  const dispatch = useTableDispatch()

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      const target = e.target as HTMLElement | null

      if (!containerRef.current?.contains(target) && !isInsidePortal(target)) deselectAll()
    }

    document.addEventListener('mousedown', onMouseDown)
    return () => {
      document.removeEventListener('mousedown', onMouseDown)
    }
  }, [deselectAll, dispatch])

  return {containerRef}
}
