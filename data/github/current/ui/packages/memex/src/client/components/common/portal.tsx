import {useTrackingRef} from '@github-ui/use-tracking-ref'
import {BaseStyles} from '@primer/react'
import {useEffect} from 'react'
import {createPortal} from 'react-dom'

import {useLazyRef} from '../../hooks/common/use-lazy-ref'

export const Portal: React.FC<{onMount?: () => void; id?: string; children: React.ReactNode}> = ({
  children,
  id,
  onMount,
}) => {
  const onMountRef = useTrackingRef(onMount)
  const el = useLazyRef(() => document.createElement('div'))
  if (id) el.current.setAttribute('id', id)

  useEffect(() => {
    const element = el.current
    const parentEl = document.getElementById('portal-root')

    parentEl?.appendChild(element)
    if (onMountRef.current) onMountRef.current()

    return function cleanup() {
      parentEl?.removeChild(element)
    }
  }, [el, onMountRef])

  return createPortal(<BaseStyles display="contents">{children}</BaseStyles>, el.current)
}
