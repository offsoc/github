import {Box, type BoxProps} from '@primer/react'
import {forwardRef} from 'react'

export const HeaderGridCellLayout = forwardRef<HTMLDivElement, BoxProps>((props, ref) => {
  const {children, sx, ...otherProps} = props
  return (
    <Box
      sx={{alignItems: 'center', py: 2, px: 3, overflow: 'hidden', display: 'flex', ...sx}}
      ref={ref}
      {...otherProps}
    >
      {children}
    </Box>
  )
})

HeaderGridCellLayout.displayName = 'HeaderGridCellLayout'
