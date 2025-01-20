import {LoadingSkeleton} from '@github-ui/skeleton/LoadingSkeleton'
import {Box} from '@primer/react'

export function SkeletonPullRequestNavigation({
  showMainNavigation,
  showFiles,
}: {
  showMainNavigation: boolean
  showFiles: boolean
}) {
  return (
    <Box sx={{display: 'flex', flexDirection: 'column', gap: 4, mx: -2, mt: -1}}>
      {showMainNavigation && (
        <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
          <LoadingSkeleton height="lg" variant="rounded" width="random" />
          <LoadingSkeleton height="lg" variant="rounded" width="random" />
          <LoadingSkeleton height="lg" variant="rounded" width="random" />
          <LoadingSkeleton height="lg" variant="rounded" width="random" />
        </Box>
      )}
      {showFiles && (
        <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
          <LoadingSkeleton height="md" variant="rounded" width="random" />
          <LoadingSkeleton height="md" variant="rounded" width="random" />
          <LoadingSkeleton height="md" variant="rounded" width="random" />
        </Box>
      )}
    </Box>
  )
}
