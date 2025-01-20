import {AlertIcon} from '@primer/octicons-react'
import {Flash, Octicon} from '@primer/react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'

import {Spacing} from '../../utils/style'

export function ErrorBanner({message, sx = {}}: {message: string; sx?: BetterSystemStyleObject}) {
  return (
    <Flash sx={{mb: Spacing.CardMargin, ...sx}} variant="danger">
      <Octicon aria-label="Alert icon" icon={AlertIcon} />
      {message}
    </Flash>
  )
}
