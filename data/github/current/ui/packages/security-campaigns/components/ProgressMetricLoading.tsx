import DataCard from '@github-ui/data-card'
import {LoadingSkeleton} from '@github-ui/skeleton/LoadingSkeleton'
import {Box} from '@primer/react'

export function ProgressMetricLoading() {
  return (
    <DataCard cardTitle="Campaign progress">
      <Box sx={{display: 'flex', color: 'fg.muted', marginBottom: '8px'}}>
        <LoadingSkeleton variant="rounded" height="md" width="30%" />
        <LoadingSkeleton variant="rounded" height="md" width="20%" sx={{marginLeft: 'auto'}} />
      </Box>
      <LoadingSkeleton variant="rounded" height="12px" width="100%" sx={{marginBottom: '4px'}} />
    </DataCard>
  )
}
