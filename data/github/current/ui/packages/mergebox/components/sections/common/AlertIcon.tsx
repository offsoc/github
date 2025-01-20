import {AlertFillIcon} from '@primer/octicons-react'
import {CircleOcticon} from '@primer/react'
import {HEADER_ICON_SIZE} from '../../../constants'

export function AlertIcon() {
  return (
    <CircleOcticon
      icon={() => <AlertFillIcon size={16} />}
      size={HEADER_ICON_SIZE}
      sx={{bg: 'neutral.emphasis', color: 'fg.onEmphasis'}}
    />
  )
}
