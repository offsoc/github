import {SearchIcon} from '@primer/octicons-react'
import {Box, Octicon} from '@primer/react'

export const FilterInputIcon = () => {
  return (
    <Box
      sx={{
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'row',
        justifyItems: 'flex-start',
      }}
    >
      <Octicon icon={SearchIcon} aria-label="Search" sx={{ml: '4px', mr: 2, color: 'fg.muted'}} />
    </Box>
  )
}
