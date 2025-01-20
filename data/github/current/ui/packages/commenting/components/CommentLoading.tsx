import {LoadingSkeleton} from '@github-ui/skeleton/LoadingSkeleton'
import {Box} from '@primer/react'
import {useMemo} from 'react'

import {TEST_IDS} from '../constants/test-ids'

export const CommentLoading = () => {
  const lineCount = useMemo(() => Math.floor(Math.random() * 5) + 1, [])

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        gap: 2,
      }}
    >
      <LoadingSkeleton variant="elliptical" height="xl" width="xl" />

      <Box
        sx={{
          border: '1px solid',
          borderColor: 'neutral.muted',
          borderRadius: 6,
          backgroundColor: 'canvas.default',
          boxShadow: 'shadow.small',
          overflowX: 'auto',
          flexGrow: 1,
        }}
        data-testid={TEST_IDS.commentSkeleton}
      >
        <Box sx={{m: 3, flexDirection: 'row', alignItems: 'center', gap: 2, display: 'flex'}}>
          <LoadingSkeleton variant="rounded" height="sm" width="150px" />
        </Box>
        <Box sx={{display: 'flex', gap: 2, m: 3, flexDirection: 'column'}}>
          {[...Array(lineCount)].map((_, index) => (
            <LoadingSkeleton key={index} variant="rounded" height="sm" width="random" />
          ))}
        </Box>
      </Box>
    </Box>
  )
}
