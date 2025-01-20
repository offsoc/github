import {Box} from '@primer/react'
import {LoadingSkeleton} from '@github-ui/skeleton/LoadingSkeleton'
import {testIdProps} from '@github-ui/test-id-props'

import {RunnerList} from './RunnerList'

export function SkeletonList() {
  return (
    <RunnerList numberOfRunners={0} {...testIdProps('skeleton-list')}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          my: '10px',
          ml: 3,
          gap: 2,
        }}
      >
        <LoadingSkeleton width="150px" />
        <LoadingSkeleton width="350px" />
      </Box>
    </RunnerList>
  )
}
