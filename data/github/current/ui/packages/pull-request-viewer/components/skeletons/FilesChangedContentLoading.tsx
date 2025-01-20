import {LoadingSkeleton} from '@github-ui/skeleton/LoadingSkeleton'
import {Box, SplitPageLayout} from '@primer/react'

import {SkeletonDiffBlock} from './SkeletonDiffBlock'

export function FilesChangedContentLoading({fileCount = 3}: {fileCount?: number}) {
  return (
    <SplitPageLayout.Content as="div" padding="none" width="full">
      <Box sx={{px: 3, height: '56px', display: 'flex', gap: 2, justifyContent: 'space-between', alignItems: 'center'}}>
        <Box sx={{display: 'flex', gap: 2, alignItems: 'center'}}>
          <LoadingSkeleton height="xl" variant="rounded" width="xl" />
          <LoadingSkeleton height="lg" variant="rounded" width="130px" />
        </Box>
        <Box sx={{display: 'flex', gap: 2, alignItems: 'center'}}>
          <LoadingSkeleton height="md" variant="rounded" width="130px" />
          <LoadingSkeleton height="xl" variant="rounded" width="xl" />
        </Box>
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}
      >
        {Array.from({length: fileCount}, (_, index) => (
          <SkeletonDiffBlock key={index} />
        ))}
      </Box>
    </SplitPageLayout.Content>
  )
}
