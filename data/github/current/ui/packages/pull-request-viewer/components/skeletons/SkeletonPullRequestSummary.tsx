import {Box} from '@primer/react'

import {SkeletonPullRequestDescription} from './SkeletonPullRequestDescription'
import {SkeletonPullRequestSummarySecondaryContent} from './SkeletonPullRequestSummarySecondaryContent'

export function SkeletonPullRequestSummary() {
  return (
    <Box sx={{display: 'flex', flexDirection: 'column', gap: 5, pt: 3}}>
      <SkeletonPullRequestDescription />
      <SkeletonPullRequestSummarySecondaryContent />
    </Box>
  )
}
