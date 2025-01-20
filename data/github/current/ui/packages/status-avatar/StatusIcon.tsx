import {Box, Octicon} from '@primer/react'
import type {SxProp} from '@primer/react'

export type StatusIconProps = {
  iconColor: string
  backgroundColor?: string
  icon: React.ElementType
  size: 12 | 20 | 24
  backgroundSx?: SxProp['sx']
  absolute?: boolean
}

export function StatusIcon({
  iconColor,
  icon,
  size = 12,
  backgroundColor = 'fg.onEmphasis',
  absolute = true,
  backgroundSx,
}: StatusIconProps) {
  let innerSize
  let margin
  if (size === 12) {
    innerSize = '10px'
    margin = '1px'
  } else if (size === 20) {
    innerSize = '16px'
    margin = '2px'
  } else {
    innerSize = '16px'
    margin = '4px'
  }

  return (
    <Box
      sx={{
        display: 'flex',
        borderRadius: '100px',
        ...(absolute
          ? {
              position: 'absolute',
              bottom: -1,
              right: -1,
              boxShadow: '0 0 0 2px var(--bgColor-default, var(--color-canvas-default))',
              backgroundColor: 'var(--bgColor-default, var(--color-canvas-default))',
            }
          : {position: 'relative'}),
        ...backgroundSx,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          position: 'absolute',
          borderRadius: '100px',
          width: innerSize,
          height: innerSize,
          left: margin,
          top: margin,
          backgroundColor,
        }}
      />
      <Octicon
        icon={icon}
        size={size}
        sx={{
          color: iconColor,
          position: 'relative',
        }}
      />
    </Box>
  )
}
