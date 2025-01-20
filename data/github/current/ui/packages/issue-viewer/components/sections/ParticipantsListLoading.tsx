import {Box} from '@primer/react'
import {LoadingSkeleton} from '@github-ui/skeleton/LoadingSkeleton'

export function ParticipantsListLoading() {
  return (
    <Box sx={{m: 2, display: 'flex', flexDirection: 'column', gap: 2}}>
      <LoadingSkeleton variant="rounded" height="md" width="60%" />
      <LoadingSkeleton variant="rounded" height="md" width="80%" />
      <LoadingSkeleton variant="rounded" height="md" width="40%" />
      <LoadingSkeleton variant="rounded" height="md" width="60%" />
      <LoadingSkeleton variant="rounded" height="md" width="70%" />
    </Box>
  )
}
