import {Box, type BoxProps} from '@primer/react'

export const Blankslate: React.FC<BoxProps> = props => (
  <Box
    sx={{
      ...(props.sx || {}),
      display: 'flex',
      flex: '1 1 auto',
      width: '100%',
      height: '100%',
      position: 'relative',
      backgroundSize: '1px 37px',
      backgroundPositionY: '15px',
      backgroundRepeat: 'repeat-x, repeat',
    }}
    {...props}
  >
    <Box sx={{m: 'auto', textAlign: 'center'}}>{props.children}</Box>
  </Box>
)
