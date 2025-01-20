import {Box} from '@primer/react'

import {LoadingSkeleton} from '@github-ui/skeleton/LoadingSkeleton'

export function SubIssuesListLoadingSkeleton() {
  return (
    <div>
      <Box sx={{p: 2, height: 40, display: 'flex', alignItems: 'center'}}>
        <Box as="h3" sx={{fontSize: 1, px: 2}}>
          Sub-issues
        </Box>
      </Box>
      <Box sx={{px: 3, py: 2}}>
        <LoadingSkeleton />
      </Box>
    </div>
  )
}
