import {DismissibleFlash} from '@github-ui/dismissible-flash'
import {type BaseStylesProps, Box} from '@primer/react'

import {type FlashType, useActiveFlash, useSetFlash} from '../contexts/FlashContext'

const flashMessagesMap: Record<FlashType, string> = {
  'definition.created.success': 'Property definition successfully created.',
  'definition.updated.success': 'Property definition successfully updated.',
  'definition.deleted.success': 'Property definition successfully deleted.',
  'repos.properties.updated': 'Properties updated successfully.',
}

export function PageFlash({containerSx}: {containerSx?: BaseStylesProps}) {
  const flash = useActiveFlash()
  const setFlash = useSetFlash()

  if (!flash) return null

  const message = flashMessagesMap[flash]

  return (
    <Box sx={containerSx}>
      <DismissibleFlash variant="success" onClose={() => setFlash(null)}>
        {message}
      </DismissibleFlash>
    </Box>
  )
}
