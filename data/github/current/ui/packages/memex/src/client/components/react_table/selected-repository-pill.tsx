import {testIdProps} from '@github-ui/test-id-props'
import {Box, Text} from '@primer/react'

import type {SuggestedRepository} from '../../api/repository/contracts'

export const SelectedRepositoryPill = ({repository}: {repository: SuggestedRepository}) => {
  return (
    <Box sx={{alignItems: 'center', display: 'flex'}} {...testIdProps('repo-searcher-selected-repo')}>
      <Text sx={{fontSize: 1, mr: 0, color: 'fg.subtle'}}>repo:</Text>
      <Text sx={{fontSize: 1, color: 'accent.fg', mr: 2}}>{repository.name}</Text>
    </Box>
  )
}
