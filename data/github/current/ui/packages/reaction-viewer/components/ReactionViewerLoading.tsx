import {LoadingSkeleton} from '@github-ui/skeleton/LoadingSkeleton'

export function ReactionViewerLoading() {
  return (
    <div className="d-flex flex-wrap gap-1">
      <LoadingSkeleton variant="elliptical" height="28px" width="28px" />
    </div>
  )
}
