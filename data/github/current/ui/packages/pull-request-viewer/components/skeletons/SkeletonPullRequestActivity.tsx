import {Box} from '@primer/react'

import {SkeletonTimeline} from './SkeletonTimeline'

export function SkeletonPullRequestActivity() {
  return (
    <Box sx={{display: 'flex', flexDirection: 'column', gap: 4, pt: 3}}>
      <SkeletonTimeline />
      <SkeletonTimeline />
      <SkeletonTimeline />
    </Box>
  )
}
