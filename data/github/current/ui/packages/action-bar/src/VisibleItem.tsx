import {testIdProps} from '@github-ui/test-id-props'
import {Box} from '@primer/react'
import useIsomorphicLayoutEffect from '@primer/react/lib-esm/utils/useIsomorphicLayoutEffect'
import {type PropsWithChildren, useRef} from 'react'

import {useActionBarResize} from './ActionBarResizeContext'

type VisibleItemProps = PropsWithChildren<{actionKey: string}>

export const VisibleItem = ({children, actionKey: key}: VisibleItemProps) => {
  const itemRef = useRef<HTMLDivElement>(null)
  const {recalculateItemSize} = useActionBarResize()

  useIsomorphicLayoutEffect(() => {
    if (itemRef.current) recalculateItemSize(key, itemRef.current)
  }, [itemRef, recalculateItemSize, key])

  return (
    <Box
      {...testIdProps(`action-bar-item-${key}`)}
      data-action-bar-item={key}
      sx={{display: 'inline-flex'}}
      ref={itemRef}
    >
      {children}
    </Box>
  )
}
