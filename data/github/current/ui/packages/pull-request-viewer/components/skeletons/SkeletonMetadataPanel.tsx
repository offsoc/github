import {LoadingSkeleton} from '@github-ui/skeleton/LoadingSkeleton'
import {Box} from '@primer/react'

export default function SkeletonMetadataPanel(): JSX.Element {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        pt: 2,
        px: 3,
      }}
    >
      <LoadingSkeleton height="md" variant="rounded" width="clamp(80px, 70%, 240px)" />
      <LoadingSkeleton height="md" variant="rounded" width="clamp(120px, 90%, 260px)" />
      <LoadingSkeleton height="md" variant="rounded" width="clamp(90px, 80%, 260px)" />
      <LoadingSkeleton height="md" variant="rounded" width="clamp(100px, 85%, 280px)" />
      <LoadingSkeleton height="md" variant="rounded" width="clamp(80px, 70%, 240px)" />
    </Box>
  )
}
