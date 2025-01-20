import {LoadingSkeleton} from '@github-ui/skeleton/LoadingSkeleton'
import {Box} from '@primer/react'

export function SkeletonDiffBlock() {
  return (
    <Box sx={{display: 'flex', flexDirection: 'column', gap: 2, px: 3}}>
      <Box sx={{borderRadius: 2, border: '1px solid', borderColor: 'border.subtle'}}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 2,
            p: 3,
            borderBottom: '1px solid',
            borderBottomColor: 'border.subtle',
            backgroundColor: 'canvas.subtle',
            borderTopLeftRadius: 2,
            borderTopRightRadius: 2,
          }}
        >
          <LoadingSkeleton height="sm" variant="rounded" width="140px" />
        </Box>
        <Box sx={{display: 'flex', flexDirection: 'column', gap: 2, p: 3}}>
          <LoadingSkeleton height="sm" variant="rounded" width="random" />
          <LoadingSkeleton height="sm" variant="rounded" width="random" />
          <LoadingSkeleton height="sm" variant="rounded" width="random" />
          <LoadingSkeleton height="sm" variant="rounded" width="random" />
        </Box>
      </Box>
    </Box>
  )
}
