import {LoadingSkeleton} from '@github-ui/skeleton/LoadingSkeleton'
import {Box} from '@primer/react'

export const MetadataFooterLoading = () => {
  return (
    <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
      <LoadingSkeleton variant="pill" height="lg" width="400px" />
    </Box>
  )
}
