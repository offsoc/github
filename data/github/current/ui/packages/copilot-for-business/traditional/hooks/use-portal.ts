import {registerPortalRoot} from '@primer/react'
import {useRef, useEffect} from 'react'

export function usePortal(config: {id: string}) {
  const portalRef = useRef(null)

  useEffect(() => {
    if (portalRef.current !== null) {
      registerPortalRoot(portalRef.current, config.id)
    }
  })

  return {ref: portalRef}
}
