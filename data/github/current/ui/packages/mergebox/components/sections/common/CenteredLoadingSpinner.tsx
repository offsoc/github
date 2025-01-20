import {Box, Spinner} from '@primer/react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'

export function CenteredLoadingSpinner({sx}: {sx?: BetterSystemStyleObject}): JSX.Element {
  return (
    <Box
      sx={{
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        mt: 6,
        width: '100%',
        ...sx,
      }}
    >
      <Spinner />
    </Box>
  )
}
