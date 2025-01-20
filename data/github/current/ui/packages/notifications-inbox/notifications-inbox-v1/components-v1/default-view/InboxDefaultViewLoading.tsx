import {IssueBodyLoading} from '@github-ui/issue-body/IssueBodyLoading'
import {LoadingSkeleton} from '@github-ui/skeleton/LoadingSkeleton'
import {Box} from '@primer/react'

const NotificationDefaultViewLoading = () => {
  return (
    <>
      <Box sx={{display: 'flex', justifyContent: 'space-between', marginBottom: 2}}>
        <LoadingSkeleton variant="rounded" height="xl" width="400px" />
      </Box>
      <Box sx={{display: 'flex', alignItems: 'center', flexDirection: 'row', gap: 2, marginBottom: 3}}>
        <LoadingSkeleton variant="pill" height="lg" width="77px" />
        <LoadingSkeleton variant="rounded" height="lg" width="200px" />
      </Box>
      <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
        <LoadingSkeleton variant="pill" height="lg" width="400px" />
      </Box>
      <Box sx={{mt: 4}}>
        <IssueBodyLoading />
      </Box>
    </>
  )
}

export default NotificationDefaultViewLoading
