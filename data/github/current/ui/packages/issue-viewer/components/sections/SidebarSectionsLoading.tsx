import {LoadingSkeleton} from '@github-ui/skeleton/LoadingSkeleton'
import {Box} from '@primer/react'

export const SidebarSectionsLoading = () => {
  return (
    <>
      <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
        <LoadingSkeleton variant="rounded" height="md" width="60%" />
        <LoadingSkeleton variant="rounded" height="md" width="80%" />
        <LoadingSkeleton variant="rounded" height="md" width="40%" />
        <LoadingSkeleton variant="rounded" height="md" width="60%" />
        <LoadingSkeleton variant="rounded" height="md" width="70%" />
        <LoadingSkeleton variant="rounded" height="md" width="50%" />
      </Box>
    </>
  )
}
