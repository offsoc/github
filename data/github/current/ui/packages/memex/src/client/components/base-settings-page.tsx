import {Box, type BoxProps} from '@primer/react'

export function BaseSettingsPage({children, ...props}: BoxProps) {
  return (
    <Box
      {...props}
      sx={{
        position: 'relative',
        backgroundSize: '1px 37px',
        backgroundPositionY: '15px',
        backgroundRepeat: 'repeat-x, repeat',
        backgroundColor: theme => `${theme.colors.canvas.default}`,
        color: theme => `${theme.colors.fg.default}`,
        width: '100%',
        height: '100%',
        overflow: 'auto',
        ...props.sx,
      }}
    >
      {children}
    </Box>
  )
}
