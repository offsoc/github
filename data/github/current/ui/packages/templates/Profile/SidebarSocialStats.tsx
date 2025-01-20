import {Box, Octicon} from '@primer/react'
import {PeopleIcon} from '@primer/octicons-react'

function ResponsiveSocialStats() {
  return (
    <Box sx={{fontSize: 1, fontWeight: 'bold'}}>
      <Octicon icon={PeopleIcon} size={16} sx={{mr: 1, color: 'fg.muted'}} /> 2450{' '}
      <Box
        as="span"
        sx={{
          color: 'fg.muted',
          fontWeight: 'normal',
        }}
      >
        followers
      </Box>{' '}
      <Box as="span" sx={{fontSize: 0, color: 'fg.muted'}}>
        ·
      </Box>{' '}
      10{' '}
      <Box
        as="span"
        sx={{
          color: 'fg.muted',
          fontWeight: 'normal',
        }}
      >
        following
      </Box>
    </Box>
  )
}

export default ResponsiveSocialStats
