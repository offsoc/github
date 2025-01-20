import {GitHubAvatar} from '@github-ui/github-avatar'
import type {SxProp} from '@primer/react'
import {Box} from '@primer/react'
import {StatusIcon} from './StatusIcon'

export type StatusAvatarProps = {
  zIndex?: {zIndex?: number}
  altText: string
  hovercardUrl?: string
  src: string
  square: boolean
  icon: React.ElementType
  iconColor: string
  backgroundColor?: string
  backgroundSx?: SxProp['sx']
  size?: 20 | 24
}
/**
 * This component renders an avatar (either square or round) with a related status emoji in the bottom right corner
 */
export function StatusAvatar({
  zIndex,
  altText,
  hovercardUrl,
  src,
  square,
  icon,
  iconColor,
  backgroundColor,
  backgroundSx,
  sx,
  size = 20,
}: StatusAvatarProps & SxProp) {
  return (
    <Box
      sx={{
        position: 'relative',
        display: 'flex',
        gap: 2,
        alignItems: 'center',
        ...zIndex,
        ...sx,
      }}
    >
      <GitHubAvatar alt={altText} data-hovercard-url={hovercardUrl} size={size} square={square} src={src} />
      <StatusIcon
        icon={icon}
        iconColor={iconColor}
        size={12}
        backgroundColor={backgroundColor}
        backgroundSx={backgroundSx}
      />
    </Box>
  )
}
