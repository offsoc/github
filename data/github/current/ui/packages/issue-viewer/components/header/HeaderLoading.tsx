import {LoadingSkeleton} from '@github-ui/skeleton/LoadingSkeleton'
import {Box} from '@primer/react'

export const HeaderLoading = () => {
  return (
    <>
      <Box sx={{display: 'flex', justifyContent: 'space-between', paddingBottom: 2}}>
        <LoadingSkeleton variant="rounded" height="xl" width="400px" />
      </Box>
      <Box sx={{display: 'flex', alignItems: 'center', flexDirection: 'row', gap: 2, paddingTop: '14px'}}>
        <LoadingSkeleton variant="pill" height="xl" width="80px" />
        <LoadingSkeleton variant="rounded" height="lg" width="200px" />
      </Box>
    </>
  )
}
