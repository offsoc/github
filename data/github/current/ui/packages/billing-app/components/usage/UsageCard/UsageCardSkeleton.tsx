import {LoadingSkeleton} from '@github-ui/skeleton/LoadingSkeleton'

import {LoadingComponent} from '../..'

const UsageCardSkeleton = () => {
  return (
    <LoadingComponent sx={{border: 0, p: 0}}>
      <LoadingSkeleton sx={{width: '100%', mb: 3}} variant="rounded" height="md" />
      <LoadingSkeleton sx={{width: '100%', mb: 2}} variant="rounded" height="md" />
      <LoadingSkeleton sx={{width: '100%', mb: 2}} variant="rounded" height="md" />
      <LoadingSkeleton sx={{width: '100%', mb: 2}} variant="rounded" height="md" />
      <LoadingSkeleton sx={{width: '100%', mb: 2}} variant="rounded" height="md" />
      <LoadingSkeleton sx={{width: '100%', mb: 2}} variant="rounded" height="md" />
      <LoadingSkeleton sx={{width: '100%'}} variant="rounded" height="md" />
    </LoadingComponent>
  )
}

export default UsageCardSkeleton
