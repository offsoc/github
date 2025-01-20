import {LoadingSkeleton} from '@github-ui/skeleton/LoadingSkeleton'
import {Box} from '@primer/react'

export function SkeletonTimeline() {
  return (
    <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
      <Box sx={{display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 2}}>
        <LoadingSkeleton height="xl" variant="elliptical" width="xl" />
        <LoadingSkeleton height="sm" variant="rounded" width="140px" />
      </Box>
      <LoadingSkeleton height="md" variant="rounded" width="random" />
      <LoadingSkeleton height="md" variant="rounded" width="random" />
    </Box>
  )
}
