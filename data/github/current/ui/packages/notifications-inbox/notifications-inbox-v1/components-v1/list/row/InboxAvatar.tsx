/* eslint eslint-comments/no-use: off */
import {GitHubAvatar} from '@github-ui/github-avatar'
import type {AvatarProps} from '@primer/react'
import type {FC} from 'react'

/// Render an Avatar for the notification row
const InboxAvatar: FC<AvatarProps> = ({sx, ...rest}) => (
  <GitHubAvatar
    sx={{
      display: 'flex',
      alignSelf: 'center',
      flexShrink: 0,
      mr: 1,
      ...sx,
    }}
    size={16}
    {...rest}
  />
)

export default InboxAvatar
