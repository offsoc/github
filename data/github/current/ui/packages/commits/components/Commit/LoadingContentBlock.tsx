import {LoadingSkeleton} from '@github-ui/skeleton/LoadingSkeleton'
import React from 'react'

export const LoadingContentBlock = React.memo(LoadingContentBlockUnmemoized)

//using boxes specifically because they provide some styling stuff that makes the skeleton look nicer
function LoadingContentBlockUnmemoized() {
  return (
    <div className="pt-3">
      <div className="border borderColor-muted rounded-top-2">
        <div className="gap-2 p-3 border-bottom borderColor-muted bgColor-muted rounded-top-2">
          <LoadingSkeleton height="sm" variant="rounded" width="140px" />
        </div>
        <div className="d-flex flex-column gap-2 p-3">
          <LoadingSkeleton height="sm" variant="rounded" width="random" />
          <LoadingSkeleton height="sm" variant="rounded" width="random" />
          <LoadingSkeleton height="sm" variant="rounded" width="random" />
          <LoadingSkeleton height="sm" variant="rounded" width="random" />
        </div>
      </div>
    </div>
  )
}
