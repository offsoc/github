import {GitHubAvatar} from '@github-ui/github-avatar'
import type {Icon} from '@primer/octicons-react'
import {Box, Octicon} from '@primer/react'

import type {FilterValueData} from '../types'
import {getFilterValue} from '.'

export interface ValueIconProps {
  value: FilterValueData
  providerIcon?: Icon
  squareIcon?: boolean
}

export const ValueIcon = ({value, providerIcon, squareIcon = false}: ValueIconProps) => {
  if (value.avatar?.url) {
    return (
      <GitHubAvatar
        src={value.avatar.url}
        alt={getFilterValue(value.value) ?? 'User Avatar'}
        square={squareIcon}
        sx={{minWidth: '20px'}}
      />
    )
  }
  if (value.iconColor && !value.icon) {
    return <Box sx={{bg: value.iconColor, borderRadius: 9, width: '10px', height: '10px'}} />
  }
  if (value.icon) {
    const cssIconVariable = value.iconColor ? `${value.iconColor} !important` : 'currentcolor'
    return <Octicon icon={value.icon} sx={{fill: cssIconVariable}} />
  }
  if (providerIcon) {
    return <Octicon icon={providerIcon} />
  }

  return null
}
