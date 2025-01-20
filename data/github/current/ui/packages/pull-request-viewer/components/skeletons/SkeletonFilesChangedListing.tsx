import {LoadingSkeleton} from '@github-ui/skeleton/LoadingSkeleton'
import {Box} from '@primer/react'

export function SkeletonFilesChangedListing() {
  return (
    <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
      <LoadingSkeleton height="md" variant="rounded" width="random" />
      <LoadingSkeleton height="md" variant="rounded" width="random" />
      <LoadingSkeleton height="md" variant="rounded" width="random" />
    </Box>
  )
}
