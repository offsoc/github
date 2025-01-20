import {LoadingSkeleton} from '@github-ui/skeleton/LoadingSkeleton'
import {Box} from '@primer/react'

export function SkeletonPullRequestHeader({showNavigationInHeader}: {showNavigationInHeader: boolean}) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        p: 3,
        borderBottom: '1px solid',
        borderBottomColor: 'border.subtle',
      }}
    >
      <LoadingSkeleton height="xl" variant="rounded" width="random" />
      <Box sx={{display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 2}}>
        <LoadingSkeleton height="xl" variant="pill" width="100px" />
        <LoadingSkeleton height="lg" variant="rounded" width="320px" />
      </Box>
      {showNavigationInHeader && (
        <Box sx={{display: 'flex', gap: 2, pt: 4, px: 1, mb: '-6px'}}>
          <LoadingSkeleton height="lg" variant="rounded" width="100px" />
          <LoadingSkeleton height="lg" variant="rounded" width="90px" />
          <LoadingSkeleton height="lg" variant="rounded" width="160px" />
        </Box>
      )}
    </Box>
  )
}
