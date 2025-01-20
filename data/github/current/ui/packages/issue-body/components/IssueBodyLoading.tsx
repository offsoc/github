import {LoadingSkeleton} from '@github-ui/skeleton/LoadingSkeleton'
import {Box} from '@primer/react'

import {TEST_IDS} from '../constants/test-ids'
import {VALUES} from '../constants/values'

export const IssueBodyLoading = () => {
  return (
    <Box sx={{display: 'flex', gap: 2, flexDirection: 'column'}} data-testid={TEST_IDS.bodyLoading}>
      {[...Array(VALUES.bodyLoadingSkeletonCount)].map((_, index) => (
        <LoadingSkeleton key={index} variant="rounded" height="sm" width="random" />
      ))}
    </Box>
  )
}
